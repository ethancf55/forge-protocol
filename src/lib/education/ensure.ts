import { prisma } from "@/lib/db";
import { generateSubstanceEducation } from "@/lib/education/generate";
import {
  normalizeSubstanceName,
  slugifySubstanceName,
} from "@/lib/education/slug";
import type { SubstanceKind } from "@/lib/education/types";
import { isSubstanceEducationContent } from "@/lib/education/types";
import { DEFAULT_DISCLAIMER } from "@/content/education/template";
import { normalizeGeneratedContent } from "@/lib/education/generate";

/**
 * Get existing education page or generate + cache one.
 * Shared globally by (kind, normalized name) so every user benefits from cache.
 */
export async function ensureSubstanceEducation(params: {
  name: string;
  kind: SubstanceKind;
  /** Force regenerate even if ready */
  force?: boolean;
}) {
  const name = params.name.trim();
  if (!name) throw new Error("Substance name required");

  const kind = params.kind;
  const nameNormalized = normalizeSubstanceName(name);
  let slug = slugifySubstanceName(name);

  const existing = await prisma.substanceEducation.findUnique({
    where: { kind_nameNormalized: { kind, nameNormalized } },
  });

  if (existing?.status === "ready" && !params.force) {
    return existing;
  }

  // Avoid stampeding generators for the same name
  if (existing?.status === "generating" && !params.force) {
    // Wait briefly for another request to finish
    for (let i = 0; i < 15; i++) {
      await sleep(800);
      const again = await prisma.substanceEducation.findUnique({
        where: { kind_nameNormalized: { kind, nameNormalized } },
      });
      if (again?.status === "ready") return again;
      if (again?.status === "failed") break;
    }
  }

  // Ensure unique slug
  slug = await uniqueSlug(kind, slug, existing?.id);

  const row =
    existing ||
    (await prisma.substanceEducation.create({
      data: {
        kind,
        name,
        nameNormalized,
        slug,
        status: "generating",
        contentJson: "{}",
      },
    }));

  if (existing) {
    await prisma.substanceEducation.update({
      where: { id: existing.id },
      data: { status: "generating", error: null },
    });
  }

  try {
    const { content, model } = await generateSubstanceEducation({ name, kind });
    return await prisma.substanceEducation.update({
      where: { id: row.id },
      data: {
        status: "ready",
        contentJson: JSON.stringify(content),
        model,
        error: null,
        name, // refresh display name
        slug,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    // Fallback educational stub so the page still opens (matches template sections)
    const fallback = normalizeGeneratedContent(
      {
        whatItIs: `"${name}" was logged in your history. A detailed AI education page could not be generated yet.`,
        mechanism:
          "Mechanism details are unavailable until generation succeeds. Check API configuration and try regenerating from the education page.",
        commonUses: [
          "Educational placeholder only — not a list of recommendations.",
        ],
        trainingContext:
          "Training context will appear here once generation succeeds. Fundamentals still matter more than any substance narrative.",
        evidenceQuality:
          "Evidence quality notes will appear after a successful AI generation.",
        anabolicAndrogenicRatio:
          kind === "compound"
            ? {
                ratio: null,
                applicability: "unknown",
                notes: "A:A ratio unavailable until generation succeeds.",
              }
            : undefined,
        importantToKnow: [
          "Do not treat this page as medical advice.",
          "Forge Protocol never provides dosing or protocols.",
          message.slice(0, 200),
        ],
        disclaimer: DEFAULT_DISCLAIMER,
      },
      undefined,
      kind as SubstanceKind
    );

    return await prisma.substanceEducation.update({
      where: { id: row.id },
      data: {
        status: "failed",
        contentJson: JSON.stringify(fallback),
        error: message.slice(0, 500),
        slug,
      },
    });
  }
}

export function parseEducationContent(contentJson: string) {
  try {
    const parsed = JSON.parse(contentJson);
    if (isSubstanceEducationContent(parsed)) return parsed;
  } catch {
    /* ignore */
  }
  return {
    whatItIs: "Content unavailable.",
    mechanism: "",
    commonUses: [] as string[],
    importantToKnow: [] as string[],
    disclaimer: DEFAULT_DISCLAIMER,
  };
}

async function uniqueSlug(kind: string, base: string, excludeId?: string) {
  let slug = base;
  let n = 2;
  while (true) {
    const hit = await prisma.substanceEducation.findUnique({
      where: { kind_slug: { kind, slug } },
    });
    if (!hit || hit.id === excludeId) return slug;
    slug = `${base}-${n}`;
    n += 1;
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
