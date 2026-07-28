import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  STACK_DISCLAIMER,
  STACK_EDUCATION_RULES,
} from "@/content/education/stack-template";
import { getGeminiApiKey, getGeminiModelName } from "@/lib/ai";
import type {
  LoggedSubstanceRef,
  StackEducationContent,
  SynergyObservation,
} from "@/lib/education/types";
import { isStackEducationContent } from "@/lib/education/types";
import {
  ensureSafeDisclaimer,
  sanitizeEducationBullets,
  sanitizeEducationText,
} from "@/lib/ai-safety";

export async function generateStackEducation(params: {
  substances: LoggedSubstanceRef[];
}): Promise<{ content: StackEducationContent; model: string }> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error(
      "Missing GOOGLE_GENERATIVE_AI_API_KEY or GEMINI_API_KEY — cannot generate stack education."
    );
  }

  if (
    params.substances.length < STACK_EDUCATION_RULES.minSubstancesForAnalysis
  ) {
    return {
      content: emptyStackContent(
        "Log at least two different substances to unlock educational Stack Observations and synergy notes."
      ),
      model: "none",
    };
  }

  const modelName = getGeminiModelName();
  const list = params.substances
    .map((s, i) => `${i + 1}. [${s.kind}] ${s.name}`)
    .join("\n");

  const prompt = `You are writing educational multi-substance analysis for Forge Protocol (logging app for serious young lifters).

## Purpose
${STACK_EDUCATION_RULES.purpose}

## User's currently logged substances (ONLY use these — do not invent others)
${list}

## HARD BANS
${STACK_EDUCATION_RULES.hardBans.map((b) => `- ${b}`).join("\n")}

## Synergy rules
${STACK_EDUCATION_RULES.synergyGuidance.map((g) => `- ${g}`).join("\n")}

## Stack Observations rules
${STACK_EDUCATION_RULES.stackObservationsGuidance.map((g) => `- ${g}`).join("\n")}

## Output
Return ONLY valid JSON (no markdown fences):
{
  "synergies": [
    {
      "substances": ["Name A", "Name B"],
      "title": "Short educational label",
      "explanation": "2–4 sentences on why mechanisms may overlap or combine. Educational only.",
      "confidence": "established" | "plausible" | "speculative"
    }
  ],
  "stackObservations": [
    "Educational pattern or tip (not a command to take anything)",
    "..."
  ],
  "disclaimer": "string"
}

Limits:
- synergies: 0–${STACK_EDUCATION_RULES.maxSynergies} items (prefer quality)
- stackObservations: 3–${STACK_EDUCATION_RULES.maxStackObservations} bullets
- substance names in synergies must match the logged list (same spelling as provided)
- disclaimer must state educational only, not medical advice, not a recommendation to use or combine

Tone: calm, precise, serious-lifter education. No hype. No protocols.`;

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      temperature: 0.35,
      maxOutputTokens: 2000,
      responseMimeType: "application/json",
    },
  });

  const result = await model.generateContent(prompt);
  const raw = result.response.text()?.trim() || "";
  const parsed = parseJson(raw);
  const content = normalizeStackContent(parsed, params.substances);

  if (!isStackEducationContent(content)) {
    throw new Error("AI returned stack education JSON in an unexpected shape.");
  }

  return { content, model: modelName };
}

export function normalizeStackContent(
  raw: unknown,
  allowed: LoggedSubstanceRef[]
): StackEducationContent {
  const obj =
    raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};

  const allowedNames = new Set(
    allowed.map((s) => s.name.trim().toLowerCase())
  );
  const filterToAllowed = allowedNames.size > 0;

  const synergies: SynergyObservation[] = [];
  if (Array.isArray(obj.synergies)) {
    for (const item of obj.synergies) {
      if (!item || typeof item !== "object") continue;
      const s = item as Record<string, unknown>;
      let substances = asStringArray(s.substances).slice(0, 5);
      if (filterToAllowed) {
        substances = substances.filter((n) =>
          allowedNames.has(n.toLowerCase())
        );
      }
      if (substances.length < 2) continue;

      const confidence = normalizeConfidence(s.confidence);
      const title = sanitizeEducationText(asText(s.title) || "Mechanism overlap");
      const explanation = sanitizeEducationText(asText(s.explanation));
      if (!explanation || explanation.length < 20) continue;

      synergies.push({
        substances,
        title,
        explanation,
        confidence,
      });

      if (synergies.length >= STACK_EDUCATION_RULES.maxSynergies) break;
    }
  }

  const stackObservations = sanitizeEducationBullets(
    asStringArray(obj.stackObservations)
  ).slice(0, STACK_EDUCATION_RULES.maxStackObservations);

  const disclaimer = ensureSafeDisclaimer(
    asText(obj.disclaimer),
    STACK_DISCLAIMER
  );

  if (!stackObservations.length) {
    stackObservations.push(
      "No strong cross-substance educational patterns were identified for this logged set yet."
    );
  }

  return { synergies, stackObservations, disclaimer };
}

export function emptyStackContent(observation: string): StackEducationContent {
  return {
    synergies: [],
    stackObservations: [observation],
    disclaimer: STACK_DISCLAIMER,
  };
}

function normalizeConfidence(
  value: unknown
): SynergyObservation["confidence"] {
  const s = String(value || "").toLowerCase();
  if (s === "established" || s === "plausible" || s === "speculative") {
    return s;
  }
  return "plausible";
}

function asText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((s) => String(s).trim()).filter(Boolean);
}

function parseJson(raw: string): unknown {
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
