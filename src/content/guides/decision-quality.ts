import type { Guide } from "@/content/types";

/**
 * Example of a guide marked `access: "paid"` for future paywall.
 * Still readable in MVP — badge only; no checkout yet.
 */
export const decisionQuality: Guide = {
  slug: "decision-quality-enhancement",
  title: "Decision quality before you change anything major",
  summary:
    "A thinking framework for high-stakes choices about training, identity, and enhancement culture — education only.",
  category: "Mindset",
  minutes: 8,
  access: "paid",
  published: true,
  order: 50,
  updatedAt: "2026-07-23",
  body: [
    {
      type: "p",
      text: "Most bad decisions in lifting culture do not start with “I want to be reckless.” They start with urgency, comparison, and incomplete stories. This guide is a decision filter — not a green light for anything.",
    },
    {
      type: "h2",
      text: "Separate process problems from fantasy problems",
    },
    {
      type: "ul",
      items: [
        "Process: sleep, consistency, progressive training, enough food",
        "Fantasy: “one missing chemical explains everything”",
      ],
    },
    {
      type: "p",
      text: "If process is broken, chemistry narratives will feel more attractive — and more misleading.",
    },
    {
      type: "h2",
      text: "Questions worth writing down",
    },
    {
      type: "ol",
      items: [
        "What would a good natural year look like with honest consistency?",
        "Am I solving training — or status anxiety?",
        "Would I still want this if nobody saw my physique?",
        "Do I have a real medical professional I can talk to honestly?",
        "What is my definition of enough?",
      ],
    },
    {
      type: "callout",
      variant: "warn",
      title: "This app will not decide for you",
      text: "Forge Protocol will not recommend PEDs, peptides, doses, or protocols. If you need clinical advice, use a clinician — not the AI chat.",
    },
    {
      type: "h2",
      text: "How to use logs in decisions",
    },
    {
      type: "p",
      text: "Before big identity moves, look at 8–12 weeks of training and bodyweight notes. If the log is empty or chaotic, fix the log first. Data will not make the decision — but it will make self-deception harder.",
    },
    {
      type: "callout",
      variant: "default",
      title: "Premium tag (foundation)",
      text: "This guide is marked access: paid for future membership/paywall experiments. Checkout is not active yet.",
    },
  ],
};
