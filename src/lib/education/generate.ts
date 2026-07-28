import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  CORE_SECTION_IDS,
  DEFAULT_DISCLAIMER,
  EDUCATION_GLOBAL_RULES,
  EDUCATION_SECTIONS,
  formatSectionPromptBlock,
  getRequiredEducationSections,
  isCoreSectionId,
  type EducationSectionDef,
} from "@/content/education/template";
import { getGeminiApiKey, getGeminiModelName } from "@/lib/ai";
import type {
  AnabolicAndrogenicRatio,
  SubstanceEducationContent,
  SubstanceKind,
} from "@/lib/education/types";
import {
  isAnabolicAndrogenicRatio,
  isSubstanceEducationContent,
} from "@/lib/education/types";
import {
  ensureSafeDisclaimer,
  sanitizeEducationBullets,
  sanitizeEducationText,
} from "@/lib/ai-safety";

export async function generateSubstanceEducation(params: {
  name: string;
  kind: SubstanceKind;
}): Promise<{ content: SubstanceEducationContent; model: string }> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error(
      "Missing GOOGLE_GENERATIVE_AI_API_KEY or GEMINI_API_KEY — cannot generate education page."
    );
  }

  const modelName = getGeminiModelName();
  const sections = getRequiredEducationSections(params.kind);
  const schemaExample = buildSchemaExample(sections);
  const sectionBlocks = sections
    .map((s) => formatSectionPromptBlock(s, params.kind))
    .join("\n\n");

  const categoryLabel =
    params.kind === "supplement"
      ? "dietary supplement / wellness substance"
      : "performance-related compound (educational discussion only — never encourage use)";

  const aaExtra =
    params.kind === "compound"
      ? `
## Anabolic:Androgenic ratio (compounds)
- If this is a classic AAS/androgen with a commonly taught A:A ratio, set anabolicAndrogenicRatio.applicability to "androgenic_compound" and ratio to the standard educational value (string like "100:100").
- If androgenic but ratio not standardly known, applicability "unknown", ratio null.
- If not an androgenic compound, applicability "not_applicable", ratio null.
- Always explain limitations of A:A ratios in notes (teaching tool, not precise human predictor).
`
      : "";

  const prompt = `You are writing a premium educational reference page for Forge Protocol — a logging app for serious young lifters.

## Subject
- Substance name: "${params.name}"
- Category: ${categoryLabel}

## Audience
${EDUCATION_GLOBAL_RULES.audience}

## Purpose
${EDUCATION_GLOBAL_RULES.purpose}

## Tone
${EDUCATION_GLOBAL_RULES.tone}

## Quality bar
${EDUCATION_GLOBAL_RULES.qualityBar.map((q) => `- ${q}`).join("\n")}

## HARD BANS (apply to every section)
${EDUCATION_GLOBAL_RULES.hardBans.map((b) => `- ${b}`).join("\n")}
${aaExtra}
## Output format
Return ONLY valid JSON (no markdown fences) with exactly these keys:
${schemaExample}

## Section specifications (follow tightly)
${sectionBlocks}

## Final checks before you answer
- Every required key present with the correct shape
- No dosing, protocols, sources, or administration methods anywhere
- Mechanism section actually teaches physiology/systems, not vague marketing
- Disclaimer is firm: educational only, not medical advice, not a recommendation to use
- If the name is vague/unknown: be honest and cautious rather than inventing detail`;

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 2400,
      responseMimeType: "application/json",
    },
  });

  const result = await model.generateContent(prompt);
  const raw = result.response.text()?.trim() || "";
  const parsedUnknown = parseJsonContent(raw);
  const content = normalizeGeneratedContent(parsedUnknown, sections, params.kind);

  if (!isSubstanceEducationContent(content)) {
    throw new Error("AI returned education JSON in an unexpected shape.");
  }

  return { content, model: modelName };
}

/**
 * Normalize AI JSON into SubstanceEducationContent using the live template.
 */
