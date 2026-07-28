import {
  EDUCATION_GUIDE_INDEX,
  SUBSTANCE_CATALOG,
  normalizeMatchKey,
  type AppearanceFlag,
  type AromatizationFlag,
  type GuideLinkKey,
  type SubstanceClassTag,
  type SubstanceProfile,
  type SubstanceRouteHint,
} from "@/content/education/substance-catalog";
import type { SubstanceKind } from "@/lib/education/types";

export type RelatedGuideLink = {
  slug: string;
  title: string;
  reason: string;
  href: string;
};

export type EducationBriefing = {
  name: string;
  kind: SubstanceKind;
  displayName: string;
  matched: boolean;
  classes: SubstanceClassTag[];
  routes: SubstanceRouteHint[];
  anabolicAndrogenicRatio: string | null;
  aromatizes: AromatizationFlag;
  appearance: AppearanceFlag;
  summary: string;
  bullets: string[];
  relatedGuides: RelatedGuideLink[];
  facts: { label: string; value: string }[];
  disclaimer: string;
};

const DISCLAIMER =
  "Educational information only — not medical advice, not a recommendation to use any substance, and not a protocol. No dosing or administration guidance.";

/**
 * Resolve a substance profile from catalog + heuristics.
 */
export function classifySubstance(
  name: string,
  kind: SubstanceKind
): {
  profile: SubstanceProfile | null;
  matched: boolean;
  classes: SubstanceClassTag[];
  routes: SubstanceRouteHint[];
  tags: SubstanceProfile["educationTags"];
} {
  const key = normalizeMatchKey(name);
  const catalogHit = findCatalogProfile(key);

  if (catalogHit) {
    return {
      profile: catalogHit,
      matched: true,
      classes: catalogHit.classes,
      routes: catalogHit.routes,
      tags: catalogHit.educationTags,
    };
  }

  // Heuristic fallback for unknown names
  const classes: SubstanceClassTag[] = [];
  const routes: SubstanceRouteHint[] = [];
  const tags: SubstanceProfile["educationTags"] = [];

  if (kind === "supplement") {
    classes.push("supplement");
    routes.push("oral");
    tags.push("supplement");
  } else {
    classes.push("unknown");
  }

  // Route hints from keywords
  if (
    /\b(test|enanthate|cypionate|propionate|deca|npp|eq|equipoise|tren|mast|primo|sus|blend|inject|pin)\b/i.test(
      key
    )
  ) {
    routes.push("injectable");
    tags.push("injectable");
    if (kind === "compound") classes.push("injectable_androgen");
  }
  if (
    /\b(oral|dbol|dianabol|anavar|var|anadrol|adrol|tbol|turinabol|winstrol|winny|superdrol|methyl)\b/i.test(
      key
    )
  ) {
    routes.push("oral");
    tags.push("oral", "alkylated", "liver");
    if (kind === "compound") {
      classes.push("oral_androgen", "alkylated_oral");
    }
  }
  if (/\b(mast|masteron|primo|proviron|winstrol|winny|anavar|var|dht)\b/i.test(key)) {
    tags.push("hair");
    classes.push("dht_related");
  }
  if (/\b(test|dbol|dianabol|deca|nandrolone|boldenone|eq)\b/i.test(key)) {
    tags.push("estrogen");
  }
  if (
    kind === "compound" ||
    /\b(test|tren|deca|eq|anadrol|dbol|mast|primo)\b/i.test(key)
  ) {
    tags.push("androgenic", "hematocrit");
  }
  if (kind === "compound") {
    tags.push("decision");
  }

  // Default injectable for bare compound logs that look like ped names without oral flag
  if (
    kind === "compound" &&
    routes.length === 0 &&
    !/\b(supplement|vitamin|creatine|fish oil)\b/i.test(key)
  ) {
    // Don't force injectable — unknown route
    routes.push("unknown");
  }

  if (routes.length === 0) routes.push(kind === "supplement" ? "oral" : "unknown");

  return {
    profile: null,
    matched: false,
    classes: unique(classes),
    routes: unique(routes),
    tags: unique(tags),
  };
}

