import { createHash } from "crypto";
import { prisma } from "@/lib/db";
import {
  emptyStackContent,
  generateStackEducation,
  normalizeStackContent,
} from "@/lib/education/stack-generate";
import { STACK_DISCLAIMER } from "@/content/education/stack-template";
import { normalizeSubstanceName } from "@/lib/education/slug";
import type {
  LoggedSubstanceRef,
  StackEducationContent,
  SubstanceKind,
} from "@/lib/education/types";
import { isStackEducationContent } from "@/lib/education/types";

/**
 * Load distinct substances the user has logged (supplements + compounds).
 */
export async function getUserLoggedSubstances(
  userId: string
): Promise<LoggedSubstanceRef[]> {
  const [supps, compounds] = await Promise.all([
    prisma.supplementLog.findMany({
      where: { userId },
      select: { name: true },
      distinct: ["name"],
      orderBy: { name: "asc" },
      take: 40,
    }),
    prisma.compoundLog.findMany({
      where: { userId },
      select: { name: true },
      distinct: ["name"],
      orderBy: { name: "asc" },
      take: 40,
    }),
  ]);

  const out: LoggedSubstanceRef[] = [
    ...supps.map((s) => ({
      kind: "supplement" as SubstanceKind,
      name: s.name.trim(),
    })),
    ...compounds.map((c) => ({
      kind: "compound" as SubstanceKind,
      name: c.name.trim(),
    })),
  ].filter((s) => s.name);

  // De-dupe by kind+normalized name
  const seen = new Set<string>();
  return out.filter((s) => {
    const key = `${s.kind}:${normalizeSubstanceName(s.name)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function hashSubstances(substances: LoggedSubstanceRef[]): string {
  const key = substances
    .map((s) => `${s.kind}:${normalizeSubstanceName(s.name)}`)
    .sort()
    .join("|");
  return createHash("sha256").update(key).digest("hex").slice(0, 32);
}

/**
 * Get or generate cached stack education for the user's current substance set.
 */
export async function ensureUserStackEducation(params: {
  userId: string;
  force?: boolean;
}): Promise<{
  substances: LoggedSubstanceRef[];
  content: StackEducationContent;
  status: string;
  model: string | null;
  error: string | null;
  fromCache: boolean;
}> {
  const substances = await getUserLoggedSubstances(params.userId);
  const substancesHash = hashSubstances(substances);

  if (substances.length < 2) {
    return {
      substances,
      content: emptyStackContent(
        "Log at least two different compounds or supplements to see educational synergies and Stack Observations."
      ),
      status: "ready",
      model: null,
      error: null,
      fromCache: false,
    };
  }

  const existing = await prisma.userStackEducation.findUnique({
    where: {
      userId_substancesHash: {
        userId: params.userId,
        substancesHash,
      },
    },
  });

  if (existing?.status === "ready" && !params.force) {
    return {
      substances,
      content: parseStackContent(existing.contentJson),
      status: existing.status,
      model: existing.model,
      error: existing.error,
      fromCache: true,
    };
  }

  if (existing?.status === "generating" && !params.force) {
    for (let i = 0; i < 12; i++) {
      await sleep(700);
      const again = await prisma.userStackEducation.findUnique({
        where: {
          userId_substancesHash: {
            userId: params.userId,
            substancesHash,
          },
        },
      });
      if (again?.status === "ready") {
        return {
          substances,
          content: parseStackContent(again.contentJson),
          status: again.status,
          model: again.model,
          error: again.error,
          fromCache: true,
        };
      }
      if (again?.status === "failed") break;
    }
  }

  const row =
    existing ||
    (await prisma.userStackEducation.create({
      data: {
        userId: params.userId,
        substancesHash,
        substancesJson: JSON.stringify(substances),
        status: "generating",
        contentJson: "{}",
      },
    }));

  if (existing) {
    await prisma.userStackEducation.update({
      where: { id: existing.id },
      data: {
        status: "generating",
        error: null,
        substancesJson: JSON.stringify(substances),
      },
    });
  }

  try {
    const { content, model } = await generateStackEducation({ substances });
    const updated = await prisma.userStackEducation.update({
      where: { id: row.id },
      data: {
        status: "ready",
        contentJson: JSON.stringify(content),
        model,
        error: null,
        substancesJson: JSON.stringify(substances),
      },
    });
    return {
      substances,
      content,
      status: updated.status,
      model: updated.model,
      error: null,
      fromCache: false,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const fallback = fallbackStackContent(substances, message);
    await prisma.userStackEducation.update({
      where: { id: row.id },
      data: {
        status: "failed",
        contentJson: JSON.stringify(fallback),
        error: message.slice(0, 500),
        substancesJson: JSON.stringify(substances),
      },
    });
    return {
      substances,
      content: fallback,
      status: "failed",
      model: null,
      error: message.slice(0, 500),
      fromCache: false,
    };
  }
}

/**
 * Educational fallback when AI is unavailable — still useful for demos.
 * Uses simple heuristic pattern matching for common educational overlaps.
 */
export function fallbackStackContent(
  substances: LoggedSubstanceRef[],
  errorNote?: string
): StackEducationContent {
  const names = substances.map((s) => s.name);
  const lower = names.map((n) => n.toLowerCase());
  const synergies = [];

  const has = (re: RegExp) => lower.some((n) => re.test(n));
  const findName = (re: RegExp) =>
    names.find((n, i) => re.test(lower[i])) || "";

  if (has(/creatine/) && has(/pqq|pyrroloquinoline/)) {
    synergies.push({
      substances: [findName(/creatine/), findName(/pqq|pyrroloquinoline/)],
      title: "Cellular energy / mitochondrial discussion overlap",
      explanation:
        "In educational discussions, creatine is often framed around high-intensity phosphate energy recycling in muscle, while PQQ is discussed in mitochondrial biogenesis / cellular energy narratives. The overlap is conceptual (cellular energy support themes), not a proven mandatory pairing and not a protocol.",
      confidence: "plausible" as const,
    });
  }

  if (has(/creatine/) && has(/testosterone|anavar|nandrolone|dbol|dianabol|tren|primo|masteron|eq\b|boldenone/)) {
    const androgen = findName(
      /testosterone|anavar|nandrolone|dbol|dianabol|tren|primo|masteron|eq\b|boldenone/
    );
    synergies.push({
      substances: [findName(/creatine/), androgen],
      title: "Intracellular water / training-adaptation narrative overlap",
      explanation:
        "Creatine is commonly discussed for phosphagen support and increased intracellular water in muscle. Androgens are discussed for androgen-receptor–mediated effects on muscle protein synthesis and training adaptations; some educational commentary also notes fluid/glycogen-related appearance changes. These are parallel training-culture narratives about muscle cell environment — not instructions to combine anything.",
      confidence: "plausible" as const,
    });
  }

  if (has(/vitamin d|vit d|cholecalciferol/) && has(/magnesium|mag /)) {
    synergies.push({
      substances: [
        findName(/vitamin d|vit d|cholecalciferol/),
        findName(/magnesium|mag /),
      ],
      title: "Micronutrient co-discussion pattern",
      explanation:
        "Vitamin D and magnesium often appear together in general wellness education because magnesium is involved in many enzymatic processes and vitamin D status is widely discussed in athletes. This is a common educational co-occurrence pattern — not a dosing stack.",
      confidence: "plausible" as const,
    });
  }

  const stackObservations = [
    `You currently have ${substances.length} distinct logged labels across supplements and compounds — Stack Observations describe patterns in what you already track, not what to add.`,
    "Educational synergy notes focus on overlapping pathways (energy systems, hormones, micronutrients). Overlap does not mean 'more is better.'",
    "Training quality, sleep, and recovery still dominate outcomes relative to any substance narrative.",
    "This analysis is educational only — not medical advice, not a recommendation to use or combine substances.",
    "Forge Protocol never provides dosing, cycles, sources, or administration guidance.",
  ];

  if (errorNote) {
    stackObservations.unshift(
      `AI stack generation was unavailable (${errorNote.slice(0, 120)}). Showing heuristic educational patterns instead.`
    );
  }

  if (!synergies.length) {
    stackObservations.unshift(
      "No high-confidence textbook pairings were auto-matched in this set; regenerate when AI quota is available for fuller analysis."
    );
  }

  return {
    synergies,
    stackObservations,
    disclaimer: STACK_DISCLAIMER,
  };
}

export function parseStackContent(contentJson: string): StackEducationContent {
  try {
    const parsed = JSON.parse(contentJson);
    if (isStackEducationContent(parsed)) {
      return normalizeStackContent(parsed, []);
    }
  } catch {
    /* ignore */
  }
  return emptyStackContent("Stack education content unavailable.");
}

function sleep(ms: number) {
  return Promise.resolve().then(
    () => new Promise((r) => setTimeout(r, ms))
  );
}
