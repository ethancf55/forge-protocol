import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

/**
 * Require a signed-in user whose id still exists in the database.
 * JWT sessions can outlive wiped/migrated user rows — those must re-auth.
 * DB outages redirect to login with a clear reason instead of a 500.
 */
export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, name: true, username: true },
    });

    if (!user) {
      // Stale cookie after DB reset/migrate — force re-login
      redirect("/login?reason=stale");
    }

    return {
      id: user.id,
      email: user.email ?? session.user.email ?? null,
      name: user.username || user.name || session.user.name || null,
    };
  } catch (err) {
    console.error("[requireUser] database unreachable", err);
    redirect("/login?reason=db");
  }
}
