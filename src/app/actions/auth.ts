"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";
import { parseContact, maskContact, type ContactChannel } from "@/lib/contact";
import { createAndSendOtp } from "@/lib/otp";
import { prisma } from "@/lib/db";

export type RequestOtpResult =
  | {
      ok: true;
      channel: ContactChannel;
      contact: string;
      display: string;
      masked: string;
      expiresInSec: number;
      delivery: "email" | "sms" | "dev";
      devCode?: string;
    }
  | { ok: false; error: string };

export type VerifyOtpResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Signup / login: email or phone → OTP (no name or username)
 */
export async function requestOtpAction(
  formData: FormData
): Promise<RequestOtpResult> {
  const purposeRaw = String(formData.get("purpose") || "login");
  const purpose = purposeRaw === "signup" ? "signup" : "login";

  try {
    if (purpose === "login") {
      return await requestLoginOtp(formData);
    }
    return await requestSignupOtp(formData);
  } catch (err) {
    console.error("[requestOtpAction]", err);
    return {
      ok: false,
      error:
        "Could not reach the database or auth service. Wait a moment and try again. If this keeps happening, the temporary Prisma DB may need to be reclaimed.",
    };
  }
}

async function requestSignupOtp(
  formData: FormData
): Promise<RequestOtpResult> {
  const channelPref = String(formData.get("channel") || "email") as
    | ContactChannel
    | "auto";
  const rawContact = String(formData.get("contact") || "");

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
          ? "An account with that email already exists. Sign in instead."
          : "An account with that phone already exists. Sign in instead.",
    };
  }

  const sent = await createAndSendOtp({
    contact: parsed.contact,
    channel: parsed.channel,
    purpose: "signup",
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
    ...(sent.devCode ? { devCode: sent.devCode } : {}),
  };
}

async function requestLoginOtp(formData: FormData): Promise<RequestOtpResult> {
  const channelPref = String(formData.get("channel") || "auto") as
    | ContactChannel
    | "auto";
  const rawContact = String(formData.get("contact") || "");

  const parsed = parseContact(
    rawContact,
    channelPref === "auto" ? "auto" : channelPref
  );
  if (!parsed.ok) return { ok: false, error: parsed.error };

  const user =
    parsed.channel === "email"
      ? await prisma.user.findUnique({ where: { email: parsed.contact } })
      : await prisma.user.findUnique({ where: { phone: parsed.contact } });

  if (!user) {
    return {
      ok: false,
      error:
        parsed.channel === "email"
          ? "No account found for that email. Create an account first."
          : "No account found for that phone. Create an account first.",
    };
  }

  const sent = await createAndSendOtp({
    contact: parsed.contact,
    channel: parsed.channel,
    purpose: "login",
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

  const parsed = parseContact(contact);
  if (!parsed.ok) return { ok: false, error: parsed.error };

  try {
    await signIn("otp", {
      contact: parsed.contact,
      code,
      purpose,
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
    console.error("[verifyOtpAction]", e);
    return {
      ok: false,
      error:
        "Verification failed (server/database). Request a new code and try again.",
    };
  }
}
