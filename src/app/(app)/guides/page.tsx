import Link from "next/link";
import { Card } from "@/components/ui/card";
import { guides } from "@/lib/content/guides";

export default function GuidesPage() {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-orange-400/90">
          Guides
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">Learn the basics</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Static education and starter structure — not personalized medical advice.
        </p>
      </div>

      <div className="space-y-3">
        {guides.map((g) => (
          <Link key={g.slug} href={`/guides/${g.slug}`}>
            <Card className="mb-3 transition hover:border-orange-500/30">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-orange-400/80">
                    {g.tag} · {g.minutes} min
                  </p>
                  <h2 className="mt-1 text-base font-semibold text-zinc-50">{g.title}</h2>
                  <p className="mt-1 text-sm leading-relaxed text-zinc-500">{g.summary}</p>
                </div>
                <span className="text-zinc-600">→</span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
