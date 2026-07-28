"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { toggleDisciplineCheckIn } from "@/app/actions/mind";
import type { DisciplineHabitDef } from "@/content/mind/types";
import { cn } from "@/lib/utils";

export function DisciplineCheckInList({
  habits,
  completedKeys,
  date,
}: {
  habits: DisciplineHabitDef[];
  completedKeys: string[];
  date: string;
}) {
  const done = new Set(completedKeys);

  return (
    <ul className="space-y-2.5">
      {habits.map((habit) => (
        <DisciplineCheckInRow
          key={habit.key}
          habit={habit}
          completed={done.has(habit.key)}
          date={date}
        />
      ))}
    </ul>
  );
}

function DisciplineCheckInRow({
  habit,
  completed,
  date,
}: {
  habit: DisciplineHabitDef;
  completed: boolean;
  date: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [localDone, setLocalDone] = useState(completed);
  const [minutes, setMinutes] = useState("");
  const [error, setError] = useState<string | null>(null);

  function toggle() {
    setError(null);
    const fd = new FormData();
    fd.set("habitKey", habit.key);
    fd.set("date", date);
    if (habit.trackMinutes && minutes) fd.set("minutes", minutes);

    start(async () => {
      const res = await toggleDisciplineCheckIn(fd);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setLocalDone(Boolean(res.completed));
      router.refresh();
    });
  }

  return (
    <li
      className={cn(
        "rounded-2xl border px-3.5 py-3.5 transition",
        localDone
          ? "border-orange-500/30 bg-orange-500/[0.07]"
          : "border-white/[0.08] bg-zinc-950/40"
      )}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={toggle}
          disabled={pending}
          aria-pressed={localDone}
          aria-label={
            localDone ? `Undo ${habit.title}` : `Complete ${habit.title}`
          }
          className={cn(
            "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border transition",
            localDone
              ? "border-orange-500/50 bg-orange-500 text-white"
              : "border-white/15 bg-zinc-900 text-transparent hover:border-orange-500/40"
          )}
        >
          <Check className="h-4 w-4" strokeWidth={2.5} />
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-sm font-semibold text-zinc-100">{habit.title}</p>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-zinc-600">
              {habit.category}
            </span>
          </div>
          <p className="mt-0.5 text-xs leading-relaxed text-zinc-500">
            {habit.prompt}
          </p>

          {habit.trackMinutes && !localDone ? (
            <div className="mt-2 flex items-center gap-2">
              <label className="text-[11px] text-zinc-600">Minutes</label>
              <input
                type="number"
                min={1}
                max={240}
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                placeholder="—"
                className="w-16 rounded-lg border border-white/10 bg-zinc-950 px-2 py-1 text-xs text-zinc-200 outline-none focus:border-orange-500/50"
              />
            </div>
          ) : null}

          {error ? (
            <p className="mt-2 text-[11px] text-red-300">{error}</p>
          ) : null}
        </div>
      </div>
    </li>
  );
}
