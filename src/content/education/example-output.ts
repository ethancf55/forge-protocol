/**
 * Quality target examples for substance education pages.
 * These are NOT served live — they show what good generation should look like
 * after the template rules are applied. Use as a calibration reference when
 * editing template.ts.
 */

import type { SubstanceEducationContent } from "@/lib/education/types";

/** Example: well-studied supplement */
export const EXAMPLE_CREATINE_MONOHYDRATE: SubstanceEducationContent = {
  whatItIs:
    "Creatine monohydrate is a dietary form of creatine, a compound your body already synthesizes and stores mainly in skeletal muscle. In sports science education it is one of the most frequently discussed performance-related supplements — not a hormone, not a stimulant class drug, and not a substitute for progressive training.",
  mechanism:
    "Creatine participates in the phosphagen system: it helps regenerate phosphocreatine, which supports rapid recycling of ATP during short, high-intensity efforts. Higher intramuscular creatine stores are associated with improved capacity for repeated high-power work. Education also notes increased intracellular water in muscle cells as a common physiological accompaniment. Response is not identical for everyone — baseline diet (especially habitual meat intake), training status, and individual biology all influence how large an effect someone observes in research or practice discussions.",
  commonUses: [
    "Discussed in sports science for support of strength and power training adaptations",
    "Studied in relation to high-intensity intermittent exercise performance",
    "Examined alongside resistance training in body-composition research contexts",
    "Used as a teaching example of a relatively high-evidence supplement versus hype products",
    "Explored in broader research beyond lifting (educational mention only — not a claim of clinical benefit for any reader)",
  ],
  importantToKnow: [
    "Individual response varies; some people see clearer performance changes than others depending on baseline creatine status and training context.",
    "Scale weight can rise from increased muscle cell water — that is not the same as fat gain.",
    "Product identity and purity can differ in the marketplace; education is not brand endorsement.",
    "People with kidney disease or other medical conditions should involve a clinician before any supplement decision.",
    "Forge Protocol never provides dosing, loading schemes, stacks, or protocols.",
    "Stronger evidence than many trendy products still does not make this medical advice.",
  ],
  disclaimer:
    "This page is for educational purposes only. It is not medical advice, diagnosis, or treatment, and it is not a recommendation to use any substance. Forge Protocol does not provide dosing, stacks, sources, or protocols. Consult a licensed medical professional for personal health decisions.",
  extra: {
    trainingContext:
      "In serious lifting culture, creatine monohydrate is usually discussed in the context of high-intensity strength and power work — heavy sets, repeated efforts, and hard training blocks — not as a magic mass builder. Education-wise, it sits next to fundamentals: progressive overload, protein-adequate nutrition, sleep, and consistency still drive results. No substance narrative replaces those.",
    evidenceQuality:
      "Among over-the-counter performance supplements, creatine monohydrate has a relatively strong evidence picture for certain strength/power outcomes compared with most gym-shelf trends. That does not mean every claim on social media is true, and evidence quality can differ by outcome studied. Treat influencer certainty as marketing until it maps to real literature patterns.",
  },
};

/** Example multi-substance stack education */
export const EXAMPLE_STACK_CREATINE_TEST_PQQ = {
  synergies: [
    {
      substances: ["Creatine monohydrate", "PQQ"],
      title: "Cellular energy / mitochondrial discussion overlap",
      explanation:
        "Creatine is discussed mainly through the phosphagen system in muscle, while PQQ is discussed in mitochondrial biogenesis and cellular redox narratives. Educationally they share a 'cellular energy support' theme, but that does not make them a required pair or a protocol.",
      confidence: "plausible" as const,
    },
    {
      substances: ["Testosterone", "Creatine monohydrate"],
      title: "Intracellular water / training-adaptation narrative overlap",
      explanation:
        "Creatine is associated with phosphagen support and increased intracellular water; androgens are discussed via androgen-receptor pathways and training adaptations, with secondary commentary on fluid/glycogen-related appearance. These are parallel educational narratives — not instructions to combine substances.",
      confidence: "plausible" as const,
    },
  ],
  stackObservations: [
    "Your log mixes a high-evidence supplement (creatine) with an androgen-class label — treat educational synergy notes as mechanism literacy, not a designed stack.",
    "Mitochondrial/energy themes appear more than once if PQQ and creatine are both logged; redundancy of narrative is not the same as proven additive benefit.",
    "Fundamentals (progressive overload, sleep, protein-adequate nutrition) still dominate outcomes relative to any substance storyline.",
    "This is educational only — not medical advice and not a recommendation to use or combine anything.",
  ],
  disclaimer:
    "Stack Observations and synergy notes are educational only. They are not medical advice, not a recommendation to use or combine any substances, and not a protocol.",
};

/** Example: performance-related compound label (educational / harm-reduction tone) */
export const EXAMPLE_TESTOSTERONE_EDU: SubstanceEducationContent = {
  whatItIs:
    "Testosterone is the primary male sex hormone (an androgen) produced mainly in the testes, with smaller amounts from other tissues. When someone logs “testosterone,” they may mean endogenous hormone context or exogenous products they track privately. This page is educational physiology and culture context — not product advice and not encouragement to use.",
  mechanism:
    "Testosterone binds androgen receptors and influences gene expression related to muscle protein synthesis, secondary sex characteristics, red blood cell production, libido, and other systemic effects. Exogenous exposure can suppress the body’s own production through negative feedback on the hypothalamic–pituitary–gonadal (HPG) axis — a core educational concept in harm-reduction materials. Downstream effects are multi-system; they are not limited to muscle.",
  anabolicAndrogenicRatio: {
    ratio: "100:100",
    applicability: "androgenic_compound",
    notes:
      "In classic educational tables, testosterone is the reference androgen at approximately 100:100 (anabolic:androgenic). These ratios are rough teaching tools from older assay methods — they do not precisely predict individual human outcomes or side-effect profiles.",
  },
  commonUses: [
    "Clinically prescribed under medical supervision for diagnosed deficiency in appropriate patients",
    "Discussed in sports medicine and anti-doping education because of performance and health implications",
    "Studied for effects on body composition, hematology, lipids, and reproductive function",
    "Logged by some users as personal history only — which this app supports without recommending use",
  ],
  importantToKnow: [
    "Self-directed use outside medical care can involve significant health and legal complexity depending on jurisdiction.",
    "Effects and risks are highly individual; clinical contexts rely on assessment and monitoring — not app logging.",
    "This app never designs cycles, doses, PCT, sources, or administration methods.",
    "Educational discussion is not encouragement to start or continue use.",
    "Seek licensed medical professionals for personal decisions — not influencers or logging tools.",
  ],
  disclaimer:
    "This page is for educational purposes only. It is not medical advice, diagnosis, or treatment, and it is not a recommendation to use any substance. Forge Protocol does not provide dosing, stacks, sources, or protocols. Consult a licensed medical professional for personal health decisions.",
  extra: {
    trainingContext:
      "In lifting culture, testosterone is often treated as the center of identity and progress narratives. Educationally, that oversimplifies: training quality, recovery, and health status interact with hormones in complex ways. Performance discussions should not erase risk education or the difference between clinical care and self-experimentation.",
    evidenceQuality:
      "Endogenous testosterone physiology and medical TRT literature are extensive; recreational/performance use literature and anecdote are mixed, confounded, and often overstated online. Separate clinical evidence from gym lore when evaluating claims.",
  },
};
