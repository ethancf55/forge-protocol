"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getDisciplineHabit } from "@/content/mind";

export type MindActionResult =
  | { ok: true; completed?: boolean }
  | { ok: false; error: string };

async function uid(): Promise<{ userId: string } | { error: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Sign in required." };
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true },
  });
  if (!user) {
    return {
      error: "Session outdated. Sign out and sign in again.",
    };
  }
  return { userId: user.id };
}

function dayDate(iso?: string) {
  const s = iso || new Date().toISOString().slice(0, 10);
  const d = new Date(s + "T12:00:00");
  if (Number.isNaN(d.getTime())) return new Date();
  return d;
}

/** Toggle a discipline habit for a given day (default today). */
export async function toggleDisciplineCheckIn(
  formData: FormData
): Promise<MindActionResult> {
  const authz = await uid();
  if ("error" in authz) return { ok: false, error: authz.error };

  const habitKey = String(formData.get("habitKey") || "").trim();
  const habit = getDisciplineHabit(habitKey);
  if (!habit) return { ok: false, error: "Unknown habit." };

  const date = dayDate(String(formData.get("date") || ""));
  const minutesRaw = formData.get("minutes");
  const minutes =
    minutesRaw !== null && String(minutesRaw).trim() !== ""
      ? Math.max(0, Math.min(240, Number(minutesRaw)))
      : null;
  const note = String(formData.get("note") || "").trim() || null;

  try {
    const existing = await prisma.disciplineCheckIn.findUnique({
      where: {
        userId_habitKey_date: {
          userId: authz.userId,
          habitKey,
          date,
        },
      },
    });

    if (existing?.completed) {
      await prisma.disciplineCheckIn.update({
        where: { id: existing.id },
        data: { completed: false, minutes: null, note: null },
      });
      revalidateMind();
      return { ok: true, completed: false };
    }

    await prisma.disciplineCheckIn.upsert({
      where: {
        userId_habitKey_date: {
          userId: authz.userId,
          habitKey,
          date,
        },
      },
      create: {
        userId: authz.userId,
        habitKey,
        date,
        completed: true,
        minutes: Number.isFinite(minutes as number) ? minutes : null,
        note,
      },
      update: {
        completed: true,
        minutes: Number.isFinite(minutes as number)
          ? minutes
          : existing?.minutes ?? null,
        note: note ?? existing?.note,
      },
    });

    revalidateMind();
    return { ok: true, completed: true };
  } catch (err) {
    console.error("[toggleDisciplineCheckIn]", err);
    return {
      ok: false,
      error: "Could not save check-in. Is the database online?",
    };
  }
}

export async function addMindReflection(
  formData: FormData
): Promise<MindActionResult> {
  const authz = await uid();
  if ("error" in authz) return { ok: false, error: authz.error };

  const body = String(formData.get("body") || "").trim();
  if (!body) return { ok: false, error: "Write a short reflection first." };
  if (body.length > 2000) {
    return { ok: false, error: "Keep reflections under 2000 characters." };
  }

  const kindRaw = String(formData.get("kind") || "general");
  const kind = ["discipline", "learning", "general"].includes(kindRaw)
    ? kindRaw
    : "general";

  try {
    await prisma.mindReflection.create({
      data: {
        userId: authz.userId,
        date: dayDate(String(formData.get("date") || "")),
        kind,
        body,
      },
    });
    revalidateMind();
    return { ok: true };
  } catch (err) {
    console.error("[addMindReflection]", err);
    return { ok: false, error: "Could not save reflection." };
  }
}

function revalidateMind() {
  revalidatePath("/mind");
  revalidatePath("/mind/discipline");
  revalidatePath("/mind/learning");
  revalidatePath("/dashboard");
}
