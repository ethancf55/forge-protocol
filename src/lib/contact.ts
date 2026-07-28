/**
 * Normalize and validate email / phone contacts for OTP auth.
 */

export type ContactChannel = "email" | "phone";

export type ParsedContact =
  | { ok: true; channel: "email"; contact: string; display: string }
  | { ok: true; channel: "phone"; contact: string; display: string }
  | { ok: false; error: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Accept common US formats and E.164. Default country +1 when 10 digits.
 */
export function parseContact(
  raw: string,
  preferred?: ContactChannel | "auto"
): ParsedContact {
  const value = String(raw || "").trim();
  if (!value) {
    return { ok: false, error: "Enter an email or phone number." };
  }

  // Explicit email preference or looks like email
  if (
    preferred === "email" ||
    (preferred !== "phone" && value.includes("@"))
  ) {
    const email = value.toLowerCase();
    if (!EMAIL_RE.test(email) || email.length > 160) {
      return { ok: false, error: "Enter a valid email address." };
    }
    return { ok: true, channel: "email", contact: email, display: email };
  }

  // Phone path
  const digits = value.replace(/[^\d+]/g, "");
  let e164: string | null = null;

  if (digits.startsWith("+")) {
    const n = digits.slice(1).replace(/\D/g, "");
    if (n.length >= 10 && n.length <= 15) e164 = `+${n}`;
  } else {
    const n = digits.replace(/\D/g, "");
    if (n.length === 10) e164 = `+1${n}`;
    else if (n.length === 11 && n.startsWith("1")) e164 = `+${n}`;
    else if (n.length >= 10 && n.length <= 15) e164 = `+${n}`;
  }

  if (!e164) {
    return {
      ok: false,
      error:
        preferred === "phone"
          ? "Enter a valid phone number (include country code if outside the US)."
          : "Enter a valid email or phone number.",
    };
  }

  const display = formatPhoneDisplay(e164);
  return { ok: true, channel: "phone", contact: e164, display };
}

export function formatPhoneDisplay(e164: string): string {
  const n = e164.replace(/\D/g, "");
  if (n.length === 11 && n.startsWith("1")) {
    return `+1 (${n.slice(1, 4)}) ${n.slice(4, 7)}-${n.slice(7)}`;
  }
  return e164;
}

export function maskContact(channel: ContactChannel, contact: string): string {
  if (channel === "email") {
    const [user, domain] = contact.split("@");
    if (!domain) return contact;
    const keep = user.slice(0, Math.min(2, user.length));
    return `${keep}${"•".repeat(Math.max(user.length - keep.length, 2))}@${domain}`;
  }
  const digits = contact.replace(/\D/g, "");
  const last4 = digits.slice(-4);
  return `••• ••• ${last4}`;
}
