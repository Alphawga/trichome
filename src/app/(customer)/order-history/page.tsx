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
      return 'bg-green-100 text-green-800';
    case 'SHIPPED':
    case 'PROCESSING':
      return 'bg-blue-100 text-blue-800';
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800';
    case 'CANCELLED':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading orders...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-20 bg-white rounded-lg border">
          <div className="max-w-md mx-auto">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Sign in to view your orders</h2>
            <p className="text-gray-600 mb-6">Please sign in to access your order history</p>
            <Link
              href="/auth/signin"
              className="inline-block bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 font-medium"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Order history</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-lg border">
          <div className="max-w-md mx-auto">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h2>
            <p className="text-gray-600 mb-6">Start shopping to see your order history</p>
            <Link
              href="/"
              className="inline-block bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 font-medium"
            >
              Start Shopping
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg border overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-4 font-semibold">Order Number</th>
                  <th className="p-4 font-semibold">Items</th>
                  <th className="p-4 font-semibold">Total</th>
                  <th className="p-4 font-semibold">Order Status</th>
                  <th className="p-4 font-semibold">Order Date</th>
                  <th className="p-4 font-semibold"></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b last:border-b-0">
                    <td className="p-4 font-mono text-sm">{order.order_number}</td>
                    <td className="p-4">
                      {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                    </td>
                    <td className="p-4 font-semibold">
                      ₦{Number(order.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {formatStatus(order.status)}
                      </span>
                    </td>
                    <td className="p-4">{format(new Date(order.created_at), 'dd-MM-yyyy')}</td>
                    <td className="p-4">
                      <div className="flex items-center space-x-4">
                        <Link
                          href={`/track-order?order=${order.order_number}`}
                          className="text-green-600 hover:underline flex items-center gap-1 whitespace-nowrap"
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
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {((page - 1) * pagination.limit) + 1} to {Math.min(page * pagination.limit, pagination.total)} of {pagination.total} orders
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-4 py-2">
                  Page {page} of {pagination.pages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                  disabled={page === pagination.pages}
                  className="px-4 py-2 border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}