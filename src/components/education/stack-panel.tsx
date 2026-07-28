import { Card, CardTitle } from "@/components/ui/card";
import {
  confidenceClass,
  confidenceLabel,
} from "@/lib/education/render";
import type {
  LoggedSubstanceRef,
  StackEducationContent,
} from "@/lib/education/types";

export function StackEducationPanel({
  content,
  substances,
  focusName,
  status,
  model,
}: {
  content: StackEducationContent;
  substances: LoggedSubstanceRef[];
  /** When set, highlight synergies that include this substance */
  focusName?: string;
  status?: string;
  model?: string | null;
}) {
  const focus = focusName?.trim().toLowerCase();
  const synergies = focus
    ? content.synergies.filter((s) =>
        s.substances.some((n) => n.toLowerCase() === focus)
      )
    : content.synergies;
  const otherSynergies = focus
    ? content.synergies.filter(
        (s) => !s.substances.some((n) => n.toLowerCase() === focus)
      )
    : [];

  return (
    <div className="space-y-5 border-t border-white/[0.06] pt-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-orange-400/90">
          Your logged set
        </p>
        <h2 className="mt-1 text-lg font-semibold tracking-tight text-zinc-50">
          Stack Observations
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-zinc-500">
          Educational patterns across substances you already log — not a
          recommendation to combine, add, or dose anything.
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {substances.map((s) => (
            <span
              key={`${s.kind}:${s.name}`}
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${
                focus && s.name.toLowerCase() === focus
                  ? "bg-orange-500/15 text-orange-200 ring-orange-500/30"
                  : "bg-white/5 text-zinc-400 ring-white/10"
              }`}
            >
              {s.kind === "compound" ? "C" : "S"} · {s.name}
            </span>
          ))}
        </div>
      </div>

      {(synergies.length > 0 || otherSynergies.length > 0) && (
        <section className="space-y-3">
          <div>
            <h3 className="text-base font-semibold text-zinc-50">
              Mechanism overlaps & synergies
            </h3>
            <p className="mt-0.5 text-xs text-zinc-500">
              Why effects may overlap or combine conceptually — educational
              only.
            </p>
          </div>
          <div className="space-y-2.5">
            {synergies.map((syn) => (
              <SynergyCard key={syn.title + syn.substances.join()} syn={syn} />
            ))}
            {otherSynergies.length > 0 ? (
              <details className="rounded-xl border border-white/[0.06] bg-zinc-950/40 px-3 py-2">
                <summary className="cursor-pointer text-xs font-medium text-zinc-400">
                  Other overlaps in your log ({otherSynergies.length})
                </summary>
                <div className="mt-2 space-y-2.5">
                  {otherSynergies.map((syn) => (
                    <SynergyCard
                      key={syn.title + syn.substances.join()}
                      syn={syn}
                    />
                  ))}
                </div>
              </details>
            ) : null}
          </div>
        </section>
      )}

      <section className="space-y-2.5">
        <h3 className="text-base font-semibold text-zinc-50">
          Stack Observations
        </h3>
        <ul className="space-y-2">
          {content.stackObservations.map((item) => (
            <li
              key={item}
              className="relative pl-5 text-[15px] leading-[1.65] text-zinc-300"
            >
              <span className="absolute left-0 top-[0.55em] h-1.5 w-1.5 rounded-full bg-orange-500" />
              {item}
            </li>
          ))}
        </ul>
      </section>

      <Card className="border-white/10 bg-zinc-950/50">
        <CardTitle className="mb-2 text-xs text-zinc-400">
          Stack education disclaimer
        </CardTitle>
        <p className="text-xs leading-relaxed text-zinc-500">
          {content.disclaimer}
        </p>
        {(status || model) && (
          <p className="mt-2 text-[10px] text-zinc-600">
            {status ? `Status: ${status}` : ""}
            {status && model ? " · " : ""}
            {model ? `Model: ${model}` : ""}
          </p>
        )}
      </Card>
    </div>
  );
}

function SynergyCard({
  syn,
}: {
  syn: StackEducationContent["synergies"][number];
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-zinc-950/40 px-3.5 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm font-semibold text-zinc-100">{syn.title}</p>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ${confidenceClass(syn.confidence)}`}
        >
          {confidenceLabel(syn.confidence)}
        </span>
      </div>
      <p className="mt-1.5 text-xs font-medium text-orange-300/90">
        {syn.substances.join(" + ")}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-zinc-400">
        {syn.explanation}
      </p>
    </div>
  );
}

export function AaRatioBlock({
  value,
}: {
  value: {
    ratio: string | null;
    applicability: string;
    notes: string;
  };
}) {
  const badge =
    value.applicability === "androgenic_compound"
      ? "Androgenic compound"
      : value.applicability === "not_applicable"
        ? "Not applicable"
        : "Unknown / not standard";

  return (
    <div className="rounded-xl border border-white/[0.08] bg-zinc-950/50 px-4 py-3.5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
            Classic teaching ratio
          </p>
          <p className="mt-1 font-mono text-2xl font-bold tracking-tight text-zinc-50">
            {value.ratio || "—"}
          </p>
          {value.ratio ? (
            <p className="mt-0.5 text-[11px] text-zinc-500">
              Anabolic : Androgenic
            </p>
          ) : null}
        </div>
        <span className="rounded-full bg-white/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-zinc-400 ring-1 ring-white/10">
          {badge}
        </span>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-zinc-400">{value.notes}</p>
    </div>
  );
}
