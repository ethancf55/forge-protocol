import {
  getEducationSection,
  getRequiredEducationSections,
} from "@/content/education/template";
import type {
  AnabolicAndrogenicRatio,
  SubstanceEducationContent,
  SubstanceKind,
} from "@/lib/education/types";

export type ResolvedEducationSection =
  | {
      id: string;
      title: string;
      subtitle?: string;
      shape: "text" | "string[]";
      value: string | string[];
    }
  | {
      id: "anabolicAndrogenicRatio";
      title: string;
      subtitle?: string;
      shape: "aaRatio";
      value: AnabolicAndrogenicRatio;
    };

/**
 * Resolve ordered section values for the education page from stored content.
 * Follows EDUCATION_SECTIONS order for the given kind. Disclaimer separate.
 */
export function resolveEducationSections(
  content: SubstanceEducationContent,
  kind: SubstanceKind
): ResolvedEducationSection[] {
  const sections = getRequiredEducationSections(kind).filter(
    (s) => s.id !== "disclaimer"
  );

  const resolved: ResolvedEducationSection[] = [];

  for (const section of sections) {
    if (section.shape === "aaRatio") {
      const aa = content.anabolicAndrogenicRatio;
      if (!aa) continue;
      // Hide pure not_applicable on non-androgens? Still show briefly for honesty on compounds.
      resolved.push({
        id: "anabolicAndrogenicRatio",
        title: section.title,
        subtitle: section.subtitle,
        shape: "aaRatio",
        value: aa,
      });
      continue;
    }

    const value = getSectionValue(content, section.id);
    if (value == null) continue;
    if (Array.isArray(value) && value.length === 0) continue;
    if (typeof value === "string" && !value.trim()) continue;

    resolved.push({
      id: section.id,
      title: section.title,
      subtitle: section.subtitle,
      shape: section.shape as "text" | "string[]",
      value,
    });
  }

  return resolved;
}

function getSectionValue(
  content: SubstanceEducationContent,
  id: string
): string | string[] | null {
  switch (id) {
    case "whatItIs":
      return content.whatItIs;
    case "mechanism":
      return content.mechanism;
    case "commonUses":
      return content.commonUses;
    case "importantToKnow":
      return content.importantToKnow;
    case "disclaimer":
      return content.disclaimer;
    default:
      return content.extra?.[id] ?? null;
  }
}

export function sectionTitleFor(id: string): string {
  return getEducationSection(id)?.title || id;
}

export function confidenceLabel(
  c: "established" | "plausible" | "speculative"
): string {
  if (c === "established") return "Established educational basis";
  if (c === "speculative") return "Speculative / gym lore";
  return "Plausible mechanism overlap";
}

export function confidenceClass(
  c: "established" | "plausible" | "speculative"
): string {
  if (c === "established")
    return "bg-emerald-500/10 text-emerald-300 ring-emerald-500/25";
  if (c === "speculative")
    return "bg-zinc-500/10 text-zinc-400 ring-white/10";
  return "bg-sky-500/10 text-sky-300 ring-sky-500/25";
}
