"use client";

import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChevronRightIcon } from "@/components/ui/icons";
import { trpc } from "@/utils/trpc";
import { useAuth } from "../../../contexts/auth-context";

const getStatusColor = (status: string) => {
  switch (status) {
    case "DELIVERED":
      return "bg-green-100 text-green-800";
    case "SHIPPED":
      return "bg-blue-100 text-blue-800";
    case "PROCESSING":
      return "bg-yellow-100 text-yellow-800";
    case "PENDING":
      return "bg-orange-100 text-orange-800";
    case "CANCELLED":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case "PAID":
      return "bg-green-100 text-green-800";
    case "PENDING":
      return "bg-yellow-100 text-yellow-800";
    case "FAILED":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const formatStatus = (status: string) => {
  return status
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const orderId = params.id as string;

  // Fetch order details
  const orderQuery = trpc.getOrderById.useQuery(
    { id: orderId },
    {
      enabled: isAuthenticated && !!orderId,
      refetchOnWindowFocus: false,
    },
  );

  const order = orderQuery.data;

  // Show loading state
  if (authLoading || orderQuery.isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-[2200px]">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E3024] mx-auto mb-4"></div>
              <p className="text-gray-600 font-body">Loading order details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-[2200px]">
          <div className="text-center py-12 sm:py-20 bg-white rounded-sm border border-gray-200 shadow-sm">
            <div className="max-w-md mx-auto">
              <h2 className="text-[20px] sm:text-[24px] font-heading font-semibold text-gray-900 mb-2">
                Sign in to view order details
              </h2>
              <p className="text-gray-600 font-body mb-4 sm:mb-6">
                Please sign in to access your order
              </p>
              <Link
                href="/auth/signin"
                className="inline-block bg-[#1E3024] text-white py-3 px-6 sm:px-8 rounded-full hover:bg-[#1E3024]/90 font-semibold transition-all duration-150 ease-out hover:shadow-lg text-[14px] sm:text-[15px] font-body"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (orderQuery.isError || !order) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-[2200px]">
          <div className="text-center py-12 sm:py-20 bg-white rounded-sm border border-gray-200 shadow-sm">
            <div className="max-w-md mx-auto">
              <h2 className="text-[20px] sm:text-[24px] font-heading font-semibold text-gray-900 mb-2">
                Order not found
              </h2>
              <p className="text-gray-600 font-body mb-4 sm:mb-6">
                The order you're looking for doesn't exist or you don't have
                permission to view it
              </p>
              <Link
                href="/order-history"
                className="inline-block bg-[#1E3024] text-white py-3 px-6 sm:px-8 rounded-full hover:bg-[#1E3024]/90 font-semibold transition-all duration-150 ease-out hover:shadow-lg text-[14px] sm:text-[15px] font-body"
              >
                View Order History
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Header Section */}
      <div className="relative w-full h-[250px] sm:h-[300px] overflow-hidden">
        <Image
          src="/banners/product-banner.jpg"
          alt="Order Details"
          fill
          className="object-cover"
          priority
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, rgba(64, 112, 41, 0.9), rgba(64, 112, 41, 0.7), transparent)",
          }}
        />
        <div className="relative h-full mx-auto px-4 sm:px-6 lg:px-8 max-w-[2200px] flex flex-col justify-center">
          <h1 className="text-[32px] sm:text-[40px] lg:text-[48px] font-heading text-white leading-tight mb-4">
            Order Details
          </h1>
          <nav className="flex items-center space-x-2">
            <Link
              href="/"
              className="text-[14px] text-white/90 hover:text-white transition-colors duration-150 ease-out font-body"
            >
              Home
            </Link>
            <ChevronRightIcon className="w-4 h-4 text-white/70" />
            <Link
              href="/order-history"
              className="text-[14px] text-white/90 hover:text-white transition-colors duration-150 ease-out font-body"
            >
              Orders
            </Link>
            <ChevronRightIcon className="w-4 h-4 text-white/70" />
            <span className="text-[14px] text-white font-body">
              {order.order_number}
            </span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-12 sm:pb-16 max-w-[1400px]">
        {/* Order Header */}
        <div className="bg-white rounded-sm border border-gray-200 p-4 sm:p-6 mb-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h2 className="text-[20px] sm:text-[24px] font-heading font-semibold text-gray-900 mb-1">
                Order #{order.order_number}
              </h2>
              <p className="text-[13px] sm:text-[14px] text-gray-600 font-body">
                Placed on {format(new Date(order.created_at), "MMMM dd, yyyy 'at' h:mm a")}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span
                className={`px-3 py-1.5 text-[12px] sm:text-[13px] font-semibold rounded-full font-body ${getStatusColor(order.status)}`}
              >
                {formatStatus(order.status)}
              </span>
              <span
                className={`px-3 py-1.5 text-[12px] sm:text-[13px] font-semibold rounded-full font-body ${getPaymentStatusColor(order.payment_status)}`}
              >
                Payment: {formatStatus(order.payment_status)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Order Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white rounded-sm border border-gray-200 shadow-sm">
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <h3 className="text-[18px] sm:text-[20px] font-heading font-semibold text-gray-900">
                  Order Items
                </h3>
              </div>
              <div className="divide-y divide-gray-200">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 sm:p-6 flex gap-4 hover:bg-gray-50 transition-colors duration-150"
                  >
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 bg-gray-100 rounded-sm overflow-hidden">
                      {item.product?.images && item.product.images.length > 0 ? (
                        <Image
                          src={
                            (item.product.images[0] as { url: string }).url
                          }
                          alt={item.product_name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          No image
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[15px] sm:text-[16px] font-heading font-semibold text-gray-900 mb-1">
                        {item.product_name}
                      </h4>
                      <p className="text-[13px] sm:text-[14px] text-gray-600 font-body mb-2">
                        Quantity: {item.quantity}
                      </p>
                      <p className="text-[14px] sm:text-[15px] font-heading font-semibold text-gray-900">
                        ₦
                        {Number(item.unit_price).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}{" "}
                        <span className="text-[13px] text-gray-600 font-body font-normal">
                          each
                        </span>
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-[15px] sm:text-[16px] font-heading font-semibold text-gray-900">
                        ₦
                        {(
                          Number(item.unit_price) * item.quantity
                        ).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-sm border border-gray-200 p-4 sm:p-6 shadow-sm">
              <h3 className="text-[18px] sm:text-[20px] font-heading font-semibold text-gray-900 mb-4">
                Shipping Address
              </h3>
              <div className="text-[14px] sm:text-[15px] text-gray-700 font-body space-y-1">
                <p className="font-semibold text-gray-900">
                  {order.shipping_first_name} {order.shipping_last_name}
                </p>
                <p>{order.shipping_address_1}</p>
                {order.shipping_address_2 && <p>{order.shipping_address_2}</p>}
                <p>
                  {order.shipping_city}
                  {order.shipping_state && `, ${order.shipping_state}`}
                </p>
                {order.shipping_postal_code && (
                  <p>{order.shipping_postal_code}</p>
                )}
                <p>{order.shipping_country || "Nigeria"}</p>
                <p className="pt-2">
                  <span className="font-semibold text-gray-900">Email:</span>{" "}
                  {order.shipping_email}
                </p>
                {order.shipping_phone && (
                  <p>
                    <span className="font-semibold text-gray-900">Phone:</span>{" "}
                    {order.shipping_phone}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-sm border border-gray-200 p-4 sm:p-6 shadow-sm sticky top-8">
              <h3 className="text-[18px] sm:text-[20px] font-heading font-semibold text-gray-900 mb-4">
                Order Summary
              </h3>
              <div className="space-y-3 border-b border-gray-200 pb-4 mb-4">
                <div className="flex justify-between text-[14px] sm:text-[15px] font-body">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900 font-semibold">
                    ₦
                    {Number(order.subtotal).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="flex justify-between text-[14px] sm:text-[15px] font-body">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-900 font-semibold">
                    ₦
                    {Number(order.shipping_cost || 0).toLocaleString(
                      undefined,
                      {
                        minimumFractionDigits: 2,
                      },
                    )}
                  </span>
                </div>
                {order.tax && Number(order.tax) > 0 && (
                  <div className="flex justify-between text-[14px] sm:text-[15px] font-body">
                    <span className="text-gray-600">Tax</span>
                    <span className="text-gray-900 font-semibold">
                      ₦
                      {Number(order.tax).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                )}
                {order.discount && Number(order.discount) > 0 && (
                  <div className="flex justify-between text-[14px] sm:text-[15px] font-body">
                    <span className="text-green-700">Discount</span>
                    <span className="text-green-700 font-semibold">
                      -₦
                      {Number(order.discount).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex justify-between text-[16px] sm:text-[18px] font-heading font-semibold mb-6">
                <span className="text-gray-900">Total</span>
                <span className="text-gray-900">
                  ₦
                  {Number(order.total).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>

              {/* Payment Info */}
              <div className="border-t border-gray-200 pt-4 space-y-2">
                <h4 className="text-[15px] sm:text-[16px] font-heading font-semibold text-gray-900 mb-2">
                  Payment Information
                </h4>
                <div className="text-[13px] sm:text-[14px] font-body text-gray-700">
                  <p>
                    <span className="font-semibold text-gray-900">Method:</span>{" "}
                    {formatStatus(order.payment_method)}
                  </p>
                  {order.payment_reference && (
                    <p className="break-all">
                      <span className="font-semibold text-gray-900">
                        Reference:
                      </span>{" "}
                      {order.payment_reference}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 space-y-3">
                <Link
                  href={`/track-order?order=${order.order_number}`}
                  className="block w-full text-center bg-[#1E3024] text-white py-3 rounded-full hover:bg-[#1E3024]/90 font-semibold transition-all duration-150 ease-out hover:shadow-lg text-[14px] sm:text-[15px] font-body"
                >
                  Track Order
                </Link>
                <Link
                  href="/order-history"
                  className="block w-full text-center border-2 border-gray-200 text-gray-900 py-3 rounded-full hover:bg-gray-50 font-semibold transition-all duration-150 ease-out text-[14px] sm:text-[15px] font-body"
                >
                  Back to Orders
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
