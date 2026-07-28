import Link from "next/link";
import { format } from "date-fns";
import { Card, CardTitle } from "@/components/ui/card";
import { WeightChart } from "@/components/charts/weight-chart";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import {
  educationPath,
  normalizeSubstanceName,
} from "@/lib/education/slug";
import type { SubstanceKind } from "@/lib/education/types";

export default async function HistoryPage() {
  const user = await requireUser();

  const [weights, workouts, supplements, compounds, notes, education] =
    await Promise.all([
      prisma.bodyMetric.findMany({
        where: { userId: user.id },
        orderBy: { date: "asc" },
        take: 60,
      }),
      prisma.trainingLog.findMany({
        where: { userId: user.id },
        orderBy: { date: "desc" },
        take: 12,
      }),
      prisma.supplementLog.findMany({
        where: { userId: user.id },
        orderBy: { date: "desc" },
        take: 12,
      }),
      prisma.compoundLog.findMany({
        where: { userId: user.id },
        orderBy: { date: "desc" },
        take: 12,
      }),
      prisma.note.findMany({
        where: { userId: user.id },
        orderBy: { date: "desc" },
        take: 8,
      }),
      prisma.substanceEducation.findMany({
        select: {
          kind: true,
          nameNormalized: true,
          slug: true,
          status: true,
          name: true,
        },
        take: 200,
      }),
    ]);

  const eduByKey = new Map(
    education.map((e) => [`${e.kind}:${e.nameNormalized}`, e])
  );

  function substanceHref(kind: SubstanceKind, name: string) {
    const key = `${kind}:${normalizeSubstanceName(name)}`;
    const page = eduByKey.get(key);
    if (page) return educationPath(kind, page.slug);
    // Ensures + redirects if older logs predate cache
    return `/learn/${kind}/open?name=${encodeURIComponent(name)}`;
  }

  const chartData = weights.map((w) => ({
    date: format(w.date, "M/d"),
    weight: w.weight,
  }));

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-orange-400/90">
          History
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">Progress</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Trends over noise. Tap a supplement or compound for its education page.
        </p>
      </div>

      <Card>
        <CardTitle className="mb-2 text-sm">Bodyweight</CardTitle>
        <WeightChart data={chartData} />
      </Card>

      <Feed
        title="Training"
        empty="No workouts logged."
        items={workouts.map((w) => (
          <Row
            key={w.id}
            title={w.title}
            meta={`${format(w.date, "MMM d")}${w.durationMin ? ` · ${w.durationMin}m` : ""}`}
            detail={w.notes}
          />
        ))}
      />

      <Feed
        title="Supplements"
        empty="No supplements logged."
        items={supplements.map((s) => (
          <Row
            key={s.id}
            title={s.name}
            meta={`${format(s.date, "MMM d")}${s.amountNote ? ` · ${s.amountNote}` : ""}`}
            detail={s.notes}
            href={substanceHref("supplement", s.name)}
            hrefHint="Education"
          />
        ))}
      />

      <Feed
        title="Compounds (self-reported)"
        empty="No compound entries."
        items={compounds.map((c) => (
          <Row
            key={c.id}
            title={c.name}
            meta={format(c.date, "MMM d")}
            detail={c.notes}
            href={substanceHref("compound", c.name)}
            hrefHint="Education"
          />
        ))}
      />

      <Feed
        title="Notes"
        empty="No notes yet."
        items={notes.map((n) => (
          <Row key={n.id} title={format(n.date, "MMM d")} meta="" detail={n.body} />
        ))}
      />

      <p className="text-center text-xs text-zinc-600">
        <Link href="/learn" className="text-orange-400/90 hover:text-orange-300">
          Browse substance education library →
        </Link>
      </p>
    </div>
  );
}

function Feed({
  title,
  empty,
  items,
}: {
  title: string;
  empty: string;
  items: React.ReactNode[];
}) {
  return (
    <Card>
      <CardTitle className="mb-3 text-sm">{title}</CardTitle>
      {items.length === 0 ? (
        <p className="text-sm text-zinc-500">{empty}</p>
      ) : (
        <ul className="space-y-2">{items}</ul>
      )}
    </Card>
  );
}

function Row({
  title,
  meta,
  detail,
  href,
  hrefHint,
}: {
  title: string;
  meta: string;
  detail?: string | null;
  href?: string;
  hrefHint?: string;
}) {
  const inner = (
    <>
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-sm font-medium text-zinc-100">{title}</p>
        <div className="flex shrink-0 items-center gap-2">
          {meta ? <p className="text-xs text-zinc-500">{meta}</p> : null}
          {href ? (
            <span className="text-[10px] font-semibold uppercase tracking-wide text-orange-400/90">
              {hrefHint || "Open"} →
            </span>
          ) : null}
        </div>
      </div>
      {detail ? (
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-zinc-500">
          {detail}
        </p>
      ) : null}
    </>
  );

  if (href) {
    return (
      <li>
        <Link
          href={href}
          className="block rounded-xl border border-white/[0.06] bg-zinc-950/40 px-3 py-2.5 transition hover:border-orange-500/35 hover:bg-orange-500/[0.04]"
        >
          {inner}
        </Link>
      </li>
    );
  }

  return (
    <li className="rounded-xl border border-white/[0.06] bg-zinc-950/40 px-3 py-2.5">
      {inner}
    </li>
  );
}
