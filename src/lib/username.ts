/**
 * Username rules for Forge Protocol accounts.
 * Stored lowercase; login is case-insensitive.
 */

export type UsernameParse =
  | { ok: true; username: string }
  | { ok: false; error: string };

const USERNAME_RE = /^[a-z0-9_]{3,24}$/;

export function normalizeUsername(raw: string): string {
  return String(raw || "")
    .trim()
    .toLowerCase()
    .replace(/^@+/, "");
}

export function parseUsername(raw: string): UsernameParse {
  const username = normalizeUsername(raw);
  if (!username) {
    return { ok: false, error: "Choose a username." };
  }
  if (username.length < 3) {
    return { ok: false, error: "Username must be at least 3 characters." };
  }
  if (username.length > 24) {
    return { ok: false, error: "Username must be 24 characters or fewer." };
  }
  if (!USERNAME_RE.test(username)) {
    return {
      ok: false,
      error: "Username can only use letters, numbers, and underscores.",
    };
  }
  // Block a few reserved handles
  const reserved = new Set([
    "admin",
    "support",
    "forge",
    "root",
    "api",
    "login",
    "signup",
    "help",
  ]);
  if (reserved.has(username)) {
    return { ok: false, error: "That username is reserved. Try another." };
  }
  return { ok: true, username };
}
