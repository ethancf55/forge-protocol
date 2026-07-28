import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AaRatioBlock,
  StackEducationPanel,
} from "@/components/education/stack-panel";
import { SubstanceBriefingPanel } from "@/components/education/substance-briefing-panel";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import {
  ensureSubstanceEducation,
  parseEducationContent,
} from "@/lib/education/ensure";
import { ensureUserStackEducation } from "@/lib/education/stack-ensure";
import { buildEducationBriefing } from "@/lib/education/classify";
import { resolveEducationSections } from "@/lib/education/render";
import { displayKind } from "@/lib/education/slug";
import type { SubstanceKind } from "@/lib/education/types";
import { regenerateSubstanceEducation } from "@/app/actions/logs";

export default async function SubstanceEducationPage({
  params,
}: {
  params: Promise<{ kind: string; slug: string }>;
}) {
  const user = await requireUser();
  const { kind: kindRaw, slug } = await params;
  if (kindRaw !== "supplement" && kindRaw !== "compound") notFound();
  const kind = kindRaw as SubstanceKind;

  let row = await prisma.substanceEducation.findUnique({
    where: { kind_slug: { kind, slug } },
  });

  if (!row) notFound();

  if (row.status === "generating" || row.status === "failed") {
    row = await ensureSubstanceEducation({
      name: row.name,
      kind,
      force: row.status === "failed",
    });
  }

  const content = parseEducationContent(row.contentJson);
  const sections = resolveEducationSections(content, kind);
  const kindLabel = displayKind(kind);
  const briefing = buildEducationBriefing(row.name, kind);

  // Multi-substance educational analysis (cached per user + substance set)
  const stack = await ensureUserStackEducation({ userId: user.id });

  return (
    <article className="mx-auto max-w-2xl space-y-6">
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <Link
          href="/history"
          className="font-semibold text-orange-400 hover:text-orange-300"
        >
          ← History
        </Link>
        <Link href="/log" className="text-zinc-500 hover:text-zinc-300">
          Log
        </Link>
        <Link href="/learn" className="text-zinc-500 hover:text-zinc-300">
          Education library
        </Link>
        <Link href="/guides" className="text-zinc-500 hover:text-zinc-300">
          Guides
        </Link>
      </div>

      <header className="space-y-3 border-b border-white/[0.06] pb-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-zinc-400 ring-1 ring-white/10">
            {kindLabel}
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ${
              row.status === "ready"
                ? "bg-emerald-500/10 text-emerald-300 ring-emerald-500/25"
                : row.status === "failed"
                  ? "bg-amber-500/10 text-amber-200 ring-amber-500/25"
                  : "bg-zinc-500/10 text-zinc-400 ring-white/10"
            }`}
          >
            {row.status === "ready"
              ? "Cached"
              : row.status === "failed"
                ? "Fallback"
                : "Generating"}
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-50 sm:text-3xl">
          {row.name}
        </h1>
        <p className="text-sm leading-relaxed text-zinc-500">
          Educational reference for substances you log. Smart profile + deep
          guides below. Not medical advice. Not a recommendation to use.
        </p>
      </header>

      <SubstanceBriefingPanel briefing={briefing} />

      {sections.map((section) => (
        <Section
          key={section.id}
          title={section.title}
          subtitle={section.subtitle}
        >
          {section.shape === "aaRatio" ? (
            <AaRatioBlock value={section.value} />
          ) : section.shape === "string[]" && Array.isArray(section.value) ? (
            <BulletList items={section.value} />
          ) : (
            <p className="text-[15px] leading-[1.7] text-zinc-300">
              {String(section.value)}
            </p>
          )}
        </Section>
      ))}

      <Card className="border-orange-500/25 bg-orange-500/10">
        <CardTitle className="mb-2 text-sm text-orange-200">Disclaimer</CardTitle>
        <p className="text-sm leading-relaxed text-orange-50/90">
          {content.disclaimer}
        </p>
      </Card>

      <StackEducationPanel
        content={stack.content}
        substances={stack.substances}
        focusName={row.name}
        status={stack.status}
        model={stack.model}
      />

      <div className="flex flex-wrap items-center gap-3 border-t border-white/[0.06] pt-5">
        <form action={regenerateSubstanceEducation}>
          <input type="hidden" name="kind" value={kind} />
          <input type="hidden" name="name" value={row.name} />
          <Button type="submit" variant="secondary" size="sm">
            Regenerate substance page
          </Button>
        </form>
        {row.model ? (
          <p className="text-[11px] text-zinc-600">Model: {row.model}</p>
        ) : null}
        {row.error ? (
          <p className="max-w-md text-[11px] text-amber-500/90">
            Last error: {row.error}
          </p>
        ) : null}
      </div>
    </article>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2.5">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-zinc-50">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-0.5 text-xs text-zinc-500">{subtitle}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function BulletList({ items }: { items: string[] }) {
  if (!items?.length) {
    return <p className="text-sm text-zinc-500">No items available.</p>;
  }
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li
          key={item}
          className="relative pl-5 text-[15px] leading-[1.65] text-zinc-300"
        >
          <span className="absolute left-0 top-[0.55em] h-1.5 w-1.5 rounded-full bg-orange-500" />
          {item}
        </li>
      ))}
    </ul>
  );
}
