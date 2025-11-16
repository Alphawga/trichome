import { Suspense } from "react";
import OrderConfirmationClient from "./OrderConfirmationClient";

export default function OrderConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-trichomes-soft">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-7xl">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-trichomes-primary mx-auto mb-4"></div>
                <p className="text-trichomes-forest/60 font-body">
                  Loading order details...
                </p>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <OrderConfirmationClient />
    </Suspense>
  );
}
