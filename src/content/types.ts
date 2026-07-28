/**
 * Content system types for Guides and future Books/PDFs.
 * Paywall is not implemented yet — `access` is reserved for later gating.
 */

export type ContentAccess = "free" | "paid";

export type ContentCategory =
  | "Training"
  | "Recovery"
  | "Nutrition"
  | "Mindset"
  | "Safety"
  | "Program"
  | "Product"
  | "Hormones";

/** Structured body blocks — keeps rendering clean and expandable */
export type ContentBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | {
      type: "callout";
      title?: string;
      text: string;
      variant?: "default" | "warn" | "tip";
    }
  | { type: "divider" }
  | { type: "quote"; text: string; cite?: string };

export type Guide = {
  /** URL slug: /guides/[slug] — unique, kebab-case */
  slug: string;
  title: string;
  /** Short card blurb */
  summary: string;
  category: ContentCategory;
  /** Estimated read time */
  minutes: number;
  /**
   * free | paid — paywall later.
   * Today: badge only; full body still readable for all published guides.
   */
  access: ContentAccess;
  /** Hide from library when false */
  published: boolean;
  /** Lower = higher on list */
  order: number;
  /** ISO date string for display (YYYY-MM-DD) */
  updatedAt: string;
  /** Pin near top of library */
  featured?: boolean;
  /** Optional tags for filtering later */
  tags?: string[];
  /**
   * Optional cover image path (public/… or absolute URL).
   * Not required — reserved for later design polish.
   */
  coverImage?: string;
  /** Optional author line */
  author?: string;
  body: ContentBlock[];
};

/**
 * Foundation for future “Books / PDFs” store.
 * Do not wire checkout yet — structure only.
 */
export type DigitalProduct = {
  slug: string;
  title: string;
  summary: string;
  /** e.g. "PDF guide", "eBook" */
  format: string;
  access: ContentAccess;
  published: boolean;
  order: number;
  /** Price in USD cents for later checkout (e.g. 2700 = $27) */
  priceCents?: number;
  /** Optional path or URL when product file is ready */
  fileKey?: string;
  /** Optional landing path when sales page exists */
  salesPath?: string;
  /** Link to in-app long-form guide when one exists */
  guideSlug?: string;
};
