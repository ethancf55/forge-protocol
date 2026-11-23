import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const started = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    const users = await prisma.user.count();
    return NextResponse.json({
      ok: true,
      db: "up",
      users,
      ms: Date.now() - started,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[health]", message);
    return NextResponse.json(
      {
        ok: false,
        db: "down",
        error: message.slice(0, 200),
        ms: Date.now() - started,
      },
      { status: 503 }
    );
  }
}
