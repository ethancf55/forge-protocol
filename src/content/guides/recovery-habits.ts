import type { Guide } from "@/content/types";

export const recoveryHabits: Guide = {
  slug: "recovery-stack-habits",
  title: "Recovery that actually moves the needle",
  summary:
    "Sleep, protein, steps, and stress — the boring multipliers that decide whether hard training pays off.",
  category: "Recovery",
  minutes: 7,
  access: "free",
  published: true,
  order: 20,
  updatedAt: "2026-07-23",
  body: [
    {
      type: "p",
      text: "Recovery is not a spa day. It is the set of daily inputs that let your body adapt to training. Young lifters often chase advanced tools while ignoring the basics that drive most of the result.",
    },
    {
      type: "h2",
      text: "Sleep first",
    },
    {
      type: "p",
      text: "Sleep regularity beats occasional long nights. A consistent sleep and wake window improves hormones, hunger control, mood, and training output more reliably than most supplements.",
    },
    {
      type: "ul",
      items: [
        "Pick a realistic bedtime you can hit 5+ nights per week.",
        "Protect the hour before bed: dim light, fewer scroll loops, fewer heavy meals if they wreck sleep.",
        "If you train late, plan wind-down deliberately — do not invent a new identity as a “night guy” every semester.",
      ],
    },
    {
      type: "h2",
      text: "Food that supports training",
    },
    {
      type: "p",
      text: "Protein and total calories support adaptation. You do not need perfection. You need enough food, enough protein across the day, and a pattern you can repeat when life is busy.",
    },
    {
      type: "callout",
      variant: "tip",
      title: "Practical standard",
      text: "If your weight and strength are both drifting down while you “eat clean,” you may simply be under-eating. Log bodyweight trends in the app and be honest.",
    },
    {
      type: "h2",
      text: "Steps and easy movement",
    },
    {
      type: "p",
      text: "Daily walking and light movement can improve recovery and appetite without becoming junk training volume. That is different from adding a fourth hard session because you feel guilty.",
    },
    {
      type: "h2",
      text: "Stress and life load",
    },
    {
      type: "p",
      text: "School, work, relationships, and money stress share the same recovery budget as squats. When life load spikes, training volume may need to drop so the work you keep stays high quality.",
    },
    {
      type: "h2",
      text: "Supplements in context",
    },
    {
      type: "p",
      text: "If you log supplements in Forge Protocol, treat the log as a record of what you already use — not a protocol builder. Creatine and basic micronutrient gaps are common topics online; nothing replaces sleep and food.",
    },
    {
      type: "callout",
      variant: "warn",
      title: "Boundary",
      text: "This guide does not prescribe supplements or doses. For health questions, talk to a licensed professional.",
    },
  ],
};
