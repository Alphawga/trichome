import type { Metadata } from "next";
import { SITE_DESCRIPTION, SITE_URL } from "@/lib/site-config";
import {
  buildOrganizationJsonLd,
  buildWebsiteJsonLd,
} from "@/lib/structured-data";
import { HomePageClient } from "./HomePageClient";

export const metadata: Metadata = {
  title: "Home",
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: SITE_URL,
  },
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: static JSON-LD, not user input
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildOrganizationJsonLd()),
        }}
      />
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: static JSON-LD, not user input
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildWebsiteJsonLd()),
        }}
      />
      <HomePageClient />
    </>
  );
}
