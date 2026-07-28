/**
 * =============================================================================
 * SUBSTANCE EDUCATION TEMPLATE — single source of truth
 * =============================================================================
 *
 * Edit THIS FILE to control single-substance educational pages.
 * Multi-substance synergies / Stack Observations → stack-template.ts
 *
 * HOW TO EDIT / ADD SECTIONS
 * --------------------------
 * 1. Find EDUCATION_SECTIONS below.
 * 2. Edit mustCover / neverInclude / writingStyle for AI control.
 * 3. appliesTo: which kinds get the section ("supplement" | "compound").
 * 4. required: true to always generate when appliesTo matches.
 * 5. After edits → Regenerate with AI on a substance page.
 *
 * SAFETY: never put dosing, protocols, sources, or admin methods in prompts.
 */

export type SubstanceKind = "supplement" | "compound";

export type EducationSectionShape = "text" | "string[]" | "aaRatio";

export type EducationSectionDef = {
  id: string;
  title: string;
  subtitle?: string;
  required: boolean;
  /** Which substance kinds include this section */
  appliesTo: SubstanceKind[];
  shape: EducationSectionShape;
  length: {
    minSentences?: number;
    maxSentences?: number;
    minItems?: number;
    maxItems?: number;
  };
  mustCover: string[];
  neverInclude: string[];
  writingStyle: string;
  supplementNote?: string;
  compoundNote?: string;
};

export const CORE_SECTION_IDS = [
  "whatItIs",
  "mechanism",
  "commonUses",
  "importantToKnow",
  "disclaimer",
] as const;

export type CoreSectionId = (typeof CORE_SECTION_IDS)[number];

export const EDUCATION_GLOBAL_RULES = {
  audience:
    "Serious young lifters (roughly 18–28) who want accurate education, not hype, not bro-science, and not medical prescriptions.",
  tone: "Calm, direct, precise. Premium educational reference — not a sales page, not a fear pamphlet, not a how-to guide.",
  purpose:
    "Help the user understand what a logged substance is, how it is thought to work, how it is discussed in fitness/health education, and what caveats matter. Never help them run a protocol.",
  hardBans: [
    "No dosing, amounts, milligrams, IUs, or frequency schedules",
    "No protocol design: no cycles, blasts, cruises, or PCT instructions",
    "No sources, vendors, pharmacies, or 'where to get it'",
    "No administration methods (injection, oral, topical, pin sites, etc.)",
    "No 'how to start / stop / taper' protocols",
    "No recommendations to use, avoid, buy, or add substances",
    "No personalized medical advice or diagnosis",
    "Educational mechanism-overlap notes belong in multi-substance Stack Observations, not as 'you should stack' advice here",
  ],
  qualityBar: [
    "Prefer mechanisms at systems / pathway / receptor level when known",
    "Separate what is well-supported from what is speculative",
    "Name individual variability without inventing fake certainty",
    "Use plain language first; technical terms allowed if defined briefly",
    "If the substance name is vague or unknown, say so honestly",
    "For androgenic compounds, always include the classic Anabolic:Androgenic ratio when a standard educational value is known; otherwise mark unknown/not applicable honestly",
  ],
} as const;

