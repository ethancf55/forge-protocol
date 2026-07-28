"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";
import { parseContact, maskContact, type ContactChannel } from "@/lib/contact";
import { createAndSendOtp } from "@/lib/otp";
import { prisma } from "@/lib/db";
import { parseUsername } from "@/lib/username";

export type RequestOtpResult =
  | {
      ok: true;
      channel: ContactChannel;
      contact: string;
      display: string;
      masked: string;
      expiresInSec: number;
      delivery: "email" | "sms" | "dev";
      username?: string;
      devCode?: string;
    }
  | { ok: false; error: string };

export type VerifyOtpResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Signup: name + username + email|phone → OTP
 * Login: username → OTP to linked email/phone
 */
export async function requestOtpAction(
  formData: FormData
): Promise<RequestOtpResult> {
  const purposeRaw = String(formData.get("purpose") || "login");
  const purpose = purposeRaw === "signup" ? "signup" : "login";

  if (purpose === "login") {
    return requestLoginOtp(formData);
  }
  return requestSignupOtp(formData);
}

async function requestSignupOtp(
  formData: FormData
): Promise<RequestOtpResult> {
  const channelPref = String(formData.get("channel") || "email") as
    | ContactChannel
    | "auto";
  const rawContact = String(formData.get("contact") || "");
  const name = String(formData.get("name") || "").trim();
  const usernameRaw = String(formData.get("username") || "");

  if (!name || name.length < 1) {
    return { ok: false, error: "Enter your name." };
  }
  if (name.length > 80) {
    return { ok: false, error: "Name is too long." };
  }

  const usernameParsed = parseUsername(usernameRaw);
  if (!usernameParsed.ok) return { ok: false, error: usernameParsed.error };

  const existingUsername = await prisma.user.findUnique({
    where: { username: usernameParsed.username },
  });
  if (existingUsername) {
    return {
      ok: false,
      error: "That username is taken. Try another.",
    };
  }

  const parsed = parseContact(
    rawContact,
    channelPref === "auto" ? "auto" : channelPref
  );
  if (!parsed.ok) return { ok: false, error: parsed.error };

  const existingContact =
    parsed.channel === "email"
      ? await prisma.user.findUnique({ where: { email: parsed.contact } })
      : await prisma.user.findUnique({ where: { phone: parsed.contact } });
  if (existingContact) {
    return {
      ok: false,
      error:
        parsed.channel === "email"
          ? "An account with that email already exists. Sign in with your username."
          : "An account with that phone already exists. Sign in with your username.",
    };
  }

  const sent = await createAndSendOtp({
    contact: parsed.contact,
    channel: parsed.channel,
    purpose: "signup",
    name,
    username: usernameParsed.username,
  });
  if (!sent.ok) return sent;

  return {
    ok: true,
    channel: parsed.channel,
    contact: parsed.contact,
    display: parsed.display,
    masked: maskContact(parsed.channel, parsed.contact),
    expiresInSec: sent.expiresInSec,
    delivery: sent.delivery,
    username: usernameParsed.username,
    ...(sent.devCode ? { devCode: sent.devCode } : {}),
  };
}

async function requestLoginOtp(formData: FormData): Promise<RequestOtpResult> {
  const usernameRaw = String(formData.get("username") || "");
  const usernameParsed = parseUsername(usernameRaw);
  if (!usernameParsed.ok) {
    return {
      ok: false,
      error: "Enter your username to sign in.",
    };
  }

  const user = await prisma.user.findUnique({
    where: { username: usernameParsed.username },
  });
  if (!user) {
    return {
      ok: false,
      error: "No account found for that username. Create an account first.",
    };
  }

  // Prefer email for OTP if both exist; otherwise phone
  let channel: ContactChannel;
  let contact: string;
  if (user.email) {
    channel = "email";
    contact = user.email;
  } else if (user.phone) {
    channel = "phone";
    contact = user.phone;
  } else {
    return {
      ok: false,
      error:
        "This account has no email or phone on file. Contact support or create a new account.",
    };
  }

  const sent = await createAndSendOtp({
    contact,
    channel,
    purpose: "login",
    username: user.username,
  });
  if (!sent.ok) return sent;

  const display =
    channel === "email"
      ? contact
      : contact;

  return {
    ok: true,
    channel,
    contact,
    display,
    masked: maskContact(channel, contact),
    expiresInSec: sent.expiresInSec,
    delivery: sent.delivery,
    username: user.username || usernameParsed.username,
    ...(sent.devCode ? { devCode: sent.devCode } : {}),
  };
}

export async function verifyOtpAction(
  formData: FormData
): Promise<VerifyOtpResult> {
  const purposeRaw = String(formData.get("purpose") || "login");
  const purpose = purposeRaw === "signup" ? "signup" : "login";
  const contact = String(formData.get("contact") || "");
  const code = String(formData.get("code") || "");
  const name = String(formData.get("name") || "").trim();
  const username = String(formData.get("username") || "").trim();

  const parsed = parseContact(contact);
  if (!parsed.ok) return { ok: false, error: parsed.error };

  try {
    await signIn("otp", {
      contact: parsed.contact,
      code,
      purpose,
      name: purpose === "signup" ? name : undefined,
      username: purpose === "signup" ? username : undefined,
      redirectTo: "/dashboard",
    });
    return { ok: true };
  } catch (e) {
    if (e && typeof e === "object" && "digest" in e) {
      const digest = String((e as { digest?: string }).digest || "");
      if (digest.startsWith("NEXT_REDIRECT")) throw e;
    }
    if (e instanceof AuthError) {
      if (purpose === "signup") {
        return {
          ok: false,
          error:
            "Could not verify and create your account. Check the code, or request a new one.",
        };
      }
      return {
        ok: false,
        error: "Invalid or expired code. Request a new one and try again.",
      };
    }
    throw e;
  }
}
