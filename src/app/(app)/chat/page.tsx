import { ChatPanel } from "@/components/chat/chat-panel";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/db";

export default async function ChatPage() {
  const user = await requireUser();
  const messages = await prisma.chatMessage.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
    take: 40,
  });

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-orange-400/90">
          AI
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">Forge assistant</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Lightweight help. Hard rails against dosing advice.
        </p>
      </div>
      <ChatPanel
        initial={messages.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
        }))}
      />
    </div>
  );
}
