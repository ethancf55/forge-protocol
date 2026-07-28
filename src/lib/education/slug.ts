import type { SubstanceKind } from "@/lib/education/types";

/** Normalize a free-text log name for lookup */
export function normalizeSubstanceName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^\w\s\-+./()]/g, "");
}

/** URL-safe slug from substance name */
export function slugifySubstanceName(name: string): string {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return base || "substance";
}

export function educationPath(kind: SubstanceKind, slug: string) {
  return `/learn/${kind}/${slug}`;
}

export function displayKind(kind: SubstanceKind) {
  return kind === "supplement" ? "Supplement" : "Compound";
}
