"use client";

import Link from "next/link";
import type { EducationBriefing } from "@/lib/education/classify";
import { Card, CardTitle } from "@/components/ui/card";

export function LogEducationBriefing({
  briefing,
  educationHref,
}: {
  briefing: EducationBriefing;
  educationHref?: string | null;
}) {
  return (
    <div className="space-y-3 rounded-2xl border border-orange-500/25 bg-gradient-to-br from-orange-500/[0.08] to-zinc-950/80 p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.02)_inset]">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-orange-400/90">
            Education unlocked
          </p>
          <h3 className="mt-1 text-base font-bold tracking-tight text-zinc-50">
            {briefing.displayName}
          </h3>
          {!briefing.matched ? (
            <p className="mt-0.5 text-[11px] text-zinc-500">
              Heuristic match — not in curated catalog. Verify details.
            </p>
          ) : (
            <p className="mt-0.5 text-[11px] text-zinc-500">
              Curated educational profile · not medical advice
            </p>
          )}
        </div>
        {educationHref ? (
          <Link
            href={educationHref}
            className="shrink-0 rounded-full bg-orange-500 px-3 py-1.5 text-[11px] font-semibold text-white"
          >
            Full page →
          </Link>
        ) : null}
      </div>

      <p className="text-sm leading-relaxed text-zinc-300">{briefing.summary}</p>

      {/* Fact chips */}
      <div className="flex flex-wrap gap-2">
        {briefing.facts.map((f) => (
          <div
            key={f.label}
            className="rounded-xl border border-white/10 bg-zinc-950/60 px-2.5 py-1.5"
          >
            <p className="text-[9px] font-semibold uppercase tracking-wide text-zinc-600">
              {f.label}
            </p>
            <p className="text-[11px] font-medium text-zinc-200">{f.value}</p>
          </div>
        ))}
      </div>

      {briefing.anabolicAndrogenicRatio ? (
        <Card className="border-white/10 bg-zinc-950/50 px-3 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
            Anabolic : Androgenic (classic teaching ratio)
          </p>
          <p className="mt-1 font-mono text-xl font-bold text-zinc-50">
            {briefing.anabolicAndrogenicRatio}
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-zinc-500">
            Historical teaching numbers relative to older assay methods — not a
            precise predictor of your outcomes or side effects.
          </p>
        </Card>
      ) : null}

      <ul className="space-y-1.5">
        {briefing.bullets.map((b) => (
          <li
            key={b}
            className="relative pl-4 text-xs leading-relaxed text-zinc-400"
          >
            <span className="absolute left-0 top-[0.45em] h-1.5 w-1.5 rounded-full bg-orange-500" />
            {b}
          </li>
        ))}
      </ul>

      {briefing.relatedGuides.length > 0 ? (
        <div className="space-y-2 border-t border-white/[0.06] pt-3">
          <CardTitle className="text-xs text-zinc-400">
            Related deep guides
          </CardTitle>
          <ul className="space-y-1.5">
            {briefing.relatedGuides.map((g) => (
              <li key={g.slug}>
                <Link
                  href={g.href}
                  className="block rounded-xl border border-white/10 bg-zinc-950/50 px-3 py-2.5 transition hover:border-orange-500/40"
                >
                  <p className="text-sm font-semibold text-zinc-100">
                    {g.title}
                  </p>
                  <p className="mt-0.5 text-[11px] text-zinc-500">{g.reason}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <p className="text-[10px] leading-relaxed text-zinc-600">
        {briefing.disclaimer}
      </p>
    </div>
  );
}
