"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { Card, CardTitle } from "@/components/ui/card";
import {
  addReminder,
  deleteReminder,
  toggleReminder,
} from "@/app/actions/reminders";

type Reminder = {
  id: string;
  title: string;
  hourLocal: number;
  enabled: boolean;
};

export function ReminderPanel({ reminders }: { reminders: Reminder[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <div className="space-y-5">
      <Card>
        <CardTitle className="mb-3 text-sm">New reminder</CardTitle>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const fd = new FormData(form);
            start(async () => {
              await addReminder(fd);
              form.reset();
              router.refresh();
            });
          }}
        >
          <Field label="Title">
            <Input name="title" placeholder="Log training / weigh-in / sleep wind-down" required />
          </Field>
          <Field label="Hour (local, 0–23)">
            <Input name="hourLocal" type="number" min={0} max={23} defaultValue={8} required />
          </Field>
          <p className="text-xs text-zinc-500">
            MVP reminders are in-app schedule markers. Push notifications can come later.
          </p>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Saving…" : "Add reminder"}
          </Button>
        </form>
      </Card>

      <Card>
        <CardTitle className="mb-3 text-sm">Your reminders</CardTitle>
        {reminders.length === 0 ? (
          <p className="text-sm text-zinc-500">None yet.</p>
        ) : (
          <ul className="space-y-2">
            {reminders.map((r) => (
              <li
                key={r.id}
                className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-zinc-950/40 px-3 py-2.5"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-zinc-100">{r.title}</p>
                  <p className="text-xs text-zinc-500 tabular-nums">
                    {String(r.hourLocal).padStart(2, "0")}:00 ·{" "}
                    {r.enabled ? "On" : "Off"}
                  </p>
                </div>
                <button
                  type="button"
                  className="text-xs text-orange-400"
                  onClick={() =>
                    start(async () => {
                      await toggleReminder(r.id, !r.enabled);
                      router.refresh();
                    })
                  }
                >
                  Toggle
                </button>
                <button
                  type="button"
                  className="text-xs text-zinc-500"
                  onClick={() =>
                    start(async () => {
                      await deleteReminder(r.id);
                      router.refresh();
                    })
                  }
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
