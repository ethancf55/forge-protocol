import Link from "next/link";
import { notFound } from "next/navigation";
import { GuideBlocks } from "@/components/content/guide-blocks";
import { getPracticeBySlug, getPublishedPractices } from "@/content/mind";

export function generateStaticParams() {
  return getPublishedPractices().map((p) => ({ slug: p.slug }));
}

export default async function DisciplinePracticePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const practice = getPracticeBySlug(slug);
  if (!practice) notFound();

  return (
    <article className="mx-auto max-w-2xl space-y-6">
      <div className="flex flex-wrap gap-3 text-xs">
        <Link
          href="/mind/discipline"
          className="font-semibold text-orange-400 hover:text-orange-300"
        >
          ← Discipline
        </Link>
        <Link href="/mind" className="text-zinc-500 hover:text-zinc-300">
          Mind
        </Link>
      </div>

      <header className="space-y-2 border-b border-white/[0.06] pb-6">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-orange-400/80">
          Practice · {practice.minutes} min
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-50 sm:text-3xl">
          {practice.title}
        </h1>
        <p className="text-sm leading-relaxed text-zinc-500">
          {practice.summary}
        </p>
      </header>

      <GuideBlocks blocks={practice.body} />

      <p className="rounded-xl border border-white/10 bg-zinc-900/50 px-3.5 py-3 text-xs leading-relaxed text-zinc-500">
        Educational mindset content. Not medical advice. Adjust practices for
        health conditions and common sense.
      </p>
    </article>
  );
}
