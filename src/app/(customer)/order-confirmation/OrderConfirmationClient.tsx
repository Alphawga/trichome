"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { AccountCreationPrompt } from "@/components/checkout/AccountCreationPrompt";
import { OrderDetailsCard } from "@/components/orders/OrderDetailsCard";
import { OrderItemList } from "@/components/orders/OrderItemList";
import { OrderSummary } from "@/components/orders/OrderSummary";
import { ShippingAddressCard } from "@/components/orders/ShippingAddressCard";
import { TrackingInfo } from "@/components/orders/TrackingInfo";
import { ChevronRightIcon } from "@/components/ui/icons";
import { trpc } from "@/utils/trpc";
import { useAuth } from "../../contexts/auth-context";

export default function OrderConfirmationClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading } = useAuth();
  const orderNumber = searchParams.get("order");
  const isGuest = searchParams.get("guest") === "true";
  const orderEmail = searchParams.get("email") || "";

  // Fetch order by order number (use public endpoint for guest orders)
  const authenticatedOrderQuery = trpc.getOrderByNumber.useQuery(
    { orderNumber: orderNumber || "" },
    {
      enabled: isAuthenticated && !isGuest && !!orderNumber,
      refetchOnWindowFocus: false,
    },
  );

  const guestOrderQuery = trpc.getOrderByNumberPublic.useQuery(
    { orderNumber: orderNumber || "", email: orderEmail || undefined },
    {
      enabled: (isGuest || !isAuthenticated) && !!orderNumber,
      refetchOnWindowFocus: false,
    },
  );

  const orderQuery =
    isGuest || !isAuthenticated ? guestOrderQuery : authenticatedOrderQuery;
  const order = orderQuery.data;

  // Redirect if no order number provided
  useEffect(() => {
    if (!isLoading && !orderNumber) {
      router.push("/order-history");
    }
  }, [orderNumber, isLoading, router]);

  // Show loading state
  if (isLoading || orderQuery.isLoading) {
    return (
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
    );
  }

  // Show login prompt if not authenticated and not a guest order
  if (!isAuthenticated && !isGuest && !orderNumber) {
    return (
      <div className="min-h-screen bg-trichomes-soft">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-7xl">
          <div className="text-center py-12 sm:py-20 bg-white rounded-xl border border-trichomes-forest/10 shadow-sm">
            <div className="max-w-md mx-auto">
              <h2 className="text-[20px] sm:text-[24px] font-heading font-semibold text-trichomes-forest mb-2">
                Sign in to view your order
              </h2>
              <p className="text-trichomes-forest/60 font-body mb-4 sm:mb-6">
                Please sign in to access your order confirmation
              </p>
              <Link
                href="/auth/signin"
                className="inline-block bg-trichomes-primary text-white py-3 px-6 sm:px-8 rounded-full hover:bg-trichomes-primary/90 font-semibold transition-all duration-150 ease-out hover:shadow-lg text-[14px] sm:text-[15px] font-body"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error if order not found
  if (orderQuery.error || !order) {
    return (
      <div className="min-h-screen bg-trichomes-soft">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-7xl">
          <div className="text-center py-12 sm:py-20 bg-white rounded-xl border border-trichomes-forest/10 shadow-sm">
            <div className="max-w-md mx-auto">
              <h2 className="text-[20px] sm:text-[24px] font-heading font-semibold text-trichomes-forest mb-2">
                Order Not Found
              </h2>
              <p className="text-trichomes-forest/60 font-body mb-4 sm:mb-6">
                {orderQuery.error?.message ||
                  "The order you are looking for does not exist."}
              </p>
              <Link
                href="/order-history"
                className="inline-block bg-trichomes-primary text-white py-3 px-6 sm:px-8 rounded-full hover:bg-trichomes-primary/90 font-semibold transition-all duration-150 ease-out hover:shadow-lg text-[14px] sm:text-[15px] font-body"
              >
                View Order History
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = Number(order.subtotal);
  const shipping = Number(order.shipping_cost);
  const tax = Number(order.tax);
  const discount = Number(order.discount);
  const total = Number(order.total);

  return (
    <div className="min-h-screen bg-trichomes-soft">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-12 sm:pb-16 max-w-7xl">
        {/* Success Message */}
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-trichomes-forest/10 shadow-sm mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-label="Checkmark"
              >
                <title>Checkmark</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div className="flex-grow">
              <h1 className="text-[24px] sm:text-[32px] font-heading font-bold text-trichomes-forest mb-2">
                Order Confirmed!
              </h1>
              <p className="text-[15px] sm:text-[16px] text-trichomes-forest/70 font-body">
                Thank you for your order. We've received your payment and will
                begin processing your order shortly.
              </p>
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="mb-6 sm:mb-8">
          <OrderDetailsCard
            orderNumber={order.order_number}
            orderDate={order.created_at}
            status={order.status}
            paymentStatus={order.payment_status}
            paymentMethod={order.payment_method || undefined}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Left Column - Order Items and Shipping */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* Order Items */}
            <div>
              <h2 className="text-[20px] sm:text-[24px] font-heading font-semibold mb-4 sm:mb-6 text-trichomes-forest">
                Order Items
              </h2>
              <OrderItemList
                items={order.items.map((item) => ({
                  id: item.id,
                  product_id: item.product_id,
                  product_name: item.product_name,
                  quantity: item.quantity,
                  price: Number(item.price),
                  total: Number(item.total),
                  product: item.product || undefined,
                }))}
                showImages={true}
                showLinks={true}
              />
            </div>

            {/* Shipping Address */}
            {order.shipping_address && (
              <ShippingAddressCard address={order.shipping_address} />
            )}

            {/* Tracking Information */}
            <TrackingInfo
              trackingNumber={order.tracking_number}
              estimatedDelivery={order.delivered_at || order.shipped_at}
              status={order.status}
            />

            {/* Account Creation Prompt for Guest Orders */}
            {(!order.user_id || isGuest) && order.email && (
              <div className="mt-8">
                <AccountCreationPrompt
                  email={order.email}
                  orderNumber={order.order_number}
                />
              </div>
            )}
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <OrderSummary
              items={order.items.map((item) => ({
                id: item.id,
                product_name: item.product_name,
                quantity: item.quantity,
                price: Number(item.price),
                total: Number(item.total),
                product: item.product || undefined,
              }))}
              subtotal={subtotal}
              shipping={shipping}
              tax={tax}
              discount={discount}
              total={total}
              variant="confirmation"
              showItemDetails={false}
            />

            {/* Next Steps */}
            <div className="mt-6 bg-white p-6 rounded-xl border border-trichomes-forest/10 shadow-sm">
              <h3 className="text-[16px] sm:text-[18px] font-heading font-semibold mb-4 text-trichomes-forest">
                What's Next?
              </h3>
              <div className="space-y-3 text-[14px] sm:text-[15px] font-body text-trichomes-forest/70">
                <p className="flex items-start">
                  <span className="mr-2 text-trichomes-primary">1.</span>
                  <span>
                    You'll receive an email confirmation shortly with your order
                    details.
                  </span>
                </p>
                <p className="flex items-start">
                  <span className="mr-2 text-trichomes-primary">2.</span>
                  <span>
                    We'll notify you when your order ships with tracking
                    information.
                  </span>
                </p>
                <p className="flex items-start">
                  <span className="mr-2 text-trichomes-primary">3.</span>
                  <span>
                    Expected delivery: 3-5 business days after shipping.
                  </span>
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 space-y-3">
              <Link
                href="/order-history"
                className="block w-full bg-trichomes-primary text-white py-3 px-6 text-center rounded-lg hover:bg-trichomes-primary/90 font-semibold transition-all duration-150 ease-out hover:shadow-lg text-[14px] sm:text-[15px] font-body"
              >
                View Order History
              </Link>
              <Link
                href="/"
                className="block w-full bg-white border-2 border-trichomes-forest/20 text-trichomes-forest py-3 px-6 text-center rounded-lg hover:bg-trichomes-soft font-semibold transition-all duration-150 ease-out text-[14px] sm:text-[15px] font-body"
              >
                Continue Shopping
              </Link>
              {order.tracking_number && (
                <Link
                  href={`/track-order?order=${order.order_number}`}
                  className="block w-full text-trichomes-primary hover:text-trichomes-forest py-3 px-6 text-center font-semibold transition-colors duration-150 text-[14px] sm:text-[15px] font-body flex items-center justify-center gap-2"
                >
                  Track Order <ChevronRightIcon className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


