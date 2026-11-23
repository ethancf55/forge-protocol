import Link from "next/link";
import { OtpAuthForm } from "@/components/auth/otp-auth-form";
import { StaleSessionBanner } from "@/components/auth/stale-session-banner";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await searchParams;

  let dbError: string | null =
    reason === "db"
      ? "Cannot reach the database right now. Try again in a moment, or claim/recreate the Prisma database if it expired."
      : null;

  let sessionUserId: string | undefined;
  try {
    const session = await auth();
    sessionUserId = session?.user?.id;
  } catch (err) {
    console.error("[login] auth()", err);
    dbError =
      dbError ||
      "Sign-in is temporarily unavailable (auth service). Refresh in a moment.";
  }

  if (!dbError && sessionUserId && reason !== "stale") {
    try {
      const exists = await prisma.user.findUnique({
        where: { id: sessionUserId },
        select: { id: true },
      });
      if (exists) redirect("/dashboard");
      if (!exists) redirect("/login?reason=stale");
    } catch {
      // DB unreachable — still show login instead of crashing
      dbError =
        "Cannot reach the database right now. The temporary Prisma DB may have expired — claim it or provision a new one, update DATABASE_URL on Vercel, and redeploy.";
    }
  }

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#0b0b0d]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(249,115,22,0.12),_transparent_55%)]" />
      <div className="relative mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5 py-10">
        <Link href="/" className="mb-8 flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-sm font-black text-white shadow-[0_8px_24px_rgba(249,115,22,0.35)]">
            F
          </span>
          <span className="text-sm font-semibold tracking-tight text-zinc-100">
            Forge Protocol
          </span>
        </Link>

        <div className="rounded-3xl border border-white/[0.08] bg-[#101014]/90 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-7">
          {dbError ? (
            <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-3 text-sm leading-relaxed text-amber-100/90">
              {dbError}
            </div>
          ) : null}
          <StaleSessionBanner reason={reason} />
          <OtpAuthForm mode="login" />
        </div>

        <p className="mt-6 text-center text-[11px] leading-relaxed text-zinc-600">
          Educational logging only · Not medical advice · No dosing protocols
        </p>
      </div>
    </div>
  );
}
