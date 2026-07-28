import { markdownToBlocks } from "@/content/guides/markdown";
import type { LearningLesson, LearningPath } from "@/content/mind/types";

/**
 * ============================================================
 * MIND → LEARNING LIBRARY
 * ============================================================
 * Add lessons below, then include their slug in a path’s lessonSlugs.
 * Also link out to /guides/* for long-form training content.
 */

function lesson(
  meta: Omit<LearningLesson, "body">,
  md: string
): LearningLesson {
  return { ...meta, body: markdownToBlocks(md) };
}

export const LEARNING_PATHS: LearningPath[] = [
  {
    slug: "mental-foundations",
    title: "Mental foundations",
    summary:
      "Standards, attention, and character under pressure — the operating system under the training.",
    order: 10,
    published: true,
    lessonSlugs: [
      "standards-over-motivation",
      "attention-as-a-muscle",
      "identity-without-performance-theater",
    ],
  },
  {
    slug: "learning-how-to-learn",
    title: "Learning how to learn",
    summary:
      "How serious people actually get smarter: deliberate practice, notes, and anti-scrolling study.",
    order: 20,
    published: true,
    lessonSlugs: [
      "deliberate-practice-basics",
      "active-recall-and-notes",
      "curating-inputs",
    ],
  },
  {
    slug: "training-literacy",
    title: "Training literacy",
    summary:
      "Pointers into the main Guides library — hypertrophy, intensity, recovery thinking.",
    order: 30,
    published: true,
    lessonSlugs: [
      "read-hypertrophy-principles",
      "read-intensity-volume",
      "read-metabolic-efficiency",
    ],
  },
];

