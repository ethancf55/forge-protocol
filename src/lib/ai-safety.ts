/**
 * Post-generation safety filters for educational AI content.
 * Strips or softens common model failure modes (dosing, protocols, sources).
 */

const BANNED_PATTERNS: { re: RegExp; label: string }[] = [
  { re: /\b\d+(\.\d+)?\s?(mg|mcg|µg|iu|i\.?u\.?|ml|cc)\b/gi, label: "dose unit" },
  { re: /\b(take|dose|dosing|inject|injection|subq|im\b|oral\s+dose)\b[^.!?\n]{0,40}\b\d+/gi, label: "dose instruction" },
  { re: /\b(every\s+\d+\s*(hours?|days?|weeks?)|ed\b|eod\b|twice\s+daily|once\s+daily)\b/gi, label: "schedule" },
  { re: /\b(stack\s+with|pair\s+with|combine\s+with|you should (take|use|start|add|run))\b/gi, label: "stack recommend" },
  { re: /\b(pct|post[\s-]?cycle|blast\s+and\s+cruise|cruise\s+dose)\b/gi, label: "protocol jargon misuse" },
  { re: /\b(buy|source|ug[l1]|underground lab|pharmacy link|where to (get|buy))\b/gi, label: "sourcing" },
  { re: /\b(pin\s+sites?|syringe|barrel|gauge\s+\d+)\b/gi, label: "administration" },
];

/** Soften banned fragments in free text without deleting the whole section */
export function sanitizeEducationText(input: string): string {
  if (!input) return input;
  let out = input;

  for (const { re } of BANNED_PATTERNS) {
    out = out.replace(re, "[educational detail removed — no dosing/protocols]");
  }

  // Soften imperative openings that slipped through
  out = out.replace(
    /\b(You should|You must|Be sure to take|Make sure to take|Start with)\b/gi,
    "People sometimes discuss"
  );

  // Collapse repeated removal markers
  out = out
    .replace(/(\[educational detail removed[^\]]*\]\s*){2,}/gi, "[educational detail removed — no dosing/protocols] ")
    .replace(/\s{2,}/g, " ")
    .trim();

  return out;
}

export function sanitizeEducationBullets(items: string[]): string[] {
  return items
    .map((s) => sanitizeEducationText(String(s)))
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .filter((s) => !/^\[educational detail removed/i.test(s))
    .slice(0, 12);
}

export function textLooksUnsafe(input: string): boolean {
  if (!input) return false;
  return BANNED_PATTERNS.some(({ re }) => {
    re.lastIndex = 0;
    return re.test(input);
  });
}

/** Enforce disclaimer baseline quality */
export function ensureSafeDisclaimer(text: string, fallback: string): string {
  const t = (text || "").trim();
  if (t.length < 40) return fallback;
  const lower = t.toLowerCase();
  if (!lower.includes("educational") && !lower.includes("not medical")) {
    return fallback;
  }
  if (textLooksUnsafe(t)) return fallback;
  return sanitizeEducationText(t);
}
