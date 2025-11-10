'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { DocumentTextIcon, CheckCircleIcon, TruckIcon, HomeIcon } from '@/components/ui/icons';

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
      <div className={`mx-auto w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center relative z-10 transition-all duration-200 ease-out ${
        isCompleted ? 'bg-trichomes-primary text-white shadow-md' : 'bg-trichomes-sage text-trichomes-forest/40'
      }`}>
        {icon}
      </div>
      <p className="font-heading font-semibold mt-2 sm:mt-3 text-[13px] sm:text-[14px] text-trichomes-forest">{title}</p>
      <p className="text-[12px] sm:text-[13px] text-trichomes-forest/60 font-body">{isExpected ? 'Expected' : date}</p>
      <p className="text-[12px] sm:text-[13px] text-trichomes-forest/60 font-body">{isExpected ? '-' : time}</p>
    </div>
  );
};

function TrackOrderPageContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id') || searchParams.get('order') || 'TC0123456789';

  const statuses: OrderStatus[] = ['Order placed', 'Order accepted', 'On the way', 'Delivered'];
  const currentStatus: OrderStatus = 'Order accepted';
  const currentStatusIndex = statuses.indexOf(currentStatus);

  return (
    <div className="min-h-screen bg-trichomes-soft">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-12 sm:pb-16 max-w-7xl">
        <h1 className="text-[24px] sm:text-[32px] lg:text-[36px] font-heading font-semibold mb-2 text-trichomes-forest">Track your order</h1>
        <p className="text-trichomes-forest/60 font-body text-[14px] sm:text-[15px] mb-6 sm:mb-8">Order ID: #{orderId}</p>

        <div className="bg-white p-6 sm:p-8 rounded-xl border border-trichomes-forest/10 shadow-sm mb-6 sm:mb-12">
          <div className="flex flex-col sm:flex-row items-start relative">
            <div className="absolute top-6 sm:top-8 left-0 right-0 h-1 bg-trichomes-forest/10 hidden sm:block">
              <div
                className="h-1 bg-trichomes-primary transition-all duration-300 ease-out"
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

        <div className="mb-6 sm:mb-8">
          <h2 className="text-[20px] sm:text-[24px] font-heading font-semibold mb-3 sm:mb-4 text-trichomes-forest">Order Details</h2>
          <div className="bg-white p-4 sm:p-6 rounded-xl border border-trichomes-forest/10 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <h3 className="font-heading font-semibold text-[15px] sm:text-[16px] text-trichomes-forest mb-2">Shipping Address</h3>
                <p className="text-[14px] sm:text-[15px] text-trichomes-forest/70 leading-relaxed font-body">23 Adebayo Street<br />Lekki Phase 1<br />Lagos, Nigeria</p>
              </div>
              <div>
                <h3 className="font-heading font-semibold text-[15px] sm:text-[16px] text-trichomes-forest mb-2">Estimated Delivery</h3>
                <p className="text-[14px] sm:text-[15px] text-trichomes-forest/70 leading-relaxed font-body">23-09-2023<br />Between 2:00 PM - 6:00 PM</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <Link
            href="/order-history"
            className="bg-trichomes-primary text-white py-3 px-6 sm:px-8 rounded-full hover:bg-trichomes-primary/90 font-semibold transition-all duration-150 ease-out hover:shadow-lg text-[14px] sm:text-[15px] font-body"
          >
            View Order History
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-trichomes-soft flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-trichomes-primary mx-auto mb-4"></div>
            <p className="text-trichomes-forest">Loading...</p>
          </div>
        </div>
      }
    >
      <TrackOrderPageContent />
    </Suspense>
  );
}
