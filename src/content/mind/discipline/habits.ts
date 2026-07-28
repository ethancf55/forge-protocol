import type { DisciplineHabitDef } from "@/content/mind/types";

/**
 * Default discipline habits for daily check-ins.
 * Add new keys carefully — existing check-ins reference these keys.
 */
export const DISCIPLINE_HABITS: DisciplineHabitDef[] = [
  {
    key: "meditation",
    title: "Meditation / stillness",
    summary: "Sit with discomfort without scrolling away from it.",
    prompt: "Did you practice stillness or breath focus today?",
    category: "focus",
    trackMinutes: true,
    order: 10,
  },
  {
    key: "hard-task",
    title: "Hard task first",
    summary: "Do the important hard thing before the easy ones.",
    prompt: "Did you complete one high-resistance task you were avoiding?",
    category: "work",
    order: 20,
  },
  {
    key: "learning-time",
    title: "Focused learning",
    summary: "Deliberate study beats passive content consumption.",
    prompt: "Did you protect focused learning time (not just scrolling)?",
    category: "learning",
    trackMinutes: true,
    order: 30,
  },
  {
    key: "cold-exposure-mindset",
    title: "Voluntary discomfort",
    summary:
      "Cold, hard cardio finishers, early alarms — choose one deliberate hard thing.",
    prompt: "Did you choose a short bout of voluntary discomfort today?",
    category: "exposure",
    order: 40,
  },
  {
    key: "delayed-gratification",
    title: "Delayed gratification",
    summary: "Want it? Wait. Practice the gap between urge and action.",
    prompt: "Did you delay an urge on purpose (scroll, snack, buy, skip)?",
    category: "character",
    order: 50,
  },
  {
    key: "show-up",
    title: "Showed up anyway",
    summary: "Trained, studied, or worked when motivation was low.",
    prompt: "Did you show up for a commitment when you didn’t feel like it?",
    category: "character",
    order: 60,
  },
];

export function getDisciplineHabit(key: string) {
  return DISCIPLINE_HABITS.find((h) => h.key === key);
}

export function getDisciplineHabits() {
  return [...DISCIPLINE_HABITS].sort((a, b) => a.order - b.order);
}
