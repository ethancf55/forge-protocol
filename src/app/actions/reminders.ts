"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function addReminder(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const title = String(formData.get("title") || "").trim();
  const hourLocal = Number(formData.get("hourLocal"));
  if (!title || Number.isNaN(hourLocal) || hourLocal < 0 || hourLocal > 23) {
    throw new Error("Invalid reminder");
  }

  await prisma.reminder.create({
    data: {
      userId: session.user.id,
      title,
      hourLocal,
    },
  });
  revalidatePath("/reminders");
  revalidatePath("/dashboard");
}

export async function toggleReminder(id: string, enabled: boolean) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  await prisma.reminder.updateMany({
    where: { id, userId: session.user.id },
    data: { enabled },
  });
  revalidatePath("/reminders");
  revalidatePath("/dashboard");
}

export async function deleteReminder(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  await prisma.reminder.deleteMany({ where: { id, userId: session.user.id } });
  revalidatePath("/reminders");
  revalidatePath("/dashboard");
}
