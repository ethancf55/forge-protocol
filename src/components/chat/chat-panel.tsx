"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

type Msg = { id: string; role: string; content: string };

export function ChatPanel({ initial }: { initial: Msg[] }) {
  const [messages, setMessages] = useState(initial);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Chat failed");
      setMessages((m) => [
        ...m,
        { id: `a-${Date.now()}`, role: "assistant", content: data.reply },
      ]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chat failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-orange-500/20 bg-orange-500/10 px-3 py-2.5 text-xs leading-relaxed text-orange-100/90">
        Organizational + educational help only. No dosing, stacks, sources, or protocol design.
      </div>

      <Card className="flex max-h-[50vh] flex-col gap-3 overflow-y-auto">
        {messages.length === 0 ? (
          <p className="text-sm text-zinc-500">
            Ask to organize your week, clarify a guide concept, or structure notes — not what to take.
          </p>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`rounded-xl px-3 py-2 text-sm leading-relaxed ${
                m.role === "user"
                  ? "ml-6 bg-orange-500/15 text-zinc-100"
                  : "mr-6 bg-zinc-950/60 text-zinc-300"
              }`}
            >
              {m.content}
            </div>
          ))
        )}
      </Card>

      {error && (
        <p className="text-sm text-red-300">{error}</p>
      )}

      <Textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="e.g. Help me structure this week's training notes…"
        rows={3}
      />
      <Button onClick={send} disabled={loading || !input.trim()} className="w-full">
        {loading ? "Thinking…" : "Send"}
      </Button>
    </div>
  );
}
