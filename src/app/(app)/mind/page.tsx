import Link from "next/link";
import type { ReactNode } from "react";
import { Brain, Flame, Library } from "lucide-react";
import { format, startOfDay, subDays } from "date-fns";
import { Card, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import {
  getDisciplineHabits,
  getPublishedPaths,
  getPublishedPractices,
} from "@/content/mind";

export default async function MindHubPage() {
  const user = await requireUser();
  const today = startOfDay(new Date());
  const since = subDays(today, 6);
  const habits = getDisciplineHabits();
  const paths = getPublishedPaths();
  const practices = getPublishedPractices();

  let completedToday = 0;
  let checkIns7d = 0;
  let reflections: { id: string; body: string; date: Date; kind: string }[] =
    [];

  try {
    const dayStart = new Date(format(today, "yyyy-MM-dd") + "T12:00:00");
    const [todayRows, weekCount, reflectionRows] = await Promise.all([
      prisma.disciplineCheckIn.findMany({
        where: {
          userId: user.id,
          date: dayStart,
          completed: true,
        },
      }),
      prisma.disciplineCheckIn.count({
        where: {
          userId: user.id,
          completed: true,
          date: { gte: since },
        },
      }),
      prisma.mindReflection.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 3,
      }),
    ]);
    completedToday = todayRows.length;
    checkIns7d = weekCount;
    reflections = reflectionRows;
  } catch (err) {
    console.error("[mind hub]", err);
  }

  const totalHabits = habits.length;
  const pct =
    totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

  return (
    <div className="space-y-7">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-orange-400/90">
          <Brain className="h-4 w-4" />
          <p className="text-xs font-semibold uppercase tracking-[0.14em]">
            Mind
          </p>
        </div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Train the mind like the body
        </h1>
        <p className="max-w-xl text-sm leading-relaxed text-zinc-500">
          Two equal pillars: <strong className="font-semibold text-zinc-300">Discipline</strong> —
          doing hard things when it’s hard — and{" "}
          <strong className="font-semibold text-zinc-300">Learning</strong> —
          deliberate knowledge, not noise. Physical progress without this is
          half a life.
        </p>
      </header>

      {/* Snapshot */}
      <div className="grid grid-cols-3 gap-2.5">
        <Stat label="Today" value={`${completedToday}/${totalHabits}`} />
        <Stat label="7-day check-ins" value={String(checkIns7d)} />
        <Stat label="Today %" value={`${pct}%`} />
      </div>

      {/* Two pillars */}
      <section className="grid gap-3 sm:grid-cols-2">
        <PillarCard
          href="/mind/discipline"
          icon={<Flame className="h-5 w-5 text-orange-400" />}
          kicker="Pillar one"
          title="Discipline"
          body="Check-ins for meditation, hard tasks, voluntary discomfort, delayed gratification, and showing up. Practices that build mental toughness without fake hype."
          cta="Open Discipline"
        />
        <PillarCard
          href="/mind/learning"
          icon={<Library className="h-5 w-5 text-orange-400" />}
          kicker="Pillar two"
          title="Learning"
          body="Paths and short lessons built to grow. Mental foundations, how to learn, and bridges into your full training Guides library."
          cta="Open Learning"
        />
      </section>

      {/* Preview strips */}
      <section className="space-y-3">
        <div className="flex items-end justify-between gap-2">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Discipline practices
          </h2>
          <Link
            href="/mind/discipline"
            className="text-[11px] font-semibold text-orange-400/90 hover:text-orange-300"
          >
            All →
          </Link>
        </div>
        <div className="space-y-2">
          {practices.slice(0, 3).map((p) => (
            <Link key={p.slug} href={`/mind/discipline/${p.slug}`} className="block">
              <Card className="transition hover:border-orange-500/35">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                  {p.minutes} min
                </p>
                <p className="mt-1 text-sm font-semibold text-zinc-100">
                  {p.title}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                  {p.summary}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-end justify-between gap-2">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Learning paths
          </h2>
          <Link
            href="/mind/learning"
            className="text-[11px] font-semibold text-orange-400/90 hover:text-orange-300"
          >
            Library →
          </Link>
        </div>
        <div className="space-y-2">
          {paths.map((path) => (
            <Link
              key={path.slug}
              href={`/mind/learning?path=${path.slug}`}
              className="block"
            >
              <Card className="transition hover:border-orange-500/35">
                <p className="text-sm font-semibold text-zinc-100">
                  {path.title}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                  {path.summary}
                </p>
                <p className="mt-2 text-[11px] text-zinc-600">
                  {path.lessonSlugs.length} lessons
                </p>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {reflections.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Recent reflections
          </h2>
          <ul className="space-y-2">
            {reflections.map((r) => (
              <li key={r.id}>
                <Card className="bg-zinc-950/40">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-600">
                    {r.kind} · {format(r.date, "MMM d")}
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">
                    {r.body}
                  </p>
                </Card>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <Card className="border-white/10 bg-zinc-950/30">
        <CardTitle className="mb-1.5 text-sm text-zinc-300">
          How Mind grows
        </CardTitle>
        <p className="text-xs leading-relaxed text-zinc-500">
          Discipline habits and practices live under{" "}
          <code className="text-zinc-400">src/content/mind/discipline/</code>.
          Learning paths and lessons live under{" "}
          <code className="text-zinc-400">src/content/mind/learning/</code>.
          Add content there — the UI is built to scale.
        </p>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-zinc-900/50 px-3 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
        {label}
      </p>
      <p className="mt-1 text-lg font-bold tabular-nums tracking-tight text-zinc-50">
        {value}
      </p>
    </div>
  );
}

function PillarCard({
  href,
  icon,
  kicker,
  title,
  body,
  cta,
}: {
  href: string;
  icon: ReactNode;
  kicker: string;
  title: string;
  body: string;
  cta: string;
}) {
  return (
    <Link href={href} className="group block h-full">
      <Card className="h-full border-orange-500/15 bg-gradient-to-br from-orange-500/[0.06] to-transparent transition group-hover:border-orange-500/40">
        <div className="flex items-center gap-2">
          {icon}
          <p className="text-[10px] font-bold uppercase tracking-wide text-orange-400/80">
            {kicker}
          </p>
        </div>
        <h2 className="mt-3 text-xl font-bold tracking-tight text-zinc-50">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-500">{body}</p>
        <p className="mt-4 text-xs font-semibold text-orange-400 group-hover:text-orange-300">
          {cta} →
        </p>
      </Card>
    </Link>
  );
}
