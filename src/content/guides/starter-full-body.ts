import type { Guide } from "@/content/types";

export const starterFullBody: Guide = {
  slug: "starter-full-body-3x",
  title: "Starter structure: full body 3× / week",
  summary:
    "A simple educational template for structure — adjust to your equipment and recovery. Not personalized coaching.",
  category: "Program",
  minutes: 9,
  access: "free",
  published: true,
  order: 40,
  updatedAt: "2026-07-23",
  body: [
    {
      type: "p",
      text: "This is a starter structure for lifters who want a clear week without a 6-day bro-split that collapses under real life. Treat it as education, not a prescription. Adjust exercises to what you have and what you can perform pain-free.",
    },
    {
      type: "callout",
      variant: "warn",
      title: "Stop rules",
      text: "Stop a movement if you feel sharp joint pain (not normal muscular effort). This is not medical advice. Get form coached in person if you are new to barbell lifts.",
    },
    {
      type: "h2",
      text: "Weekly layout",
    },
    {
      type: "p",
      text: "Train three non-consecutive days when possible (e.g. Mon / Wed / Fri). If you miss a day, continue the rotation — do not “make up” by doubling.",
    },
    {
      type: "h3",
      text: "Day A",
    },
    {
      type: "ul",
      items: [
        "Squat pattern (back squat, goblet squat, or leg press)",
        "Horizontal push (bench or push-ups)",
        "Horizontal pull (row variation)",
        "Hinge accessory (RDL or back extension)",
        "Core (plank or dead bug)",
      ],
    },
    {
      type: "h3",
      text: "Day B",
    },
    {
      type: "ul",
      items: [
        "Hinge pattern (deadlift variation you own technically)",
        "Vertical push (overhead press or landmine)",
        "Vertical pull (pulldown or pull-up regression)",
        "Single-leg work (split squat or step-up)",
        "Arms or carry (optional, keep short)",
      ],
    },
    {
      type: "h3",
      text: "Day C",
    },
    {
      type: "p",
      text: "Repeat Day A, or run a lighter technique-focused mix if recovery is poor: slightly fewer sets, same movement patterns, clean form.",
    },
    {
      type: "h2",
      text: "Sets, reps, rest (educational ranges)",
    },
    {
      type: "ul",
      items: [
        "Main lifts: roughly 3–4 hard sets in a moderate rep range you can control",
        "Accessories: 2–3 sets",
        "Rest on main lifts: often 2–3 minutes — enough to perform, not to scroll forever",
      ],
    },
    {
      type: "h2",
      text: "Progression",
    },
    {
      type: "ol",
      items: [
        "Write the session in Log with a clear title (e.g. “Full body A”).",
        "When all work sets hit the top of your rep target with clean form, add a small load next time.",
        "If form breaks, keep the weight or stop a set earlier.",
        "Review History weekly: something should trend up over a month.",
      ],
    },
    {
      type: "callout",
      variant: "tip",
      title: "Busy-week version",
      text: "Keep the main lift + one push + one pull. Skip the extras. Consistency beats a perfect template you abandon.",
    },
    {
      type: "p",
      text: "This structure is for general education. It is not a personalized program, not physical therapy, and not a guarantee of results.",
    },
  ],
};
