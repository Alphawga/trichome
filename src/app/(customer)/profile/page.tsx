"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/app/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import {
  ChevronRightIcon,
} from "@/components/ui/icons";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { AddressList } from "@/components/profile/AddressList";
import { PasswordForm } from "@/components/profile/PasswordForm";

export default function ProfilePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/signin");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return null; // Or a loader
  }

  if (!isAuthenticated) {
    return null;
  }

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

          <div className="grid grid-cols-1 gap-12">
            {/* Personal Information */}
            <div>
              <ProfileForm />
            </div>

            {/* Addresses */}
            <div>
              <AddressList />
            </div>

            {/* Change Password */}
            <div>
              <PasswordForm />
            </div>
          </div>

          {/* Links to other pages */}
          <div className="space-y-3 sm:space-y-4 mt-12 pt-12 border-t border-gray-200">
            <h2 className="text-[20px] font-heading font-bold text-gray-900 mb-6">
              Other Actions
            </h2>
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
