export type Guide = {
  slug: string;
  title: string;
  tag: string;
  minutes: number;
  summary: string;
  body: string[];
};

export const guides: Guide[] = [
  {
    slug: "progressive-overload-basics",
    title: "Progressive overload without chaos",
    tag: "Training",
    minutes: 5,
    summary: "How to add stress over time without wrecking joints or sleep.",
    body: [
      "Progressive overload means gradually increasing the demand on a lift or muscle group over weeks — not maxing out every session.",
      "Useful levers: load, reps, sets, rest quality, and technique standard. Pick one primary lever per block.",
      "If recovery is failing (poor sleep, joint pain, stalled performance), volume and intensity need management — not random new exercises.",
      "Log your sessions. Trends beat feelings. This app exists so you can see those trends clearly.",
    ],
  },
  {
    slug: "recovery-stack-habits",
    title: "Recovery that actually moves the needle",
    tag: "Recovery",
    minutes: 4,
    summary: "Sleep, protein, steps, and stress — the boring multipliers.",
    body: [
      "Sleep regularity beats occasional long nights. Aim for a consistent window first.",
      "Protein and total calories support training adaptation; fancy supplements do not fix a chaotic diet.",
      "Daily steps and light movement can aid recovery without becoming junk volume.",
      "If you log supplements here, treat the log as a record — not a protocol designer.",
    ],
  },
  {
    slug: "logging-compounds-ethically",
    title: "How to use compound logging responsibly",
    tag: "Safety",
    minutes: 4,
    summary: "Self-report only. No recommendations. Clear boundaries.",
    body: [
      "Forge Protocol lets you log compounds you already use so your history stays in one place.",
      "The app will never suggest what to take, how much, or when. That is out of scope by design.",
      "Incomplete online advice is common. Logging is not the same as clinical care.",
      "Health questions belong with a licensed medical professional — not a chatbot or a forum.",
    ],
  },
  {
    slug: "starter-full-body-3x",
    title: "Starter program: full body 3x / week",
    tag: "Program",
    minutes: 6,
    summary: "A simple natural-friendly template for structure — adjust to your equipment.",
    body: [
      "Day A: Squat pattern · Horizontal push · Horizontal pull · Hinge accessory · Core",
      "Day B: Hinge pattern · Vertical push · Vertical pull · Single-leg work · Arms/core",
      "Day C: Repeat A or a lighter technique-focused mix depending on recovery.",
      "Progress: add a little load or a rep when form stays clean. Rest 2–3 minutes on main lifts.",
      "This is educational structure, not personalized coaching. Stop if pain (not effort) appears.",
    ],
  },
];

export function getGuide(slug: string) {
  return guides.find((g) => g.slug === slug);
}
