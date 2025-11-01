'use client';

import React, { useState } from 'react';
import { SearchIcon, ExportIcon, EyeIcon, EditIcon, TruckIcon } from '@/components/ui/icons';
import { OrderViewSheet } from './OrderViewSheet';
import { trpc } from '@/utils/trpc';
import { OrderStatus, PaymentStatus } from '@prisma/client';
import type { Order, OrderItem as PrismaOrderItem, User, Address } from '@prisma/client';
import { DataTable, type Column } from '@/components/ui/data-table';


type OrderWithRelations = Order & {
  user: Pick<User, 'id' | 'email' | 'first_name' | 'last_name'> | null;
  items: Array<PrismaOrderItem & {
    product: {
      id: string;
      name: string;
      slug: string;
      images: Array<{ url: string }>;
    };
  }>;
  shipping_address: Address | null;
};


interface AdminOrder {
  id: string;
  customerName: string;
  customerEmail: string;
  items: Array<{
    id: number;
    name: string;
    quantity: number;
    price: number;
    image: string;
  }>;
  total: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  paymentStatus: 'Pending' | 'Paid' | 'Failed' | 'Refunded';
  orderDate: string;
  shippingAddress: string;
  trackingNumber?: string;
}


interface ActionsDropdownProps {
  order: AdminOrder;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onTrack: (id: string) => void;
  openDropdownId: string | null;
  setOpenDropdownId: (id: string | null) => void;
}

