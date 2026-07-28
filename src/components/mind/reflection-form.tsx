"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { addMindReflection } from "@/app/actions/mind";

export function ReflectionForm({
  kind = "general",
  date,
}: {
  kind?: "discipline" | "learning" | "general";
  date: string;
}) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  function submit() {
    setMsg(null);
    setErr(null);
    const fd = new FormData();
    fd.set("body", body);
    fd.set("kind", kind);
    fd.set("date", date);
    start(async () => {
      const res = await addMindReflection(fd);
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      setBody("");
      setMsg("Saved.");
      router.refresh();
    });
  }

  return (
    <div className="space-y-2.5">
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="What was hard today — and did you meet your standard?"
        className="min-h-[88px]"
      />
      {err ? <p className="text-xs text-red-300">{err}</p> : null}
      {msg ? <p className="text-xs text-emerald-300/90">{msg}</p> : null}
      <Button
        type="button"
        size="sm"
        disabled={pending || !body.trim()}
        onClick={submit}
      >
        {pending ? "Saving…" : "Save reflection"}
      </Button>
    </div>
  );
}