export const LEARNING_LESSONS: LearningLesson[] = [
  lesson(
    {
      slug: "standards-over-motivation",
      title: "Standards over motivation",
      summary:
        "Why feelings are bad managers, and how written standards create consistency.",
      pathSlug: "mental-foundations",
      minutes: 5,
      order: 10,
      published: true,
      tags: ["discipline", "identity"],
    },
    `
Motivation is a visitor. Standards are the lease.

## Write the standard

Examples of clear standards:

- Train the plan unless injured or genuinely sick  
- One hard non-gym task before entertainment  
- Phone not in the bedroom  

Vague goals (“be disciplined”) fail. Specific behaviors survive bad moods.

## Review weekly

A standard you never review becomes wallpaper. Once a week: did you keep it? Adjust if it’s unrealistic — don’t silently abandon it.
`
  ),
  lesson(
    {
      slug: "attention-as-a-muscle",
      title: "Attention as a muscle",
      summary:
        "Focus is trainable. Distraction is a training partner you keep failing to beat.",
      pathSlug: "mental-foundations",
      minutes: 5,
      order: 20,
      published: true,
      tags: ["focus", "meditation"],
    },
    `
You wouldn’t expect a deadlift PR with no progressive exposure. Attention works the same way.

## Progressive focus

- Start with short protected blocks  
- Remove the easiest distraction first (notifications)  
- Track deep work like you track sessions  

## Recovery for attention

Sleep debt destroys focus faster than any app “focus mode” can fix. Treat sleep as cognitive equipment.
`
  ),
  lesson(
    {
      slug: "identity-without-performance-theater",
      title: "Identity without performance theater",
      summary:
        "Be someone who does the work — not someone who only posts the work.",
      pathSlug: "mental-foundations",
      minutes: 4,
      order: 30,
      published: true,
      tags: ["character"],
    },
    `
Performance theater is optimizing for being seen as disciplined. Real discipline often looks boring and private.

## Signal vs substance

Ask: if nobody could see this, would I still do it? If the answer is usually no, the identity is brittle.

## Integration with training

The same honesty that makes a good training log — weight, reps, misses — applies to mind work. Log reality.
`
  ),
  lesson(
    {
      slug: "deliberate-practice-basics",
      title: "Deliberate practice basics",
      summary:
        "Practice with a target, feedback, and difficulty — not endless passive reps.",
      pathSlug: "learning-how-to-learn",
      minutes: 6,
      order: 10,
      published: true,
      tags: ["learning", "practice"],
    },
    `
Deliberate practice is not “time spent.” It’s designed difficulty with feedback.

## Elements

1. Specific skill target  
2. Full attention  
3. Feedback (coach, video, quiz, log)  
4. Repeat near the edge of ability  

Scrolling training content is not practice. Running a hard set with intent is. Studying a concept and testing yourself is.

## For lifters

Apply this to technique cues, programming literacy, and life skills — same engine.
`
  ),
  lesson(
    {
      slug: "active-recall-and-notes",
      title: "Active recall and notes",
      summary:
        "Close the book and retrieve. Notes should be tools, not graveyards.",
      pathSlug: "learning-how-to-learn",
      minutes: 5,
      order: 20,
      published: true,
      tags: ["learning", "memory"],
    },
    `
Re-reading feels productive. Retrieval *is* productive.

## Simple method

1. Study a section  
2. Close it  
3. Write what you remember  
4. Check gaps  

## Notes that work

- Short  
- In your words  
- Linked to questions you can retest later  

Pretty notes you never review are decoration.
`
  ),
  lesson(
    {
      slug: "curating-inputs",
      title: "Curating your inputs",
      summary:
        "Your information diet trains your mind. Most feeds train anxiety and envy.",
      pathSlug: "learning-how-to-learn",
      minutes: 4,
      order: 30,
      published: true,
      tags: ["attention", "inputs"],
    },
    `
You wouldn’t eat random powder from unlabeled bags. Treat media the same way.

## Rules of thumb

- Prefer long-form over rage clips for learning  
- Follow people who update beliefs with evidence  
- Unfollow accounts that only sell insecurity  

The Mind → Learning library and the main Guides are intentional inputs. Use them on purpose.
`
  ),
  // Bridge lessons → existing long-form guides
  lesson(
    {
      slug: "read-hypertrophy-principles",
      title: "Next read: Hypertrophy principles",
      summary:
        "Open the full guide on mechanical tension, volume, and progressive overload.",
      pathSlug: "training-literacy",
      minutes: 1,
      order: 10,
      published: true,
      tags: ["guides", "training"],
    },
    `
## Deep dive

Open the full guide in the main library:

**Training Principles That Drive the Most Hypertrophy**  
Path: Guides → hypertrophy-training-principles  
URL: /guides/hypertrophy-training-principles

Come back here when done and note one principle you’ll apply this week.
`
  ),
  lesson(
    {
      slug: "read-intensity-volume",
      title: "Next read: Intensity vs volume",
      summary:
        "How load, effort, and volume actually interact — without program dogma.",
      pathSlug: "training-literacy",
      minutes: 1,
      order: 20,
      published: true,
      tags: ["guides", "training"],
    },
    `
## Deep dive

**Training Intensity vs Volume: What Most Lifters Get Wrong**  
URL: /guides/training-intensity-vs-volume
`
  ),
  lesson(
    {
      slug: "read-metabolic-efficiency",
      title: "Next read: Metabolic efficiency",
      summary:
        "What metabolic efficiency means for lifters — without gimmick fat-loss language.",
      pathSlug: "training-literacy",
      minutes: 1,
      order: 30,
      published: true,
      tags: ["guides", "nutrition"],
    },
    `
## Deep dive

**Metabolic Efficiency: What It Actually Means for Lifters**  
URL: /guides/metabolic-efficiency-lifters
`
  ),
];

export function getPublishedPaths() {
  return LEARNING_PATHS.filter((p) => p.published).sort(
    (a, b) => a.order - b.order
  );
}

export function getPathBySlug(slug: string) {
  return LEARNING_PATHS.find((p) => p.slug === slug && p.published);
}

export function getPublishedLessons() {
  return LEARNING_LESSONS.filter((l) => l.published).sort(
    (a, b) => a.order - b.order
  );
}

export function getLessonBySlug(slug: string) {
  return LEARNING_LESSONS.find((l) => l.slug === slug && l.published);
}

export function getLessonsForPath(pathSlug: string) {
  const path = getPathBySlug(pathSlug);
  if (!path) return [];
  return path.lessonSlugs
    .map((s) => getLessonBySlug(s))
    .filter(Boolean) as LearningLesson[];
}

/**
 * HOW TO ADD A LESSON
 * 1. Add a lesson() entry to LEARNING_LESSONS
 * 2. Add its slug to the right path’s lessonSlugs
 * 3. Save — it appears under /mind/learning
 */
