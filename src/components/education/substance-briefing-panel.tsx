import Link from "next/link";
import type { EducationBriefing } from "@/lib/education/classify";
import { Card, CardTitle } from "@/components/ui/card";

/** Server-renderable briefing for substance education pages */
export function SubstanceBriefingPanel({
  briefing,
}: {
  briefing: EducationBriefing;
}) {
  return (
    <section className="space-y-3 rounded-2xl border border-white/[0.08] bg-zinc-950/50 p-4">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-orange-400/90">
          Smart education profile
        </p>
        <p className="mt-1 text-sm leading-relaxed text-zinc-400">
          {briefing.summary}
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {briefing.facts.map((f) => (
          <div
            key={f.label}
            className="rounded-xl border border-white/[0.06] bg-zinc-900/40 px-3 py-2"
          >
            <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-600">
              {f.label}
            </p>
            <p className="mt-0.5 text-xs font-medium text-zinc-200">{f.value}</p>
          </div>
        ))}
      </div>

      {briefing.anabolicAndrogenicRatio ? (
        <div className="rounded-xl border border-orange-500/20 bg-orange-500/[0.06] px-3 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-orange-300/80">
            Anabolic : Androgenic (teaching ratio)
          </p>
          <p className="mt-1 font-mono text-2xl font-bold text-zinc-50">
            {briefing.anabolicAndrogenicRatio}
          </p>
        </div>
      ) : null}

      {briefing.relatedGuides.length > 0 ? (
        <div className="space-y-2">
          <CardTitle className="text-xs text-zinc-500">
            Open related guides
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            {briefing.relatedGuides.map((g) => (
              <Link
                key={g.slug}
                href={g.href}
                className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11px] font-semibold text-orange-300/90 transition hover:border-orange-500/40"
              >
                {g.title} →
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      <p className="text-[10px] text-zinc-600">{briefing.disclaimer}</p>
    </section>
  );
}
