"use client";

import Image from "next/image";
import Link from "next/link";

import {
  ChevronRightIcon,
  EditIcon,
  PlusIcon,
  TrashIcon,
} from "@/components/ui/icons";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Header Section */}
      <div className="relative w-full h-[300px] sm:h-[350px] lg:h-[400px] overflow-hidden">
        <Image
          src="/banners/about-us.jpg"
          alt="Profile"
          fill
          className="object-cover"
          priority
        />
        <div 
          className="absolute inset-0" 
          style={{ 
            background: 'linear-gradient(to right, rgba(166, 147, 142, 0.88), rgba(166, 147, 142, 0.7), rgba(166, 147, 142, 0.35))'
          }}
        />
        <div className="relative h-full mx-auto px-4 sm:px-6 lg:px-8 max-w-[2200px] flex flex-col justify-center">
          <h1 className="text-[40px] sm:text-[48px] lg:text-[56px] font-heading text-white leading-tight mb-4">
            My Profile
          </h1>
          <nav className="flex items-center space-x-2">
            <Link
              href="/"
              className="text-[14px] text-white/90 hover:text-white transition-colors duration-150 ease-out font-body"
            >
              Home
            </Link>
            <ChevronRightIcon className="w-4 h-4 text-white/70" />
            <span className="text-[14px] text-white font-body">
              Profile
            </span>
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-16 sm:pb-20 lg:pb-24 max-w-[2200px]">
        <div className="max-w-4xl mx-auto">
          {/* Saved shipping addresses */}
          <div className="mb-8 sm:mb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-4">
              <h2 className="text-[24px] sm:text-[28px] font-heading text-gray-900">
                Saved shipping addresses
              </h2>
              <button
                type="button"
                className="flex items-center gap-2 text-[14px] sm:text-[15px] text-white bg-[#1E3024] rounded-full px-4 sm:px-6 py-2 sm:py-3 hover:bg-[#1E3024]/90 transition-all duration-150 ease-out font-body shadow-sm hover:shadow-md"
              >
                <PlusIcon /> Add new
              </button>
            </div>
            <div className="bg-white p-4 sm:p-6 border border-gray-200 rounded-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200 ease-out">
              <p className="text-[14px] sm:text-[15px] text-gray-900 font-body">
                23 Adebayo Street, Lekki Phase 1, Lagos, Nigeria
              </p>
              <div className="flex items-center gap-3 sm:gap-4">
                <button
                  type="button"
                  className="flex items-center gap-2 text-[13px] sm:text-[14px] font-medium bg-gray-100 text-gray-900 rounded-sm px-3 sm:px-4 py-2 hover:bg-gray-200 transition-all duration-150 ease-out font-body"
                >
                  <EditIcon /> Edit
                </button>
                <button
                  type="button"
                  className="flex items-center gap-2 text-[13px] sm:text-[14px] font-medium bg-red-50 text-red-700 rounded-sm px-3 sm:px-4 py-2 hover:bg-red-100 transition-all duration-150 ease-out font-body"
                >
                  <TrashIcon /> Delete
                </button>
              </div>
            </div>
          </div>

          {/* Links to other pages */}
          <div className="space-y-3 sm:space-y-4">
            <Link
              href="/order-history"
              className="w-full bg-white p-4 sm:p-6 border border-gray-200 rounded-sm flex justify-between items-center text-left hover:bg-gray-50 hover:border-gray-300 transition-all duration-150 ease-out block shadow-sm hover:shadow-md"
            >
              <span className="text-[16px] sm:text-[18px] font-heading text-gray-900">
                Order history
              </span>
              <ChevronRightIcon className="text-[#407029]" />
            </Link>
            <Link
              href="/wishlist"
              className="w-full bg-white p-4 sm:p-6 border border-gray-200 rounded-sm flex justify-between items-center text-left hover:bg-gray-50 hover:border-gray-300 transition-all duration-150 ease-out block shadow-sm hover:shadow-md"
            >
              <span className="text-[16px] sm:text-[18px] font-heading text-gray-900">
                Wishlist
              </span>
              <ChevronRightIcon className="text-[#407029]" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
