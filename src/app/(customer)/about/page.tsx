import type { Metadata } from "next";
import { Suspense } from "react";
import { SITE_URL } from "@/lib/site-config";
import AboutPageClient from "./AboutPageClient";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Trichomes Cosmeceuticals — a science-backed skincare and beauty store based in Akure, Ondo State, Nigeria.",
  alternates: {
    canonical: `${SITE_URL}/about`,
  },
};

export default function AboutPage() {
  return (
    <Suspense>
      <AboutPageClient />
    </Suspense>
  );
}
