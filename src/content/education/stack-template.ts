/**
 * Stack education controls — synergies + "Stack Observations".
 * Edit this file to tune multi-substance educational analysis.
 *
 * Educational only: describe overlapping mechanisms and patterns
 * among substances the user ALREADY logged. Never recommend adding,
 * removing, dosing, or combining substances as a protocol.
 */

export const STACK_EDUCATION_RULES = {
  purpose:
    "Given substances the user already logged, explain meaningful mechanism overlaps, additive effect patterns, and educational observations. Do not design stacks or recommend use.",
  minSubstancesForAnalysis: 2,
  maxSynergies: 6,
  maxStackObservations: 7,
  hardBans: [
    "No dosing, amounts, frequencies, or schedules",
    "No 'you should take / add / stack / cycle' language",
    "No sources, vendors, or acquisition advice",
    "No administration methods",
    "No PCT or recovery drug protocols",
    "Do not invent substances that are not in the user's logged list",
    "Do not recommend starting any new compound or supplement",
  ],
  synergyGuidance: [
    "Only discuss pairs/groups that appear in the provided logged list",
    "Explain WHY mechanisms may overlap or add (pathway level) — e.g. mitochondrial support, cell hydration/glycogen context, androgen receptor + training adaptation narratives",
    "Label confidence: established (widely discussed with reasonable physiological basis), plausible (mechanistic logic but thinner evidence), speculative (gym lore / weak support)",
    "Prefer quality over quantity — skip weak forced pairings",
    "If nothing meaningful, return an empty synergies array and say so in stackObservations",
    "Examples of educational synergy framing (do not invent if not logged): creatine + PQQ (mitochondrial / cellular energy discussion), testosterone + creatine (intracellular water / glycogen-related discussion in training culture education)",
  ],
  stackObservationsGuidance: [
    "Cross-cutting patterns across the logged set (e.g. several recovery-oriented labels, heavy androgen focus, mixed evidence tiers)",
    "Educational tips about monitoring concepts, recovery fundamentals, and avoiding narrative overreach — not what to swallow",
    "Remind that logging is not the same as a clinically designed stack",
    "Call out when two items may load the same pathway so the user understands redundancy as a concept",
    "3–7 bullets max; each bullet educational, not imperative",
  ],
} as const;

export const STACK_DISCLAIMER =
  "Stack Observations and synergy notes are educational only. They are not medical advice, not a recommendation to use or combine any substances, and not a protocol. Forge Protocol never provides dosing, stacks-as-prescriptions, sources, or administration guidance. Consult a licensed medical professional for personal decisions.";
