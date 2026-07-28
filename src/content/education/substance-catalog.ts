/**
 * Curated educational profiles for common logged substances.
 * Match by alias keys (lowercase). Used for post-log briefings + guide routing.
 *
 * Rules: educational only — no dosing, protocols, or recommendations to use.
 */

export type SubstanceRouteHint = "oral" | "injectable" | "topical" | "unknown";

export type SubstanceClassTag =
  | "oral_androgen"
  | "injectable_androgen"
  | "dht_related"
  | "testosterone"
  | "nandrolone_family"
  | "alkylated_oral"
  | "peptide"
  | "sarm"
  | "supplement"
  | "unknown";

export type AromatizationFlag = "yes" | "low" | "no" | "unknown";
export type AppearanceFlag = "dry" | "wet" | "mixed" | "unknown";

export type SubstanceProfile = {
  /** Match keys: lowercase names/aliases */
  keys: string[];
  displayName: string;
  classes: SubstanceClassTag[];
  routes: SubstanceRouteHint[];
  /** Classic teaching ratio when known, e.g. "100:100" */
  anabolicAndrogenicRatio?: string | null;
  aromatizes: AromatizationFlag;
  /** Culture term with educational caveats in summary — not medical taxonomy */
  appearance: AppearanceFlag;
  /** Tags that drive related guide selection */
  educationTags: Array<
    | "injectable"
    | "oral"
    | "alkylated"
    | "androgenic"
    | "estrogen"
    | "hair"
    | "hematocrit"
    | "liver"
    | "test_base"
    | "supplement"
    | "decision"
  >;
  /** Short educational summary after logging */
  summary: string;
  /** 2–5 educational bullets */
  bullets: string[];
};

/**
 * Related deep guides in the app library (slugs must match guides/index).
 */
export const EDUCATION_GUIDE_INDEX = {
  injection: {
    slug: "safe-injection-practices",
    title: "Safe Injection Practices",
    reason: "Injectable route — hygiene and technique literacy",
  },
  alkylation: {
    slug: "17a-alkylation-liver-cholestasis-tudca",
    title: "How oral steroids add liver stress and where TUDCA fits in",
    reason: "17α-alkylation / oral hepatic stress education",
  },
  hematocrit: {
    slug: "androgens-epo-hematocrit-blood-pressure",
    title: "Androgens, Erythropoietin, Hematocrit & Blood Pressure",
    reason: "Androgen–RBC–BP pathway education",
  },
  hair: {
    slug: "hair-loss-androgens-genetics",
    title: "Hair Loss, Androgens & Genetics",
    reason: "Androgenetic hair loss mechanisms",
  },
  estrogen: {
    slug: "testosterone-base-and-estrogen",
    title: "Why a Testosterone Base Matters + Understanding Estrogen",
    reason: "Suppression, aromatization, and estrogen literacy",
  },
  peds: {
    slug: "peds-hormones-young-lifters",
    title: "What Most Young Lifters Get Wrong About PEDs & Hormones",
    reason: "Decision quality and harm-reduction overview",
  },
  logging: {
    slug: "compound-logging",
    title: "Logging compounds without turning the app into a protocol",
    reason: "How to use compound logs responsibly",
  },
} as const;

export type GuideLinkKey = keyof typeof EDUCATION_GUIDE_INDEX;

