/**
 * ============================================================
 * GUIDE TEMPLATE — copy this file to add a new guide
 * ============================================================
 *
 * 1. Duplicate this file:  my-new-guide.ts
 * 2. Rename the export:    export const myNewGuide = defineGuide(...)
 * 3. Fill meta + Markdown body below
 * 4. Register in index.ts: import + add to allGuides array
 * 5. Save → open /guides
 *
 * access: "free" | "paid"  → paid shows Premium badge only (no paywall yet)
 * published: false         → hidden from library
 * coverImage: "/guides/my-cover.jpg"  → optional later (put file in public/)
 */

import { defineGuide } from "@/content/guides/markdown";

export const templateGuide = defineGuide(
  {
    slug: "template-guide-example",
    title: "Template guide (unpublished)",
    summary: "Copy this file to create your own detailed guide.",
    category: "Mindset",
    minutes: 5,
    access: "free",
    published: false, // set true when ready
    order: 999,
    updatedAt: "2026-07-24",
    featured: false,
    tags: ["template"],
    author: "Forge Protocol",
    // coverImage: "/guides/example-cover.jpg",
  },
  `
## Opening

Write your long-form content in Markdown. Headings, lists, and callouts are supported.

### What to cover

- Clear educational points
- Practical frameworks
- Honest caveats

::: warn Educational boundary
No dosing, stacks, sources, or protocols. Not medical advice.
:::

## Next section

Keep sections focused. Serious lifters read more when the structure is clean.

1. First idea
2. Second idea
3. Third idea

---

> Standards beat hype.
> cite: Forge Protocol
`
);