function findCatalogProfile(key: string): SubstanceProfile | null {
  // Exact key match
  for (const p of SUBSTANCE_CATALOG) {
    if (p.keys.includes(key)) return p;
  }
  // Substring / includes match (longer keys first)
  const allKeys = SUBSTANCE_CATALOG.flatMap((p) =>
    p.keys.map((k) => ({ k, p }))
  ).sort((a, b) => b.k.length - a.k.length);

  for (const { k, p } of allKeys) {
    if (k.length < 3) continue;
    if (key === k || key.includes(k) || k.includes(key)) return p;
  }
  return null;
}

/**
 * Build post-log educational briefing with guide links.
 */
export function buildEducationBriefing(
  name: string,
  kind: SubstanceKind
): EducationBriefing {
  const classified = classifySubstance(name, kind);
  const profile = classified.profile;

  const relatedGuides = resolveGuides(classified.tags, classified.routes, kind);
  const summary =
    profile?.summary ||
    buildFallbackSummary(name, kind, classified.classes, classified.routes);
  const bullets =
    profile?.bullets ||
    buildFallbackBullets(kind, classified.tags, classified.routes);

  const ratio =
    profile?.anabolicAndrogenicRatio !== undefined
      ? profile.anabolicAndrogenicRatio
      : classified.classes.some((c) =>
            [
              "oral_androgen",
              "injectable_androgen",
              "testosterone",
              "dht_related",
              "nandrolone_family",
            ].includes(c)
          )
        ? null
        : null;

  const aromatizes = profile?.aromatizes ?? "unknown";
  const appearance = profile?.appearance ?? "unknown";

  const facts: { label: string; value: string }[] = [];
  facts.push({
    label: "Detected type",
    value: formatClasses(classified.classes, kind),
  });
  facts.push({
    label: "Route education",
    value: classified.routes.map(formatRoute).join(" · ") || "Unknown",
  });
  if (ratio) {
    facts.push({
      label: "Anabolic : Androgenic (classic teaching)",
      value: ratio,
    });
  } else if (kind === "compound" && classified.matched) {
    facts.push({
      label: "Anabolic : Androgenic (classic teaching)",
      value: "Not standardly listed / see full page",
    });
  }
  facts.push({
    label: "Aromatization (educational)",
    value: formatAromatizes(aromatizes),
  });
  if (appearance !== "unknown") {
    facts.push({
      label: "Culture appearance tag",
      value: formatAppearance(appearance),
    });
  }

  return {
    name,
    kind,
    displayName: profile?.displayName || name,
    matched: classified.matched,
    classes: classified.classes,
    routes: classified.routes,
    anabolicAndrogenicRatio: ratio,
    aromatizes,
    appearance,
    summary,
    bullets,
    relatedGuides,
    facts,
    disclaimer: DISCLAIMER,
  };
}

function resolveGuides(
  tags: SubstanceProfile["educationTags"],
  routes: SubstanceRouteHint[],
  kind: SubstanceKind
): RelatedGuideLink[] {
  const keys = new Set<GuideLinkKey>();

  if (tags.includes("injectable") || routes.includes("injectable")) {
    keys.add("injection");
  }
  if (tags.includes("alkylated") || tags.includes("liver") || tags.includes("oral")) {
    if (tags.includes("alkylated") || tags.includes("liver")) {
      keys.add("alkylation");
    }
  }
  if (tags.includes("estrogen") || tags.includes("test_base")) {
    keys.add("estrogen");
  }
  if (tags.includes("hair")) {
    keys.add("hair");
  }
  if (tags.includes("hematocrit") || tags.includes("androgenic")) {
    if (kind === "compound") keys.add("hematocrit");
  }
  if (tags.includes("decision") || kind === "compound") {
    keys.add("peds");
  }
  if (kind === "compound") {
    keys.add("logging");
  }

  // Supplements: lighter guide set
  if (kind === "supplement" && tags.includes("liver")) {
    keys.add("alkylation");
  }

  return [...keys].map((k) => {
    const g = EDUCATION_GUIDE_INDEX[k];
    return {
      slug: g.slug,
      title: g.title,
      reason: g.reason,
      href: `/guides/${g.slug}`,
    };
  });
}

