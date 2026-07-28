"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

type Msg = { id: string; role: string; content: string };

export function ChatPanel({ initial }: { initial: Msg[] }) {
  const [messages, setMessages] = useState(initial);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [configured, setConfigured] = useState<boolean | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/chat")
      .then((r) => r.json())
      .then((d) => setConfigured(Boolean(d.configured)))
      .catch(() => setConfigured(null));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send() {
    const message = input.trim();
    if (!message || loading) return;

    setInput("");
    setError(null);
    setLoading(true);

    const tempId = `temp-${Date.now()}`;
    setMessages((m) => [...m, { id: tempId, role: "user", content: message }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
        credentials: "same-origin",
      });

      let data: { reply?: string; error?: string; code?: string } = {};
      try {
        data = await res.json();
      } catch {
        throw new Error("Server returned an invalid response.");
      }

      if (!res.ok) {
        // Keep user message; show error clearly
        if (data.code === "MISSING_API_KEY") {
          setConfigured(false);
        }
        throw new Error(data.error || `Chat failed (${res.status})`);
      }

      if (!data.reply) {
        throw new Error("No reply from AI.");
      }

      setMessages((m) => [
        ...m,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: data.reply as string,
        },
      ]);
      setConfigured(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chat failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-orange-500/20 bg-orange-500/10 px-3 py-2.5 text-xs leading-relaxed text-orange-100/90">
        Organizational + educational help only. No dosing, stacks, sources, or
        protocol design.
      </div>

      {configured === false && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-xs leading-relaxed text-amber-100/95">
          <strong className="font-semibold">AI is not configured.</strong> Add{" "}
          <code className="rounded bg-black/30 px-1">
            GOOGLE_GENERATIVE_AI_API_KEY
          </code>{" "}
          (or{" "}
          <code className="rounded bg-black/30 px-1">GEMINI_API_KEY</code>) to{" "}
          <code className="rounded bg-black/30 px-1">.env</code> from{" "}
          <a
            href="https://aistudio.google.com/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-orange-300"
          >
            Google AI Studio
          </a>
          , then restart{" "}
          <code className="rounded bg-black/30 px-1">npm run dev</code>.
        </div>
      )}

      <Card className="flex max-h-[50vh] min-h-[200px] flex-col gap-3 overflow-y-auto">
        {messages.length === 0 ? (
          <p className="text-sm text-zinc-500">
            Ask to organize your week, clarify a guide concept, or structure
            notes — not what to take.
          </p>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`rounded-xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
                m.role === "user"
                  ? "ml-4 sm:ml-6 bg-orange-500/15 text-zinc-100"
                  : "mr-4 sm:mr-6 bg-zinc-950/60 text-zinc-300"
              }`}
            >
              {m.content}
            </div>
          ))
        )}
        {loading && (
          <div className="mr-6 rounded-xl bg-zinc-950/60 px-3 py-2 text-sm text-zinc-500">
            Thinking…
          </div>
        )}
        <div ref={bottomRef} />
      </Card>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-200">
          {error}
        </div>
      )}

      <Textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            void send();
          }
        }}
        placeholder="e.g. Help me structure this week's training notes…"
        rows={3}
        disabled={loading}
      />
      <Button
        onClick={() => void send()}
        disabled={loading || !input.trim()}
        className="w-full"
      >
        {loading ? "Thinking…" : "Send"}
      </Button>
      <p className="text-center text-[11px] text-zinc-600">
        Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
}
