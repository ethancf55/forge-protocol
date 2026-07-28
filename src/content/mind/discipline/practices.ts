import { markdownToBlocks } from "@/content/guides/markdown";
import type { DisciplinePractice } from "@/content/mind/types";

function practice(
  meta: Omit<DisciplinePractice, "body">,
  md: string
): DisciplinePractice {
  return { ...meta, body: markdownToBlocks(md) };
}

export const DISCIPLINE_PRACTICES: DisciplinePractice[] = [
  practice(
    {
      slug: "showing-up-when-hard",
      title: "Showing up when it’s hard",
      summary:
        "Motivation is weather. Standards are climate. How to act when you don’t feel like it.",
      minutes: 6,
      order: 10,
      published: true,
      relatedHabitKeys: ["show-up", "hard-task"],
    },
    `
Discipline is not constant hype. It’s the ability to execute a pre-decided standard when your brain offers excuses.

## Motivation is unreliable

Serious lifters already know this in the gym: you don’t wait to “feel explosive” to train. The Mind pillar applies the same rule to attention, study, and character.

## A grounded approach

1. **Decide the minimum the night before** — one hard task, one session, one study block  
2. **Shrink activation energy** — bag packed, tab open, shoes by the door  
3. **Start for two minutes** — most resistance is at the start, not the middle  
4. **Don’t negotiate mid-session** — renegotiate only after you finish the minimum  

## What this is not

- Not self-punishment  
- Not ignoring injury or real recovery needs  
- Not performing toughness for social media  

::: tip Standard
“I do what I said I would, especially on average days.”
:::
`
  ),
  practice(
    {
      slug: "meditation-without-mysticism",
      title: "Meditation without mysticism",
      summary:
        "Stillness as attention training — practical, secular, and useful for lifters.",
      minutes: 7,
      order: 20,
      published: true,
      relatedHabitKeys: ["meditation"],
    },
    `
You don’t need a personality rebrand to sit still. Meditation here means **training attention** and tolerance for boredom.

## Why it helps hard people

Lifting already teaches discomfort tolerance under load. Meditation teaches discomfort tolerance **without a barbell** — urges, restlessness, and the need to check a phone.

## A simple form

- Sit or lie still  
- Pick an anchor (breath, body, ambient sound)  
- When the mind wanders, notice and return — that return *is* the rep  

No perfect silence required. Distraction is the resistance band.

## Common failure modes

- Expecting calm every session  
- Using it as spiritual cosplay instead of practice  
- Skipping it only when life is chaotic — that’s when it’s most useful  

::: tip Framing
Count returns to the anchor like quality reps, not empty minutes.
:::
`
  ),
  practice(
    {
      slug: "voluntary-discomfort",
      title: "Voluntary discomfort",
      summary:
        "Cold, hard finishes, early starts — choose small stresses you control so life’s stresses hit softer.",
      minutes: 6,
      order: 30,
      published: true,
      relatedHabitKeys: ["cold-exposure-mindset"],
    },
    `
Voluntary discomfort is **chosen stress with an off-switch**. The point is not suffering for status. It’s practicing the skill of staying composed when the body wants out.

## Examples (menu, not mandate)

- Cold shower finish  
- Extra hard last set of cardio you already planned  
- No headphones for a hard session  
- Early wake for a non-negotiable morning block  

## Rules that keep it sane

- Don’t stack stupid risk on top of training injuries  
- Don’t use it to avoid real problems (sleep, food, therapy when needed)  
- Keep it short and repeatable — identity is built by reps  

## Delayed gratification link

The same muscle decides: scroll now or study; skip training or train; buy now or wait. Small daily delays compound into character.

::: warn Boundary
This is mindset education, not medical advice for cold exposure or extreme challenges.
:::
`
  ),
  practice(
    {
      slug: "deep-work-blocks",
      title: "Deep work blocks",
      summary:
        "Protected learning and focus time — the opposite of passive content consumption.",
      minutes: 5,
      order: 40,
      published: true,
      relatedHabitKeys: ["learning-time", "hard-task"],
    },
    `
Deep work is uninterrupted focus on something that compounds: studying training science, reading a hard book, building a skill.

## Vs passive consumption

| Passive | Deep |
|---------|------|
| Infinite scroll | Single task |
| Dopamine grazing | Effortful attention |
| Feels busy | Produces understanding |

## Setup principles

- Phone out of reach or grayscale  
- One objective for the block  
- Short enough to finish (25–50 minutes is fine)  
- Log it under Learning time when done  

Consistency beats heroic 4-hour sessions you abandon in a week.
`
  ),
];

export function getPublishedPractices() {
  return DISCIPLINE_PRACTICES.filter((p) => p.published).sort(
    (a, b) => a.order - b.order
  );
}

export function getPracticeBySlug(slug: string) {
  return DISCIPLINE_PRACTICES.find((p) => p.slug === slug && p.published);
}
