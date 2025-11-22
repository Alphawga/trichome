import { Suspense } from "react";
import CompareClient from "./CompareClient";

export default function ComparePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-trichomes-soft">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-12 sm:pb-16 max-w-7xl">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-trichomes-soft rounded w-1/3"></div>
              <div className="h-64 bg-trichomes-soft rounded"></div>
            </div>
          </div>
        </div>
      }
    >
      <CompareClient />
    </Suspense>
  );
}
