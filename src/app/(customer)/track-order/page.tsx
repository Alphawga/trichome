"use client";

import type { OrderStatus } from "@prisma/client";
import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { OrderStatusTimeline } from "@/components/orders/OrderStatusTimeline";
import { TrackingUpdates } from "@/components/orders/TrackingUpdates";
import { ChevronRightIcon } from "@/components/ui/icons";
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
      <div className="min-h-screen bg-white">
        {/* Hero Header Section */}
        <div className="relative w-full h-[300px] sm:h-[350px] lg:h-[400px] overflow-hidden">
          <Image
            src="/banners/product-banner.jpg"
            alt="Track Order"
            fill
            className="object-cover"
            priority
          />
          <div 
            className="absolute inset-0" 
            style={{ 
              background: 'linear-gradient(to right, rgba(64, 112, 41, 0.9), rgba(64, 112, 41, 0.7), transparent)'
            }}
          />
          <div className="relative h-full mx-auto px-4 sm:px-6 lg:px-8 max-w-[2200px] flex flex-col justify-center">
            <h1 className="text-[40px] sm:text-[48px] lg:text-[56px] font-heading text-white leading-tight mb-4">
              Track Your Order
            </h1>
            <nav className="flex items-center space-x-2">
              <Link
                href="/"
                className="text-[14px] text-white/90 hover:text-white transition-colors duration-150 ease-out font-body"
              >
                Home
              </Link>
              <ChevronRightIcon className="w-4 h-4 text-white/70" />
              <span className="text-[14px] text-white font-body">
                Track Order
              </span>
            </nav>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-12 sm:pb-16 max-w-2xl">
          <p className="text-gray-600 font-body text-[14px] sm:text-[15px] mb-6 sm:mb-8">
            Enter your order number and email to track your order
          </p>

          <div className="bg-white p-6 sm:p-8 rounded-sm border border-gray-200 shadow-sm">
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
                  className="block text-sm font-medium text-gray-900 mb-2 font-body"
                >
                  Order Number
                </label>
                <input
                  type="text"
                  id="orderNumber"
                  name="orderNumber"
                  required
                  placeholder="e.g., ORD-1234567890"
                  className="w-full px-4 py-3 border border-gray-200 bg-white focus:ring-1 focus:ring-black focus:border-black outline-none rounded font-body"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-900 mb-2 font-body"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 border border-gray-200 bg-white focus:ring-1 focus:ring-black focus:border-black outline-none rounded font-body"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#1E3024] text-white py-3 px-6 rounded-full hover:bg-[#1E3024]/90 font-semibold transition-all duration-150 ease-out hover:shadow-lg text-sm font-body"
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
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-12 sm:pb-16 max-w-[2200px]">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
              <p className="text-gray-900 font-body">
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
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-12 sm:pb-16 max-w-[2200px]">
          <h1 className="text-[24px] sm:text-[32px] lg:text-[36px] font-heading font-semibold mb-2 text-gray-900">
            Track your order
          </h1>

          <div className="bg-white p-6 sm:p-8 rounded-sm border border-red-200 shadow-sm">
            <div className="text-center">
              <p className="text-red-600 font-body mb-4">
                {error.message || "Failed to load tracking information"}
              </p>
              <Link
                href="/track-order"
                className="inline-block bg-[#1E3024] text-white py-2 px-6 rounded-full hover:bg-[#1E3024]/90 font-semibold transition-all duration-150 ease-out text-sm font-body"
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
    <div className="min-h-screen bg-white">
      {/* Hero Header Section */}
      <div className="relative w-full h-[300px] sm:h-[350px] lg:h-[400px] overflow-hidden">
        <Image
          src="/banners/product-banner.jpg"
          alt="Track Order"
          fill
          className="object-cover"
          priority
        />
        <div 
          className="absolute inset-0" 
          style={{ 
            background: 'linear-gradient(to right, rgba(64, 112, 41, 0.9), rgba(64, 112, 41, 0.7), transparent)'
          }}
        />
        <div className="relative h-full mx-auto px-4 sm:px-6 lg:px-8 max-w-[2200px] flex flex-col justify-center">
          <h1 className="text-[40px] sm:text-[48px] lg:text-[56px] font-heading text-white leading-tight mb-4">
            Track Your Order
          </h1>
          <nav className="flex items-center space-x-2">
            <Link
              href="/"
              className="text-[14px] text-white/90 hover:text-white transition-colors duration-150 ease-out font-body"
            >
              Home
            </Link>
            <ChevronRightIcon className="w-4 h-4 text-white/70" />
            <span className="text-[14px] text-white font-body">
              Track Order
            </span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-12 sm:pb-16 max-w-[2200px]">
        <p className="text-gray-600 font-body text-[14px] sm:text-[15px] mb-6 sm:mb-8">
          Order Number:{" "}
          <span className="font-mono font-semibold text-gray-900">
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
            <h2 className="text-[20px] sm:text-[24px] font-heading font-semibold mb-3 sm:mb-4 text-gray-900">
              Shipping Details
            </h2>
            <div className="bg-white p-4 sm:p-6 rounded-sm border border-gray-200 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <h3 className="font-heading font-semibold text-[15px] sm:text-[16px] text-gray-900 mb-2">
                    Shipping Address
                  </h3>
                  <p className="text-[14px] sm:text-[15px] text-gray-900/70 leading-relaxed font-body">
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
                    <h3 className="font-heading font-semibold text-[15px] sm:text-[16px] text-gray-900 mb-2">
                      Estimated Delivery
                    </h3>
                    <p className="text-[14px] sm:text-[15px] text-gray-900/70 leading-relaxed font-body">
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
            className="bg-[#1E3024] text-white py-3 px-6 sm:px-8 rounded-full hover:bg-[#1E3024]/90 font-semibold transition-all duration-150 ease-out hover:shadow-lg text-[14px] sm:text-[15px] font-body"
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
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
            <p className="text-gray-900">Loading...</p>
          </div>
        </div>
      }
    >
      <TrackOrderPageContent />
    </Suspense>
  );
}
