import Link from "next/link";
import { notFound } from "next/navigation";
import { AccessBadge } from "@/components/content/access-badge";
import {
  GuideBlocks,
  guideTocFromBlocks,
} from "@/components/content/guide-blocks";
import { getGuideBySlug, getPublishedGuides } from "@/content/guides";

export function generateStaticParams() {
  return getPublishedGuides().map((g) => ({ slug: g.slug }));
}

export default async function GuideDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) notFound();

  const toc = guideTocFromBlocks(guide.body);
  const others = getPublishedGuides()
    .filter((g) => g.slug !== guide.slug)
    .slice(0, 4);

  return (
    <article className="mx-auto max-w-2xl space-y-6 pb-8">
      <Link
        href="/guides"
        className="inline-flex text-xs font-semibold text-orange-400 hover:text-orange-300"
      >
        ← All guides
      </Link>

      <header className="space-y-3 border-b border-white/[0.06] pb-6">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-orange-400/80">
            {guide.category} · {guide.minutes} min read
          </p>
          <AccessBadge access={guide.access} />
          {guide.featured ? (
            <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-zinc-400 ring-1 ring-white/10">
              Featured
            </span>
          ) : null}
        </div>
        <h1 className="text-2xl font-bold leading-[1.15] tracking-tight text-zinc-50 sm:text-3xl">
          {guide.title}
        </h1>
        <p className="text-sm leading-relaxed text-zinc-500 sm:text-[15px]">
          {guide.summary}
        </p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-zinc-600">
          {guide.author ? <span>{guide.author}</span> : null}
          <span>Updated {guide.updatedAt}</span>
        </div>

        {guide.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={guide.coverImage}
            alt=""
            className="mt-2 aspect-[16/9] w-full rounded-2xl border border-white/10 object-cover"
          />
        ) : null}

        {guide.access === "paid" && (
          <div className="rounded-xl border border-orange-500/25 bg-orange-500/10 px-3.5 py-2.5 text-xs leading-relaxed text-orange-100/90">
            Marked <strong className="font-semibold">Premium</strong> for a
            future paywall. Full text is available now — checkout is not active
            in the MVP.
          </div>
        )}
      </header>

      {/* Mobile-friendly TOC for long guides */}
      {toc.length >= 4 ? (
        <nav className="rounded-2xl border border-white/[0.08] bg-zinc-950/50 px-4 py-3.5">
          <p className="text-[11px] font-bold uppercase tracking-wide text-zinc-500">
            On this page
          </p>
          <ol className="mt-2.5 space-y-1.5">
            {toc.map((heading) => (
              <li key={heading}>
                <a
                  href={`#${heading
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/^-|-$/g, "")
                    .slice(0, 80)}`}
                  className="text-sm text-zinc-400 transition hover:text-orange-300"
                >
                  {heading}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      ) : null}

      <div className="guide-prose">
        <GuideBlocks blocks={guide.body} />
      </div>

      <footer className="space-y-4 border-t border-white/[0.06] pt-6">
        <p className="rounded-xl border border-white/10 bg-zinc-900/50 px-3.5 py-3 text-xs leading-relaxed text-zinc-500">
          Educational content only. Not medical advice. Not a personalized
          protocol. Forge Protocol does not recommend compounds, doses, or
          sources.
        </p>

        {others.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
              More guides
            </p>
            <ul className="space-y-2">
              {others.map((g) => (
                <li key={g.slug}>
                  <Link
                    href={`/guides/${g.slug}`}
                    className="block rounded-xl border border-white/[0.06] bg-zinc-950/40 px-3 py-2.5 transition hover:border-orange-500/30"
                  >
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-zinc-200">
                        {g.title}
                      </span>
                      <AccessBadge access={g.access} />
                    </span>
                    <span className="mt-0.5 block text-xs text-zinc-500">
                      {g.category} · {g.minutes} min
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </footer>
    </article>
  );
}
