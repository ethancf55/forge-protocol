import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { chatWithForgeAI } from "@/lib/ai";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const message = String(body.message || "").trim();
  if (!message) {
    return NextResponse.json({ error: "Message required" }, { status: 400 });
  }

  await prisma.chatMessage.create({
    data: { userId: session.user.id, role: "user", content: message },
  });

  const history = await prisma.chatMessage.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
    take: 20,
  });

  const messages = history.map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  let reply: string;
  try {
    reply = await chatWithForgeAI(messages);
  } catch {
    reply =
      "Something went wrong reaching the AI service. Your logs are safe — try again in a moment.";
  }

  await prisma.chatMessage.create({
    data: { userId: session.user.id, role: "assistant", content: reply },
  });

  return NextResponse.json({ reply });
}