export function normalizeGeneratedContent(
  raw: unknown,
  sections: EducationSectionDef[] = getRequiredEducationSections(),
  kind: SubstanceKind = "supplement"
): SubstanceEducationContent {
  const obj =
    raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};

  const content: SubstanceEducationContent = {
    whatItIs: sanitizeEducationText(asText(obj.whatItIs)),
    mechanism: sanitizeEducationText(asText(obj.mechanism)),
    commonUses: sanitizeEducationBullets(asStringArray(obj.commonUses)),
    importantToKnow: sanitizeEducationBullets(
      asStringArray(obj.importantToKnow)
    ),
    disclaimer: ensureSafeDisclaimer(
      asText(obj.disclaimer),
      DEFAULT_DISCLAIMER
    ),
    extra: {},
  };

  for (const section of sections) {
    if (section.id === "commonUses" && section.shape === "string[]") {
      content.commonUses = content.commonUses.slice(
        0,
        section.length.maxItems ?? 10
      );
    }
    if (section.id === "importantToKnow" && section.shape === "string[]") {
      content.importantToKnow = content.importantToKnow.slice(
        0,
        section.length.maxItems ?? 12
      );
    }
  }

  // AA ratio (compounds)
  if (kind === "compound" || obj.anabolicAndrogenicRatio) {
    content.anabolicAndrogenicRatio = normalizeAaRatio(
      obj.anabolicAndrogenicRatio
    );
  }

  const extra: Record<string, string | string[]> = {};
  for (const section of sections) {
    if (isCoreSectionId(section.id)) continue;
    if (section.id === "anabolicAndrogenicRatio") continue;
    if (section.shape === "aaRatio") continue;

    const value = obj[section.id];
    if (section.shape === "string[]") {
      const arr = sanitizeEducationBullets(asStringArray(value)).slice(
        0,
        section.length.maxItems ?? 12
      );
      if (arr.length) extra[section.id] = arr;
    } else if (section.shape === "text") {
      const text = sanitizeEducationText(asText(value));
      if (text) extra[section.id] = text;
    }
  }

  if (obj.extra && typeof obj.extra === "object") {
    const nested = obj.extra as Record<string, unknown>;
    for (const [k, v] of Object.entries(nested)) {
      if (extra[k] || k === "anabolicAndrogenicRatio") continue;
      if (Array.isArray(v)) {
        const arr = sanitizeEducationBullets(asStringArray(v));
        if (arr.length) extra[k] = arr;
      } else if (typeof v === "string" && v.trim()) {
        const text = sanitizeEducationText(v.trim());
        if (text) extra[k] = text;
      }
    }
  }

  if (Object.keys(extra).length) {
    content.extra = extra;
  } else {
    delete content.extra;
  }

  if (!content.whatItIs) {
    content.whatItIs =
      "Educational definition was not generated. Regenerate this page when AI is available.";
  }
  if (!content.mechanism) {
    content.mechanism =
      "Mechanism details were not generated. Regenerate this page when AI is available.";
  }

  // Ensure at least one safe caveat
  if (!content.importantToKnow.length) {
    content.importantToKnow = [
      "Forge Protocol never provides dosing or protocols.",
      "This page is educational only — not medical advice.",
    ];
  }

  return content;
}

function normalizeAaRatio(value: unknown): AnabolicAndrogenicRatio {
  if (isAnabolicAndrogenicRatio(value)) {
    const ratioRaw =
      value.ratio && String(value.ratio).trim()
        ? String(value.ratio).trim().replace(/\s/g, "")
        : null;
    // Only accept classic N:N teaching ratios — reject invented junk
    const ratio =
      ratioRaw && /^\d{1,4}:\d{1,4}$/.test(ratioRaw) ? ratioRaw : null;
    let applicability = value.applicability;
    if (applicability === "androgenic_compound" && !ratio) {
      applicability = "unknown";
    }
    return {
      ratio,
      applicability,
      notes: sanitizeEducationText(
        value.notes.trim() || defaultAaNotes(applicability)
      ),
    };
  }

  if (typeof value === "string" && value.trim()) {
    const ratioMatch = value.match(/(\d{1,4}\s*:\s*\d{1,4})/);
    return {
      ratio: ratioMatch ? ratioMatch[1].replace(/\s/g, "") : null,
      applicability: ratioMatch ? "androgenic_compound" : "unknown",
      notes: sanitizeEducationText(value.trim()),
    };
  }

  return {
    ratio: null,
    applicability: "unknown",
    notes: defaultAaNotes("unknown"),
  };
}

function defaultAaNotes(
  applicability: AnabolicAndrogenicRatio["applicability"]
): string {
  if (applicability === "not_applicable") {
    return "Anabolic:Androgenic ratios are a teaching concept used for androgenic–anabolic steroid-class compounds. This entry is not treated as an androgenic compound for A:A ratio education.";
  }
  if (applicability === "androgenic_compound") {
    return "Classic Anabolic:Androgenic ratios are rough educational tools (historically referenced to testosterone). They do not precisely predict individual human outcomes.";
  }
  return "A standard educational Anabolic:Androgenic ratio is not clearly established for this label, or the entry is too vague to assign one honestly.";
}

function buildSchemaExample(sections: EducationSectionDef[]) {
  const lines = sections.map((s) => {
    if (s.shape === "string[]") {
      return `  "${s.id}": ["bullet 1", "bullet 2", "..."]`;
    }
    if (s.shape === "aaRatio") {
      return `  "${s.id}": { "ratio": "100:100" | null, "applicability": "androgenic_compound" | "not_applicable" | "unknown", "notes": "..." }`;
    }
    return `  "${s.id}": "paragraph text..."`;
  });
  return `{\n${lines.join(",\n")}\n}`;
}

function asText(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim();
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((s) => String(s).trim()).filter(Boolean);
}

function parseJsonContent(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    const cleaned = raw
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();
    return JSON.parse(cleaned);
  }
}

export function educationSectionTitle(id: string): string {
  return (
    EDUCATION_SECTIONS.find((s) => s.id === id)?.title ||
    id.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase())
  );
}

export function educationSectionSubtitle(id: string): string | undefined {
  return EDUCATION_SECTIONS.find((s) => s.id === id)?.subtitle;
}

export { CORE_SECTION_IDS };