const ActionsDropdown: React.FC<ActionsDropdownProps> = ({
  order,
  onView,
  onEdit,
  onTrack,
  openDropdownId,
  setOpenDropdownId
}) => (
  <div className="relative">
    <button
      onClick={() => setOpenDropdownId(openDropdownId === order.id ? null : order.id)}
      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
      title="Actions"
    >
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
      </svg>
    </button>

    {openDropdownId === order.id && (
      <>
        <div
          className="fixed inset-0 z-10"
          onClick={() => setOpenDropdownId(null)}
        />
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
          <button
            onClick={() => {
              onView(order.id);
              setOpenDropdownId(null);
            }}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <EyeIcon className="w-4 h-4" />
            View Details
          </button>
          <button
            onClick={() => {
              onEdit(order.id);
              setOpenDropdownId(null);
            }}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <EditIcon className="w-4 h-4" />
            Edit Order
          </button>
          {(order.status === 'Shipped' || order.status === 'Delivered') && (
            <>
              <div className="border-t border-gray-100 my-1" />
              <button
                onClick={() => {
                  onTrack(order.id);
                  setOpenDropdownId(null);
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <TruckIcon className="w-4 h-4" />
                Track Shipment
              </button>
            </>
          )}
        </div>
      </>
    )}
  </div>
);


const mapOrderStatus = (status: OrderStatus): AdminOrder['status'] => {
  const statusMap: Record<OrderStatus, AdminOrder['status']> = {
    PENDING: 'Pending',
    CONFIRMED: 'Processing',
    PROCESSING: 'Processing',
    SHIPPED: 'Shipped',
    DELIVERED: 'Delivered',
    CANCELLED: 'Cancelled',
    RETURNED: 'Cancelled',
    REFUNDED: 'Cancelled',
  };
  return statusMap[status];
};


const mapPaymentStatus = (status: PaymentStatus): AdminOrder['paymentStatus'] => {
  const statusMap: Record<PaymentStatus, AdminOrder['paymentStatus']> = {
    PENDING: 'Pending',
    PROCESSING: 'Pending',
    COMPLETED: 'Paid',
    FAILED: 'Failed',
    CANCELLED: 'Failed',
    REFUNDED: 'Refunded',
    PARTIALLY_REFUNDED: 'Refunded',
  };
  return statusMap[status];
};


const transformOrder = (order: OrderWithRelations): AdminOrder => {
  const customerName = order.user
    ? `${order.user.first_name} ${order.user.last_name}`.trim()
    : `${order.first_name} ${order.last_name}`.trim();

  const customerEmail = order.user?.email || order.email;

  const shippingAddress = order.shipping_address
    ? `${order.shipping_address.address_1}${order.shipping_address.address_2 ? ', ' + order.shipping_address.address_2 : ''}, ${order.shipping_address.city}, ${order.shipping_address.state}, ${order.shipping_address.country}`
    : 'No address provided';

  return {
    id: order.order_number,
    customerName,
    customerEmail,
    items: order.items.map((item, index) => ({
      id: index + 1,
      name: item.product_name,
      quantity: item.quantity,
      price: Number(item.price),
      image: item.product.images[0]?.url || 'https://placehold.co/50x50/38761d/white?text=P',
    })),
    total: Number(order.total),
    status: mapOrderStatus(order.status),
    paymentStatus: mapPaymentStatus(order.payment_status),
    orderDate: new Date(order.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }),
    shippingAddress,
    trackingNumber: order.tracking_number || undefined,
  };
};

export default function AdminOrdersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'All'>('All');
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | 'All'>('All');
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [viewSheetOpen, setViewSheetOpen] = useState(false);
  const [viewingOrder, setViewingOrder] = useState<AdminOrder | null>(null);

  // Define table columns
  const columns: Column<AdminOrder>[] = [
    {
      header: 'Order ID',
      cell: (order) => (
        <div>
          <span className="font-medium text-gray-900">#{order.id}</span>
          <p className="text-sm text-gray-500">{order.orderDate}</p>
        </div>
      ),
    },
    {
      header: 'Customer',
      cell: (order) => (
        <div>
          <span className="font-medium text-gray-900">{order.customerName}</span>
          <p className="text-sm text-gray-500">{order.customerEmail}</p>
        </div>
      ),
    },
    {
      header: 'Items',
      cell: (order) => (
        <div>
          <span className="text-gray-900">
            {order.items.length} item{order.items.length > 1 ? 's' : ''}
          </span>
          <p className="text-sm text-gray-500">
            {order.items.slice(0, 2).map(item => item.name).join(', ')}
            {order.items.length > 2 && ` +${order.items.length - 2} more`}
          </p>
        </div>
      ),
    },
    {
      header: 'Total',
      cell: (order) => (
        <span className="text-gray-900 font-medium">₦{order.total.toLocaleString()}</span>
      ),
    },
    {
      header: 'Order Status',
      cell: (order) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
          order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
          order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
          order.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
          order.status === 'Pending' ? 'bg-gray-100 text-gray-800' :
          'bg-red-100 text-red-800'
        }`}>
          {order.status}
        </span>
      ),
    },
    {
      header: 'Payment',
      cell: (order) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
          order.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' :
          order.paymentStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
          order.paymentStatus === 'Failed' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {order.paymentStatus}
        </span>
      ),
    },
    {
      header: 'Actions',
      cell: (order) => (
        <ActionsDropdown
          order={order}
          onView={handleViewOrder}
          onEdit={handleEditOrder}
          onTrack={handleTrackOrder}
          openDropdownId={openDropdownId}
          setOpenDropdownId={setOpenDropdownId}
        />
      ),
      className: 'w-20',
    },
  ];

  // Fetch orders from database
  const ordersQuery = trpc.getOrders.useQuery(
    {
      page: 1,
      limit: 100,
      status: statusFilter !== 'All' ? statusFilter : undefined,
      payment_status: paymentFilter !== 'All' ? paymentFilter : undefined,
      search: searchTerm || undefined,
    },
    {
      refetchOnWindowFocus: false,
    }
  );

  // Fetch order statistics
  const statsQuery = trpc.getOrderStats.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const orders = ordersQuery.data?.orders || [];
  const stats = statsQuery.data;

  // Transform database orders to AdminOrder format
  const transformedOrders = orders.map(transformOrder);

  const filteredOrders = transformedOrders;

  const handleViewOrder = (id: string) => {
    const order = filteredOrders.find(o => o.id === id);
    if (order) {
      setViewingOrder(order);
      setViewSheetOpen(true);
    }
  };

  const handleEditOrder = (id: string) => {
    console.log('Edit order:', id);
    // TODO: Navigate to order edit form
  };

  const handleTrackOrder = (id: string) => {
    console.log('Track order:', id);
    // TODO: Navigate to tracking page
  };

  const handleExportCSV = () => {
    console.log('Export orders CSV');
    // TODO: Implement CSV export
  };

  const statuses: Array<OrderStatus | 'All'> = ['All', 'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
  const paymentStatuses: Array<PaymentStatus | 'All'> = ['All', 'PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'];

  // Display labels for filters
  const statusLabels: Record<OrderStatus | 'All', string> = {
    All: 'All Status',
    PENDING: 'Pending',
    CONFIRMED: 'Confirmed',
    PROCESSING: 'Processing',
    SHIPPED: 'Shipped',
    DELIVERED: 'Delivered',
    CANCELLED: 'Cancelled',
    RETURNED: 'Returned',
    REFUNDED: 'Refunded',
  };

  const paymentLabels: Record<PaymentStatus | 'All', string> = {
    All: 'All Payment',
    PENDING: 'Pending',
    PROCESSING: 'Processing',
    COMPLETED: 'Paid',
    FAILED: 'Failed',
    CANCELLED: 'Cancelled',
    REFUNDED: 'Refunded',
    PARTIALLY_REFUNDED: 'Partially Refunded',
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
        <p className="text-gray-600">Track and manage customer orders</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {statsQuery.isLoading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white p-6 rounded-lg border border-gray-200 animate-pulse">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                  <div className="ml-4 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              </div>
            ))}
          </>
        ) : stats ? (
          <>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <div className="w-6 h-6 text-blue-600">📋</div>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Total Orders</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <div className="w-6 h-6 text-yellow-600">⏳</div>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Pending Orders</p>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <div className="w-6 h-6 text-green-600">💰</div>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Total Revenue</p>
                  <p className="text-2xl font-bold">₦{Number(stats.revenue).toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <div className="w-6 h-6 text-purple-600">🚚</div>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Shipped Orders</p>
                  <p className="text-2xl font-bold">{stats.shipped}</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="col-span-4 text-center py-8 text-gray-500">
            Failed to load order statistics
          </div>
        )}
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search orders, customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <SearchIcon />
            </div>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'All')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none"
          >
            {statuses.map(status => (
              <option key={status} value={status}>{statusLabels[status]}</option>
            ))}
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value as PaymentStatus | 'All')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none"
          >
            {paymentStatuses.map(status => (
              <option key={status} value={status}>{paymentLabels[status]}</option>
            ))}
          </select>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 font-medium transition-colors"
          >
            <ExportIcon /> Export CSV
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <DataTable
        columns={columns}
        data={filteredOrders}
        isLoading={ordersQuery.isLoading}
        error={ordersQuery.error}
        onRetry={() => ordersQuery.refetch()}
        emptyMessage="No orders found matching your filters"
        keyExtractor={(order) => order.id}
      />

      {filteredOrders.length > 15 && (
        <div className="mt-6 flex justify-center">
          <button className="px-6 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
            Load More Orders
          </button>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-8 bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <button className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="text-yellow-600 mb-2">⏳</div>
            <p className="font-medium">Process Pending Orders</p>
            <p className="text-sm text-gray-500">
              {stats ? `${stats.pending} orders waiting` : 'Loading...'}
            </p>
          </button>

          <button className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="text-blue-600 mb-2">🚚</div>
            <p className="font-medium">Update Shipping</p>
            <p className="text-sm text-gray-500">Add tracking numbers</p>
          </button>

          <button className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="text-green-600 mb-2">📊</div>
            <p className="font-medium">Generate Report</p>
            <p className="text-sm text-gray-500">Order analytics</p>
          </button>
        </div>
      </div>

      {/* Order View Sheet */}
      <OrderViewSheet
        order={viewingOrder}
        open={viewSheetOpen}
        onOpenChange={setViewSheetOpen}
      />
    </div>
  );
}