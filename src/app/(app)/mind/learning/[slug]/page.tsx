import Link from "next/link";
import { notFound } from "next/navigation";
import { GuideBlocks } from "@/components/content/guide-blocks";
import {
  getLessonBySlug,
  getPathBySlug,
  getPublishedLessons,
} from "@/content/mind";

export function generateStaticParams() {
  return getPublishedLessons().map((l) => ({ slug: l.slug }));
}

export default async function LearningLessonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const lesson = getLessonBySlug(slug);
  if (!lesson) notFound();

  const path = getPathBySlug(lesson.pathSlug);
  const others = getPublishedLessons()
    .filter((l) => l.pathSlug === lesson.pathSlug && l.slug !== lesson.slug)
    .slice(0, 4);

  return (
    <article className="mx-auto max-w-2xl space-y-6">
      <div className="flex flex-wrap gap-3 text-xs">
        <Link
          href="/mind/learning"
          className="font-semibold text-orange-400 hover:text-orange-300"
        >
          ← Learning
        </Link>
        {path ? (
          <Link
            href={`/mind/learning?path=${path.slug}`}
            className="text-zinc-500 hover:text-zinc-300"
          >
            {path.title}
          </Link>
        ) : null}
        <Link href="/mind" className="text-zinc-500 hover:text-zinc-300">
          Mind
        </Link>
      </div>

      <header className="space-y-2 border-b border-white/[0.06] pb-6">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-orange-400/80">
          Lesson · {lesson.minutes} min
          {path ? ` · ${path.title}` : ""}
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-50 sm:text-3xl">
          {lesson.title}
        </h1>
        <p className="text-sm leading-relaxed text-zinc-500">{lesson.summary}</p>
      </header>

      <GuideBlocks blocks={lesson.body} />

      {others.length > 0 ? (
        <footer className="space-y-2 border-t border-white/[0.06] pt-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            More in this path
          </p>
          <ul className="space-y-2">
            {others.map((l) => (
              <li key={l.slug}>
                <Link
                  href={`/mind/learning/${l.slug}`}
                  className="block rounded-xl border border-white/[0.06] bg-zinc-950/40 px-3 py-2.5 text-sm text-zinc-200 transition hover:border-orange-500/30"
                >
                  {l.title}
                </Link>
              </li>
            ))}
          </ul>
        </footer>
      ) : null}
    </article>
  );
}
