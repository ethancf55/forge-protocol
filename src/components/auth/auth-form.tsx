"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";

type Mode = "login" | "signup";

export function AuthForm({
  mode,
  action,
}: {
  mode: Mode;
  action: (formData: FormData) => Promise<{ error?: string } | void>;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <form
      className="space-y-4"
      action={(fd) => {
        setError(null);
        start(async () => {
          const res = await action(fd);
          if (res?.error) setError(res.error);
        });
      }}
    >
      {mode === "signup" && (
        <Field label="Name">
          <Input name="name" required placeholder="Ethan" autoComplete="name" />
        </Field>
      )}
      <Field label="Email">
        <Input
          name="email"
          type="email"
          required
          placeholder="you@email.com"
          autoComplete="email"
        />
      </Field>
      <Field label="Password">
        <Input
          name="password"
          type="password"
          required
          minLength={6}
          placeholder="••••••••"
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
        />
      </Field>

      {error && (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={pending} size="lg">
        {pending ? "Working…" : mode === "signup" ? "Create account" : "Sign in"}
      </Button>

      <p className="text-center text-sm text-zinc-500">
        {mode === "signup" ? (
          <>
            Already have an account?{" "}
            <Link href="/login" className="text-orange-400 hover:underline">
              Sign in
            </Link>
          </>
        ) : (
          <>
            New here?{" "}
            <Link href="/signup" className="text-orange-400 hover:underline">
              Create account
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
