/**
 * @deprecated Import from `@/content/guides` instead.
 * Kept as a thin re-export so old imports do not break.
 */
export {
  getPublishedGuides as guidesList,
  getGuideBySlug as getGuide,
  allGuides,
} from "@/content/guides";

// Legacy shape helpers if needed
import { getPublishedGuides } from "@/content/guides";

/** @deprecated use getPublishedGuides() */
export const guides = getPublishedGuides().map((g) => ({
  slug: g.slug,
  title: g.title,
  tag: g.category,
  minutes: g.minutes,
  summary: g.summary,
  body: g.body
    .filter((b) => b.type === "p")
    .map((b) => ("text" in b ? b.text : "")),
}));
