import { ReminderPanel } from "@/components/reminders/reminder-panel";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/db";

export default async function RemindersPage() {
  const user = await requireUser();
  const reminders = await prisma.reminder.findMany({
    where: { userId: user.id },
    orderBy: { hourLocal: "asc" },
  });

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-orange-400/90">
          Reminders
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">Stay consistent</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Lightweight daily anchors — log, weigh-in, wind-down.
        </p>
      </div>
      <ReminderPanel reminders={reminders} />
    </div>
  );
}
