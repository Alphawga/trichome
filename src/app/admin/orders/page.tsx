'use client';

import React, { useState } from 'react';
import { SearchIcon, FilterIcon, ExportIcon, EyeIcon, EditIcon, TruckIcon } from '@/components/ui/icons';

// Temporary interfaces for migration
interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  image: string;
}

interface AdminOrder {
  id: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  total: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  paymentStatus: 'Pending' | 'Paid' | 'Failed' | 'Refunded';
  orderDate: string;
  shippingAddress: string;
  trackingNumber?: string;
}

interface OrderRowProps {
  order: AdminOrder;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onTrack: (id: string) => void;
}

const OrderRow: React.FC<OrderRowProps> = ({ order, onView, onEdit, onTrack }) => (
  <tr className="border-b last:border-0 hover:bg-gray-50">
    <td className="p-4">
      <div>
        <span className="font-medium text-gray-900">#{order.id}</span>
        <p className="text-sm text-gray-500">{order.orderDate}</p>
      </div>
    </td>
    <td className="p-4">
      <div>
        <span className="font-medium text-gray-900">{order.customerName}</span>
        <p className="text-sm text-gray-500">{order.customerEmail}</p>
      </div>
    </td>
    <td className="p-4">
      <div>
        <span className="text-gray-900">{order.items.length} item{order.items.length > 1 ? 's' : ''}</span>
        <p className="text-sm text-gray-500">
          {order.items.slice(0, 2).map(item => item.name).join(', ')}
          {order.items.length > 2 && ` +${order.items.length - 2} more`}
        </p>
      </div>
    </td>
    <td className="p-4 text-gray-900 font-medium">₦{order.total.toLocaleString()}</td>
    <td className="p-4">
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
        order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
        order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
        order.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
        order.status === 'Pending' ? 'bg-gray-100 text-gray-800' :
        'bg-red-100 text-red-800'
      }`}>
        {order.status}
      </span>
    </td>
    <td className="p-4">
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
        order.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' :
        order.paymentStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
        order.paymentStatus === 'Failed' ? 'bg-red-100 text-red-800' :
        'bg-gray-100 text-gray-800'
      }`}>
        {order.paymentStatus}
      </span>
    </td>
    <td className="p-4">
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onView(order.id)}
          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
          title="View order details"
        >
          <EyeIcon className="w-4 h-4" />
        </button>
        <button
          onClick={() => onEdit(order.id)}
          className="p-1 text-gray-400 hover:text-green-600 transition-colors"
          title="Edit order"
        >
          <EditIcon className="w-4 h-4" />
        </button>
        {(order.status === 'Shipped' || order.status === 'Delivered') && (
          <button
            onClick={() => onTrack(order.id)}
            className="p-1 text-gray-400 hover:text-purple-600 transition-colors"
            title="Track shipment"
          >
            <TruckIcon className="w-4 h-4" />
          </button>
        )}
      </div>
    </td>
  </tr>
);

export default function AdminOrdersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [dateRange, setDateRange] = useState('All');

  // Mock data - will be replaced with tRPC calls
  const mockOrders: AdminOrder[] = Array.from({ length: 20 }, (_, i) => {
    const statuses: AdminOrder['status'][] = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    const paymentStatuses: AdminOrder['paymentStatus'][] = ['Pending', 'Paid', 'Failed', 'Refunded'];
    const itemCount = Math.floor(Math.random() * 5) + 1;

    const items: OrderItem[] = Array.from({ length: itemCount }, (_, j) => ({
      id: j + 1,
      name: `Product ${j + 1}`,
      quantity: Math.floor(Math.random() * 3) + 1,
      price: Math.floor(Math.random() * 30000) + 5000,
      image: `https://picsum.photos/seed/${i * 10 + j}/50/50`
    }));

    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return {
      id: `ORD-${String(i + 1).padStart(4, '0')}`,
      customerName: `Customer ${i + 1}`,
      customerEmail: `customer${i + 1}@example.com`,
      items: items,
      total: total,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      paymentStatus: paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)],
      orderDate: `2023-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      shippingAddress: `${Math.floor(Math.random() * 999) + 1} Sample Street, Lagos, Nigeria`,
      trackingNumber: Math.random() > 0.5 ? `TRK${Math.random().toString().slice(2, 12)}` : undefined
    };
  });

  const filteredOrders = mockOrders.filter(order => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
    const matchesPayment = paymentFilter === 'All' || order.paymentStatus === paymentFilter;
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const handleViewOrder = (id: string) => {
    console.log('View order:', id);
    // TODO: Navigate to order detail view
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

  const statuses = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
  const paymentStatuses = ['All', 'Pending', 'Paid', 'Failed', 'Refunded'];

  // Calculate stats
  const totalRevenue = mockOrders
    .filter(order => order.paymentStatus === 'Paid')
    .reduce((sum, order) => sum + order.total, 0);

  const pendingOrders = mockOrders.filter(order => order.status === 'Pending').length;
  const processingOrders = mockOrders.filter(order => order.status === 'Processing').length;
  const shippedOrders = mockOrders.filter(order => order.status === 'Shipped').length;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
        <p className="text-gray-600">Track and manage customer orders</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <div className="w-6 h-6 text-blue-600">📋</div>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Total Orders</p>
              <p className="text-2xl font-bold">{mockOrders.length}</p>
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
              <p className="text-2xl font-bold">{pendingOrders}</p>
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
              <p className="text-2xl font-bold">₦{totalRevenue.toLocaleString()}</p>
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
              <p className="text-2xl font-bold">{shippedOrders}</p>
            </div>
          </div>
        </div>
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
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none"
          >
            {statuses.map(status => (
              <option key={status} value={status}>{status} Status</option>
            ))}
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none"
          >
            {paymentStatuses.map(status => (
              <option key={status} value={status}>{status} Payment</option>
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
      <div className="bg-white rounded-lg border overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-semibold text-sm text-gray-700">Order ID</th>
              <th className="p-4 font-semibold text-sm text-gray-700">Customer</th>
              <th className="p-4 font-semibold text-sm text-gray-700">Items</th>
              <th className="p-4 font-semibold text-sm text-gray-700">Total</th>
              <th className="p-4 font-semibold text-sm text-gray-700">Order Status</th>
              <th className="p-4 font-semibold text-sm text-gray-700">Payment</th>
              <th className="p-4 font-semibold text-sm text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map(order => (
                <OrderRow
                  key={order.id}
                  order={order}
                  onView={handleViewOrder}
                  onEdit={handleEditOrder}
                  onTrack={handleTrackOrder}
                />
              ))
            ) : (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-500">
                  No orders found matching your filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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
            <p className="text-sm text-gray-500">{pendingOrders} orders waiting</p>
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
    </div>
  );
}