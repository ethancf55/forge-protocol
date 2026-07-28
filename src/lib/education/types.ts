export type SubstanceKind = "supplement" | "compound";

/** Structured AA ratio block for androgenic compounds when known */
export type AnabolicAndrogenicRatio = {
  /** e.g. "100:100" — null when unknown or not applicable */
  ratio: string | null;
  /**
   * androgenic_compound = treat as androgen-class education
   * not_applicable = not an androgenic compound
   * unknown = may be androgenic but ratio not established / not standard
   */
  applicability: "androgenic_compound" | "not_applicable" | "unknown";
  /** Educational notes: reference compound, limitations of AA ratios, etc. */
  notes: string;
};

export type SubstanceEducationContent = {
  whatItIs: string;
  mechanism: string;
  commonUses: string[];
  importantToKnow: string[];
  disclaimer: string;
  /** Present on compound pages; omitted or not_applicable for supplements */
  anabolicAndrogenicRatio?: AnabolicAndrogenicRatio;
  /** Custom sections keyed by EDUCATION_SECTIONS id */
  extra?: Record<string, string | string[]>;
};

export function isSubstanceEducationContent(
  value: unknown
): value is SubstanceEducationContent {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.whatItIs === "string" &&
    typeof v.mechanism === "string" &&
    Array.isArray(v.commonUses) &&
    Array.isArray(v.importantToKnow) &&
    typeof v.disclaimer === "string"
  );
}

export function isAnabolicAndrogenicRatio(
  value: unknown
): value is AnabolicAndrogenicRatio {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  const app = v.applicability;
  return (
    (v.ratio === null || typeof v.ratio === "string") &&
    (app === "androgenic_compound" ||
      app === "not_applicable" ||
      app === "unknown") &&
    typeof v.notes === "string"
  );
}

/** One educational synergy / additive-overlap note */
export type SynergyObservation = {
  /** Display names of substances involved (2+) */
  substances: string[];
  /** Short label, e.g. "Mitochondrial support overlap" */
  title: string;
  /** Why mechanisms overlap or combine — educational only */
  explanation: string;
  /** How confident the educational claim is */
  confidence: "established" | "plausible" | "speculative";
};

/** Per-user multi-substance educational analysis */
export type StackEducationContent = {
  synergies: SynergyObservation[];
  /** Patterns / educational tips across the logged set — never "take X" */
  stackObservations: string[];
  disclaimer: string;
};

export function isStackEducationContent(
  value: unknown
): value is StackEducationContent {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    Array.isArray(v.synergies) &&
    Array.isArray(v.stackObservations) &&
    typeof v.disclaimer === "string"
  );
}

export type LoggedSubstanceRef = {
  kind: SubstanceKind;
  name: string;
};
