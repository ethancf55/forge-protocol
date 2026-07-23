"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function uid() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

function parseDate(value: FormDataEntryValue | null) {
  const s = String(value || "");
  const d = new Date(s + "T12:00:00");
  if (Number.isNaN(d.getTime())) return new Date();
  return d;
}

export async function addWorkout(formData: FormData) {
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
}

export async function addBodyweight(formData: FormData) {
  const userId = await uid();
  const weight = Number(formData.get("weight"));
  if (!weight || weight <= 0) throw new Error("Invalid weight");
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
}

export async function addSupplement(formData: FormData) {
  const userId = await uid();
  await prisma.supplementLog.create({
    data: {
      userId,
      date: parseDate(formData.get("date")),
      name: String(formData.get("name") || "").trim() || "Supplement",
      amountNote: String(formData.get("amountNote") || "").trim() || null,
      notes: String(formData.get("notes") || "").trim() || null,
    },
  });
  revalidatePath("/log");
  revalidatePath("/history");
}

export async function addCompound(formData: FormData) {
  const userId = await uid();
  await prisma.compoundLog.create({
    data: {
      userId,
      date: parseDate(formData.get("date")),
      name: String(formData.get("name") || "").trim() || "Entry",
      notes: String(formData.get("notes") || "").trim() || null,
    },
  });
  revalidatePath("/log");
  revalidatePath("/history");
}

export async function addNote(formData: FormData) {
  const userId = await uid();
  await prisma.note.create({
    data: {
      userId,
      date: parseDate(formData.get("date")),
      body: String(formData.get("body") || "").trim() || "(empty)",
    },
  });
  revalidatePath("/log");
  revalidatePath("/history");
  revalidatePath("/dashboard");
}
