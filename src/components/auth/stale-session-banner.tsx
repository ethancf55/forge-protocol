"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";

/**
 * Clears a JWT that no longer maps to a DB user (e.g. after migrate/reset).
 */
export function StaleSessionBanner({ reason }: { reason?: string }) {
  const shouldClear = reason === "stale" || reason === "db";
  const [clearing, setClearing] = useState(shouldClear);

  useEffect(() => {
    if (!shouldClear) return;
    let cancelled = false;
    (async () => {
      try {
        await signOut({ redirect: false });
      } finally {
        if (!cancelled) setClearing(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [shouldClear]);

  if (!shouldClear && !clearing) return null;

  return (
    <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-3 text-sm leading-relaxed text-amber-100/90">
      {clearing ? (
        <p>Clearing outdated session…</p>
      ) : reason === "db" ? (
        <p>
          The database was unreachable or reset. Sign up again (or sign in if
          you already recreated an account). If this keeps happening, claim your
          Prisma DB and update <code className="text-amber-50">DATABASE_URL</code>.
        </p>
      ) : (
        <p>
          Your previous session no longer matches the database (common after a
          reset or migration). Create an account or sign in again — then logging
          will save correctly.
        </p>
      )}
    </div>
  );
}
