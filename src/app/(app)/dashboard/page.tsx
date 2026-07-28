import Link from "next/link";
import { format, startOfDay, subDays } from "date-fns";
import { Card, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/db";

export default async function DashboardPage() {
  const user = await requireUser();
  const since = subDays(startOfDay(new Date()), 13);
  const firstName = user.name?.split(" ")[0] || "athlete";
  const userId = user.id;

  // Safe defaults so the page never crashes if a query fails or data is empty
  let sessions14d = 0;
  let notes14d = 0;
  let latestWeight: { weight: number; unit: string } | null = null;
  let reminders: { id: string; title: string; hourLocal: number }[] = [];
  let recentTraining: {
    id: string;
    title: string;
    date: Date;
    durationMin: number | null;
  }[] = [];

  try {
    const [sessionCount, weights, noteCount, reminderRows, trainingRows] =
      await Promise.all([
        prisma.trainingLog.count({
          where: { userId, date: { gte: since } },
        }),
        prisma.bodyMetric.findMany({
          where: { userId },
          orderBy: { date: "desc" },
          take: 1,
        }),
        prisma.note.count({
          where: { userId, date: { gte: since } },
        }),
        prisma.reminder.findMany({
          where: { userId, enabled: true },
          orderBy: { hourLocal: "asc" },
          take: 3,
        }),
        prisma.trainingLog.findMany({
          where: { userId },
          orderBy: { date: "desc" },
          take: 4,
        }),
      ]);

    sessions14d = sessionCount;
    notes14d = noteCount;
    latestWeight = weights[0]
      ? { weight: weights[0].weight, unit: weights[0].unit }
      : null;
    reminders = reminderRows;
    recentTraining = trainingRows;
  } catch (err) {
    console.error("[dashboard] failed to load stats:", err);
  }

  const empty = sessions14d === 0 && !latestWeight && notes14d === 0;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-orange-400/90">
          Dashboard
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl">
          {greeting()}, {firstName}
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          {empty
            ? "Your command center. Start by logging today’s session or weight."
            : "Keep the log honest. Progress compounds."}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2.5 md:gap-3">
        <Stat label="Sessions · 14d" value={String(sessions14d)} />
        <Stat
          label="Weight"
          value={
            latestWeight
              ? `${latestWeight.weight}${latestWeight.unit}`
              : "—"
          }
        />
        <Stat label="Notes · 14d" value={String(notes14d)} />
      </div>

      {empty && (
        <Card className="border-orange-500/20 bg-gradient-to-br from-orange-500/[0.08] to-transparent">
          <p className="text-sm font-semibold text-zinc-100">
            Foundation ready — no entries yet
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">
            Log training, bodyweight, supplements, compounds, and notes. This
            dashboard fills in as you go. Nothing is prescribed for you.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/log?tab=training"
              className="rounded-full bg-gradient-to-br from-orange-500 to-orange-600 px-4 py-2 text-xs font-semibold text-white"
            >
              Log training
            </Link>
            <Link
              href="/log?tab=weight"
              className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-zinc-200"
            >
              Log weight
            </Link>
            <Link
              href="/guides"
              className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-zinc-200"
            >
              Browse guides
            </Link>
          </div>
        </Card>
      )}

      <Card>
        <CardTitle className="mb-3 text-sm">Quick log</CardTitle>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
          {[
            { href: "/log?tab=training", label: "Training" },
            { href: "/log?tab=weight", label: "Bodyweight" },
            { href: "/log?tab=supplements", label: "Supplements" },
            { href: "/log?tab=compounds", label: "Compounds" },
            { href: "/mind", label: "Mind" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-xl border border-white/10 bg-zinc-950/50 px-3 py-3 text-center text-sm font-medium text-zinc-200 transition hover:border-orange-500/40 hover:text-orange-300"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <CardTitle className="text-sm">Recent training</CardTitle>
            <Link
              href="/history"
              className="text-xs font-medium text-orange-400"
            >
              History
            </Link>
          </div>
          {recentTraining.length === 0 ? (
            <Placeholder
              text="No sessions yet"
              cta={{ href: "/log?tab=training", label: "Add session" }}
            />
          ) : (
            <ul className="space-y-2">
              {recentTraining.map((w) => (
                <li
                  key={w.id}
                  className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-zinc-950/40 px-3 py-2.5"
                >
                  <div>
                    <p className="text-sm font-medium text-zinc-100">
                      {w.title}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {format(w.date, "MMM d")}
                      {w.durationMin ? ` · ${w.durationMin} min` : ""}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <div className="mb-3 flex items-center justify-between">
            <CardTitle className="text-sm">Reminders</CardTitle>
            <Link
              href="/reminders"
              className="text-xs font-medium text-orange-400"
            >
              Manage
            </Link>
          </div>
          {reminders.length === 0 ? (
            <Placeholder
              text="No active reminders"
              cta={{ href: "/reminders", label: "Set one" }}
            />
          ) : (
            <ul className="space-y-2">
              {reminders.map((r) => (
                <li
                  key={r.id}
                  className="flex justify-between text-sm text-zinc-300"
                >
                  <span>{r.title}</span>
                  <span className="text-zinc-500 tabular-nums">
                    {String(r.hourLocal).padStart(2, "0")}:00
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card className="border-white/[0.06]">
        <CardTitle className="mb-3 text-sm">Modules</CardTitle>
        <div className="grid grid-cols-2 gap-2 text-xs text-zinc-400 md:grid-cols-3">
          {[
            ["Dashboard", "Snapshot & shortcuts"],
            ["Log", "Training · metrics · supps · compounds · notes"],
            ["History", "Charts & recent activity"],
            ["Mind", "Discipline check-ins + learning paths"],
            ["Guides", "Long-form training & education"],
            ["Substances", "AI education for logged compounds/supps"],
            ["Reminders", "Simple daily anchors"],
            ["AI", "Org + education only — no dosing"],
          ].map(([title, desc]) => (
            <div
              key={title}
              className="rounded-xl border border-white/[0.05] bg-zinc-950/30 px-3 py-2.5"
            >
              <p className="font-semibold text-zinc-200">{title}</p>
              <p className="mt-0.5 leading-snug text-zinc-500">{desc}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-zinc-900/50 px-3 py-3 md:px-4">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
        {label}
      </p>
      <p className="mt-1 text-lg font-bold tabular-nums tracking-tight text-zinc-50 md:text-xl">
        {value}
      </p>
    </div>
  );
}

function Placeholder({
  text,
  cta,
}: {
  text: string;
  cta: { href: string; label: string };
}) {
  return (
    <div className="rounded-xl border border-dashed border-white/10 bg-zinc-950/30 px-3 py-6 text-center">
      <p className="text-sm text-zinc-500">{text}</p>
      <Link
        href={cta.href}
        className="mt-2 inline-block text-xs font-semibold text-orange-400 hover:text-orange-300"
      >
        {cta.label} →
      </Link>
    </div>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}
