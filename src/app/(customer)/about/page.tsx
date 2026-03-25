import { Suspense } from "react";
import AboutPageClient from "./AboutPageClient";

export default function AboutPage() {
  return (
    <Suspense>
      <AboutPageClient />
    </Suspense>
  );
}
