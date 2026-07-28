import type { ContentBlock } from "@/content/types";

/** Built-in discipline habits users can check off daily */
export type DisciplineHabitDef = {
  key: string;
  title: string;
  summary: string;
  /** Short grounded prompt shown on the card */
  prompt: string;
  category: "focus" | "exposure" | "work" | "learning" | "character";
  /** Suggest logging minutes (meditation, study) */
  trackMinutes?: boolean;
  order: number;
};

/** Longer practice explainers under Discipline */
export type DisciplinePractice = {
  slug: string;
  title: string;
  summary: string;
  minutes: number;
  order: number;
  published: boolean;
  relatedHabitKeys?: string[];
  body: ContentBlock[];
};

/** Learning library paths (collections) */
export type LearningPath = {
  slug: string;
  title: string;
  summary: string;
  order: number;
  published: boolean;
  /** Lesson slugs in recommended order */
  lessonSlugs: string[];
};

/** Individual learning lessons / principles */
export type LearningLesson = {
  slug: string;
  title: string;
  summary: string;
  pathSlug: string;
  minutes: number;
  order: number;
  published: boolean;
  tags?: string[];
  body: ContentBlock[];
};
