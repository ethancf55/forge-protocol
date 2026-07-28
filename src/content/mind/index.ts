/**
 * Mind pillar — content entrypoint
 *
 * Structure:
 *   mind/
 *     discipline/habits.ts      — daily check-in catalog
 *     discipline/practices.ts   — longer discipline essays
 *     learning/index.ts         — paths + lessons (grow here)
 *     types.ts
 */

export {
  DISCIPLINE_HABITS,
  getDisciplineHabit,
  getDisciplineHabits,
} from "./discipline/habits";
export {
  getPublishedPractices,
  getPracticeBySlug,
} from "./discipline/practices";
export {
  getPublishedPaths,
  getPathBySlug,
  getPublishedLessons,
  getLessonBySlug,
  getLessonsForPath,
  LEARNING_PATHS,
  LEARNING_LESSONS,
} from "./learning";
export type {
  DisciplineHabitDef,
  DisciplinePractice,
  LearningLesson,
  LearningPath,
} from "./types";
