'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { WhatsAppIcon, UserIcon, HeartIcon, BagIcon, SearchIcon } from '../ui/icons';

interface HeaderProps {
    cartCount: number;
    wishlistCount: number;
}

export const Header: React.FC<HeaderProps> = ({ cartCount, wishlistCount }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  const navLinks = [
    { href: '/brands', label: 'Brands' },
    { href: '/shop', label: 'Shop' },
    { href: '/products', label: 'Products' },
    { href: '/consultation', label: 'Consultation' },
    { href: '/about', label: 'About' },
  ];

  return (
    <header className="sticky top-0 z-50 shadow-sm">
      {/* Top green gradient bar with text */}
      <div className="h-12 bg-gradient-to-r from-green-900 via-green-500 to-green-900 flex items-center justify-center">
        <p className="text-white text-base font-medium">Welcome to Trichome - Your Premium Beauty Destination</p>
      </div>

      <div className="bg-white/98 border-b border-gray-200 backdrop-blur-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-24">
            {/* Logo */}
            <Link href="/" className="flex items-center h-full group">
              <Image
                src="/T3.png"
                alt="Trichomes Logo"
                width={140}
                height={110}
                className="object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </Link>

            {/* Navigation */}
            <nav className="hidden lg:flex items-center space-x-8 h-full">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative text-base font-medium transition-all duration-300 group flex items-center h-full ${
                    isActive(link.href)
                      ? 'text-green-600'
                      : 'text-gray-700 hover:text-green-600'
                  }`}
                >
                  <span className="relative pb-1">
                    {link.label}
                    <span className={`absolute bottom-0 left-0 h-0.5 bg-green-600 transition-all duration-300 ease-out ${
                      isActive(link.href)
                        ? 'w-full'
                        : 'w-0 group-hover:w-full'
                    }`}></span>
                  </span>
                </Link>
              ))}
            </nav>

            {/* Right side: Search and Icons */}
            <div className="flex items-center space-x-5 h-full">
              {/* Search Bar */}
              <div className="hidden md:flex relative items-center group">
                <SearchIcon className="absolute left-3 text-gray-400 w-5 h-5 transition-colors group-focus-within:text-green-600" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2.5 text-base border border-gray-300 rounded-full bg-gray-50 focus:outline-none focus:border-green-600 focus:bg-white focus:ring-2 focus:ring-green-100 transition-all w-48 focus:w-56"
                />
              </div>

              {/* WhatsApp */}
              <a
                href="https://wa.me/your-whatsapp-number"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-green-600 transition-all duration-300 hover:scale-110"
                title="Chat on WhatsApp"
              >
                <WhatsAppIcon className="w-6 h-6" />
              </a>

              {/* Wishlist */}
              <Link
                href="/wishlist"
                className="relative text-gray-600 hover:text-green-600 transition-all duration-300 hover:scale-110 group"
                title="Wishlist"
              >
                <HeartIcon className="w-6 h-6" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-bounce group-hover:animate-none">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* User Profile */}
              <Link
                href="/profile"
                className={`transition-all duration-300 hover:scale-110 ${
                  isActive('/profile') ? 'text-green-600' : 'text-gray-600 hover:text-green-600'
                }`}
                title="Profile"
              >
                <UserIcon className="w-6 h-6" />
              </Link>

              {/* Cart */}
              <Link
                href="/cart"
                className="relative text-gray-600 hover:text-green-600 transition-all duration-300 hover:scale-110 group"
                title="Shopping Cart"
              >
                <BagIcon className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-bounce group-hover:animate-none">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};