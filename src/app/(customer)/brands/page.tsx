import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site-config";
import { buildBreadcrumbJsonLd } from "@/lib/structured-data";
import { BrandsPageClient } from "./BrandsPageClient";

export const metadata: Metadata = {
  title: "Shop by Brand",
  description:
    "Browse cosmeceutical skincare brands available at Trichomes, Akure — premium, science-backed skincare for Nigerian skin.",
  alternates: {
    canonical: `${SITE_URL}/brands`,
  },
};

const breadcrumbJsonLd = buildBreadcrumbJsonLd([
  { name: "Home", path: "/" },
  { name: "Brands", path: "/brands" },
]);

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: static JSON-LD, not user input
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <BrandsPageClient />
    </>
  );
}
