import type { ReactNode } from "react";
import type { ContentBlock } from "@/content/types";
import { cn } from "@/lib/utils";

export function GuideBlocks({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div className="space-y-5 sm:space-y-6">
      {blocks.map((block, i) => (
        <Block key={i} block={block} />
      ))}
    </div>
  );
}

/** Extract h2 headings for a simple table of contents */
export function guideTocFromBlocks(blocks: ContentBlock[]): string[] {
  return blocks
    .filter((b): b is Extract<ContentBlock, { type: "h2" }> => b.type === "h2")
    .map((b) => b.text);
}

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function Block({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case "p":
      return (
        <p className="text-[15px] leading-[1.75] text-zinc-300 sm:text-[16px] sm:leading-[1.75]">
          {renderInline(block.text)}
        </p>
      );
    case "h2":
      return (
        <h2
          id={slugifyHeading(block.text)}
          className="scroll-mt-24 border-b border-white/[0.06] pb-2 pt-4 text-xl font-semibold tracking-tight text-zinc-50 sm:text-2xl"
        >
          {block.text}
        </h2>
      );
    case "h3":
      return (
        <h3
          id={slugifyHeading(block.text)}
          className="scroll-mt-24 pt-1 text-base font-semibold text-zinc-100 sm:text-lg"
        >
          {block.text}
        </h3>
      );
    case "ul":
      return (
        <ul className="space-y-2.5 pl-0.5">
          {block.items.map((item) => (
            <li
              key={item}
              className="relative pl-5 text-[15px] leading-[1.7] text-zinc-300 sm:text-[16px]"
            >
              <span className="absolute left-0 top-[0.6em] h-1.5 w-1.5 rounded-full bg-orange-500" />
              {renderInline(item)}
            </li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol className="list-decimal space-y-2.5 pl-5 text-[15px] leading-[1.7] text-zinc-300 marker:font-semibold marker:text-orange-400/90 sm:text-[16px]">
          {block.items.map((item) => (
            <li key={item} className="pl-1">
              {renderInline(item)}
            </li>
          ))}
        </ol>
      );
    case "callout":
      return (
        <aside
          className={cn(
            "rounded-2xl border px-4 py-3.5 sm:px-5 sm:py-4",
            block.variant === "warn" &&
              "border-amber-500/30 bg-amber-500/[0.08] text-amber-50/95",
            block.variant === "tip" &&
              "border-orange-500/30 bg-orange-500/[0.08] text-orange-50/95",
            (!block.variant || block.variant === "default") &&
              "border-white/10 bg-zinc-900/80 text-zinc-300"
          )}
        >
          {block.title ? (
            <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-orange-300/95">
              {block.title}
            </p>
          ) : null}
          <p className="text-sm leading-relaxed sm:text-[15px]">
            {renderInline(block.text)}
          </p>
        </aside>
      );
    case "quote":
      return (
        <blockquote className="border-l-2 border-orange-500/50 py-1 pl-4">
          <p className="text-[15px] leading-relaxed text-zinc-200 italic sm:text-base">
            “{block.text}”
          </p>
          {block.cite ? (
            <cite className="mt-2 block text-xs not-italic text-zinc-500">
              — {block.cite}
            </cite>
          ) : null}
        </blockquote>
      );
    case "divider":
      return <hr className="border-white/[0.08]" />;
    default:
      return null;
  }
}

/** Minimal **bold** support inside text */
function renderInline(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  if (parts.length === 1) return text;
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-zinc-100">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}
