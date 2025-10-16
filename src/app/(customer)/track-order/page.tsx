'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { DocumentTextIcon, CheckCircleIcon, TruckIcon, HomeIcon } from '../../components/ui/icons';

type OrderStatus = 'Order placed' | 'Order accepted' | 'On the way' | 'Delivered';

interface StatusStepProps {
  icon: React.ReactNode;
  title: OrderStatus;
  date: string;
  time: string;
  isCompleted: boolean;
}

const StatusStep: React.FC<StatusStepProps> = ({ icon, title, date, time, isCompleted }) => {
  const isExpected = !date;
  return (
    <div className="flex-1 text-center">
      <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center relative z-10 ${
        isCompleted ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'
      }`}>
        {icon}
      </div>
      <p className="font-semibold mt-2">{title}</p>
      <p className="text-sm text-gray-500">{isExpected ? 'Expected' : date}</p>
      <p className="text-sm text-gray-500">{isExpected ? '-' : time}</p>
    </div>
  );
};

export default function TrackOrderPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id') || 'TC0123456789';

  const statuses: OrderStatus[] = ['Order placed', 'Order accepted', 'On the way', 'Delivered'];
  const currentStatus: OrderStatus = 'Order accepted';
  const currentStatusIndex = statuses.indexOf(currentStatus);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-2">Track your order</h1>
      <p className="text-gray-500 mb-8">Order ID: #{orderId}</p>

      <div className="bg-white p-8 rounded-lg border">
        <div className="flex items-start relative">
          <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200">
            <div
              className="h-1 bg-green-600"
              style={{ width: `${(currentStatusIndex / (statuses.length - 1)) * 100}%` }}
            ></div>
          </div>
          <StatusStep
            icon={<DocumentTextIcon />}
            title="Order placed"
            date="20-09-2023"
            time="11:00 AM"
            isCompleted={currentStatusIndex >= 0}
          />
          <StatusStep
            icon={<CheckCircleIcon />}
            title="Order accepted"
            date="20-09-2023"
            time="11:30 AM"
            isCompleted={currentStatusIndex >= 1}
          />
          <StatusStep
            icon={<TruckIcon />}
            title="On the way"
            date=""
            time=""
            isCompleted={currentStatusIndex >= 2}
          />
          <StatusStep
            icon={<HomeIcon />}
            title="Delivered"
            date=""
            time=""
            isCompleted={currentStatusIndex >= 3}
          />
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Order Details</h2>
        <div className="bg-white p-6 rounded-lg border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Shipping Address</h3>
              <p className="text-gray-600">23 Adebayo Street<br />Lekki Phase 1<br />Lagos, Nigeria</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Estimated Delivery</h3>
              <p className="text-gray-600">23-09-2023<br />Between 2:00 PM - 6:00 PM</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <Link
          href="/order-history"
          className="bg-[#38761d] text-white py-3 px-8 rounded-lg hover:bg-opacity-90 font-semibold transition-colors"
        >
          View Order History
        </Link>
      </div>
    </div>
  );
}