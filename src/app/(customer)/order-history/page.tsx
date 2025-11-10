'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ViewIcon, RefundIcon } from '@/components/ui/icons';
import { trpc } from '@/utils/trpc';
import { useAuth } from '../../contexts/auth-context';
import { format } from 'date-fns';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'DELIVERED':
      return 'bg-trichomes-primary/20 text-trichomes-primary';
    case 'SHIPPED':
    case 'PROCESSING':
      return 'bg-trichomes-sage text-trichomes-forest';
    case 'PENDING':
      return 'bg-trichomes-gold/30 text-trichomes-forest';
    case 'CANCELLED':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-trichomes-forest/10 text-trichomes-forest';
  }
};

const formatStatus = (status: string) => {
  return status
    .toLowerCase()
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
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
    }
  );

  const orders = ordersQuery.data?.orders || [];
  const pagination = ordersQuery.data?.pagination;

  // Show loading state
  if (isLoading || ordersQuery.isLoading) {
    return (
      <div className="min-h-screen bg-trichomes-soft">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-7xl">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-trichomes-primary mx-auto mb-4"></div>
              <p className="text-trichomes-forest/60 font-body">Loading orders...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-trichomes-soft">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-7xl">
          <div className="text-center py-12 sm:py-20 bg-white rounded-xl border border-trichomes-forest/10 shadow-sm">
            <div className="max-w-md mx-auto">
              <h2 className="text-[20px] sm:text-[24px] font-heading font-semibold text-trichomes-forest mb-2">Sign in to view your orders</h2>
              <p className="text-trichomes-forest/60 font-body mb-4 sm:mb-6">Please sign in to access your order history</p>
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

  return (
    <div className="min-h-screen bg-trichomes-soft">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-12 sm:pb-16 max-w-7xl">
        <h1 className="text-[24px] sm:text-[32px] lg:text-[36px] font-heading font-semibold mb-6 sm:mb-8 text-trichomes-forest">Order history</h1>

        {orders.length === 0 ? (
          <div className="text-center py-12 sm:py-20 bg-white rounded-xl border border-trichomes-forest/10 shadow-sm">
            <div className="max-w-md mx-auto">
              <h2 className="text-[20px] sm:text-[24px] font-heading font-semibold text-trichomes-forest mb-2">No orders yet</h2>
              <p className="text-trichomes-forest/60 font-body mb-4 sm:mb-6">Start shopping to see your order history</p>
              <Link
                href="/"
                className="inline-block bg-trichomes-primary text-white py-3 px-6 sm:px-8 rounded-full hover:bg-trichomes-primary/90 font-semibold transition-all duration-150 ease-out hover:shadow-lg text-[14px] sm:text-[15px] font-body"
              >
                Start Shopping
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl border border-trichomes-forest/10 overflow-x-auto shadow-sm">
              <table className="w-full text-left min-w-[700px]">
                <thead className="bg-trichomes-sage border-b border-trichomes-forest/10">
                  <tr>
                    <th className="p-3 sm:p-4 font-heading font-semibold text-[14px] sm:text-[15px] text-trichomes-forest">Order Number</th>
                    <th className="p-3 sm:p-4 font-heading font-semibold text-[14px] sm:text-[15px] text-trichomes-forest">Items</th>
                    <th className="p-3 sm:p-4 font-heading font-semibold text-[14px] sm:text-[15px] text-trichomes-forest">Total</th>
                    <th className="p-3 sm:p-4 font-heading font-semibold text-[14px] sm:text-[15px] text-trichomes-forest">Order Status</th>
                    <th className="p-3 sm:p-4 font-heading font-semibold text-[14px] sm:text-[15px] text-trichomes-forest">Order Date</th>
                    <th className="p-3 sm:p-4 font-heading font-semibold text-[14px] sm:text-[15px] text-trichomes-forest"></th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-trichomes-forest/10 last:border-b-0 hover:bg-trichomes-sage/30 transition-colors duration-150">
                      <td className="p-3 sm:p-4 font-mono text-[13px] sm:text-[14px] text-trichomes-forest font-body">{order.order_number}</td>
                      <td className="p-3 sm:p-4 text-[13px] sm:text-[14px] text-trichomes-forest/70 font-body">
                        {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                      </td>
                      <td className="p-3 sm:p-4 font-heading font-semibold text-[14px] sm:text-[15px] text-trichomes-forest">
                        ₦{Number(order.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 sm:p-4">
                        <span className={`px-2 sm:px-3 py-1 text-[11px] sm:text-[12px] font-semibold rounded-full font-body ${getStatusColor(order.status)}`}>
                          {formatStatus(order.status)}
                        </span>
                      </td>
                      <td className="p-3 sm:p-4 text-[13px] sm:text-[14px] text-trichomes-forest/70 font-body">{format(new Date(order.created_at), 'dd-MM-yyyy')}</td>
                      <td className="p-3 sm:p-4">
                        <div className="flex items-center space-x-4">
                          <Link
                            href={`/track-order?order=${order.order_number}`}
                            className="text-trichomes-primary hover:text-trichomes-forest transition-colors duration-150 flex items-center gap-1 whitespace-nowrap text-[13px] sm:text-[14px] font-body"
                          >
                            <ViewIcon /> View order
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
                <p className="text-[13px] sm:text-[14px] text-trichomes-forest/60 font-body">
                  Showing {((page - 1) * pagination.limit) + 1} to {Math.min(page * pagination.limit, pagination.total)} of {pagination.total} orders
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 sm:px-4 py-2 border-2 border-trichomes-forest/20 rounded-lg hover:bg-trichomes-sage disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 ease-out text-[13px] sm:text-[14px] font-body text-trichomes-forest"
                  >
                    Previous
                  </button>
                  <span className="px-3 sm:px-4 py-2 text-[13px] sm:text-[14px] text-trichomes-forest/70 font-body">
                    Page {page} of {pagination.pages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                    disabled={page === pagination.pages}
                    className="px-3 sm:px-4 py-2 border-2 border-trichomes-forest/20 rounded-lg hover:bg-trichomes-sage disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 ease-out text-[13px] sm:text-[14px] font-body text-trichomes-forest"
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