export const SUBSTANCE_CATALOG: SubstanceProfile[] = [
  // ——— Testosterone ———
  {
    keys: [
      "testosterone",
      "test",
      "test e",
      "test c",
      "test p",
      "testosterone enanthate",
      "testosterone cypionate",
      "testosterone propionate",
      "testosterone undecanoate",
      "sustanon",
      "test blend",
    ],
    displayName: "Testosterone",
    classes: ["testosterone", "injectable_androgen"],
    routes: ["injectable"],
    anabolicAndrogenicRatio: "100:100",
    aromatizes: "yes",
    appearance: "wet",
    educationTags: [
      "injectable",
      "androgenic",
      "estrogen",
      "hematocrit",
      "test_base",
      "hair",
    ],
    summary:
      "Testosterone is the reference androgen in educational tables (often cited near 100:100 anabolic:androgenic). It aromatizes to estradiol, so estrogen literacy matters. Injectable routes raise hygiene and technique education needs. Strong androgens are also discussed in hematocrit/blood-pressure and hair-loss genetics contexts for susceptible people.",
    bullets: [
      "Classic teaching A:A ratio is often listed near 100:100 (rough historical tool, not a personal predictor).",
      "Aromatizable — estradiol is part of the physiological picture, not only “side effects.”",
      "Often discussed as a “base” concept when endogenous production is suppressed — educational framing only.",
      "Androgen exposure can influence red-cell drive and hair outcomes in genetically susceptible people.",
    ],
  },
  // ——— Winstrol / Stanozolol ———
  {
    keys: ["winstrol", "winny", "stanozolol", "stanazolol"],
    displayName: "Stanozolol (Winstrol)",
    classes: ["oral_androgen", "dht_related", "alkylated_oral"],
    routes: ["oral", "injectable"],
    anabolicAndrogenicRatio: "320:30",
    aromatizes: "no",
    appearance: "dry",
    educationTags: ["oral", "alkylated", "androgenic", "hair", "liver", "hematocrit"],
    summary:
      "Stanozolol is commonly discussed as a DHT-related androgen with a high classic anabolic:androgenic teaching ratio, little/no aromatization, and a “dry” reputation in culture. Oral forms are 17α-alkylated in standard chemistry education — link to liver/cholestasis literacy. DHT-pathway compounds are often discussed for hair risk in susceptible genetics.",
    bullets: [
      "Classic teaching ratios are often cited near ~320:30 (anabolic:androgenic) — approximate teaching numbers only.",
      "Generally discussed as non-aromatizing (low estrogen conversion narrative).",
      "Culture often labels the look “dry” — not a medical guarantee and not a recommendation.",
      "Oral versions sit in the 17α-alkylation / hepatic stress education category.",
    ],
  },
  // ——— Anavar / Oxandrolone ———
  {
    keys: ["anavar", "var", "oxandrolone"],
    displayName: "Oxandrolone (Anavar)",
    classes: ["oral_androgen", "dht_related", "alkylated_oral"],
    routes: ["oral"],
    anabolicAndrogenicRatio: "322:24",
    aromatizes: "no",
    appearance: "dry",
    educationTags: ["oral", "alkylated", "androgenic", "hair", "liver"],
    summary:
      "Oxandrolone is a DHT-related oral androgen in educational chemistry, typically discussed as non-aromatizing with a relatively high classic A:A teaching ratio. As a 17α-alkylated oral structure class, liver-stress literacy (including cholestasis concepts) applies. Hair outcomes still depend heavily on genetics.",
    bullets: [
      "Often cited with a high anabolic:androgenic teaching ratio (classic tables vary by source).",
      "Non-aromatizing in standard educational framing.",
      "Oral 17α-alkylation → hepatic education pathway, not a “safe oral” claim.",
      "DHT-related structures remain relevant to androgenetic hair discussions.",
    ],
  },
  // ——— Dianabol ———
  {
    keys: ["dianabol", "dbol", "methandrostenolone", "methandienone"],
    displayName: "Methandienone (Dianabol)",
    classes: ["oral_androgen", "alkylated_oral"],
    routes: ["oral"],
    anabolicAndrogenicRatio: "90:40",
    aromatizes: "yes",
    appearance: "wet",
    educationTags: ["oral", "alkylated", "androgenic", "estrogen", "liver", "hematocrit"],
    summary:
      "Dianabol is a classic oral 17α-alkylated androgen in educational materials, often discussed as aromatizing and associated with a “wetter” look in culture. Estrogen education and alkylation/liver literacy both apply. Androgen pathways also connect to hematocrit discussions in general androgen education.",
    bullets: [
      "17α-alkylated oral class → liver/cholestasis educational relevance.",
      "Aromatizable — estrogen pathway literacy is relevant.",
      "Culture often describes fluid/“wet” characteristics — descriptive, not advice.",
      "Androgen exposure broadly links to RBC/hematocrit education themes.",
    ],
  },
  // ——— Anadrol ———
  {
    keys: ["anadrol", "adrol", "oxymetholone"],
    displayName: "Oxymetholone (Anadrol)",
    classes: ["oral_androgen", "alkylated_oral"],
    routes: ["oral"],
    anabolicAndrogenicRatio: "320:45",
    aromatizes: "unknown",
    appearance: "wet",
    educationTags: ["oral", "alkylated", "androgenic", "liver", "hematocrit", "estrogen"],
    summary:
      "Oxymetholone is discussed as a potent oral 17α-alkylated androgen with strong hepatic-education relevance. Culture often associates it with rapid water/weight appearance changes. Exact estrogen chemistry is more nuanced than simple “aromatizes yes/no” memes — still treat estrogen and liver literacy as relevant educational topics.",
    bullets: [
      "Oral 17α-alkylation → liver stress / cholestasis education.",
      "Strong androgen class → hematocrit/BP pathway literacy.",
      "Appearance often described as “wet” in culture — not medical taxonomy.",
      "Individual response varies; no outcome is guaranteed.",
    ],
  },
  // ——— Masteron ———
  {
    keys: ["masteron", "mast", "drostanolone", "drostanolone propionate", "drostanolone enanthate"],
    displayName: "Drostanolone (Masteron)",
    classes: ["injectable_androgen", "dht_related"],
    routes: ["injectable"],
    anabolicAndrogenicRatio: "62:25",
    aromatizes: "no",
    appearance: "dry",
    educationTags: ["injectable", "androgenic", "hair", "hematocrit"],
    summary:
      "Drostanolone is a DHT-derived injectable androgen in educational chemistry, typically non-aromatizing and culturally labeled “dry.” DHT-pathway compounds are frequently discussed in hair-loss genetics education for susceptible people. Injectable route → sterile practice literacy.",
    bullets: [
      "DHT-related structure → hair/androgenetic alopecia education is highly relevant for susceptible genetics.",
      "Generally discussed as non-aromatizing.",
      "Culture “dry” label is descriptive reputation, not a guarantee.",
      "Injectable route → safe injection practice education.",
    ],
  },
  // ——— Primobolan ———
  {
    keys: ["primo", "primobolan", "metenolone", "methenolone", "metenolone enanthate", "metenolone acetate"],
    displayName: "Metenolone (Primobolan)",
    classes: ["injectable_androgen", "dht_related", "oral_androgen"],
    routes: ["injectable", "oral"],
    anabolicAndrogenicRatio: "88:44",
    aromatizes: "no",
    appearance: "dry",
    educationTags: ["injectable", "oral", "androgenic", "hair", "alkylated", "liver"],
    summary:
      "Metenolone is DHT-related in structure education, typically non-aromatizing. Injectable forms raise injection-hygiene literacy; oral acetate forms in classical chemistry involve alkylation themes. Hair outcomes remain genetics-dependent.",
    bullets: [
      "Non-aromatizing in standard educational framing.",
      "DHT-related → hair genetics literacy for susceptible users.",
      "Route matters: injectable vs oral change which safety guides apply.",
      "Mild cultural reputation ≠ free of suppression or other risks.",
    ],
  },
  // ——— Equipoise / Boldenone ———
  {
    keys: ["equipoise", "eq", "boldenone", "boldenone undecylenate", "bold"],
    displayName: "Boldenone (Equipoise)",
    classes: ["injectable_androgen"],
    routes: ["injectable"],
    anabolicAndrogenicRatio: "100:50",
    aromatizes: "low",
    appearance: "mixed",
    educationTags: ["injectable", "androgenic", "estrogen", "hematocrit", "hair"],
    summary:
      "Boldenone is an injectable androgen often discussed with moderate classic A:A teaching numbers and lower (not zero) aromatization than testosterone in educational comparisons. Injectable practice literacy and general androgen pathways (hematocrit, hair genetics) still apply.",
    bullets: [
      "Injectable → sterile technique education.",
      "Aromatization often described as lower than testosterone — still not “no estrogen biology.”",
      "Androgen class → EPO/hematocrit and BP educational pathways.",
      "Individual estrogen and hair outcomes vary widely.",
    ],
  },
  // ——— Nandrolone / Deca / NPP ———
  {
    keys: ["deca", "deca durabolin", "nandrolone", "nandrolone decanoate", "npp", "nandrolone phenylpropionate"],
    displayName: "Nandrolone",
    classes: ["injectable_androgen", "nandrolone_family"],
    routes: ["injectable"],
    anabolicAndrogenicRatio: "125:37",
    aromatizes: "low",
    appearance: "wet",
    educationTags: ["injectable", "androgenic", "estrogen", "hematocrit", "test_base"],
    summary:
      "Nandrolone is a 19-nor injectable androgen with classic teaching ratios often near 125:37. It has some aromatization/estrogenic pathway discussion (not identical to testosterone). Injectable hygiene, estrogen literacy, and general androgen/hematocrit education are relevant. “Test base” talk often appears in culture when stacking non-test compounds — conceptual only.",
    bullets: [
      "Classic A:A teaching ratio often cited near ~125:37.",
      "Some estrogenic pathway activity is discussed — not a pure “dry non-aromatizing” story.",
      "Injectable → safe injection education.",
      "Suppression / base concepts appear in educational stacking culture — not advice.",
    ],
  },
  // ——— Trenbolone ———
  {
    keys: ["tren", "trenbolone", "tren a", "tren e", "trenbolone acetate", "trenbolone enanthate", "parabolan"],
    displayName: "Trenbolone",
    classes: ["injectable_androgen"],
    routes: ["injectable"],
    anabolicAndrogenicRatio: "500:500",
    aromatizes: "no",
    appearance: "dry",
    educationTags: ["injectable", "androgenic", "hair", "hematocrit", "decision", "estrogen"],
    summary:
      "Trenbolone is discussed as a highly androgenic/anabolic 19-nor in educational materials, typically non-aromatizing to estradiol via classical aromatase, yet still associated with significant systemic stress narratives. Injectable hygiene, decision-quality education, hematocrit/androgen pathways, and hair genetics remain relevant. Not a beginner literacy topic.",
    bullets: [
      "Very high classic A:A teaching numbers appear in older tables — still approximate tools.",
      "Generally non-aromatizing to E2 via classical pathway; other hormonal side-effect stories exist outside simple estrogen memes.",
      "Strong androgen class → hematocrit/BP and hair-susceptibility education.",
      "Injectable → sterile practice literacy.",
    ],
  },
  // ——— Proviron ———
  {
    keys: ["proviron", "mesterolone"],
    displayName: "Mesterolone (Proviron)",
    classes: ["oral_androgen", "dht_related"],
    routes: ["oral"],
    anabolicAndrogenicRatio: "30:100",
    aromatizes: "no",
    appearance: "dry",
    educationTags: ["oral", "androgenic", "hair", "estrogen"],
    summary:
      "Mesterolone is a DHT-derivative oral androgen often discussed for androgenicity and anti-estrogenic character in culture — not as a mass builder. DHT-pathway hair education applies for susceptible genetics. Educational only; not a recommendation.",
    bullets: [
      "DHT-related → hair-loss genetics literacy.",
      "Non-aromatizing; sometimes discussed in estrogen-character conversations (concept only).",
      "Classic tables list relatively higher androgenic than anabolic teaching ratios.",
      "Not a substitute for understanding suppression or medical care.",
    ],
  },
  // ——— Turinabol ———
  {
    keys: ["turinabol", "tbol", "chlorodehydromethyltestosterone", "cdmt"],
    displayName: "Oral Turinabol",
    classes: ["oral_androgen", "alkylated_oral"],
    routes: ["oral"],
    anabolicAndrogenicRatio: "54:6",
    aromatizes: "no",
    appearance: "dry",
    educationTags: ["oral", "alkylated", "androgenic", "liver", "hair"],
    summary:
      "Oral Turinabol is a 17α-alkylated oral androgen in educational chemistry, typically discussed as non-aromatizing. Liver/alkylation literacy and general androgen/hair themes apply.",
    bullets: [
      "17α-alkylated oral → hepatic stress education.",
      "Non-aromatizing in standard framing.",
      "Androgenic exposure still relevant to hair genetics for some people.",
    ],
  },
  // ——— Supplements (examples) ———
  {
    keys: ["creatine", "creatine monohydrate", "creatine hcl"],
    displayName: "Creatine",
    classes: ["supplement"],
    routes: ["oral"],
    aromatizes: "no",
    appearance: "unknown",
    educationTags: ["supplement"],
    summary:
      "Creatine is a well-studied dietary supplement in sports science education — not a hormone. Expect intracellular water narratives, not androgen/estrogen pathways. Open the substance education page for mechanism detail.",
    bullets: [
      "Not an anabolic steroid; no classic A:A ratio applies.",
      "Discussed for phosphagen/energy system support in training education.",
      "Scale weight can rise from water in muscle — not the same as fat gain.",
    ],
  },
  {
    keys: ["tudca", "tauroursodeoxycholic acid"],
    displayName: "TUDCA",
    classes: ["supplement"],
    routes: ["oral"],
    aromatizes: "no",
    appearance: "unknown",
    educationTags: ["supplement", "liver", "alkylated"],
    summary:
      "TUDCA is discussed in bile-acid and cell-stress research. Logging it often pairs educationally with 17α-alkylation / cholestasis literacy — not as proof of a “protection protocol.”",
    bullets: [
      "Mechanism literacy lives in the oral alkylation / cholestasis guide.",
      "Not a recommendation to use oral androgens or TUDCA.",
      "Supplement quality and medical context vary — clinicians for personal decisions.",
    ],
  },
];

/** Normalize a free-text log name for catalog matching */
export function normalizeMatchKey(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/\s+/g, " ")
    .replace(/[^\w\s\-./+]/g, "");
}
