import {
  GoogleGenerativeAI,
  type Content,
  type Part,
} from "@google/generative-ai";
import { sanitizeEducationText } from "@/lib/ai-safety";

const SYSTEM = `You are Forge Protocol Assistant — a calm, premium coach-side helper inside a logging app for serious young lifters (18–28).

You MAY:
- Help organize training logs, recovery notes, and goals
- Explain general training/recovery concepts at a high level
- Help the user structure questions for their medical professional
- Encourage consistency, sleep, progressive overload fundamentals
- Refuse unsafe requests clearly and briefly

You MUST NOT:
- Recommend, design, or suggest any PED, peptide, hormone, SARM, or research-chemical protocols
- Provide dosing, stacks, cycles, sources, administration, or PCT instructions
- Tell the user what compounds to take or stop
- Give medical diagnosis or treatment advice
- Encourage starting enhancement

If asked about compounds/doses/protocols: refuse, restate that the app is for logging + education only, and suggest speaking with a licensed clinician. Stay concise, direct, and anti-hype.`;

export type ChatRole = "user" | "assistant" | "system";

export type ChatTurn = {
  role: ChatRole;
  content: string;
};

export class AiConfigError extends Error {
  code = "MISSING_API_KEY" as const;
  constructor() {
    super(
      "AI is not configured. Add GOOGLE_GENERATIVE_AI_API_KEY (or GEMINI_API_KEY) to your .env file from https://aistudio.google.com/apikey, then restart the dev server."
    );
    this.name = "AiConfigError";
  }
}

export class AiRequestError extends Error {
  code = "AI_REQUEST_FAILED" as const;
  constructor(message: string) {
    super(message);
    this.name = "AiRequestError";
  }
}

/** Prefer GOOGLE_GENERATIVE_AI_API_KEY, fall back to GEMINI_API_KEY */
export function getGeminiApiKey(): string | null {
  const key =
    process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim() ||
    process.env.GEMINI_API_KEY?.trim();
  if (!key) return null;
  return key;
}

export function isAiConfigured(): boolean {
  return Boolean(getGeminiApiKey());
}

export function getGeminiModelName(): string {
  return (
    process.env.GEMINI_MODEL?.trim() ||
    process.env.GOOGLE_GENERATIVE_AI_MODEL?.trim() ||
    "gemini-2.0-flash"
  );
}

/**
 * Call Google Gemini and return assistant text.
 * Conversation history is passed as multi-turn contents (user/model).
 */
export async function chatWithForgeAI(messages: ChatTurn[]): Promise<string> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new AiConfigError();
  }

  const safe = messages
    .filter(
      (m) =>
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim().length > 0
    )
    .map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content.trim(),
    }));

  if (safe.length === 0) {
    throw new AiRequestError("No valid messages to send.");
  }

  const contents = toGeminiContents(safe);
  if (contents.length === 0) {
    throw new AiRequestError("Could not build a valid chat history for Gemini.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: getGeminiModelName(),
    systemInstruction: SYSTEM,
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 900,
    },
  });

  try {
    const result = await model.generateContent({ contents });
    const text = result.response.text()?.trim();
    if (!text) {
      // Blocked or empty
      const block = result.response.promptFeedback?.blockReason;
      if (block) {
        throw new AiRequestError(
          `Gemini blocked the request (${block}). Try rephrasing.`
        );
      }
      throw new AiRequestError("Gemini returned an empty response. Try again.");
    }
    // Final safety pass — strip accidental dosing/protocol leaks
    return sanitizeEducationText(text);
  } catch (err) {
    if (err instanceof AiConfigError || err instanceof AiRequestError) throw err;

    const msg = err instanceof Error ? err.message : String(err);

    if (/API_KEY_INVALID|API key not valid|401|403.*key|invalid.*api.*key/i.test(msg)) {
      throw new AiRequestError(
        "Google rejected the API key. Check GOOGLE_GENERATIVE_AI_API_KEY or GEMINI_API_KEY in .env (https://aistudio.google.com/apikey), then restart the server."
      );
    }
    if (/429|RESOURCE_EXHAUSTED|rate limit|quota/i.test(msg)) {
      throw new AiRequestError(
        "Gemini rate limit or quota hit. Wait a moment and try again, or check your Google AI Studio quota."
      );
    }
    if (/404|not found|is not found for API version/i.test(msg)) {
      throw new AiRequestError(
        `Gemini model error: ${msg.slice(0, 200)}. Set GEMINI_MODEL=gemini-2.0-flash in .env or see Google AI model docs.`
      );
    }
    if (/SAFETY|blocked/i.test(msg)) {
      throw new AiRequestError(
        "Gemini blocked that message for safety. Try a different wording."
      );
    }

    throw new AiRequestError(`AI request failed: ${msg.slice(0, 280)}`);
  }
}

/**
 * Convert app history (user/assistant) into Gemini Content[].
 * - Maps assistant → model
 * - Merges consecutive same-role turns (Gemini is picky about alternation)
 * - Ensures the sequence starts with a user turn
 */
function toGeminiContents(
  messages: { role: "user" | "assistant"; content: string }[]
): Content[] {
  const mapped: Content[] = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content } satisfies Part],
  }));

  // Merge consecutive same roles
  const merged: Content[] = [];
  for (const turn of mapped) {
    const prev = merged[merged.length - 1];
    if (prev && prev.role === turn.role) {
      const prevText = partText(prev.parts);
      const nextText = partText(turn.parts);
      prev.parts = [{ text: `${prevText}\n\n${nextText}` }];
    } else {
      merged.push({
        role: turn.role,
        parts: [...turn.parts],
      });
    }
  }

  // Drop leading model messages (Gemini chat typically starts with user)
  while (merged.length && merged[0].role === "model") {
    merged.shift();
  }

  return merged;
}

function partText(parts: Part[]): string {
  return parts
    .map((p) => ("text" in p && p.text ? p.text : ""))
    .join("")
    .trim();
}
