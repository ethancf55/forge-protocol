import type { Guide } from "@/content/types";

export const compoundLogging: Guide = {
  slug: "logging-compounds-ethically",
  title: "How to use compound logging responsibly",
  summary:
    "Self-report only. Clear boundaries. Why Forge Protocol will never turn into a protocol engine.",
  category: "Safety",
  minutes: 6,
  access: "free",
  published: true,
  order: 30,
  updatedAt: "2026-07-23",
  body: [
    {
      type: "p",
      text: "Some users want one place to keep a private history of compounds they already use. Forge Protocol supports that as a log — the same way a notebook would. It is not a recommendation engine.",
    },
    {
      type: "h2",
      text: "What the compound log is for",
    },
    {
      type: "ul",
      items: [
        "Personal record-keeping so your history stays organized",
        "Context next to training, bodyweight, and notes",
        "Honesty with yourself about what you are actually doing over time",
      ],
    },
    {
      type: "h2",
      text: "What it is not for",
    },
    {
      type: "ul",
      items: [
        "Finding out what you “should” take",
        "Auto-generated stacks, cycles, or PCT plans",
        "Sourcing advice",
        "Medical diagnosis or treatment",
      ],
    },
    {
      type: "callout",
      variant: "warn",
      title: "Hard product rule",
      text: "The app will never suggest what compound to use, how much to use, or when to use it. That is out of scope by design — forever for the MVP philosophy.",
    },
    {
      type: "h2",
      text: "Why online advice is a weak teacher",
    },
    {
      type: "p",
      text: "Comment sections optimize for certainty and engagement. They hide genetics, polypharmacy, lighting, and people who quit after side effects. Logging your own data is still not a substitute for clinical care.",
    },
    {
      type: "h2",
      text: "If you are natural",
    },
    {
      type: "p",
      text: "You can ignore the compound log entirely. Training, weight, supplements, and notes are enough for a complete MVP experience.",
    },
    {
      type: "h2",
      text: "If you already use compounds",
    },
    {
      type: "p",
      text: "Use the log carefully and privately. Pair it with honest training notes. Health decisions belong with a licensed medical professional — not a forum and not the in-app AI.",
    },
    {
      type: "callout",
      variant: "default",
      title: "Educational only",
      text: "This article is educational and policy-focused. It is not medical advice and not encouragement to use PEDs.",
    },
  ],
};
