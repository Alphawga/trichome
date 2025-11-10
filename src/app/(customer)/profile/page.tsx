'use client';

import React from 'react';
import Link from 'next/link';
import { PlusIcon, EditIcon, TrashIcon, ChevronRightIcon } from '@/components/ui/icons';

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-trichomes-soft">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-12 sm:pb-16 max-w-7xl">
        <div className="max-w-4xl mx-auto">
          {/* Saved shipping addresses */}
          <div className="mb-8 sm:mb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-4">
              <h1 className="text-[24px] sm:text-[32px] lg:text-[36px] font-heading font-semibold text-trichomes-forest">Saved shipping addresses</h1>
              <button className="flex items-center gap-2 text-[14px] sm:text-[15px] font-semibold text-trichomes-forest bg-white border-2 border-trichomes-primary px-4 sm:px-6 py-2 sm:py-3 rounded-full hover:bg-trichomes-primary hover:text-white transition-all duration-150 ease-out font-body">
                <PlusIcon /> Add new
              </button>
            </div>
            <div className="bg-white p-4 sm:p-6 rounded-xl border border-trichomes-forest/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm hover:shadow-md transition-shadow duration-200 ease-out">
              <p className="text-[14px] sm:text-[15px] text-trichomes-forest font-body">23 Adebayo Street, Lekki Phase 1, Lagos, Nigeria</p>
              <div className="flex items-center gap-3 sm:gap-4">
                <button className="flex items-center gap-2 text-[13px] sm:text-[14px] font-medium bg-trichomes-sage text-trichomes-forest px-3 sm:px-4 py-2 rounded-lg hover:bg-trichomes-primary hover:text-white transition-all duration-150 ease-out font-body">
                  <EditIcon /> Edit
                </button>
                <button className="flex items-center gap-2 text-[13px] sm:text-[14px] font-medium bg-red-50 text-red-700 px-3 sm:px-4 py-2 rounded-lg hover:bg-red-100 transition-all duration-150 ease-out font-body">
                  <TrashIcon /> Delete
                </button>
              </div>
            </div>
          </div>

          {/* Links to other pages */}
          <div className="space-y-3 sm:space-y-4">
            <Link href="/order-history" className="w-full bg-white p-4 sm:p-6 rounded-xl border border-trichomes-forest/10 flex justify-between items-center text-left hover:bg-trichomes-sage/50 transition-all duration-150 ease-out block shadow-sm hover:shadow-md">
              <span className="text-[16px] sm:text-[18px] font-heading font-semibold text-trichomes-forest">Order history</span>
              <ChevronRightIcon className="text-trichomes-primary" />
            </Link>
            <Link href="/wishlist" className="w-full bg-white p-4 sm:p-6 rounded-xl border border-trichomes-forest/10 flex justify-between items-center text-left hover:bg-trichomes-sage/50 transition-all duration-150 ease-out block shadow-sm hover:shadow-md">
              <span className="text-[16px] sm:text-[18px] font-heading font-semibold text-trichomes-forest">Wishlist</span>
              <ChevronRightIcon className="text-trichomes-primary" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
