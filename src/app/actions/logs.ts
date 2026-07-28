"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ensureSubstanceEducation } from "@/lib/education/ensure";
import { educationPath } from "@/lib/education/slug";
import {
  buildEducationBriefing,
  type EducationBriefing,
} from "@/lib/education/classify";
import type { SubstanceKind } from "@/lib/education/types";

export type LogActionResult =
  | {
      ok: true;
      educationHref?: string | null;
      educationBriefing?: EducationBriefing | null;
    }
  | { ok: false; error: string };

async function uid(): Promise<string> {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) {
    throw new LogError(
      "You are not signed in. Please sign in and try again.",
      "UNAUTHORIZED"
    );
  }

  // JWT can outlive a wiped DB user — catch before FK blowups
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!user) {
    throw new LogError(
      "Your session is outdated (account not found). Sign out, create an account or sign in again, then retry.",
      "STALE_SESSION"
    );
  }
  return user.id;
}

class LogError extends Error {
  code: string;
  constructor(message: string, code: string) {
    super(message);
    this.name = "LogError";
    this.code = code;
  }
}

function parseDate(value: FormDataEntryValue | null) {
  const s = String(value || "");
  const d = new Date(s + "T12:00:00");
  if (Number.isNaN(d.getTime())) return new Date();
  return d;
}

function toActionError(err: unknown): LogActionResult {
  if (err instanceof LogError) {
    return { ok: false, error: err.message };
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2003") {
      return {
        ok: false,
        error:
          "Could not save — your account session is invalid. Sign out, sign up/in again, then retry.",
      };
    }
    return {
      ok: false,
      error: `Database error (${err.code}). Please try again.`,
    };
  }
  if (err instanceof Error && err.message) {
    return { ok: false, error: err.message };
  }
  return { ok: false, error: "Something went wrong while saving." };
}

export async function addWorkout(
  formData: FormData
): Promise<LogActionResult> {
  try {
    const userId = await uid();
    await prisma.trainingLog.create({
      data: {
        userId,
        date: parseDate(formData.get("date")),
        title: String(formData.get("title") || "Training").trim() || "Training",
        durationMin: formData.get("durationMin")
          ? Number(formData.get("durationMin"))
          : null,
        notes: String(formData.get("notes") || "").trim() || null,
        exercisesJson: String(formData.get("exercises") || "[]"),
      },
    });
    revalidatePath("/dashboard");
    revalidatePath("/log");
    revalidatePath("/history");
    return { ok: true };
  } catch (err) {
    console.error("[addWorkout]", err);
    return toActionError(err);
  }
}

export async function addBodyweight(
  formData: FormData
): Promise<LogActionResult> {
  try {
    const userId = await uid();
    const weight = Number(formData.get("weight"));
    if (!weight || weight <= 0) {
      return { ok: false, error: "Enter a valid bodyweight." };
    }
    await prisma.bodyMetric.create({
      data: {
        userId,
        date: parseDate(formData.get("date")),
        weight,
        unit: String(formData.get("unit") || "lb"),
      },
    });
    revalidatePath("/dashboard");
    revalidatePath("/log");
    revalidatePath("/history");
    return { ok: true };
  } catch (err) {
    console.error("[addBodyweight]", err);
    return toActionError(err);
  }
}

export async function addSupplement(
  formData: FormData
): Promise<LogActionResult> {
  try {
    const userId = await uid();
    const name = String(formData.get("name") || "").trim();
    if (!name) {
      return { ok: false, error: "Enter a supplement name." };
    }

    await prisma.supplementLog.create({
      data: {
        userId,
        date: parseDate(formData.get("date")),
        name,
        amountNote: String(formData.get("amountNote") || "").trim() || null,
        notes: String(formData.get("notes") || "").trim() || null,
      },
    });

    // Education is best-effort and must never undo a successful log
    const educationHref = await generateEducationLink(name, "supplement");
    const educationBriefing = buildEducationBriefing(name, "supplement");

    revalidatePath("/log");
    revalidatePath("/history");
    revalidatePath("/learn");
    revalidatePath("/dashboard");
    revalidatePath("/guides");
    return { ok: true, educationHref, educationBriefing };
  } catch (err) {
    console.error("[addSupplement]", err);
    return toActionError(err);
  }
}

export async function addCompound(
  formData: FormData
): Promise<LogActionResult> {
  try {
    const userId = await uid();
    const name = String(formData.get("name") || "").trim();
    if (!name) {
      return { ok: false, error: "Enter a compound name." };
    }

    await prisma.compoundLog.create({
      data: {
        userId,
        date: parseDate(formData.get("date")),
        name,
        notes: String(formData.get("notes") || "").trim() || null,
      },
    });

    const educationHref = await generateEducationLink(name, "compound");
    const educationBriefing = buildEducationBriefing(name, "compound");

    revalidatePath("/log");
    revalidatePath("/history");
    revalidatePath("/learn");
    revalidatePath("/dashboard");
    revalidatePath("/guides");
    return { ok: true, educationHref, educationBriefing };
  } catch (err) {
    console.error("[addCompound]", err);
    return toActionError(err);
  }
}

export async function addNote(formData: FormData): Promise<LogActionResult> {
  try {
    const userId = await uid();
    const body = String(formData.get("body") || "").trim();
    if (!body) {
      return { ok: false, error: "Note cannot be empty." };
    }
    await prisma.note.create({
      data: {
        userId,
        date: parseDate(formData.get("date")),
        body,
      },
    });
    revalidatePath("/log");
    revalidatePath("/history");
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (err) {
    console.error("[addNote]", err);
    return toActionError(err);
  }
}

export async function regenerateSubstanceEducation(formData: FormData) {
  await uid();
  const kind = String(formData.get("kind") || "") as SubstanceKind;
  const name = String(formData.get("name") || "").trim();
  if ((kind !== "supplement" && kind !== "compound") || !name) {
    throw new Error("Invalid regenerate request");
  }
  const row = await ensureSubstanceEducation({ name, kind, force: true });
  revalidatePath(educationPath(kind, row.slug));
  revalidatePath("/learn");
  revalidatePath("/history");
}

async function generateEducationLink(name: string, kind: SubstanceKind) {
  try {
    const row = await ensureSubstanceEducation({ name, kind });
    return educationPath(kind, row.slug);
  } catch (err) {
    console.error("[education] ensure failed after log", err);
    return null;
  }
}
