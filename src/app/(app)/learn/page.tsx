import Link from "next/link";
import { Card } from "@/components/ui/card";
import { StackEducationPanel } from "@/components/education/stack-panel";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import {
  educationPath,
  normalizeSubstanceName,
} from "@/lib/education/slug";
import { ensureUserStackEducation } from "@/lib/education/stack-ensure";
import type { SubstanceKind } from "@/lib/education/types";

export default async function LearnLibraryPage() {
  const user = await requireUser();

  // Substances the user has actually logged
  const [supps, compounds, stack] = await Promise.all([
    prisma.supplementLog.findMany({
      where: { userId: user.id },
      select: { name: true },
      distinct: ["name"],
      orderBy: { name: "asc" },
      take: 100,
    }),
    prisma.compoundLog.findMany({
      where: { userId: user.id },
      select: { name: true },
      distinct: ["name"],
      orderBy: { name: "asc" },
      take: 100,
    }),
    ensureUserStackEducation({ userId: user.id }),
  ]);

  const pages = await prisma.substanceEducation.findMany({
    orderBy: { updatedAt: "desc" },
    take: 100,
  });

  const byNorm = new Map(
    pages.map((p) => [`${p.kind}:${p.nameNormalized}`, p] as const)
  );

  function resolve(kind: SubstanceKind, name: string) {
    return byNorm.get(`${kind}:${normalizeSubstanceName(name)}`) || null;
  }

  function itemHref(kind: SubstanceKind, name: string) {
    const page = resolve(kind, name);
    if (page) return educationPath(kind, page.slug);
    return `/learn/${kind}/open?name=${encodeURIComponent(name)}`;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-orange-400/90">
          Education
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">
          Substance library
        </h1>
        <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-zinc-500">
          Educational pages auto-created when you log a supplement or compound.
          Cached so they are not regenerated every visit.
        </p>
      </div>

      <Section
        title="Your supplements"
        empty="Log a supplement to generate an education page."
        items={supps.map((s) => {
          const page = resolve("supplement", s.name);
          return {
            name: s.name,
            href: itemHref("supplement", s.name),
            status: page?.status,
            ready: Boolean(page),
          };
        })}
      />

      <Section
        title="Your compounds"
        empty="Log a compound to generate an education page."
        items={compounds.map((c) => {
          const page = resolve("compound", c.name);
          return {
            name: c.name,
            href: itemHref("compound", c.name),
            status: page?.status,
            ready: Boolean(page),
          };
        })}
      />

      {stack.substances.length >= 2 ? (
        <StackEducationPanel
          content={stack.content}
          substances={stack.substances}
          status={stack.status}
          model={stack.model}
        />
      ) : (
        <Card className="border-white/10 bg-zinc-950/40">
          <p className="text-sm text-zinc-400">
            Log two or more different substances to unlock educational{" "}
            <strong className="font-semibold text-zinc-200">
              Stack Observations
            </strong>{" "}
            and mechanism-overlap notes.
          </p>
        </Card>
      )}

      <Card className="border-white/10 bg-zinc-950/40">
        <p className="text-xs leading-relaxed text-zinc-500">
          Educational only · Not medical advice · No dosing or protocols.
          Single-substance template:{" "}
          <code className="text-zinc-400">src/content/education/template.ts</code>
          . Stack rules:{" "}
          <code className="text-zinc-400">
            src/content/education/stack-template.ts
          </code>
          .
        </p>
      </Card>
    </div>
  );
}

function Section({
  title,
  empty,
  items,
}: {
  title: string;
  empty: string;
  items: {
    name: string;
    href: string;
    status?: string | null;
    ready: boolean;
  }[];
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
        {title}
      </h2>
      {items.length === 0 ? (
        <p className="text-sm text-zinc-500">{empty}</p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <Link key={item.name} href={item.href} className="block">
              <Card className="transition hover:border-orange-500/35">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-zinc-100">
                      {item.name}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {item.ready
                        ? item.status === "ready"
                          ? "Open education page"
                          : `Status: ${item.status}`
                        : "Page will generate on next log / open"}
                    </p>
                  </div>
                  <span className="text-zinc-600">→</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
