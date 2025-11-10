'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { UserIcon, HeartIcon, BagIcon, SearchIcon, ChevronRightIcon } from '../ui/icons';

interface HeaderProps {
    cartCount: number;
    wishlistCount: number;
}

interface DropdownItem {
  label: string;
  href: string;
  description?: string;
}

interface DropdownMenu {
  items: DropdownItem[];
  featured?: DropdownItem;
}

const NavLink: React.FC<{
  href: string;
  children: React.ReactNode;
  hasDropdown?: boolean;
  isActive?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  isOpen?: boolean;
  dropdownMenu?: DropdownMenu;
  onCloseDropdown?: () => void;
}> = ({ href, children, hasDropdown, isActive, onMouseEnter, onMouseLeave, isOpen, dropdownMenu, onCloseDropdown }) => (
  <div
    className="relative"
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
  >
    <Link
      href={href}
      className={`relative flex items-center text-[15px] font-semibold transition-colors group uppercase tracking-wider ${
        isActive ? 'text-[#3A643B]' : 'text-[#1E3024] hover:text-[#3A643B]'
      }`}
    >
      <span className="relative">
        {children}
        {/* Animated underline */}
        <span 
          className={`absolute bottom-0 left-0 h-0.5 bg-[#3A643B] transition-all duration-300 ease-out ${
            isActive || isOpen ? 'w-full' : 'w-0 group-hover:w-full'
          }`}
        />
      </span>
      {hasDropdown && (
        <span className={`ml-1 font-light text-lg transition-transform duration-200 mb-1.5 ${
          isActive ? 'text-[#3A643B]' : 'text-gray-500 group-hover:text-[#3A643B]'
        } ${isOpen ? 'rotate-45' : ''}`}>+</span>
      )}
    </Link>
    {hasDropdown && isOpen && dropdownMenu && onCloseDropdown && (
      <Dropdown
        isOpen={true}
        menu={dropdownMenu}
        onClose={onCloseDropdown}
      />
    )}
  </div>
);

