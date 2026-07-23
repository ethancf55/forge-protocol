import OpenAI from "openai";

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

export function getXaiClient() {
  const key = process.env.XAI_API_KEY;
  if (!key) return null;
  return new OpenAI({
    apiKey: key,
    baseURL: "https://api.x.ai/v1",
  });
}

export async function chatWithForgeAI(
  messages: { role: "user" | "assistant"; content: string }[]
) {
  const client = getXaiClient();
  if (!client) {
    return (
      "AI chat is not configured yet (missing XAI_API_KEY). " +
      "You can still use logging, history, guides, and reminders. " +
      "When enabled, I only help with organization and general education — never dosing or protocols."
    );
  }

  const completion = await client.chat.completions.create({
    model: "grok-4-1-fast-non-reasoning",
    messages: [{ role: "system", content: SYSTEM }, ...messages],
    temperature: 0.4,
    max_tokens: 700,
  });

  return (
    completion.choices[0]?.message?.content?.trim() ||
    "I could not generate a response. Try again."
  );
}