function buildFallbackSummary(
  name: string,
  kind: SubstanceKind,
  classes: SubstanceClassTag[],
  routes: SubstanceRouteHint[]
): string {
  if (kind === "supplement") {
    return `"${name}" was logged as a supplement. Open the full education page for a general mechanism overview. This briefing uses keyword heuristics when the name is not in the curated catalog — verify details and treat everything as educational only.`;
  }
  const routeBit = routes.includes("injectable")
    ? "Injectable-related keywords were detected — review sterile practice education."
    : routes.includes("oral")
      ? "Oral/androgen-related keywords were detected — review alkylation/liver literacy if this is a classic oral androgen."
      : "Route could not be confidently classified from the name alone.";
  return `"${name}" was logged as a compound. ${routeBit} Related deep guides are linked below based on educational tags. Full AI page (when available) has longer mechanism text. Not medical advice.`;
}

function buildFallbackBullets(
  kind: SubstanceKind,
  tags: SubstanceProfile["educationTags"],
  routes: SubstanceRouteHint[]
): string[] {
  const bullets: string[] = [
    "Educational classification only — not a recommendation to use.",
  ];
  if (routes.includes("injectable") || tags.includes("injectable")) {
    bullets.push(
      "Injectable context → hygiene, single-use equipment, and site-rotation literacy matter."
    );
  }
  if (tags.includes("alkylated") || tags.includes("liver")) {
    bullets.push(
      "Oral 17α-alkylated class (if applicable) → hepatic stress / cholestasis education."
    );
  }
  if (tags.includes("estrogen")) {
    bullets.push(
      "Aromatization / estrogen pathway education may apply depending on the exact substance."
    );
  }
  if (tags.includes("hair")) {
    bullets.push(
      "DHT-related or strong androgen narratives → hair outcomes depend heavily on genetics."
    );
  }
  if (tags.includes("hematocrit")) {
    bullets.push(
      "Androgen exposure is discussed in EPO / hematocrit / blood-pressure education."
    );
  }
  if (kind === "supplement") {
    bullets.push(
      "Supplements are not anabolic steroids; open the substance page for specifics."
    );
  }
  return bullets.slice(0, 5);
}

function formatClasses(classes: SubstanceClassTag[], kind: SubstanceKind): string {
  if (!classes.length) return kind === "supplement" ? "Supplement" : "Unclassified compound";
  const map: Record<string, string> = {
    oral_androgen: "Oral androgen (educational class)",
    injectable_androgen: "Injectable androgen (educational class)",
    dht_related: "DHT-related structure (educational)",
    testosterone: "Testosterone / test esters",
    nandrolone_family: "Nandrolone family",
    alkylated_oral: "17α-alkylated oral class",
    peptide: "Peptide (educational)",
    sarm: "SARM (educational)",
    supplement: "Dietary supplement",
    unknown: "Unclassified",
  };
  return unique(classes)
    .map((c) => map[c] || c)
    .join(" · ");
}

function formatRoute(r: SubstanceRouteHint): string {
  if (r === "oral") return "Oral";
  if (r === "injectable") return "Injectable";
  if (r === "topical") return "Topical";
  return "Unknown / not assumed";
}

function formatAromatizes(a: AromatizationFlag): string {
  if (a === "yes") return "Yes — aromatization commonly discussed";
  if (a === "low") return "Low / partial — not identical to testosterone";
  if (a === "no") return "Generally non-aromatizing (standard educational framing)";
  return "Unknown / depends on exact substance";
}

function formatAppearance(a: AppearanceFlag): string {
  if (a === "dry")
    return "Often called “dry” in gym culture (descriptive reputation only)";
  if (a === "wet")
    return "Often called “wet” in gym culture (water/glycogen narratives — not medical)";
  if (a === "mixed") return "Mixed / context-dependent reputation";
  return "Not classified";
}

function unique<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}