export const EDUCATION_SECTIONS: EducationSectionDef[] = [
  {
    id: "whatItIs",
    title: "What it is",
    subtitle: "Class, context, and plain-language definition",
    required: true,
    appliesTo: ["supplement", "compound"],
    shape: "text",
    length: { minSentences: 2, maxSentences: 5 },
    mustCover: [
      "Clear plain-language definition of the substance",
      "Broad class/category (e.g. amino-acid derivative, androgen, peptide class, vitamin, etc.) when known",
      "Whether it is endogenous, dietary, synthetic, or a class umbrella — only if accurate",
      "One sentence of fitness/education context without encouraging use",
    ],
    neverInclude: [
      "Brand marketing or product pitches",
      "Dosing or 'best form to take'",
      "Claims of guaranteed results",
    ],
    writingStyle:
      "Encyclopedia-brief + coach-adjacent clarity. No fluff. Assume the reader is intelligent but not a pharmacologist.",
    supplementNote:
      "Frame as dietary/supplement category education when appropriate.",
    compoundNote:
      "Frame as educational discussion of a performance-related compound class or labeled entry. Never encourage use.",
  },
  {
    id: "mechanism",
    title: "Mechanism of action",
    subtitle: "How it is thought to work — educational physiology",
    required: true,
    appliesTo: ["supplement", "compound"],
    shape: "text",
    length: { minSentences: 3, maxSentences: 7 },
    mustCover: [
      "Primary pathway or system involved",
      "What changes physiologically at a high level relevant to training/recovery/body composition education",
      "Downstream effects commonly discussed in education (not guaranteed outcomes)",
      "Important feedback loops or adaptive responses at conceptual level WITHOUT management protocols",
      "Uncertainty: well-described vs debated when relevant",
    ],
    neverInclude: [
      "Dosing, loading phases, blood-level targets",
      "How to administer or time the substance",
      "Stack pairings framed as recommendations",
      "PCT or recovery drug sequences",
    ],
    writingStyle:
      "Systems-level physiology education. Prefer 'is thought to / can influence / is associated with' when evidence is mixed.",
    compoundNote:
      "Emphasize receptor/axis/system effects and educational harm-reduction concepts (e.g. feedback suppression as a concept).",
  },
  {
    id: "anabolicAndrogenicRatio",
    title: "Anabolic : Androgenic ratio",
    subtitle: "Classic educational ratio when known (androgen-class compounds)",
    required: true,
    appliesTo: ["compound"],
    shape: "aaRatio",
    length: { minSentences: 2, maxSentences: 4 },
    mustCover: [
      "If this is an androgenic/anabolic steroid-class compound with a commonly cited educational Anabolic:Androgenic (A:A) ratio, include that ratio (e.g. '100:100')",
      "State the usual educational reference (historically relative to testosterone as ~100:100) and that ratios are rough, species/method-dependent teaching tools — not precise human outcome predictors",
      "If it is androgenic but no standard A:A ratio is well established in education, set applicability to unknown and explain why",
      "If it is clearly not an androgenic compound (e.g. peptide class, non-androgen label), set applicability to not_applicable",
    ],
    neverInclude: [
      "Dosing to 'optimize' anabolic vs androgenic effects",
      "Protocols to minimize androgenic sides",
      "Fabricated ratios when none are standard",
    ],
    writingStyle:
      "Precise educational pharmacology literacy. Treat A:A ratios as historical teaching numbers with limits, not gospel.",
    compoundNote:
      "Always attempt this block for compounds. Prefer known standard values (e.g. testosterone 100:100, nandrolone often cited near 125:37 in classic tables, oxandrolone often cited with higher anabolic:androgenic teaching ratios) only when commonly taught — otherwise unknown.",
  },
  {
    id: "commonUses",
    title: "Common uses (educational)",
    subtitle: "How it is commonly discussed — not recommendations",
    required: true,
    appliesTo: ["supplement", "compound"],
    shape: "string[]",
    length: { minItems: 3, maxItems: 6 },
    mustCover: [
      "3–6 bullets of educational discussion contexts",
      "Descriptive, not imperative",
    ],
    neverInclude: [
      "Imperatives like 'use this for…'",
      "Dosing or timing tips disguised as uses",
    ],
    writingStyle:
      "Descriptive bullets. Contexts people study/discuss, not commands.",
    compoundNote:
      "May include clinical prescription and anti-doping education contexts when relevant.",
  },
  {
    id: "trainingContext",
    title: "Training & performance context",
    subtitle: "Where it shows up in serious lifting culture — education only",
    required: true,
    appliesTo: ["supplement", "compound"],
    shape: "text",
    length: { minSentences: 2, maxSentences: 5 },
    mustCover: [
      "How this substance appears in strength/hypertrophy culture education",
      "Associated training qualities in discussion — not proof",
      "Reminder that fundamentals matter more than any substance narrative",
    ],
    neverInclude: [
      "Sample programs paired with the substance",
      "Peri-workout protocols",
    ],
    writingStyle:
      "Grounded in real lifting culture without glamorizing enhancement.",
  },
  {
    id: "evidenceQuality",
    title: "Evidence quality (high level)",
    subtitle: "How strong the general evidence picture is",
    required: true,
    appliesTo: ["supplement", "compound"],
    shape: "text",
    length: { minSentences: 2, maxSentences: 4 },
    mustCover: [
      "Rough evidence picture: strong / mixed / limited / mostly anecdote",
      "Trials vs clinical use vs mechanistic theory vs gym lore when relevant",
    ],
    neverInclude: [
      "Fake citation lists",
      "Dosing trial details that become protocols",
    ],
    writingStyle:
      "Epistemically honest. Calibrate confidence, not PubMed cosplay.",
  },
  {
    id: "importantToKnow",
    title: "Important things to know",
    subtitle: "Caveats, variability, and when education is not enough",
    required: true,
    appliesTo: ["supplement", "compound"],
    shape: "string[]",
    length: { minItems: 4, maxItems: 8 },
    mustCover: [
      "Individual variability when relevant",
      "General risk/consideration themes at educational level",
      "Product quality / identity uncertainty when relevant",
      "When to involve a licensed clinician",
      "Forge Protocol does not provide dosing or protocols",
    ],
    neverInclude: [
      "DIY lab target protocols",
      "Self-treatment decision trees",
      "Sources or acquisition advice",
    ],
    writingStyle:
      "Practical, adult, non-alarmist.",
    compoundNote:
      "May note legal/health complexity of self-directed use by jurisdiction — without moralizing.",
  },
  {
    id: "disclaimer",
    title: "Disclaimer",
    subtitle: "Non-negotiable boundary",
    required: true,
    appliesTo: ["supplement", "compound"],
    shape: "text",
    length: { minSentences: 2, maxSentences: 4 },
    mustCover: [
      "Educational only",
      "Not medical advice, diagnosis, or treatment",
      "Not a recommendation to use any substance",
      "No dosing, stacks-as-prescriptions, sources, or protocols from Forge Protocol",
      "Licensed medical professional for personal decisions",
    ],
    neverInclude: ["Soft language that re-opens dosing advice"],
    writingStyle: "Clear and firm.",
  },
];

