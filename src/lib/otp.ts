import { createHash, randomInt } from "crypto";
import { prisma } from "@/lib/db";
import type { ContactChannel } from "@/lib/contact";

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_MS = 45 * 1000;

export type OtpPurpose = "login" | "signup";

function hashCode(code: string, contact: string): string {
  const pepper = process.env.AUTH_SECRET || "forge-dev-pepper";
  return createHash("sha256")
    .update(`${pepper}:${contact}:${code}`)
    .digest("hex");
}

function generateCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export async function createAndSendOtp(params: {
  contact: string;
  channel: ContactChannel;
  purpose: OtpPurpose;
  name?: string | null;
  username?: string | null;
}): Promise<
  | {
      ok: true;
      expiresInSec: number;
      /** Only present in dev / when OTP_DEV_REVEAL=true */
      devCode?: string;
      delivery: "email" | "sms" | "dev";
    }
  | { ok: false; error: string }
> {
  const { contact, channel, purpose } = params;

  // Rate-limit resends
  const recent = await prisma.authOtp.findFirst({
    where: {
      contact,
      purpose,
      consumedAt: null,
      createdAt: { gte: new Date(Date.now() - RESEND_COOLDOWN_MS) },
    },
    orderBy: { createdAt: "desc" },
  });
  if (recent) {
    const wait = Math.ceil(
      (RESEND_COOLDOWN_MS - (Date.now() - recent.createdAt.getTime())) / 1000
    );
    return {
      ok: false,
      error: `Please wait ${Math.max(wait, 1)}s before requesting another code.`,
    };
  }

  // Invalidate prior unused codes for this contact+purpose
  await prisma.authOtp.updateMany({
    where: { contact, purpose, consumedAt: null },
    data: { consumedAt: new Date() },
  });

  const code = generateCode();
  const codeHash = hashCode(code, contact);
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  await prisma.authOtp.create({
    data: {
      contact,
      channel,
      purpose,
      name: params.name?.trim() || null,
      username: params.username?.trim().toLowerCase() || null,
      codeHash,
      expiresAt,
    },
  });

  const delivery = await deliverOtp({
    channel,
    contact,
    code,
    purpose,
  });

  const reveal =
    process.env.OTP_DEV_REVEAL === "true" ||
    process.env.NODE_ENV !== "production" ||
    delivery.mode === "dev";

  return {
    ok: true,
    expiresInSec: Math.floor(OTP_TTL_MS / 1000),
    delivery: delivery.mode,
    ...(reveal ? { devCode: code } : {}),
  };
}

export async function verifyOtp(params: {
  contact: string;
  purpose: OtpPurpose;
  code: string;
}): Promise<
  | {
      ok: true;
      channel: ContactChannel;
      name: string | null;
      username: string | null;
      otpId: string;
    }
  | { ok: false; error: string }
> {
  const code = String(params.code || "").replace(/\s/g, "");
  if (!/^\d{6}$/.test(code)) {
    return { ok: false, error: "Enter the 6-digit code." };
  }

  const row = await prisma.authOtp.findFirst({
    where: {
      contact: params.contact,
      purpose: params.purpose,
      consumedAt: null,
    },
    orderBy: { createdAt: "desc" },
  });

  if (!row) {
    return { ok: false, error: "No active code. Request a new one." };
  }
  if (row.expiresAt.getTime() < Date.now()) {
    return { ok: false, error: "That code expired. Request a new one." };
  }
  if (row.attempts >= MAX_ATTEMPTS) {
    return {
      ok: false,
      error: "Too many attempts. Request a new code.",
    };
  }

  const expected = hashCode(code, params.contact);
  if (expected !== row.codeHash) {
    await prisma.authOtp.update({
      where: { id: row.id },
      data: { attempts: { increment: 1 } },
    });
    const left = MAX_ATTEMPTS - row.attempts - 1;
    return {
      ok: false,
      error:
        left > 0
          ? `Incorrect code. ${left} attempt${left === 1 ? "" : "s"} left.`
          : "Too many attempts. Request a new code.",
    };
  }

  await prisma.authOtp.update({
    where: { id: row.id },
    data: { consumedAt: new Date() },
  });

  return {
    ok: true,
    channel: row.channel as ContactChannel,
    name: row.name,
    username: row.username,
    otpId: row.id,
  };
}

async function deliverOtp(params: {
  channel: ContactChannel;
  contact: string;
  code: string;
  purpose: OtpPurpose;
}): Promise<{ mode: "email" | "sms" | "dev" }> {
  const body =
    params.purpose === "signup"
      ? `Your Forge Protocol verification code is ${params.code}. It expires in 10 minutes.`
      : `Your Forge Protocol login code is ${params.code}. It expires in 10 minutes.`;

  if (params.channel === "email") {
    const sent = await sendEmailOtp(params.contact, body);
    if (sent) return { mode: "email" };
  } else {
    const sent = await sendSmsOtp(params.contact, body);
    if (sent) return { mode: "sms" };
  }

  // Dev / unconfigured providers: log clearly
  console.info(
    `[Forge OTP] ${params.channel} → ${params.contact} | code=${params.code} | purpose=${params.purpose}`
  );
  return { mode: "dev" };
}

async function sendEmailOtp(to: string, text: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return false;

  const from =
    process.env.OTP_EMAIL_FROM?.trim() || "Forge Protocol <onboarding@resend.dev>";

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: "Your Forge Protocol code",
        text,
      }),
    });
    if (!res.ok) {
      console.error("[otp email] Resend failed", await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error("[otp email]", err);
    return false;
  }
}

async function sendSmsOtp(to: string, text: string): Promise<boolean> {
  const sid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const token = process.env.TWILIO_AUTH_TOKEN?.trim();
  const from = process.env.TWILIO_FROM_NUMBER?.trim();
  if (!sid || !token || !from) return false;

  try {
    const auth = Buffer.from(`${sid}:${token}`).toString("base64");
    const body = new URLSearchParams({ To: to, From: from, Body: text });
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      }
    );
    if (!res.ok) {
      console.error("[otp sms] Twilio failed", await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error("[otp sms]", err);
    return false;
  }
}
