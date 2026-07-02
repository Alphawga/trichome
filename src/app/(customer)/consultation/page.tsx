import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site-config";
import { buildBreadcrumbJsonLd } from "@/lib/structured-data";
import { ConsultationPageClient } from "./ConsultationPageClient";

export const metadata: Metadata = {
  title: "Book a Skincare Consultation",
  description:
    "Book a free skincare consultation with our expert consultants at Trichomes, Akure, Ondo State — get personalized product recommendations for your skin.",
  alternates: {
    canonical: `${SITE_URL}/consultation`,
  },
};

const breadcrumbJsonLd = buildBreadcrumbJsonLd([
  { name: "Home", path: "/" },
  { name: "Book a Consultation", path: "/consultation" },
]);

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: static JSON-LD, not user input
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ConsultationPageClient />
    </>
  );
}
