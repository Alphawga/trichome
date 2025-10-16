'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

// Temporary interfaces for migration
interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
}

interface AdminOrder {
  orderId: string;
  customerName: string;
  customerId: string;
  customerEmail: string;
  shippingAddress: string;
  status: 'Pending' | 'In progress' | 'Delivered' | 'Cancelled';
  amount: number;
  items: OrderItem[];
  orderDate: string;
}

type AdminOrderStatus = 'Pending' | 'In progress' | 'Delivered' | 'Cancelled';

export default function OrderViewPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  // Mock order data - will be replaced with tRPC call
  const mockOrder: AdminOrder = {
    orderId: orderId || 'ORD-0001',
    customerName: 'John Doe',
    customerId: 'CUST-001',
    customerEmail: 'john.doe@example.com',
    shippingAddress: '23 Adebayo Street, Lekki Phase 1, Lagos, Nigeria',
    status: 'In progress',
    amount: 45600,
    orderDate: '2023-10-25',
    items: [
      {
        id: 1,
        name: 'La Roche-Posay Effaclar Purifying Foaming Gel',
        quantity: 2,
        price: 15800
      },
      {
        id: 2,
        name: 'CeraVe Hydrating Cleanser',
        quantity: 1,
        price: 14000
      }
    ]
  };

  const [status, setStatus] = useState<AdminOrderStatus>(mockOrder.status);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusUpdate = async () => {
    setIsUpdating(true);
    try {
      // TODO: Update order status with tRPC
      console.log('Updating order status to:', status);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Show success message or redirect
      router.refresh();
    } catch (error) {
      console.error('Failed to update order status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleBack = () => {
    router.push('/admin/orders');
  };

  const statusOptions: AdminOrderStatus[] = ['Pending', 'In progress', 'Delivered', 'Cancelled'];

  const getStatusColor = (status: AdminOrderStatus) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'In progress':
        return 'bg-blue-100 text-blue-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="flex items-center mb-6">
        <button
          onClick={handleBack}
          className="text-gray-500 hover:text-gray-800 mr-4 text-2xl"
        >
          ←
        </button>
        <h1 className="text-2xl font-bold">Order Details</h1>
        <span className="ml-4 text-lg text-gray-500 font-medium">#{mockOrder.orderId}</span>
        <span className={`ml-4 px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(mockOrder.status)}`}>
          {mockOrder.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-lg border">
            <h2 className="text-lg font-bold mb-4">Items in Order ({mockOrder.items.length})</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b">
                    <th className="p-2 font-semibold text-sm">Product</th>
                    <th className="p-2 font-semibold text-sm">Quantity</th>
                    <th className="p-2 font-semibold text-sm">Price</th>
                    <th className="p-2 font-semibold text-sm text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {mockOrder.items.map(item => (
                    <tr key={item.id} className="border-b last:border-0">
                      <td className="p-2">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-500">Product ID: {item.id}</p>
                        </div>
                      </td>
                      <td className="p-2">{item.quantity}</td>
                      <td className="p-2">₦{item.price.toLocaleString()}</td>
                      <td className="p-2 text-right font-medium">₦{(item.quantity * item.price).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="text-right mt-4 pr-2 border-t pt-4">
              <p className="text-gray-600">Subtotal: <span className="font-medium text-black">₦{mockOrder.amount.toLocaleString()}</span></p>
              <p className="text-gray-600">Shipping: <span className="font-medium text-black">₦4,500</span></p>
              <p className="font-bold text-lg mt-2">Total: <span className="text-black">₦{(mockOrder.amount + 4500).toLocaleString()}</span></p>
            </div>
          </div>

          {/* Order Timeline */}
          <div className="bg-white p-6 rounded-lg border mt-6">
            <h2 className="text-lg font-bold mb-4">Order Timeline</h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="w-3 h-3 bg-green-500 rounded-full mt-2 mr-4"></div>
                <div>
                  <p className="font-medium">Order Placed</p>
                  <p className="text-sm text-gray-500">{mockOrder.orderDate} at 10:30 AM</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-3 h-3 bg-blue-500 rounded-full mt-2 mr-4"></div>
                <div>
                  <p className="font-medium">Payment Confirmed</p>
                  <p className="text-sm text-gray-500">{mockOrder.orderDate} at 10:32 AM</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mt-2 mr-4"></div>
                <div>
                  <p className="font-medium">Order Processing</p>
                  <p className="text-sm text-gray-500">{mockOrder.orderDate} at 11:15 AM</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          {/* Customer Details */}
          <div className="bg-white p-6 rounded-lg border mb-6">
            <h2 className="text-lg font-bold mb-4">Customer Details</h2>
            <div className="space-y-3">
              <div>
                <p className="font-medium">{mockOrder.customerName}</p>
                <p className="text-sm text-gray-600">{mockOrder.customerId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email:</p>
                <p className="font-medium">{mockOrder.customerEmail}</p>
              </div>
              <div className="pt-2">
                <Link
                  href={`/admin/customers?search=${encodeURIComponent(mockOrder.customerEmail)}`}
                  className="text-green-600 hover:text-green-700 text-sm font-medium"
                >
                  View Customer Profile →
                </Link>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white p-6 rounded-lg border mb-6">
            <h2 className="text-lg font-bold mb-4">Shipping Address</h2>
            <p className="text-gray-700 leading-relaxed">{mockOrder.shippingAddress}</p>
          </div>

          {/* Update Status */}
          <div className="bg-white p-6 rounded-lg border">
            <h2 className="text-lg font-bold mb-4">Update Status</h2>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as AdminOrderStatus)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 mb-4"
            >
              {statusOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <button
              onClick={handleStatusUpdate}
              disabled={isUpdating || status === mockOrder.status}
              className="w-full px-6 py-2 border border-transparent rounded-lg bg-[#38761d] text-white hover:bg-opacity-90 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isUpdating ? 'Updating...' : 'Update Order'}
            </button>

            {status !== mockOrder.status && (
              <p className="text-sm text-gray-600 mt-2">
                Status will change from "{mockOrder.status}" to "{status}"
              </p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-lg border mt-6">
            <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full text-left px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                Send Tracking Email
              </button>
              <button className="w-full text-left px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                Print Shipping Label
              </button>
              <button className="w-full text-left px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                Generate Invoice
              </button>
              <button className="w-full text-left px-4 py-2 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                Cancel Order
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}