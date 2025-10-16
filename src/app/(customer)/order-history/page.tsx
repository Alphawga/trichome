'use client';

import React from 'react';
import Link from 'next/link';
import { ViewIcon, RefundIcon } from '../../components/ui/icons';

// Mock order history data
const orderHistory = [
  {
    id: 'TC0123456789',
    items: '3 items',
    status: 'Delivered',
    date: '20-09-2023'
  },
  {
    id: 'TC0123456788',
    items: '2 items',
    status: 'Delivered',
    date: '15-09-2023'
  },
  {
    id: 'TC0123456787',
    items: '1 item',
    status: 'In Transit',
    date: '12-09-2023'
  },
  {
    id: 'TC0123456786',
    items: '4 items',
    status: 'Delivered',
    date: '08-09-2023'
  },
  {
    id: 'TC0123456785',
    items: '2 items',
    status: 'Delivered',
    date: '05-09-2023'
  }
];

export default function OrderHistoryPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Order history</h1>
      <div className="bg-white rounded-lg border overflow-x-auto">
        <table className="w-full text-left min-w-[700px]">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-semibold">Order ID</th>
              <th className="p-4 font-semibold">Items delivered</th>
              <th className="p-4 font-semibold">Order status</th>
              <th className="p-4 font-semibold">Date delivered</th>
              <th className="p-4 font-semibold"></th>
            </tr>
          </thead>
          <tbody>
            {orderHistory.map((order, index) => (
              <tr key={index} className="border-b last:border-b-0">
                <td className="p-4">{order.id}</td>
                <td className="p-4">{order.items}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                    order.status === 'In Transit' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="p-4">{order.date}</td>
                <td className="p-4">
                  <div className="flex items-center space-x-4">
                    <button className="text-red-600 hover:underline flex items-center gap-1">
                      <RefundIcon /> Request refund
                    </button>
                    <Link
                      href={`/track-order?id=${order.id}`}
                      className="text-green-600 hover:underline flex items-center gap-1"
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
    </div>
  );
}