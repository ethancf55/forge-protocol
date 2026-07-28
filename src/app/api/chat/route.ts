import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  AiConfigError,
  AiRequestError,
  chatWithForgeAI,
  getGeminiModelName,
  isAiConfigured,
} from "@/lib/ai";
import { prisma } from "@/lib/db";

export async function GET() {
  return NextResponse.json({
    configured: isAiConfigured(),
    provider: "google-gemini",
    model: getGeminiModelName(),
  });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "You must be signed in to use AI chat." },
      { status: 401 }
    );
  }

  const userId = session.user.id;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const message = String(
    (body as { message?: string })?.message || ""
  ).trim();
  if (!message) {
    return NextResponse.json({ error: "Message required." }, { status: 400 });
  }
  if (message.length > 4000) {
    return NextResponse.json(
      { error: "Message is too long (max 4000 characters)." },
      { status: 400 }
    );
  }

  // Persist user message first so history survives even if AI fails
  let userMsg;
  try {
    userMsg = await prisma.chatMessage.create({
      data: { userId, role: "user", content: message },
    });
  } catch (err) {
    console.error("[chat] failed to save user message", err);
    return NextResponse.json(
      { error: "Could not save your message. Check the database connection." },
      { status: 500 }
    );
  }

  const history = await prisma.chatMessage.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    take: 24,
  });

  const messages = history.map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  try {
    const reply = await chatWithForgeAI(messages);

    const assistantMsg = await prisma.chatMessage.create({
      data: { userId, role: "assistant", content: reply },
    });

    return NextResponse.json({
      reply,
      userMessageId: userMsg.id,
      assistantMessageId: assistantMsg.id,
    });
  } catch (err) {
    console.error("[chat] AI error", err);

    if (err instanceof AiConfigError) {
      return NextResponse.json(
        {
          error: err.message,
          code: err.code,
          userMessageId: userMsg.id,
        },
        { status: 503 }
      );
    }

    if (err instanceof AiRequestError) {
      return NextResponse.json(
        {
          error: err.message,
          code: err.code,
          userMessageId: userMsg.id,
        },
        { status: 502 }
      );
    }

    return NextResponse.json(
      {
        error:
          "Something went wrong reaching the AI service. Your message was saved — try again in a moment.",
        code: "UNKNOWN",
        userMessageId: userMsg.id,
      },
      { status: 500 }
    );
  }
}
