"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import {
  requestOtpAction,
  verifyOtpAction,
  type RequestOtpResult,
} from "@/app/actions/auth";

type Mode = "login" | "signup";
type Channel = "email" | "phone";
type Step = "contact" | "code";

export function OtpAuthForm({ mode }: { mode: Mode }) {
  const [channel, setChannel] = useState<Channel>("email");
  const [step, setStep] = useState<Step>("contact");
  const [contactInput, setContactInput] = useState("");
  const [code, setCode] = useState("");
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [otpMeta, setOtpMeta] = useState<Extract<
    RequestOtpResult,
    { ok: true }
  > | null>(null);

  const title =
    mode === "signup" ? "Create your account" : "Welcome back";
  const subtitle =
    mode === "signup"
      ? "Enter your email or phone, then verify with a code."
      : "Enter your email or phone. We’ll send a one-time code.";

  const contactPlaceholder =
    channel === "email" ? "you@email.com" : "(555) 123-4567";

  const deliveryLabel = useMemo(() => {
    if (!otpMeta) return null;
    if (otpMeta.delivery === "email") return "email";
    if (otpMeta.delivery === "sms") return "text message";
    return otpMeta.channel === "email"
      ? "email (dev delivery)"
      : "SMS (dev delivery)";
  }, [otpMeta]);

  function requestCode() {
    setError(null);
    setInfo(null);
    const fd = new FormData();
    fd.set("purpose", mode);
    fd.set("channel", channel);
    fd.set("contact", contactInput);

    start(async () => {
      const res = await requestOtpAction(fd);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setOtpMeta(res);
      setStep("code");
      setCode("");
      const via =
        res.delivery === "sms"
          ? "text"
          : res.delivery === "email"
            ? "email"
            : "dev channel";
      const base = `Code sent to ${res.masked} via ${via}. Expires in ${Math.round(res.expiresInSec / 60)} min.`;
      setInfo(res.devCode ? `${base} Dev code: ${res.devCode}` : base);
    });
  }

  function verifyCode() {
    setError(null);
    if (!otpMeta) {
      setError("Request a code first.");
      return;
    }
    const fd = new FormData();
    fd.set("purpose", mode);
    fd.set("contact", otpMeta.contact);
    fd.set("code", code);

    start(async () => {
      try {
        const res = await verifyOtpAction(fd);
        if (res && !res.ok) {
          setError(res.error);
        }
      } catch (e) {
        if (e && typeof e === "object" && "digest" in e) throw e;
        setError("Verification failed. Try again.");
      }
    });
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-50">
          {title}
        </h1>
        <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">
          {subtitle}
        </p>
      </div>

      {step === "contact" ? (
        <div className="grid grid-cols-2 gap-1 rounded-2xl border border-white/10 bg-zinc-950/60 p-1">
          {(
            [
              ["email", "Email"],
              ["phone", "Phone"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setChannel(id);
                setContactInput("");
                setError(null);
              }}
              className={`rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                channel === id
                  ? "bg-orange-500 text-white shadow-[0_4px_20px_rgba(249,115,22,0.35)]"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      ) : null}

      {error ? (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-200">
          {error}
        </p>
      ) : null}
      {info ? (
        <p className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3.5 py-2.5 text-sm text-emerald-100/90">
          {info}
        </p>
      ) : null}

      {step === "contact" ? (
        <div className="space-y-3.5">
          <Field label={channel === "email" ? "Email" : "Phone number"}>
            <Input
              value={contactInput}
              onChange={(e) => setContactInput(e.target.value)}
              placeholder={contactPlaceholder}
              type={channel === "email" ? "email" : "tel"}
              autoComplete={channel === "email" ? "email" : "tel"}
              inputMode={channel === "email" ? "email" : "tel"}
              required
            />
          </Field>

          <p className="text-[11px] leading-relaxed text-zinc-500">
            We’ll send a 6-digit code to this{" "}
            {channel === "email" ? "email" : "phone"}.
          </p>

          <Button
            type="button"
            className="w-full"
            size="lg"
            disabled={pending}
            onClick={requestCode}
          >
            {pending ? "Sending code…" : "Send verification code"}
          </Button>
        </div>
      ) : (
        <div className="space-y-3.5">
          <div className="rounded-xl border border-white/10 bg-zinc-950/50 px-3.5 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
              Code via {deliveryLabel}
            </p>
            <p className="mt-1 text-sm text-zinc-200">
              {otpMeta?.masked || contactInput}
            </p>
          </div>

          <Field label="6-digit code">
            <Input
              value={code}
              onChange={(e) =>
                setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="000000"
              inputMode="numeric"
              autoComplete="one-time-code"
              className="tracking-[0.35em] text-center text-lg font-semibold"
              required
            />
          </Field>

          <Button
            type="button"
            className="w-full"
            size="lg"
            disabled={pending || code.length !== 6}
            onClick={verifyCode}
          >
            {pending
              ? "Verifying…"
              : mode === "signup"
                ? "Verify & create account"
                : "Verify & sign in"}
          </Button>

          <div className="flex items-center justify-between gap-2 text-xs">
            <button
              type="button"
              className="text-zinc-500 hover:text-zinc-300"
              onClick={() => {
                setStep("contact");
                setOtpMeta(null);
                setCode("");
                setInfo(null);
                setError(null);
              }}
              disabled={pending}
            >
              ← Back
            </button>
            <button
              type="button"
              className="font-semibold text-orange-400 hover:text-orange-300"
              onClick={requestCode}
              disabled={pending}
            >
              Resend code
            </button>
          </div>
        </div>
      )}

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
    </div>
  );
}
