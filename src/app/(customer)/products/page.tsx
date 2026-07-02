import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site-config";
import { buildBreadcrumbJsonLd } from "@/lib/structured-data";
import { ProductsPageClient } from "./ProductsPageClient";

export const metadata: Metadata = {
  title: "Shop All Products",
  description:
    "Browse the full Trichomes catalog of cosmeceutical skincare products — cleansers, serums, moisturizers, and treatments curated for Nigerian skin.",
  alternates: {
    canonical: `${SITE_URL}/products`,
  },
};

const breadcrumbJsonLd = buildBreadcrumbJsonLd([
  { name: "Home", path: "/" },
  { name: "Products", path: "/products" },
]);

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: static JSON-LD, not user input
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ProductsPageClient />
    </>
  );
}
