"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { LogEducationBriefing } from "@/components/education/log-education-briefing";
import { formatDateInput } from "@/lib/utils";
import {
  addBodyweight,
  addCompound,
  addNote,
  addSupplement,
  addWorkout,
  type LogActionResult,
} from "@/app/actions/logs";
import type { EducationBriefing } from "@/lib/education/classify";

const tabs = [
  { id: "training", label: "Training" },
  { id: "weight", label: "Weight" },
  { id: "supplements", label: "Supps" },
  { id: "compounds", label: "Compounds" },
  { id: "notes", label: "Notes" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export function LogForms() {
  const search = useSearchParams();
  const router = useRouter();
  const raw = search.get("tab") || "training";
  const tab = (tabs.some((t) => t.id === raw) ? raw : "training") as TabId;
  const [pending, start] = useTransition();
  const [status, setStatus] = useState<string | null>(null);
  const [statusKind, setStatusKind] = useState<"ok" | "err">("ok");
  const [briefing, setBriefing] = useState<EducationBriefing | null>(null);
  const [educationHref, setEducationHref] = useState<string | null>(null);
  const today = formatDateInput();

  function setTab(id: TabId) {
    setStatus(null);
    setBriefing(null);
    setEducationHref(null);
    router.replace(`/log?tab=${id}`);
  }

  function run(
    action: (fd: FormData) => Promise<LogActionResult>,
    form: HTMLFormElement
  ) {
    const fd = new FormData(form);
    start(async () => {
      setStatus(null);
      setBriefing(null);
      setEducationHref(null);
      try {
        const result = await action(fd);

        if (!result?.ok) {
          setStatusKind("err");
          setStatus(
            result?.error ||
              "Could not save. If this keeps happening, sign out and sign in again."
          );
          return;
        }

        form.reset();
        const dateInput = form.querySelector<HTMLInputElement>(
          'input[name="date"]'
        );
        if (dateInput) dateInput.value = today;

        setStatusKind("ok");
        router.refresh();

        if (result.educationBriefing) {
          setBriefing(result.educationBriefing);
          setEducationHref(result.educationHref || null);
          setStatus("Saved. Educational briefing ready below.");
          return;
        }

        if (result.educationHref) {
          setEducationHref(result.educationHref);
          setStatus("Saved.");
          return;
        }

        setStatus("Saved. Check History to confirm.");
      } catch (err) {
        setStatusKind("err");
        setStatus(
          err instanceof Error
            ? err.message
            : "Something went wrong. Try signing out and back in."
        );
      }
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex gap-1 overflow-x-auto pb-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
              tab === t.id
                ? "bg-orange-500 text-white"
                : "bg-white/5 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {status ? (
        <p
          className={`rounded-xl border px-3 py-2 text-xs ${
            statusKind === "err"
              ? "border-red-500/30 bg-red-500/10 text-red-200"
              : "border-emerald-500/25 bg-emerald-500/10 text-emerald-200"
          }`}
        >
          {status}
          {statusKind === "err" && status.toLowerCase().includes("session") ? (
            <>
              {" "}
              <a href="/login?reason=stale" className="underline">
                Sign in again
              </a>
            </>
          ) : null}
        </p>
      ) : null}

      {briefing ? (
        <LogEducationBriefing
          briefing={briefing}
          educationHref={educationHref}
        />
      ) : null}

      {tab === "training" && (
        <Card>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              run(addWorkout, e.currentTarget);
            }}
          >
            <Field label="Date">
              <Input name="date" type="date" defaultValue={today} required />
            </Field>
            <Field label="Session title">
              <Input name="title" placeholder="Upper A / Legs / Full body" required />
            </Field>
            <Field label="Duration (min)">
              <Input name="durationMin" type="number" min={1} placeholder="75" />
            </Field>
            <Field label="Notes">
              <Textarea name="notes" placeholder="Energy, pumps, pain flags, PR notes…" />
            </Field>
            <input type="hidden" name="exercises" value="[]" />
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Saving…" : "Save training"}
            </Button>
          </form>
        </Card>
      )}

      {tab === "weight" && (
        <Card>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              run(addBodyweight, e.currentTarget);
            }}
          >
            <Field label="Date">
              <Input name="date" type="date" defaultValue={today} required />
            </Field>
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <Field label="Bodyweight">
                  <Input name="weight" type="number" step="0.1" placeholder="185.4" required />
                </Field>
              </div>
              <Field label="Unit">
                <select
                  name="unit"
                  defaultValue="lb"
                  className="w-full rounded-xl border border-white/10 bg-zinc-950/80 px-3 py-2.5 text-sm"
                >
                  <option value="lb">lb</option>
                  <option value="kg">kg</option>
                </select>
              </Field>
            </div>
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Saving…" : "Save weight"}
            </Button>
          </form>
        </Card>
      )}

      {tab === "supplements" && (
        <Card>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              run(addSupplement, e.currentTarget);
            }}
          >
            <Field label="Date">
              <Input name="date" type="date" defaultValue={today} required />
            </Field>
            <Field label="Name">
              <Input name="name" placeholder="Creatine, vitamin D, fish oil…" required />
            </Field>
            <Field label="Amount note (optional free text)">
              <Input name="amountNote" placeholder="As labeled / your usual amount" />
            </Field>
            <Field label="Notes">
              <Textarea name="notes" placeholder="Timing, brand, context…" />
            </Field>
            <p className="text-[11px] leading-relaxed text-zinc-500">
              Saves to History, then surfaces a smart educational briefing and
              related guides. No dosing. Not medical advice.
            </p>
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Saving & analyzing…" : "Save supplement"}
            </Button>
          </form>
        </Card>
      )}

      {tab === "compounds" && (
        <Card className="space-y-3">
          <div className="rounded-xl border border-orange-500/25 bg-orange-500/10 px-3 py-2.5 text-xs leading-relaxed text-orange-100/90">
            <strong className="font-semibold text-orange-300">Self-report only.</strong> Log what you
            already use for your own history. After save, the app surfaces educational
            context (class, A:A when known, related guides). Never dosing or protocols.
          </div>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              run(addCompound, e.currentTarget);
            }}
          >
            <Field label="Date">
              <Input name="date" type="date" defaultValue={today} required />
            </Field>
            <Field label="Name (your label)">
              <Input
                name="name"
                placeholder="e.g. Testosterone, Masteron, Winstrol…"
                required
              />
            </Field>
            <Field label="Notes (no protocol design)">
              <Textarea name="notes" placeholder="Context for your records only…" />
            </Field>
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Saving & analyzing…" : "Save compound log"}
            </Button>
          </form>
        </Card>
      )}

      {tab === "notes" && (
        <Card>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              run(addNote, e.currentTarget);
            }}
          >
            <Field label="Date">
              <Input name="date" type="date" defaultValue={today} required />
            </Field>
            <Field label="Note">
              <Textarea
                name="body"
                required
                placeholder="Sleep, stress, hunger, joint feedback, life load…"
              />
            </Field>
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Saving…" : "Save note"}
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}
