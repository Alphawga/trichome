'use client';

import React from 'react';
import Link from 'next/link';
import { PlusIcon, EditIcon, TrashIcon, ChevronRightIcon } from '@/components/ui/icons';

export default function ProfilePage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Saved shipping addresses */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Saved shipping addresses</h1>
            <button className="flex items-center gap-2 text-sm font-semibold text-gray-800 bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50">
              <PlusIcon /> Add new
            </button>
          </div>
          <div className="bg-white p-6 rounded-lg border flex justify-between items-center">
            <p>23 Adebayo Street, Lekki Phase 1, Lagos, Nigeria</p>
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 text-sm font-medium bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200">
                <EditIcon /> Edit
              </button>
              <button className="flex items-center gap-2 text-sm font-medium bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200">
                <TrashIcon /> Delete
              </button>
            </div>
          </div>
        </div>

        {/* Links to other pages */}
        <div className="space-y-4">
          <Link href="/order-history" className="w-full bg-white p-6 rounded-lg border flex justify-between items-center text-left hover:bg-gray-50 block">
            <span className="text-xl font-semibold">Order history</span>
            <ChevronRightIcon />
          </Link>
          <Link href="/wishlist" className="w-full bg-white p-6 rounded-lg border flex justify-between items-center text-left hover:bg-gray-50 block">
            <span className="text-xl font-semibold">Wishlist</span>
            <ChevronRightIcon />
          </Link>
        </div>
      </div>
    </div>
  );
}