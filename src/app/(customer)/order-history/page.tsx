"use client";

import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ChevronRightIcon, ViewIcon } from "@/components/ui/icons";
import { trpc } from "@/utils/trpc";
import { useAuth } from "../../contexts/auth-context";

const getStatusColor = (status: string) => {
  switch (status) {
    case "DELIVERED":
      return "bg-[#1E3024]/20 text-[#407029]";
    case "SHIPPED":
    case "PROCESSING":
      return "bg-gray-100 text-gray-900";
    case "PENDING":
      return "bg-trichomes-gold/30 text-gray-900";
    case "CANCELLED":
      return "bg-red-100 text-red-800";
    default:
      return "bg-trichomes-forest/10 text-gray-900";
  }
};

const formatStatus = (status: string) => {
  return status
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default function OrderHistoryPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [page, setPage] = useState(1);

  // Fetch orders
  const ordersQuery = trpc.getMyOrders.useQuery(
    { page, limit: 10 },
    {
      enabled: isAuthenticated,
      refetchOnWindowFocus: false,
    },
  );

  const orders = ordersQuery.data?.orders || [];
  const pagination = ordersQuery.data?.pagination;

  // Show loading state
  if (isLoading || ordersQuery.isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-[2200px]">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-trichomes-primary mx-auto mb-4"></div>
              <p className="text-gray-600 font-body">
                Loading orders...
              </p>
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
                Sign in to view your orders
              </h2>
              <p className="text-gray-600 font-body mb-4 sm:mb-6">
                Please sign in to access your order history
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

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Header Section */}
      <div className="relative w-full h-[300px] sm:h-[350px] lg:h-[400px] overflow-hidden">
        <Image
          src="/banners/product-banner.jpg"
          alt="Order History"
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
            Order History
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
              Orders
            </span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-12 sm:pb-16 max-w-[2200px]">

        {orders.length === 0 ? (
          <div className="text-center py-12 sm:py-20 bg-white rounded-sm border border-gray-200 shadow-sm">
            <div className="max-w-md mx-auto">
              <h2 className="text-[20px] sm:text-[24px] font-heading font-semibold text-gray-900 mb-2">
                No orders yet
              </h2>
              <p className="text-gray-600 font-body mb-4 sm:mb-6">
                Start shopping to see your order history
              </p>
              <Link
                href="/"
                className="inline-block bg-[#1E3024] text-white py-3 px-6 sm:px-8 rounded-full hover:bg-[#1E3024]/90 font-semibold transition-all duration-150 ease-out hover:shadow-lg text-[14px] sm:text-[15px] font-body"
              >
                Start Shopping
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-sm border border-gray-200 overflow-x-auto shadow-sm">
              <table className="w-full text-left min-w-[700px]">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="p-3 sm:p-4 font-heading font-semibold text-[14px] sm:text-[15px] text-gray-900">
                      Order Number
                    </th>
                    <th className="p-3 sm:p-4 font-heading font-semibold text-[14px] sm:text-[15px] text-gray-900">
                      Items
                    </th>
                    <th className="p-3 sm:p-4 font-heading font-semibold text-[14px] sm:text-[15px] text-gray-900">
                      Total
                    </th>
                    <th className="p-3 sm:p-4 font-heading font-semibold text-[14px] sm:text-[15px] text-gray-900">
                      Order Status
                    </th>
                    <th className="p-3 sm:p-4 font-heading font-semibold text-[14px] sm:text-[15px] text-gray-900">
                      Order Date
                    </th>
                    <th className="p-3 sm:p-4 font-heading font-semibold text-[14px] sm:text-[15px] text-gray-900"></th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-gray-200 last:border-b-0 hover:bg-gray-100/30 transition-colors duration-150"
                    >
                      <td className="p-3 sm:p-4 font-mono text-[13px] sm:text-[14px] text-gray-900 font-body">
                        {order.order_number}
                      </td>
                      <td className="p-3 sm:p-4 text-[13px] sm:text-[14px] text-gray-900/70 font-body">
                        {order.items.length}{" "}
                        {order.items.length === 1 ? "item" : "items"}
                      </td>
                      <td className="p-3 sm:p-4 font-heading font-semibold text-[14px] sm:text-[15px] text-gray-900">
                        ₦
                        {Number(order.total).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td className="p-3 sm:p-4">
                        <span
                          className={`px-2 sm:px-3 py-1 text-[11px] sm:text-[12px] font-semibold rounded-full font-body ${getStatusColor(order.status)}`}
                        >
                          {formatStatus(order.status)}
                        </span>
                      </td>
                      <td className="p-3 sm:p-4 text-[13px] sm:text-[14px] text-gray-900/70 font-body">
                        {format(new Date(order.created_at), "dd-MM-yyyy")}
                      </td>
                      <td className="p-3 sm:p-4">
                        <div className="flex items-center space-x-2 sm:space-x-4">
                          <Link
                            href={`/order-history/${order.id}`}
                            className="text-[#407029] hover:text-gray-900 transition-colors duration-150 flex items-center gap-1 whitespace-nowrap text-[13px] sm:text-[14px] font-body"
                          >
                            <ViewIcon className="w-4 h-4" />
                            <span className="hidden sm:inline">View</span>
                          </Link>
                          <Link
                            href={`/track-order?order=${order.order_number}`}
                            className="text-[#407029] hover:text-gray-900 transition-colors duration-150 whitespace-nowrap text-[13px] sm:text-[14px] font-body"
                          >
                            Track
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-[13px] sm:text-[14px] text-gray-600 font-body">
                  Showing {(page - 1) * pagination.limit + 1} to{" "}
                  {Math.min(page * pagination.limit, pagination.total)} of{" "}
                  {pagination.total} orders
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 sm:px-4 py-2 border-2 border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 ease-out text-[13px] sm:text-[14px] font-body text-gray-900"
                  >
                    Previous
                  </button>
                  <span className="px-3 sm:px-4 py-2 text-[13px] sm:text-[14px] text-gray-900/70 font-body">
                    Page {page} of {pagination.pages}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setPage((p) => Math.min(pagination.pages, p + 1))
                    }
                    disabled={page === pagination.pages}
                    className="px-3 sm:px-4 py-2 border-2 border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 ease-out text-[13px] sm:text-[14px] font-body text-gray-900"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
