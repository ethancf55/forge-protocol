import Link from "next/link";
import { Card } from "@/components/ui/card";
import { AccessBadge } from "@/components/content/access-badge";
import {
  getFeaturedGuides,
  getGuideCategories,
  getPublishedGuides,
} from "@/content/guides";
import { getPublishedProducts } from "@/content/products";

export default function GuidesPage() {
  const guides = getPublishedGuides();
  const featured = getFeaturedGuides();
  const categories = getGuideCategories();
  const products = getPublishedProducts();
  const freeCount = guides.filter((g) => g.access === "free").length;
  const paidCount = guides.filter((g) => g.access === "paid").length;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-orange-400/90">
          Guides
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl">
          Learn with intent
        </h1>
        <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-zinc-500">
          Long-form educational guides for serious lifters. Not medical advice.
          Not personalized protocols. Premium badges reserve paid content for
          later — full text is open for now.
        </p>
        <p className="mt-2 text-[11px] text-zinc-600">
          {guides.length} guides · {freeCount} free · {paidCount} premium-tagged
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <span
            key={cat}
            className="rounded-full border border-white/10 bg-zinc-900/60 px-3 py-1 text-[11px] font-semibold text-zinc-400"
          >
            {cat}
          </span>
        ))}
      </div>

      {featured.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Featured
          </h2>
          <div className="space-y-3">
            {featured.map((g) => (
              <GuideCard key={g.slug} guide={g} featured />
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Library
        </h2>
        <div className="space-y-3">
          {guides.map((g) => (
            <GuideCard key={g.slug} guide={g} />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Books / PDFs
          </h2>
          <p className="mt-1 text-xs text-zinc-600">
            Structure ready for a future store. Checkout not wired in-app.
          </p>
        </div>
        <div className="space-y-2">
          {products.map((p) => (
            <Card
              key={p.slug}
              className="border-dashed border-white/10 bg-zinc-950/40"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                      {p.format}
                    </p>
                    <AccessBadge access={p.access} />
                  </div>
                  <h3 className="mt-1 text-sm font-semibold text-zinc-200">
                    {p.title}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                    {p.summary}
                  </p>
                  {p.priceCents != null && (
                    <p className="mt-2 text-xs font-semibold text-zinc-400">
                      ${(p.priceCents / 100).toFixed(0)} · external sales for now
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 flex-col gap-2">
                  {p.guideSlug ? (
                    <Link
                      href={`/guides/${p.guideSlug}`}
                      className="rounded-full bg-orange-500/15 px-3 py-1.5 text-center text-[11px] font-semibold text-orange-300 ring-1 ring-orange-500/30"
                    >
                      Read in app
                    </Link>
                  ) : null}
                  {p.salesPath ? (
                    <a
                      href={p.salesPath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full border border-white/15 px-3 py-1.5 text-center text-[11px] font-semibold text-zinc-300"
                    >
                      Sales page
                    </a>
                  ) : null}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

function GuideCard({
  guide: g,
  featured,
}: {
  guide: ReturnType<typeof getPublishedGuides>[number];
  featured?: boolean;
}) {
  return (
    <Link href={`/guides/${g.slug}`} className="block">
      <Card
        className={
          featured
            ? "border-orange-500/25 bg-gradient-to-br from-orange-500/[0.07] to-transparent transition hover:border-orange-500/45"
            : "transition hover:border-orange-500/35"
        }
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-orange-400/80">
                {g.category} · {g.minutes} min
              </p>
              <AccessBadge access={g.access} />
              {g.featured ? (
                <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-zinc-400 ring-1 ring-white/10">
                  Featured
                </span>
              ) : null}
            </div>
            <h2 className="mt-1.5 text-base font-semibold leading-snug text-zinc-50 sm:text-lg">
              {g.title}
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">
              {g.summary}
            </p>
            {g.tags && g.tags.length > 0 ? (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {g.tags.slice(0, 4).map((t) => (
                  <span
                    key={t}
                    className="rounded-md bg-white/[0.04] px-1.5 py-0.5 text-[10px] text-zinc-500"
                  >
                    {t}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
          <span className="mt-1 shrink-0 text-zinc-600" aria-hidden>
            →
          </span>
        </div>
      </Card>
    </Link>
  );
}
