import React, { Suspense } from "react";
import CheckoutClient from "./CheckoutClient";

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-trichomes-soft flex items-center justify-center">
          <div className="text-center">
            <p className="text-trichomes-forest font-body">Loading checkout...</p>
          </div>
        </div>
      }
    >
      <CheckoutClient />
    </Suspense>
  );
}
