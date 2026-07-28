# Content library — Guides (owner guide)

## Add a new guide in ~5 minutes

### 1. Copy the template

```bash
cp src/content/guides/_template.ts src/content/guides/my-new-guide.ts
```

### 2. Edit the file

```ts
import { defineGuide } from "@/content/guides/markdown";

export const myNewGuide = defineGuide(
  {
    slug: "my-new-guide",       // URL: /guides/my-new-guide
    title: "Your title",
    summary: "Card description (1–2 sentences).",
    category: "Training",       // Training | Recovery | Nutrition | Mindset | Safety | Program | Hormones
    minutes: 12,
    access: "free",             // or "paid" (badge only — no lock yet)
    published: true,            // false = hidden
    order: 40,                  // lower = higher in list
    updatedAt: "2026-07-24",
    featured: false,            // true = featured strip
    tags: ["example"],
    author: "Forge Protocol",
    // coverImage: "/guides/my-cover.jpg",  // optional — file in public/guides/
  },
  `
## Section one

Write long-form content in **Markdown**.

- Bullet points
- Work great

::: tip Tip title
Highlighted callout.
:::

::: warn Boundary
No dosing. Not medical advice.
:::
`
);
```

### 3. Register it

In `src/content/guides/index.ts`:

```ts
import { myNewGuide } from "./my-new-guide";

export const allGuides: Guide[] = [
  // ...
  myNewGuide,
];
```

### 4. Save and open

`/guides` and `/guides/my-new-guide`

---

## Markdown cheatsheet

| Syntax | Result |
|--------|--------|
| `## Heading` | Section H2 |
| `### Subheading` | H3 |
| plain lines | Paragraph |
| `- item` | Bullet list |
| `1. item` | Numbered list |
| `---` | Divider |
| `> quote` | Pull quote |
| `::: tip Title` … `:::` | Orange tip callout |
| `::: warn Title` … `:::` | Amber warning callout |
| `**bold**` | Bold text |

You can still use the older block array style (`body: [{ type: "p", text: "..." }]`) if you prefer.

---

## Free vs paid (foundation only)

| Field | Today | Later |
|-------|--------|--------|
| `access: "free"` | Open | Open |
| `access: "paid"` | **Premium badge**, full text still readable | Gate body behind purchase/membership |

Do **not** build checkout here until you are ready. Products live in `src/content/products/index.ts`.

---

## Flagship guide

**What Most Young Lifters Get Wrong About PEDs & Hormones**

- In-app: `/guides/peds-hormones-young-lifters`
- File: `src/content/guides/peds-hormones-young-lifters.ts`
- Product row links to the same slug via `guideSlug`

---

## Content rules

- Educational / harm-reduction  
- No dosing, stacks, sources, or protocol design  
- Clear “not medical advice” where relevant  
