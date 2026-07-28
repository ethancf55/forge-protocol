import Link from "next/link";
import { format, startOfDay, subDays } from "date-fns";
import { Card, CardTitle } from "@/components/ui/card";
import { DisciplineCheckInList } from "@/components/mind/discipline-checkin";
import { ReflectionForm } from "@/components/mind/reflection-form";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import {
  getDisciplineHabits,
  getPublishedPractices,
} from "@/content/mind";

export default async function DisciplinePage() {
  const user = await requireUser();
  const habits = getDisciplineHabits();
  const practices = getPublishedPractices();
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const dayDate = new Date(todayStr + "T12:00:00");
  const weekStart = subDays(startOfDay(new Date()), 6);

  let completedKeys: string[] = [];
  let weekByHabit: Record<string, number> = {};

  try {
    const [todayRows, weekRows] = await Promise.all([
      prisma.disciplineCheckIn.findMany({
        where: { userId: user.id, date: dayDate, completed: true },
      }),
      prisma.disciplineCheckIn.findMany({
        where: {
          userId: user.id,
          completed: true,
          date: { gte: weekStart },
        },
      }),
    ]);
    completedKeys = todayRows.map((r) => r.habitKey);
    weekByHabit = {};
    for (const r of weekRows) {
      weekByHabit[r.habitKey] = (weekByHabit[r.habitKey] || 0) + 1;
    }
  } catch (err) {
    console.error("[discipline page]", err);
  }

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <Link href="/mind" className="font-semibold text-orange-400 hover:text-orange-300">
          ← Mind
        </Link>
        <Link href="/mind/learning" className="text-zinc-500 hover:text-zinc-300">
          Learning
        </Link>
      </div>

      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-orange-400/90">
          Discipline
        </p>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Do hard things on purpose
        </h1>
        <p className="max-w-xl text-sm leading-relaxed text-zinc-500">
          Grounded toughness: meditation, delayed gratification, voluntary
          discomfort, deep work, and showing up when motivation is absent. Track
          the reps. Skip the fake hype.
        </p>
      </header>

      <section className="space-y-3">
        <div className="flex items-end justify-between gap-2">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Today’s check-ins
            </h2>
            <p className="mt-0.5 text-[11px] text-zinc-600">
              {format(new Date(), "EEEE, MMM d")} · {completedKeys.length}/
              {habits.length} done
            </p>
          </div>
        </div>
        <DisciplineCheckInList
          habits={habits}
          completedKeys={completedKeys}
          date={todayStr}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          7-day consistency
        </h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {habits.map((h) => (
            <Card key={h.key} className="bg-zinc-950/40 px-3 py-2.5">
              <p className="truncate text-xs font-medium text-zinc-300">
                {h.title}
              </p>
              <p className="mt-1 text-lg font-bold tabular-nums text-zinc-50">
                {weekByHabit[h.key] || 0}
                <span className="text-xs font-medium text-zinc-600"> / 7</span>
              </p>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Practices
        </h2>
        <div className="space-y-2">
          {practices.map((p) => (
            <Link key={p.slug} href={`/mind/discipline/${p.slug}`} className="block">
              <Card className="transition hover:border-orange-500/35">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                      {p.minutes} min read
                    </p>
                    <p className="mt-1 text-sm font-semibold text-zinc-100">
                      {p.title}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                      {p.summary}
                    </p>
                  </div>
                  <span className="text-zinc-600">→</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <Card>
          <CardTitle className="mb-1 text-sm">End-of-day reflection</CardTitle>
          <p className="mb-3 text-xs text-zinc-500">
            Optional. Honest notes beat motivational posters.
          </p>
          <ReflectionForm kind="discipline" date={todayStr} />
        </Card>
      </section>
    </div>
  );
}
