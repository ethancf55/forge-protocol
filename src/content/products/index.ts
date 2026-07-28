import type { DigitalProduct } from "@/content/types";

/**
 * Foundation for a future “Books / PDFs” library.
 * Not sold in-app yet — structure only so Guides and Products share patterns.
 *
 * Later:
 * - sales pages (e.g. forgevirtualtraining.org/guide)
 * - Gumroad / Stripe checkout
 * - entitlement checks using `access` + user purchase records
 */
export const digitalProducts: DigitalProduct[] = [
  {
    slug: "peds-hormones-young-lifters",
    title: "What Most Young Lifters Get Wrong About PEDs & Hormones",
    summary:
      "Flagship educational guide — harm reduction and decision quality. Full long-form version is also in-app under Guides. No dosing. No protocols.",
    format: "PDF + in-app guide",
    access: "paid",
    published: true,
    order: 10,
    priceCents: 2700,
    // fileKey: "products/peds-hormones.pdf", // wire when hosting downloads
    salesPath: "https://forgevirtualtraining.org/guide",
    guideSlug: "peds-hormones-young-lifters",
  },
];

export function getPublishedProducts(): DigitalProduct[] {
  return digitalProducts
    .filter((p) => p.published)
    .sort((a, b) => a.order - b.order);
}

export function getProductBySlug(slug: string): DigitalProduct | undefined {
  return digitalProducts.find((p) => p.slug === slug && p.published);
}