const Dropdown: React.FC<{
  isOpen: boolean;
  menu: DropdownMenu;
  onClose: () => void;
}> = ({ isOpen, menu, onClose }) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      
      // Adjust position if dropdown goes off screen
      if (rect.right > viewportWidth) {
        dropdownRef.current.style.right = '0';
        dropdownRef.current.style.left = 'auto';
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full left-1/2 z-50 w-[600px] bg-[#FAFAF7] rounded-b-xl shadow-lg border-x border-b border-[#E6E4C6]/50 overflow-hidden dropdown-animate"
      onMouseLeave={onClose}
      style={{ marginTop: '-1px' }}
    >
      <div className="p-8 pt-6">
        <div className="grid grid-cols-2 gap-4">
          {menu.items.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className="group p-3 rounded-lg hover:bg-[#E6E4C6]/30 transition-all duration-200"
              onClick={onClose}
            >
              <div className="flex items-center justify-between">
                <span className="text-[#1E3024] font-medium text-sm group-hover:text-[#3A643B] transition-colors">
                  {item.label}
                </span>
                <ChevronRightIcon className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 group-hover:text-[#3A643B] transition-all" />
              </div>
              {item.description && (
                <p className="text-xs text-gray-500 mt-1 font-normal">
                  {item.description}
                </p>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export const Header: React.FC<HeaderProps> = ({ cartCount, wishlistCount }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const pathname = usePathname();
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  // Define dropdown menus
  const dropdownMenus: Record<string, DropdownMenu> = {
    about: {
      items: [
        { label: 'Our Story', href: '/about', description: 'Learn about our journey' },
        { label: 'Our Mission', href: '/about#mission', description: 'What drives us' },
        { label: 'Sustainability', href: '/about#sustainability', description: 'Our commitment' },
        { label: 'Press & Media', href: '/about#press', description: 'Latest news' },
      ],
      featured: {
        label: 'About Trichomes',
        href: '/about',
        description: 'Where science meets nature - luxury simplified',
      },
    },
    brands: {
      items: [
        { label: 'All Brands', href: '/brands', description: 'Browse all brands' },
        { label: 'Featured', href: '/brands?featured=true', description: 'Featured collections' },
        { label: 'New Arrivals', href: '/brands?new=true', description: 'Latest additions' },
        { label: 'Best Sellers', href: '/brands?bestsellers=true', description: 'Top products' },
      ],
      featured: {
        label: 'Shop by Brand',
        href: '/brands',
        description: 'Discover premium beauty brands',
      },
    },
    face: {
      items: [
        { label: 'Moisturizers', href: '/products?category=moisturizers', description: 'Hydrating formulas' },
        { label: 'Cleansers', href: '/products?category=cleansers', description: 'Gentle cleansing' },
        { label: 'Serums', href: '/products?category=serums', description: 'Targeted treatments' },
        { label: 'Sunscreen', href: '/products?category=sunscreen', description: 'UV protection' },
        { label: 'Toners', href: '/products?category=toners', description: 'Balance & refresh' },
        { label: 'Eye Care', href: '/products?category=eye-care', description: 'Delicate care' },
      ],
      featured: {
        label: 'Face Care Collection',
        href: '/products?category=face-care',
        description: 'Premium skincare for healthy, glowing skin',
      },
    },
    body: {
      items: [
        { label: 'Body Lotions', href: '/products?category=body-lotions', description: 'Nourishing hydration' },
        { label: 'Body Washes', href: '/products?category=body-washes', description: 'Gentle cleansing' },
        { label: 'Body Scrubs', href: '/products?category=body-scrubs', description: 'Exfoliating care' },
        { label: 'Body Oils', href: '/products?category=body-oils', description: 'Luxurious moisture' },
        { label: 'Hand Care', href: '/products?category=hand-care', description: 'Soft hands' },
        { label: 'Foot Care', href: '/products?category=foot-care', description: 'Pampered feet' },
      ],
      featured: {
        label: 'Bath & Body Collection',
        href: '/products?category=body-care',
        description: 'Luxurious body care for smooth, nourished skin',
      },
    },
    shop: {
      items: [
        { label: 'All Products', href: '/products', description: 'Browse everything' },
        { label: 'New Arrivals', href: '/products?new=true', description: 'Latest products' },
        { label: 'Sale', href: '/products?sale=true', description: 'Special offers' },
        { label: 'Gift Sets', href: '/products?gifts=true', description: 'Perfect gifts' },
        { label: 'Hair Care', href: '/products?category=hair-care', description: 'Hair essentials' },
        { label: 'Perfumes', href: '/products?category=perfumes', description: 'Luxury fragrances' },
      ],
      featured: {
        label: 'Shop All',
        href: '/shop',
        description: 'Discover our complete collection',
      },
    },
  };

  const handleDropdownEnter = (key: string) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setOpenDropdown(key);
  };

  const handleDropdownLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 150);
  };

  useEffect(() => {
    return () => {
      if (dropdownTimeoutRef.current) {
        clearTimeout(dropdownTimeoutRef.current);
      }
    };
  }, []);

  return (
    <header className="bg-[#FAFAF7] sticky top-0 z-50 shadow-sm">
      {/* Top Announcement Bar */}
      <div className="bg-[#E6E4C6] text-sm text-[#1E3024] font-medium hidden sm:block border-b border-[#E9DDAA]/30">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-3 flex justify-center items-center">
          <p className="uppercase tracking-wide text-center overflow-hidden whitespace-nowrap">
            <span>NATURAL BEAUTY, NATURALLY YOURS - <Link href="/shop" className="underline hover:text-[#3A643B] transition-colors">SHOP NOW</Link></span>
            <span className="mx-2">•</span>
            <span>FREE SHIPPING OVER ₦20,000 - <Link href="/shop" className="underline hover:text-[#3A643B] transition-colors">LEARN MORE</Link></span>
            <span className="mx-2 hidden md:inline">•</span>
            <span className="hidden md:inline">BOOK YOUR FREE CONSULTATION - <Link href="/consultation" className="underline hover:text-[#3A643B] transition-colors">BOOK NOW</Link></span>
            <span className="mx-2 hidden lg:inline">•</span>
            <span className="hidden lg:inline">WHERE SCIENCE MEETS NATURE - <Link href="/about" className="underline hover:text-[#3A643B] transition-colors">OUR STORY</Link></span>
          </p>
        </div>
      </div>

      {/* Main Header */}
      <div className="border-b border-gray-200">
        <div className="w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between h-24">
          {/* Left: Search */}
          <div className="flex-1">
            <div className="relative w-full max-w-xs hidden md:block">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400">
                <SearchIcon className="w-5 h-5" />
              </div>
              <input
                type="text"
                placeholder="type to search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 bg-transparent border-b border-gray-300 focus:border-[#3A643B] outline-none py-1.5 text-base text-[#1E3024] placeholder:text-gray-400 transition-colors"
              />
            </div>
          </div>

          {/* Center: Logo */}
          <div className="flex-1 flex justify-center">
            <Link href="/" className="flex items-center group">
              <Image
                src="/T3.png"
                alt="Trichomes Logo"
                width={140}
                height={110}
                className="object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </Link>
          </div>

          {/* Right: Icons */}
          <div className="flex-1 flex items-center justify-end space-x-4 sm:space-x-6">
            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="relative text-[#1E3024] hover:text-[#3A643B] transition-all duration-200 hover:scale-110 hidden sm:block"
              title="Wishlist"
            >
              <HeartIcon className="w-6 h-6" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-[#3A643B] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* User Profile */}
            <Link
              href="/profile"
              className={`transition-all duration-200 hover:scale-110 ${
                isActive('/profile') ? 'text-[#3A643B]' : 'text-[#1E3024] hover:text-[#3A643B]'
              }`}
              title="Profile"
            >
              <UserIcon className="w-6 h-6" />
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative text-[#1E3024] hover:text-[#3A643B] transition-all duration-200 hover:scale-110"
              title="Shopping Cart"
            >
              <BagIcon className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-[#3A643B] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="border-b border-gray-200 hidden lg:block relative">
        <div className="w-full px-4 sm:px-6 lg:px-8 flex justify-center items-center h-14 space-x-8">
          <NavLink
            href="/about"
            hasDropdown
            isActive={isActive('/about')}
            onMouseEnter={() => handleDropdownEnter('about')}
            onMouseLeave={handleDropdownLeave}
            isOpen={openDropdown === 'about'}
            dropdownMenu={dropdownMenus.about}
            onCloseDropdown={() => setOpenDropdown(null)}
          >
            About Us
          </NavLink>

          <NavLink
            href="/brands"
            hasDropdown
            isActive={isActive('/brands')}
            onMouseEnter={() => handleDropdownEnter('brands')}
            onMouseLeave={handleDropdownLeave}
            isOpen={openDropdown === 'brands'}
            dropdownMenu={dropdownMenus.brands}
            onCloseDropdown={() => setOpenDropdown(null)}
          >
            Brands
          </NavLink>

          <NavLink
            href="/products?category=face-care"
            hasDropdown
            isActive={pathname.includes('face-care')}
            onMouseEnter={() => handleDropdownEnter('face')}
            onMouseLeave={handleDropdownLeave}
            isOpen={openDropdown === 'face'}
            dropdownMenu={dropdownMenus.face}
            onCloseDropdown={() => setOpenDropdown(null)}
          >
            Face
          </NavLink>

          <NavLink
            href="/products?category=body-care"
            hasDropdown
            isActive={pathname.includes('body-care')}
            onMouseEnter={() => handleDropdownEnter('body')}
            onMouseLeave={handleDropdownLeave}
            isOpen={openDropdown === 'body'}
            dropdownMenu={dropdownMenus.body}
            onCloseDropdown={() => setOpenDropdown(null)}
          >
            Bath & Body
          </NavLink>

          <NavLink
            href="/shop"
            hasDropdown
            isActive={isActive('/shop')}
            onMouseEnter={() => handleDropdownEnter('shop')}
            onMouseLeave={handleDropdownLeave}
            isOpen={openDropdown === 'shop'}
            dropdownMenu={dropdownMenus.shop}
            onCloseDropdown={() => setOpenDropdown(null)}
          >
            Shop
          </NavLink>

          <NavLink href="/consultation" isActive={isActive('/consultation')}>
            Book a Consultation
          </NavLink>
          <NavLink href="/rewards" isActive={isActive('/rewards')}>
            Rewards
          </NavLink>
        </div>
      </nav>
    </header>
  );
};