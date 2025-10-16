'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { WhatsAppIcon, UserIcon, HeartIcon, BagIcon, SearchIcon } from '../ui/icons';

interface HeaderProps {
    cartCount: number;
    wishlistCount: number;
}

export const Header: React.FC<HeaderProps> = ({ cartCount, wishlistCount }) => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="bg-white/95 border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Always visible */}
          <Link href="/" className="flex items-center h-full">
           <Image src="/T3.png" alt="Trichomes Logo" width={120} height={100} className="object-contain" /> 
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6 h-full">
            <Link href="/brands" className="relative text-sm text-gray-600 hover:text-gray-900 transition-colors group flex items-center h-full">
              <span className="relative pb-1">
                Brands
                <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gray-900 transition-all duration-300 ease-out group-hover:w-full group-hover:left-0"></span>
              </span>
            </Link>
            <Link href="/skincare" className="relative text-sm text-gray-600 hover:text-gray-900 transition-colors group flex items-center h-full">
              <span className="relative pb-1">
                Skincare
                <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gray-900 transition-all duration-300 ease-out group-hover:w-full group-hover:left-0"></span>
              </span>
            </Link>
            <Link href="/shop" className="relative text-sm text-gray-600 hover:text-gray-900 transition-colors group flex items-center h-full">
              <span className="relative pb-1">
                Shop
                <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gray-900 transition-all duration-300 ease-out group-hover:w-full group-hover:left-0"></span>
              </span>
            </Link>
            <Link href="/products" className="relative text-sm text-gray-600 hover:text-gray-900 transition-colors group flex items-center h-full">
              <span className="relative pb-1">
                Products
                <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gray-900 transition-all duration-300 ease-out group-hover:w-full group-hover:left-0"></span>
              </span>
            </Link>
            <Link href="/consultation" className="relative text-sm text-gray-600 hover:text-gray-900 transition-colors group flex items-center h-full">
              <span className="relative pb-1">
                Book a Consultation
                <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gray-900 transition-all duration-300 ease-out group-hover:w-full group-hover:left-0"></span>
              </span>
            </Link>
            <Link href="/about" className="relative text-sm text-gray-600 hover:text-gray-900 transition-colors group flex items-center h-full">
              <span className="relative pb-1">
                About Us
                <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gray-900 transition-all duration-300 ease-out group-hover:w-full group-hover:left-0"></span>
              </span>
            </Link>
          </nav>

          {/* Right side: Search and Icons */}
          <div className="flex items-center space-x-4 h-full">
            {/* Search Bar */}
            <div className="relative flex items-center">
              <SearchIcon className="absolute left-0 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-6 pr-2 py-1.5 text-sm border-b border-gray-300 bg-transparent focus:outline-none focus:border-gray-900 transition-colors w-40"
              />
            </div>

            {/* WhatsApp */}
            <a href="https://wa.me/your-whatsapp-number" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900 transition-colors">
              <WhatsAppIcon className="w-4 h-4" />
            </a>

            {/* Wishlist */}
            <Link href="/wishlist" className="relative text-gray-600 hover:text-gray-900 transition-colors">
              <HeartIcon className="w-4 h-4" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-green-600 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">{wishlistCount}</span>
              )}
            </Link>

            {/* User Profile */}
            <Link href="/profile" className="text-gray-600 hover:text-gray-900 transition-colors">
              <UserIcon className="w-4 h-4" />
            </Link>

            {/* Cart */}
            <Link href="/cart" className="relative text-gray-600 hover:text-gray-900 transition-colors">
              <BagIcon className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-green-600 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">{cartCount}</span>
              )}
            </Link>
          </div>

        </div>
      </div>
    </header>
  );
};