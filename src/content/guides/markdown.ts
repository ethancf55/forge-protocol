import type { ContentBlock, Guide } from "@/content/types";

/**
 * Convert a simple Markdown subset into Guide body blocks.
 *
 * Supported:
 * - # / ## / ### headings  (H1 treated as H2 in body — title comes from frontmatter)
 * - paragraphs
 * - - or * unordered lists
 * - 1. ordered lists
 * - > blockquotes  (optional — "cite: Name" on next line)
 * - --- divider
 * - Callouts:
 *   ::: tip Title
 *   text here
 *   :::
 *   variants: tip | warn | note (note → default)
 */

export function markdownToBlocks(md: string): ContentBlock[] {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const blocks: ContentBlock[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i += 1;
      continue;
    }

    // fenced callout
    if (trimmed.startsWith(":::")) {
      const meta = trimmed.slice(3).trim();
      const [variantRaw, ...titleParts] = meta.split(/\s+/);
      const variant =
        variantRaw === "warn" || variantRaw === "tip"
          ? variantRaw
          : "default";
      const title = titleParts.join(" ").trim() || undefined;
      const bodyLines: string[] = [];
      i += 1;
      while (i < lines.length && !lines[i].trim().startsWith(":::")) {
        bodyLines.push(lines[i]);
        i += 1;
      }
      i += 1; // skip closing :::
      const text = bodyLines.join("\n").trim();
      if (text) {
        blocks.push({ type: "callout", variant, title, text });
      }
      continue;
    }

    // divider
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      blocks.push({ type: "divider" });
      i += 1;
      continue;
    }

    // headings
    const h = /^(#{1,3})\s+(.+)$/.exec(trimmed);
    if (h) {
      const level = h[1].length;
      const text = h[2].trim();
      if (level === 1 || level === 2) {
        blocks.push({ type: "h2", text });
      } else {
        blocks.push({ type: "h3", text });
      }
      i += 1;
      continue;
    }

    // unordered list
    if (/^[-*+]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*+]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*+]\s+/, ""));
        i += 1;
      }
      blocks.push({ type: "ul", items });
      continue;
    }

    // ordered list
    if (/^\d+\.\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ""));
        i += 1;
      }
      blocks.push({ type: "ol", items });
      continue;
    }

    // blockquote
    if (trimmed.startsWith(">")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ""));
        i += 1;
      }
      let cite: string | undefined;
      const last = quoteLines[quoteLines.length - 1];
      if (last && /^cite:\s*/i.test(last)) {
        cite = last.replace(/^cite:\s*/i, "").trim();
        quoteLines.pop();
      }
      const text = quoteLines.join(" ").trim();
      if (text) blocks.push({ type: "quote", text, cite });
      continue;
    }

    // paragraph — gather until blank line or special start
    const para: string[] = [trimmed];
    i += 1;
    while (i < lines.length) {
      const t = lines[i].trim();
      if (!t) break;
      if (
        t.startsWith("#") ||
        t.startsWith(">") ||
        t.startsWith(":::") ||
        /^[-*+]\s+/.test(t) ||
        /^\d+\.\s+/.test(t) ||
        /^(-{3,}|\*{3,}|_{3,})$/.test(t)
      ) {
        break;
      }
      para.push(t);
      i += 1;
    }
    blocks.push({ type: "p", text: para.join(" ") });
  }

  return blocks;
}

export type GuideMeta = Omit<Guide, "body">;

/**
 * Define a guide with Markdown body (owner-friendly for long content).
 *
 * @example
 * export const myGuide = defineGuide({
 *   slug: "my-guide",
 *   title: "...",
 *   ...
 * }, `
 * ## Section
 * Paragraph text.
 * `);
 */
export function defineGuide(meta: GuideMeta, markdownBody: string): Guide {
  return {
    ...meta,
    body: markdownToBlocks(markdownBody),
  };
}
