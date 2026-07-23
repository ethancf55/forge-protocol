import Link from "next/link";
import { notFound } from "next/navigation";
import { getGuide } from "@/lib/content/guides";

export default async function GuideDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  return (
    <div className="space-y-5">
      <Link href="/guides" className="text-xs font-semibold text-orange-400">
        ← All guides
      </Link>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-orange-400/80">
          {guide.tag} · {guide.minutes} min
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">{guide.title}</h1>
        <p className="mt-2 text-sm text-zinc-500">{guide.summary}</p>
      </div>
      <div className="space-y-4">
        {guide.body.map((p, i) => (
          <p key={i} className="text-sm leading-relaxed text-zinc-300">
            {p}
          </p>
        ))}
      </div>
      <p className="rounded-xl border border-white/10 bg-zinc-900/50 px-3 py-2.5 text-xs text-zinc-500">
        Educational content only. Not medical advice. Not a personalized protocol.
      </p>
    </div>
  );
}
