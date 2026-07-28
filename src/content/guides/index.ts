import type { Guide } from "@/content/types";
import { progressiveOverload } from "./progressive-overload";
import { recoveryHabits } from "./recovery-habits";
import { compoundLogging } from "./compound-logging";
import { starterFullBody } from "./starter-full-body";
import { decisionQuality } from "./decision-quality";
import { pedsHormonesYoungLifters } from "./peds-hormones-young-lifters";
import { intensityVsVolume } from "./intensity-vs-volume";
import { alkylationLiverCholestasisTudca } from "./17a-alkylation-liver-cholestasis-tudca";
import { testosteroneBaseAndEstrogen } from "./testosterone-base-and-estrogen";
import { hypertrophyTrainingPrinciples } from "./hypertrophy-training-principles";
import { metabolicEfficiencyLifters } from "./metabolic-efficiency-lifters";
import { safeInjectionPractices } from "./safe-injection-practices";
import { androgensEpoHematocritBp } from "./androgens-epo-hematocrit-blood-pressure";
import { hairLossAndrogensGenetics } from "./hair-loss-androgens-genetics";
import { templateGuide } from "./_template";

/**
 * ============================================================
 * GUIDE REGISTRY — add every guide here
 * ============================================================
 *
 * To add a new guide:
 * 1. Copy `_template.ts` → `my-guide.ts`
 * 2. Fill title, summary, access, and Markdown body
 * 3. Import it below and push into `allGuides`
 * 4. Save and open /guides
 *
 * Tips:
 * - `access: "paid"` = Premium badge only (no lock yet)
 * - `published: false` = hidden
 * - `featured: true` = highlighted on library page
 * - Long guides: write Markdown in defineGuide(..., \`...\`)
 */
export const allGuides: Guide[] = [
  pedsHormonesYoungLifters,
  safeInjectionPractices,
  androgensEpoHematocritBp,
  hairLossAndrogensGenetics,
  intensityVsVolume,
  hypertrophyTrainingPrinciples,
  metabolicEfficiencyLifters,
  alkylationLiverCholestasisTudca,
  testosteroneBaseAndEstrogen,
  progressiveOverload,
  recoveryHabits,
  compoundLogging,
  starterFullBody,
  decisionQuality,
  templateGuide, // unpublished template — safe to leave
];

export function getPublishedGuides(): Guide[] {
  return allGuides
    .filter((g) => g.published)
    .sort((a, b) => {
      // Featured first, then order, then title
      const af = a.featured ? 0 : 1;
      const bf = b.featured ? 0 : 1;
      if (af !== bf) return af - bf;
      return a.order - b.order || a.title.localeCompare(b.title);
    });
}

export function getGuideBySlug(slug: string): Guide | undefined {
  return allGuides.find((g) => g.slug === slug && g.published);
}

export function getGuidesByCategory(category: string): Guide[] {
  return getPublishedGuides().filter((g) => g.category === category);
}

export function getGuideCategories(): string[] {
  return [...new Set(getPublishedGuides().map((g) => g.category))];
}

export function getFeaturedGuides(): Guide[] {
  return getPublishedGuides().filter((g) => g.featured);
}

export function getFreeGuides(): Guide[] {
  return getPublishedGuides().filter((g) => g.access === "free");
}

export function getPaidGuides(): Guide[] {
  return getPublishedGuides().filter((g) => g.access === "paid");
}

/** Rough word count for minutes sanity-check */
export function estimateGuideWords(guide: Guide): number {
  return guide.body.reduce((n, b) => {
    if (b.type === "p" || b.type === "h2" || b.type === "h3" || b.type === "quote") {
      return n + b.text.split(/\s+/).length;
    }
    if (b.type === "callout") return n + b.text.split(/\s+/).length;
    if (b.type === "ul" || b.type === "ol") {
      return n + b.items.join(" ").split(/\s+/).length;
    }
    return n;
  }, 0);
}
