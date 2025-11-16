"use client";

import type { OrderStatus } from "@prisma/client";
import { format } from "date-fns";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { OrderStatusTimeline } from "@/components/orders/OrderStatusTimeline";
import { TrackingUpdates } from "@/components/orders/TrackingUpdates";
import { trpc } from "@/utils/trpc";

function TrackOrderPageContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("id") || searchParams.get("order") || "";
  const email = searchParams.get("email") || "";

  const [guestEmail, _setGuestEmail] = useState(email);
  const [showEmailInput, _setShowEmailInput] = useState(!email && !orderNumber);

  // Fetch tracking information
  const {
    data: trackingData,
    isLoading,
    error,
  } = trpc.getOrderTracking.useQuery(
    {
      orderNumber: orderNumber || "",
      email: guestEmail || email || undefined,
    },
    {
      enabled: !!orderNumber && (!!email || !!guestEmail),
      refetchOnWindowFocus: false,
      retry: false,
    },
  );

  // Email input for guest tracking
  if (showEmailInput || (!orderNumber && !email)) {
    return (
      <div className="min-h-screen bg-trichomes-soft">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-12 sm:pb-16 max-w-2xl">
          <h1 className="text-[24px] sm:text-[32px] lg:text-[36px] font-heading font-semibold mb-2 text-trichomes-forest">
            Track your order
          </h1>
          <p className="text-trichomes-forest/60 font-body text-[14px] sm:text-[15px] mb-6 sm:mb-8">
            Enter your order number and email to track your order
          </p>

          <div className="bg-white p-6 sm:p-8 rounded-xl border border-trichomes-forest/10 shadow-sm">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const orderNum = formData.get("orderNumber") as string;
                const orderEmail = formData.get("email") as string;

                if (orderNum && orderEmail) {
                  window.location.href = `/track-order?order=${orderNum}&email=${encodeURIComponent(orderEmail)}`;
                }
              }}
              className="space-y-4"
            >
              <div>
                <label
                  htmlFor="orderNumber"
                  className="block text-sm font-medium text-trichomes-forest mb-2 font-body"
                >
                  Order Number
                </label>
                <input
                  type="text"
                  id="orderNumber"
                  name="orderNumber"
                  required
                  placeholder="e.g., ORD-1234567890"
                  className="w-full px-4 py-3 border border-trichomes-forest/15 bg-trichomes-soft focus:ring-1 focus:ring-trichomes-primary focus:border-trichomes-primary outline-none rounded font-body"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-trichomes-forest mb-2 font-body"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 border border-trichomes-forest/15 bg-trichomes-soft focus:ring-1 focus:ring-trichomes-primary focus:border-trichomes-primary outline-none rounded font-body"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-trichomes-primary text-white py-3 px-6 rounded-full hover:bg-trichomes-primary/90 font-semibold transition-all duration-150 ease-out hover:shadow-lg text-sm font-body"
              >
                Track Order
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-trichomes-soft">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-12 sm:pb-16 max-w-7xl">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-trichomes-primary mx-auto mb-4"></div>
              <p className="text-trichomes-forest font-body">
                Loading tracking information...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-trichomes-soft">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-12 sm:pb-16 max-w-7xl">
          <h1 className="text-[24px] sm:text-[32px] lg:text-[36px] font-heading font-semibold mb-2 text-trichomes-forest">
            Track your order
          </h1>

          <div className="bg-white p-6 sm:p-8 rounded-xl border border-red-200 shadow-sm">
            <div className="text-center">
              <p className="text-red-600 font-body mb-4">
                {error.message || "Failed to load tracking information"}
              </p>
              <Link
                href="/track-order"
                className="inline-block bg-trichomes-primary text-white py-2 px-6 rounded-full hover:bg-trichomes-primary/90 font-semibold transition-all duration-150 ease-out text-sm font-body"
              >
                Try Again
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!trackingData) {
    return null;
  }

  // Build tracking info from order status if no tracking number
  const trackingInfo = trackingData.trackingInfo || {
    trackingNumber: trackingData.trackingNumber || "N/A",
    carrier: "Standard Shipping",
    status: trackingData.status,
    events: trackingData.events || [],
    estimatedDelivery: trackingData.estimatedDelivery || undefined,
    origin: trackingData.shippingAddress?.city
      ? `${trackingData.shippingAddress.city}, ${trackingData.shippingAddress.state}`
      : undefined,
    destination: trackingData.shippingAddress
      ? `${trackingData.shippingAddress.address_1}, ${trackingData.shippingAddress.city}, ${trackingData.shippingAddress.state}`
      : undefined,
    lastUpdated: new Date(),
  };

  return (
    <div className="min-h-screen bg-trichomes-soft">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-12 sm:pb-16 max-w-7xl">
        <h1 className="text-[24px] sm:text-[32px] lg:text-[36px] font-heading font-semibold mb-2 text-trichomes-forest">
          Track your order
        </h1>
        <p className="text-trichomes-forest/60 font-body text-[14px] sm:text-[15px] mb-6 sm:mb-8">
          Order Number:{" "}
          <span className="font-mono font-semibold text-trichomes-forest">
            {trackingData.orderNumber}
          </span>
        </p>

        {/* Order Status Timeline */}
        <div className="mb-6 sm:mb-12">
          <OrderStatusTimeline
            currentStatus={trackingData.status}
            statusHistory={
              trackingData.events?.map((event) => ({
                status: event.status as OrderStatus,
                created_at: new Date(event.timestamp as unknown as string),
                notes: event.description,
              })) || []
            }
          />
        </div>

        {/* Tracking Updates */}
        {trackingData.trackingInfo && (
          <div className="mb-6 sm:mb-12">
            <TrackingUpdates trackingInfo={trackingInfo} />
          </div>
        )}

        {/* Shipping Address */}
        {trackingData.shippingAddress && (
          <div className="mb-6 sm:mb-8">
            <h2 className="text-[20px] sm:text-[24px] font-heading font-semibold mb-3 sm:mb-4 text-trichomes-forest">
              Shipping Details
            </h2>
            <div className="bg-white p-4 sm:p-6 rounded-xl border border-trichomes-forest/10 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <h3 className="font-heading font-semibold text-[15px] sm:text-[16px] text-trichomes-forest mb-2">
                    Shipping Address
                  </h3>
                  <p className="text-[14px] sm:text-[15px] text-trichomes-forest/70 leading-relaxed font-body">
                    {trackingData.shippingAddress.address_1}
                    {trackingData.shippingAddress.address_2 && (
                      <>
                        <br />
                        {trackingData.shippingAddress.address_2}
                      </>
                    )}
                    <br />
                    {trackingData.shippingAddress.city},{" "}
                    {trackingData.shippingAddress.state}
                    {trackingData.shippingAddress.postal_code && (
                      <> {trackingData.shippingAddress.postal_code}</>
                    )}
                    <br />
                    {trackingData.shippingAddress.country}
                  </p>
                </div>
                {trackingData.estimatedDelivery && (
                  <div>
                    <h3 className="font-heading font-semibold text-[15px] sm:text-[16px] text-trichomes-forest mb-2">
                      Estimated Delivery
                    </h3>
                    <p className="text-[14px] sm:text-[15px] text-trichomes-forest/70 leading-relaxed font-body">
                      {format(
                        new Date(trackingData.estimatedDelivery),
                        "dd-MM-yyyy",
                      )}
                      <br />
                      Between 2:00 PM - 6:00 PM
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-center">
          <Link
            href="/order-history"
            className="bg-trichomes-primary text-white py-3 px-6 sm:px-8 rounded-full hover:bg-trichomes-primary/90 font-semibold transition-all duration-150 ease-out hover:shadow-lg text-[14px] sm:text-[15px] font-body"
          >
            View Order History
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-trichomes-soft flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-trichomes-primary mx-auto mb-4"></div>
            <p className="text-trichomes-forest">Loading...</p>
          </div>
        </div>
      }
    >
      <TrackOrderPageContent />
    </Suspense>
  );
}
