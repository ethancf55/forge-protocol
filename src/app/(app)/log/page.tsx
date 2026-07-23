import { Suspense } from "react";
import { LogForms } from "@/components/log/log-forms";

export default function LogPage() {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-orange-400/90">
          Log
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">Capture the day</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Training, weight, supplements, compounds, notes — one clean flow.
        </p>
      </div>
      <Suspense fallback={<p className="text-sm text-zinc-500">Loading…</p>}>
        <LogForms />
      </Suspense>
    </div>
  );
}
