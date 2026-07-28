import { redirect, notFound } from "next/navigation";
import { requireUser } from "@/lib/session";
import { ensureSubstanceEducation } from "@/lib/education/ensure";
import { educationPath } from "@/lib/education/slug";
import type { SubstanceKind } from "@/lib/education/types";

/**
 * Ensure an education page exists for a substance name, then redirect to it.
 * Used when history/library has a log entry but no cached page yet.
 */
export default async function OpenSubstanceEducationPage({
  params,
  searchParams,
}: {
  params: Promise<{ kind: string }>;
  searchParams: Promise<{ name?: string }>;
}) {
  await requireUser();
  const { kind: kindRaw } = await params;
  const { name: nameRaw } = await searchParams;

  if (kindRaw !== "supplement" && kindRaw !== "compound") notFound();
  const kind = kindRaw as SubstanceKind;
  const name = String(nameRaw || "").trim();
  if (!name) redirect("/log");

  const row = await ensureSubstanceEducation({ name, kind });
  redirect(educationPath(kind, row.slug));
}
