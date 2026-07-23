import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#0b0b0d]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(249,115,22,0.18),transparent)]" />
      <div className="relative mx-auto flex min-h-dvh max-w-lg flex-col px-5 pb-10 pt-8">
        <header className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-sm font-black text-white shadow-[0_4px_24px_rgba(249,115,22,0.35)]">
            F
          </span>
          <span className="text-sm font-semibold tracking-tight">Forge Protocol</span>
        </header>

        <div className="flex flex-1 flex-col justify-center py-12">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-orange-400">
            For serious young lifters
          </p>
          <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-zinc-50 sm:text-5xl">
            Log hard.
            <br />
            <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
              Think clearly.
            </span>
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-zinc-400">
            Premium tracking for training, bodyweight, supplements, compounds, and notes —
            plus guides and a lightweight AI that helps you organize. No auto-dosing. No protocol
            push.
          </p>

          <ul className="mt-8 space-y-2.5 text-sm text-zinc-400">
            {[
              "Clean dashboard & daily logging",
              "Progress history and weight chart",
              "Static educational guides & starter structure",
              "Simple reminders + safe AI chat rails",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-600 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_4px_24px_rgba(249,115,22,0.35)]"
            >
              Create account
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full border border-white/15 px-6 py-3.5 text-sm font-semibold text-zinc-200 hover:border-orange-500/40"
            >
              Sign in
            </Link>
          </div>
        </div>

        <p className="text-center text-[11px] leading-relaxed text-zinc-600">
          Educational tooling only. Not medical advice. Compounds are self-reported logs — the app
          never recommends doses or protocols.
        </p>
      </div>
    </div>
  );
}