export function getRequiredEducationSections(
  kind?: SubstanceKind
): EducationSectionDef[] {
  return EDUCATION_SECTIONS.filter((s) => {
    if (!s.required) return false;
    if (!kind) return true;
    return s.appliesTo.includes(kind);
  });
}

export function getEducationSection(id: string): EducationSectionDef | undefined {
  return EDUCATION_SECTIONS.find((s) => s.id === id);
}

export function isCoreSectionId(id: string): id is CoreSectionId {
  return (CORE_SECTION_IDS as readonly string[]).includes(id);
}

export function formatSectionPromptBlock(
  section: EducationSectionDef,
  kind: SubstanceKind
): string {
  let shapeLine: string;
  if (section.shape === "string[]") {
    shapeLine = `Shape: JSON array of strings (${section.length.minItems ?? 3}–${section.length.maxItems ?? 6} items)`;
  } else if (section.shape === "aaRatio") {
    shapeLine = `Shape: JSON object {
  "ratio": "100:100" or null,
  "applicability": "androgenic_compound" | "not_applicable" | "unknown",
  "notes": "2–4 educational sentences"
}`;
  } else {
    shapeLine = `Shape: JSON string (~${section.length.minSentences ?? 2}–${section.length.maxSentences ?? 5} sentences)`;
  }

  const kindNote =
    kind === "supplement" ? section.supplementNote : section.compoundNote;

  return [
    `### ${section.id} — ${section.title}`,
    shapeLine,
    `Writing style: ${section.writingStyle}`,
    `MUST cover:\n${section.mustCover.map((p) => `  • ${p}`).join("\n")}`,
    `NEVER include:\n${section.neverInclude.map((p) => `  • ${p}`).join("\n")}`,
    kindNote ? `Category note (${kind}): ${kindNote}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

export const DEFAULT_DISCLAIMER =
  "This page is for educational purposes only. It is not medical advice, diagnosis, or treatment, and it is not a recommendation to use any substance. Forge Protocol does not provide dosing, stacks, sources, or protocols. Consult a licensed medical professional for personal health decisions.";
