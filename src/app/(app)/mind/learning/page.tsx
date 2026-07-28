import Link from "next/link";
import { Card } from "@/components/ui/card";
import {
  getLessonsForPath,
  getPublishedLessons,
  getPublishedPaths,
} from "@/content/mind";

export default async function LearningLibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ path?: string }>;
}) {
  const { path: pathFilter } = await searchParams;
  const paths = getPublishedPaths();
  const activePath =
    pathFilter && paths.some((p) => p.slug === pathFilter)
      ? pathFilter
      : null;

  const lessons = activePath
    ? getLessonsForPath(activePath)
    : getPublishedLessons();

  const pathMeta = activePath
    ? paths.find((p) => p.slug === activePath)
    : null;

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <Link href="/mind" className="font-semibold text-orange-400 hover:text-orange-300">
          ← Mind
        </Link>
        <Link href="/mind/discipline" className="text-zinc-500 hover:text-zinc-300">
          Discipline
        </Link>
        <Link href="/guides" className="text-zinc-500 hover:text-zinc-300">
          Full Guides
        </Link>
      </div>

      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-orange-400/90">
          Learning
        </p>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Knowledge with intent
        </h1>
        <p className="max-w-xl text-sm leading-relaxed text-zinc-500">
          Short lessons and paths designed to grow. For long-form depth, jump to
          the main Guides library anytime. Built so you can keep adding content
          for years.
        </p>
      </header>

      {/* Path chips */}
      <div className="flex flex-wrap gap-2">
        <Link
          href="/mind/learning"
          className={`rounded-full px-3 py-1.5 text-[11px] font-semibold ring-1 transition ${
            !activePath
              ? "bg-orange-500 text-white ring-orange-500"
              : "bg-white/5 text-zinc-400 ring-white/10 hover:text-zinc-200"
          }`}
        >
          All lessons
        </Link>
        {paths.map((p) => (
          <Link
            key={p.slug}
            href={`/mind/learning?path=${p.slug}`}
            className={`rounded-full px-3 py-1.5 text-[11px] font-semibold ring-1 transition ${
              activePath === p.slug
                ? "bg-orange-500 text-white ring-orange-500"
                : "bg-white/5 text-zinc-400 ring-white/10 hover:text-zinc-200"
            }`}
          >
            {p.title}
          </Link>
        ))}
      </div>

      {pathMeta ? (
        <Card className="border-orange-500/20 bg-orange-500/[0.05]">
          <p className="text-sm font-semibold text-zinc-100">{pathMeta.title}</p>
          <p className="mt-1 text-xs leading-relaxed text-zinc-500">
            {pathMeta.summary}
          </p>
        </Card>
      ) : (
        <section className="space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Paths
          </h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {paths.map((p) => (
              <Link key={p.slug} href={`/mind/learning?path=${p.slug}`}>
                <Card className="h-full transition hover:border-orange-500/35">
                  <p className="text-sm font-semibold text-zinc-100">{p.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                    {p.summary}
                  </p>
                  <p className="mt-2 text-[11px] text-zinc-600">
                    {p.lessonSlugs.length} lessons
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          {pathMeta ? "Lessons in this path" : "All lessons"}
        </h2>
        <div className="space-y-2">
          {lessons.map((lesson) => (
            <Link
              key={lesson.slug}
              href={`/mind/learning/${lesson.slug}`}
              className="block"
            >
              <Card className="transition hover:border-orange-500/35">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                      {lesson.minutes} min
                      {lesson.tags?.[0] ? ` · ${lesson.tags[0]}` : ""}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-zinc-100">
                      {lesson.title}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                      {lesson.summary}
                    </p>
                  </div>
                  <span className="shrink-0 text-zinc-600">→</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <Card className="border-dashed border-white/10 bg-zinc-950/30">
        <p className="text-xs leading-relaxed text-zinc-500">
          <strong className="font-semibold text-zinc-400">Add content:</strong>{" "}
          edit{" "}
          <code className="text-zinc-400">src/content/mind/learning/index.ts</code>{" "}
          — add a lesson and attach it to a path. Long-form training pieces stay
          in <code className="text-zinc-400">src/content/guides/</code>.
        </p>
      </Card>
    </div>
  );
}
