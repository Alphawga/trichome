"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/app/contexts/auth-context";
import { SearchBar } from "../search/SearchBar";
import {
  BagIcon,
  ChevronRightIcon,
  HeartIcon,
  SearchIcon,
  UserIcon,
} from "../ui/icons";

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
}> = ({
  href,
  children,
  hasDropdown,
  isActive,
  onMouseEnter,
  onMouseLeave,
  isOpen,
  dropdownMenu,
  onCloseDropdown,
}) => (
    <div
      className="relative"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <Link
        href={href}
        className={`relative flex items-center text-[15px] font-semibold transition-colors group uppercase tracking-wider ${isActive ? "text-[#3A643B]" : "text-[#1E3024] hover:text-[#3A643B]"
          }`}
        onFocus={onMouseEnter}
        onBlur={onMouseLeave}
        aria-haspopup={hasDropdown ? "menu" : undefined}
        aria-expanded={isOpen ? "true" : "false"}
      >
        <span className="relative">
          {children}
          {/* Animated underline */}
          <span
            className={`absolute bottom-0 left-0 h-0.5 bg-[#3A643B] transition-all duration-300 ease-out ${isActive || isOpen ? "w-full" : "w-0 group-hover:w-full"
              }`}
          />
        </span>
        {hasDropdown && (
          <span
            className={`ml-1 font-light text-lg transition-transform duration-200 mb-1.5 ${isActive
              ? "text-[#3A643B]"
              : "text-gray-500 group-hover:text-[#3A643B]"
              } ${isOpen ? "rotate-45" : ""}`}
          >
            +
          </span>
        )}
      </Link>
      {hasDropdown && isOpen && dropdownMenu && onCloseDropdown && (
        <Dropdown isOpen={true} menu={dropdownMenu} onClose={onCloseDropdown} />
      )}
    </div>
  );

const Dropdown: React.FC<{
  isOpen: boolean;
  menu: DropdownMenu;
  onClose: () => void;
}> = ({ isOpen, menu, onClose }) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const parentRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<"center" | "right" | "left">(
    "center",
  );
  const [isPositioned, setIsPositioned] = useState(false);

  useEffect(() => {
    if (isOpen && parentRef.current) {
      setIsPositioned(false);

      requestAnimationFrame(() => {
        if (!parentRef.current) return;

        const parentRect = parentRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const dropdownWidth = 600;
        const dropdownHalfWidth = dropdownWidth / 2;

        const centerX = parentRect.left + parentRect.width / 2;

        if (centerX + dropdownHalfWidth > viewportWidth) {
          setPosition("right");
        }
        else if (centerX - dropdownHalfWidth < 0) {
          setPosition("left");
        } else {
          setPosition("center");
        }

        setIsPositioned(true);
      });
    } else {
      setIsPositioned(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setPosition("center");
      setIsPositioned(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getPositionClasses = () => {
    switch (position) {
      case "right":
        return "right-0 left-auto";
      case "left":
        return "left-0 right-auto";
      default:
        return "left-1/2 -translate-x-1/2";
    }
  };

  return (
    <div ref={parentRef} className="relative">
      <div
        className={`absolute top-full z-50 pt-2 ${getPositionClasses()}`}
      >
        <div
          ref={dropdownRef}
          className={`w-[600px] bg-white shadow-lg border border-gray-200 rounded-sm overflow-hidden ${isPositioned
            ? "opacity-100 animate-[dropdownSlideIn_450ms_cubic-bezier(0.16,1,0.3,1)]"
            : "opacity-0"
            }`}
          role="menu"
        >
          <div className="p-6">
            <div className="grid grid-cols-2 gap-3">
              {menu.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group p-3 rounded-sm hover:bg-gray-50 transition-all duration-200 border border-transparent hover:border-gray-300"
                  onClick={onClose}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-gray-900 font-medium text-[13px] group-hover:text-black transition-colors">
                      {item.label}
                    </span>
                    <ChevronRightIcon className="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover:opacity-100 group-hover:text-gray-900 transition-all" />
                  </div>
                  {item.description && (
                    <p className="text-[11px] text-gray-600 mt-1 font-normal">
                      {item.description}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Hamburger Menu Icon Component
const MenuIcon: React.FC<{ isOpen: boolean; className?: string }> = ({
  isOpen,
  className,
}) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <title>Menu</title>
    {isOpen ? (
      <>
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </>
    ) : (
      <>
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </>
    )}
  </svg>
);

export const Header: React.FC<HeaderProps> = ({ cartCount, wishlistCount }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileMenuClosing, setMobileMenuClosing] = useState(false);
  const [mobileExpandedMenu, setMobileExpandedMenu] = useState<string | null>(
    null,
  );
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const menuTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Auth state
  const { user, isAuthenticated, isLoading: isAuthLoading, logout } = useAuth();

  // Handle search from SearchBar component
  const handleSearchFromBar = (query: string) => {
    setIsSearching(true);
    setTimeout(() => {
      router.push(`/products?search=${encodeURIComponent(query)}`);
      setIsSearching(false);
    }, 400);
  };

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  // Define dropdown menus
  const dropdownMenus: Record<string, DropdownMenu> = {
    about: {
      items: [
        {
          label: "Our Story",
          href: "/about",
          description: "Learn about our journey",
        },
        {
          label: "Our Mission",
          href: "/about#mission",
          description: "What drives us",
        },
        {
          label: "Sustainability",
          href: "/about#sustainability",
          description: "Our commitment",
        },
        {
          label: "Press & Media",
          href: "/about#press",
          description: "Latest news",
        },
      ],
      featured: {
        label: "About Trichomes",
        href: "/about",
        description: "Where science meets nature - luxury simplified",
      },
    },
    brands: {
      items: [
        {
          label: "All Brands",
          href: "/brands",
          description: "Browse all brands",
        },
        {
          label: "Featured",
          href: "/brands?featured=true",
          description: "Featured collections",
        },
        {
          label: "New Arrivals",
          href: "/brands?new=true",
          description: "Latest additions",
        },
        {
          label: "Best Sellers",
          href: "/brands?bestsellers=true",
          description: "Top products",
        },
      ],
      featured: {
        label: "Shop by Brand",
        href: "/brands",
        description: "Discover premium beauty brands",
      },
    },
    face: {
      items: [
        {
          label: "Moisturizers",
          href: "/products?category=moisturizers",
          description: "Hydrating formulas",
        },
        {
          label: "Cleansers",
          href: "/products?category=cleansers",
          description: "Gentle cleansing",
        },
        {
          label: "Serums",
          href: "/products?category=serums",
          description: "Targeted treatments",
        },
        {
          label: "Sunscreen",
          href: "/products?category=sunscreen",
          description: "UV protection",
        },
        {
          label: "Toners",
          href: "/products?category=toners",
          description: "Balance & refresh",
        },
        {
          label: "Eye Care",
          href: "/products?category=eye-care",
          description: "Delicate care",
        },
      ],
      featured: {
        label: "Face Care Collection",
        href: "/products?category=face-care",
        description: "Premium skincare for healthy, glowing skin",
      },
    },
    body: {
      items: [
        {
          label: "Body Lotions",
          href: "/products?category=body-lotions",
          description: "Nourishing hydration",
        },
        {
          label: "Body Washes",
          href: "/products?category=body-washes",
          description: "Gentle cleansing",
        },
        {
          label: "Body Scrubs",
          href: "/products?category=body-scrubs",
          description: "Exfoliating care",
        },
        {
          label: "Body Oils",
          href: "/products?category=body-oils",
          description: "Luxurious moisture",
        },
        {
          label: "Hand Care",
          href: "/products?category=hand-care",
          description: "Soft hands",
        },
        {
          label: "Foot Care",
          href: "/products?category=foot-care",
          description: "Pampered feet",
        },
      ],
      featured: {
        label: "Bath & Body Collection",
        href: "/products?category=body-care",
        description: "Luxurious body care for smooth, nourished skin",
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
    }, 300);
  };

  useEffect(() => {
    return () => {
      if (dropdownTimeoutRef.current) {
        clearTimeout(dropdownTimeoutRef.current);
      }
    };
  }, []);

  // Close mobile menu when route changes with animation
  const mobileMenuOpenRef = useRef(mobileMenuOpen);
  useEffect(() => {
    mobileMenuOpenRef.current = mobileMenuOpen;
  }, [mobileMenuOpen]);
  const prevPathRef = useRef(pathname);
  useEffect(() => {
    const currentPath = pathname;
    if (prevPathRef.current !== currentPath && mobileMenuOpenRef.current) {
      setMobileMenuClosing(true);
      menuTimeoutRef.current = setTimeout(() => {
        setMobileMenuOpen(false);
        setMobileMenuClosing(false);
        setMobileExpandedMenu(null);
      }, 300);
    }
    prevPathRef.current = currentPath;
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  const toggleMobileMenu = () => {
    if (mobileMenuOpen) {
      // Closing animation
      setMobileMenuClosing(true);
      menuTimeoutRef.current = setTimeout(() => {
        setMobileMenuOpen(false);
        setMobileMenuClosing(false);
        setMobileExpandedMenu(null);
      }, 300); // Match animation duration
    } else {
      // Opening
      setMobileMenuOpen(true);
      setMobileMenuClosing(false);
      setMobileExpandedMenu(null);
    }
  };

  const toggleMobileSubmenu = (menuKey: string) => {
    setMobileExpandedMenu(mobileExpandedMenu === menuKey ? null : menuKey);
  };

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Immediately clear blur on search
      setIsSearchFocused(false);
      document.body.classList.remove("search-focused");
      setIsSearching(true);
      // Animate search action with slight delay for appreciation
      setTimeout(() => {
        router.push(
          `/products?search=${encodeURIComponent(searchQuery.trim())}`,
        );
        setIsSearching(false);
        // Reset search after navigation
        setTimeout(() => {
          setSearchQuery("");
        }, 500);
      }, 400);
    }
  };

  // Handle Enter key in search
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch(e);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (menuTimeoutRef.current) {
        clearTimeout(menuTimeoutRef.current);
      }
    };
  }, []);

  // Handle search focus/blur - Mobile only
  const handleSearchFocus = () => {
    setIsSearchFocused(true);
    // Add blur class to body to blur all page content - only on mobile
    if (window.innerWidth < 1024) {
      document.body.classList.add("search-focused");
    }
  };

  const handleSearchBlur = () => {
    // Delay blur to allow for button clicks
    setTimeout(() => {
      setIsSearchFocused(false);
      // Remove blur class from body
      document.body.classList.remove("search-focused");
    }, 200);
  };

  // Calculate and set header height for overlay positioning, cleanup on unmount
  useEffect(() => {
    const updateHeaderHeight = () => {
      const header = document.querySelector("header");
      if (header) {
        const height = header.offsetHeight;
        document.documentElement.style.setProperty(
          "--header-height",
          `${height}px`,
        );
      }
    };

    updateHeaderHeight();
    window.addEventListener("resize", updateHeaderHeight);

    return () => {
      window.removeEventListener("resize", updateHeaderHeight);
      document.body.classList.remove("search-focused");
    };
  }, []);

  return (
    <header className="bg-[#FAFAF7] lg:sticky lg:top-0 z-50 shadow-sm">
      <div className="bg-[#FFEFE0] text-sm sm:text-sm text-[#000000] font-medium ">
        <div className="w-full px-4 sm:px-4 lg:px-8 py-3 sm:py-3">
          {/* Desktop: Full announcement */}
          <div className="hidden md:flex justify-center items-center">
            <p className="uppercase tracking-wide text-center overflow-hidden whitespace-nowrap">
              <span>
                NATURAL BEAUTY, NATURALLY YOURS -{" "}
                <Link
                  href="/products"
                  className="underline hover:text-[#3A643B] transition-colors"
                >
                  SHOP NOW
                </Link>
              </span>
              <span className="mx-2">•</span>
              <span>
                FREE SHIPPING OVER ₦20,000 -{" "}
                <Link
                  href="/products"
                  className="underline hover:text-[#3A643B] transition-colors"
                >
                  LEARN MORE
                </Link>
              </span>
              <span className="mx-2 hidden lg:inline">•</span>
              <span className="hidden lg:inline">
                BOOK YOUR FREE CONSULTATION -{" "}
                <Link
                  href="/consultation"
                  className="underline hover:text-[#3A643B] transition-colors"
                >
                  BOOK NOW
                </Link>
              </span>
            </p>
          </div>

          {/* Mobile: Simplified announcement */}
          <div className="md:hidden text-center">
            <p className="uppercase tracking-wide">
              FREE SHIPPING OVER ₦20,000 -{" "}
              <Link
                href="/products"
                className="underline hover:text-[#3A643B] transition-colors"
              >
                SHOP NOW
              </Link>
            </p>
          </div>
        </div>
      </div>

      <div
        className="border-b border-gray-200"
        style={{ position: "relative", zIndex: "auto" }}
      >
        <div className="w-full">
          <div className="flex items-center justify-between h-20 sm:h-24 lg:h-24 relative px-4 sm:px-6 lg:px-8">
            {/* Left: Desktop Search (Desktop) | Mobile Menu Button & Wishlist (Mobile) */}
            <div className="flex-1 flex items-center gap-3 sm:gap-4 lg:gap-4 min-w-0">
              {/* Mobile Menu Button */}
              <button
                type="button"
                onClick={toggleMobileMenu}
                className="lg:hidden text-[#1E3024] hover:text-[#3A643B] transition-colors duration-200 p-2 flex-shrink-0"
                aria-label="Toggle menu"
              >
                <MenuIcon isOpen={mobileMenuOpen} className="w-6 h-6" />
              </button>

              {/* Mobile Wishlist - Moved to left for balance */}
              <Link
                href="/wishlist"
                className="relative lg:hidden text-[#1E3024] hover:text-[#3A643B] transition-all duration-200 hover:scale-110 p-2 flex-shrink-0"
                title="Wishlist"
                onClick={() => setMobileMenuOpen(false)}
              >
                <HeartIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-[#3A643B] text-white text-[10px] sm:text-xs h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center font-bold">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Desktop Search Bar - Left side */}
              <div className="hidden lg:flex items-center w-full max-w-md">
                <form onSubmit={handleSearch} className="w-full">
                  <div className="relative w-full group">
                    <div
                      className={`absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 transition-all duration-400 ease-out ${isSearchFocused || isSearching
                        ? "scale-110 text-[#3A643B]"
                        : "group-hover:text-[#3A643B]"
                        }`}
                    >
                      <SearchIcon className="w-5 h-5" />
                    </div>
                    <div className="relative">
                      <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleSearchKeyDown}
                        onFocus={handleSearchFocus}
                        onBlur={handleSearchBlur}
                        className={`w-full pl-9 pr-20 bg-transparent outline-none py-2 text-base text-[#1E3024] placeholder:text-gray-400 transition-all duration-400 ease-out ${isSearchFocused || isSearching
                          ? "scale-[1.01] bg-[#FAFAF7]/50"
                          : ""
                          }`}
                      />
                      {/* Animated bottom border line */}
                      <div
                        className={`absolute bottom-0 left-0 h-0.5 bg-[#3A643B] transition-all duration-400 ease-out ${isSearchFocused || isSearching ? "w-full" : "w-0"
                          }`}
                      />
                    </div>
                    {searchQuery && (
                      <button
                        type="submit"
                        className={`absolute right-0 top-1/2 -translate-y-1/2 px-4 py-2 text-sm font-semibold uppercase tracking-wider text-[#3A643B] hover:text-[#1E3024] transition-all duration-400 ease-out animate-[fadeIn_400ms_cubic-bezier(0.16,1,0.3,1)] ${isSearching ? "scale-105" : "hover:scale-105"
                          }`}
                        aria-label="Search"
                      >
                        Search
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>

            {/* Center: Logo - Absolute Centered - Bigger on Mobile */}
            <div className="absolute left-1/2 -translate-x-1/2 flex justify-center">
              <Link
                href="/"
                className="flex items-center group"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Image
                  src="/T3.png"
                  alt="Trichomes Logo"
                  width={120}
                  height={80}
                  className="w-[120px] h-[120px] sm:w-[180px] sm:h-[135px] lg:w-[140px] lg:h-[110px] object-contain mt-3 transition-transform duration-300 group-hover:scale-105"
                />
              </Link>
            </div>

            {/* Right: Icons - Desktop Wishlist, User, Cart */}
            <div className="flex-1 flex items-center justify-end space-x-3 sm:space-x-4 lg:space-x-4 min-w-0">
              {/* Desktop Wishlist - Visible on desktop */}
              <Link
                href="/wishlist"
                className="relative hidden lg:block text-[#1E3024] hover:text-[#3A643B] transition-all duration-200 hover:scale-110 p-1.5 flex-shrink-0"
                title="Wishlist"
                onClick={() => setMobileMenuOpen(false)}
              >
                <HeartIcon className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-[#3A643B] text-white text-[10px] h-4 w-4 flex items-center justify-center font-bold">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* User Profile / Auth */}
              <div className="relative" ref={userMenuRef}>
                {isAuthLoading ? (
                  <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
                ) : isAuthenticated && user ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-2 transition-all duration-200 hover:scale-105 p-1"
                      title={`${user.first_name || ''} ${user.last_name || ''}`}
                    >
                      {/* Avatar */}
                      <div className="w-8 h-8 rounded-full bg-[#3A643B] flex items-center justify-center text-white text-sm font-semibold uppercase overflow-hidden">
                        {user.first_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                      </div>
                    </button>

                    {/* User Dropdown Menu */}
                    {userMenuOpen && (
                      <>
                        <button
                          type="button"
                          className="fixed inset-0 z-40"
                          onClick={() => setUserMenuOpen(false)}
                          aria-label="Close user menu"
                        />
                        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 animate-[fadeInUp_200ms_ease-out]">
                          {/* User Info */}
                          <div className="px-4 py-3 border-b border-gray-100">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {user.first_name} {user.last_name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {user.email}
                            </p>
                          </div>

                          {/* Menu Items */}
                          <div className="py-1">
                            <Link
                              href="/profile"
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                              onClick={() => setUserMenuOpen(false)}
                            >
                              <UserIcon className="w-4 h-4" />
                              My Profile
                            </Link>
                            <Link
                              href="/order-history"
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                              onClick={() => setUserMenuOpen(false)}
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <title>Orders</title>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                              </svg>
                              My Orders
                            </Link>
                            <Link
                              href="/wishlist"
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                              onClick={() => setUserMenuOpen(false)}
                            >
                              <HeartIcon className="w-4 h-4" />
                              Wishlist
                            </Link>
                          </div>

                          {/* Sign Out */}
                          <div className="border-t border-gray-100 pt-1">
                            <button
                              type="button"
                              onClick={async () => {
                                setUserMenuOpen(false);
                                await logout();
                                router.push('/');
                              }}
                              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <title>Sign Out</title>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                              </svg>
                              Sign Out
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <Link
                    href="/auth/signin"
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-[#3A643B] hover:text-[#1E3024] border border-[#3A643B] rounded-full hover:bg-[#3A643B]/5 transition-all duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <UserIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">Sign In</span>
                  </Link>
                )}
              </div>

              {/* Cart */}
              <Link
                href="/cart"
                className="relative text-[#1E3024] hover:text-[#3A643B] transition-all duration-200 hover:scale-110 p-2 sm:p-1.5 flex-shrink-0"
                title="Shopping Cart"
                onClick={() => setMobileMenuOpen(false)}
              >
                <BagIcon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-5 lg:h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-[#3A643B] text-white text-[10px] sm:text-xs h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar moved into slide-out menu */}

      {/* Mobile Navigation Menu */}
      {(mobileMenuOpen || mobileMenuClosing) && (
        <>
          {/* Overlay with fade animation */}
          <button
            type="button"
            className={`fixed inset-0 bg-[#1E3024]/50 z-40 lg:hidden transition-opacity duration-300 ease-out ${mobileMenuClosing ? "opacity-0" : "opacity-100"
              }`}
            onClick={toggleMobileMenu}
            style={{
              animation: mobileMenuClosing
                ? "none"
                : "fadeIn 300ms cubic-bezier(0.16, 1, 0.3, 1)",
            }}
            aria-label="Close mobile menu"
          />

          {/* Mobile Menu with slide-in/out animation */}
          <div
            className={`fixed top-0 left-0 h-full w-full max-w-sm bg-[#FAFAF7] shadow-2xl z-50 lg:hidden overflow-y-auto transition-transform duration-300 ease-out ${mobileMenuClosing ? "-translate-x-full" : "translate-x-0"
              }`}
            style={{
              animation: !mobileMenuClosing
                ? "slideInFromLeft 300ms cubic-bezier(0.16, 1, 0.3, 1)"
                : "none",
            }}
          >
            <div className="flex flex-col h-full w-full">
              {/* Menu Header */}
              <div className="flex items-center justify-between px-4 py-4 border-b border-[#1E3024]/10 bg-[#FAFAF7] sticky top-0">
                <h2 className="text-lg font-heading text-[#1E3024] uppercase tracking-wider">
                  Menu
                </h2>
                <button
                  type="button"
                  onClick={toggleMobileMenu}
                  className="text-[#1E3024] hover:text-[#3A643B] transition-colors duration-200 p-2"
                  aria-label="Close menu"
                >
                  <MenuIcon isOpen={true} className="w-6 h-6" />
                </button>
              </div>

              {/* Mobile Search inside slide-out menu */}
              <div className="px-4 py-4 border-b border-[#1E3024]/10 bg-[#FAFAF7]">
                <SearchBar
                  initialQuery={searchQuery}
                  placeholder="Search products..."
                  showSuggestions={true}
                  showHistory={true}
                  showPopular={true}
                  onSearch={(q) => {
                    handleSearchFromBar(q);
                    toggleMobileMenu();
                  }}
                  size="md"
                  className="w-full"
                />
              </div>

              {/* Menu Items */}
              <div className="flex-1 px-4 py-6 space-y-1">
                {/* About Us */}
                <div>
                  <button
                    type="button"
                    onClick={() => toggleMobileSubmenu("about")}
                    className={`w-full flex items-center justify-between py-3 px-4 text-left text-base font-semibold uppercase tracking-wider transition-colors duration-150 ease-out ${isActive("/about")
                      ? "text-[#3A643B] bg-[#E6E4C6]/30"
                      : "text-[#1E3024] hover:bg-[#E6E4C6]/20"
                      }`}
                  >
                    <span>About Us</span>
                    <ChevronRightIcon
                      className={`w-4 h-4 transition-transform duration-300 ease-out ${mobileExpandedMenu === "about"
                        ? "rotate-90"
                        : "rotate-0"
                        }`}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-400 ease-out ${mobileExpandedMenu === "about"
                      ? "max-h-96 opacity-100"
                      : "max-h-0 opacity-0"
                      }`}
                  >
                    {mobileExpandedMenu === "about" && dropdownMenus.about && (
                      <div className="pl-4 space-y-1 border-l-2 border-[#3A643B]/20 pt-2 pb-1">
                        {dropdownMenus.about.items.map((item, index) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="block py-2.5 px-4 text-sm text-[#1E3024]/80 hover:text-[#3A643B] hover:bg-[#E6E4C6]/20 transition-colors duration-150 ease-out transform hover:translate-x-1"
                            onClick={toggleMobileMenu}
                            style={{
                              animation: `fadeInUp 300ms cubic-bezier(0.16, 1, 0.3, 1) ${index * 30}ms both`,
                            }}
                          >
                            <div className="font-medium">{item.label}</div>
                            {item.description && (
                              <div className="text-xs text-[#1E3024]/60 mt-0.5">
                                {item.description}
                              </div>
                            )}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Brands */}
                <div>
                  <button
                    type="button"
                    onClick={() => toggleMobileSubmenu("brands")}
                    className={`w-full flex items-center justify-between py-3 px-4 text-left text-base font-semibold uppercase tracking-wider transition-colors duration-150 ease-out ${isActive("/brands")
                      ? "text-[#3A643B] bg-[#E6E4C6]/30"
                      : "text-[#1E3024] hover:bg-[#E6E4C6]/20"
                      }`}
                  >
                    <span>Brands</span>
                    <ChevronRightIcon
                      className={`w-4 h-4 transition-transform duration-300 ease-out ${mobileExpandedMenu === "brands"
                        ? "rotate-90"
                        : "rotate-0"
                        }`}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-400 ease-out ${mobileExpandedMenu === "brands"
                      ? "max-h-96 opacity-100"
                      : "max-h-0 opacity-0"
                      }`}
                  >
                    {mobileExpandedMenu === "brands" &&
                      dropdownMenus.brands && (
                        <div className="pl-4 space-y-1 border-l-2 border-[#3A643B]/20 pt-2 pb-1">
                          {dropdownMenus.brands.items.map((item, index) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              className="block py-2.5 px-4 text-sm text-[#1E3024]/80 hover:text-[#3A643B] hover:bg-[#E6E4C6]/20 transition-colors duration-150 ease-out transform hover:translate-x-1"
                              onClick={toggleMobileMenu}
                              style={{
                                animation: `fadeInUp 300ms cubic-bezier(0.16, 1, 0.3, 1) ${index * 30}ms both`,
                              }}
                            >
                              <div className="font-medium">{item.label}</div>
                              {item.description && (
                                <div className="text-xs text-[#1E3024]/60 mt-0.5">
                                  {item.description}
                                </div>
                              )}
                            </Link>
                          ))}
                        </div>
                      )}
                  </div>
                </div>

                {/* Face */}
                <div>
                  <button
                    type="button"
                    onClick={() => toggleMobileSubmenu("face")}
                    className={`w-full flex items-center justify-between py-3 px-4 text-left text-base font-semibold uppercase tracking-wider transition-colors duration-150 ease-out ${pathname.includes("face-care")
                      ? "text-[#3A643B] bg-[#E6E4C6]/30"
                      : "text-[#1E3024] hover:bg-[#E6E4C6]/20"
                      }`}
                  >
                    <span>Face</span>
                    <ChevronRightIcon
                      className={`w-4 h-4 transition-transform duration-300 ease-out ${mobileExpandedMenu === "face" ? "rotate-90" : "rotate-0"
                        }`}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-400 ease-out ${mobileExpandedMenu === "face"
                      ? "max-h-96 opacity-100"
                      : "max-h-0 opacity-0"
                      }`}
                  >
                    {mobileExpandedMenu === "face" && dropdownMenus.face && (
                      <div className="pl-4 space-y-1 border-l-2 border-[#3A643B]/20 pt-2 pb-1">
                        {dropdownMenus.face.items.map((item, index) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="block py-2.5 px-4 text-sm text-[#1E3024]/80 hover:text-[#3A643B] hover:bg-[#E6E4C6]/20 transition-colors duration-150 ease-out transform hover:translate-x-1"
                            onClick={toggleMobileMenu}
                            style={{
                              animation: `fadeInUp 300ms cubic-bezier(0.16, 1, 0.3, 1) ${index * 30}ms both`,
                            }}
                          >
                            <div className="font-medium">{item.label}</div>
                            {item.description && (
                              <div className="text-xs text-[#1E3024]/60 mt-0.5">
                                {item.description}
                              </div>
                            )}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bath & Body */}
                <div>
                  <button
                    type="button"
                    onClick={() => toggleMobileSubmenu("body")}
                    className={`w-full flex items-center justify-between py-3 px-4 text-left text-base font-semibold uppercase tracking-wider transition-colors duration-150 ease-out ${pathname.includes("body-care")
                      ? "text-[#3A643B] bg-[#E6E4C6]/30"
                      : "text-[#1E3024] hover:bg-[#E6E4C6]/20"
                      }`}
                  >
                    <span>Bath & Body</span>
                    <ChevronRightIcon
                      className={`w-4 h-4 transition-transform duration-300 ease-out ${mobileExpandedMenu === "body" ? "rotate-90" : "rotate-0"
                        }`}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-400 ease-out ${mobileExpandedMenu === "body"
                      ? "max-h-96 opacity-100"
                      : "max-h-0 opacity-0"
                      }`}
                  >
                    {mobileExpandedMenu === "body" && dropdownMenus.body && (
                      <div className="pl-4 space-y-1 border-l-2 border-[#3A643B]/20 pt-2 pb-1">
                        {dropdownMenus.body.items.map((item, index) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="block py-2.5 px-4 text-sm text-[#1E3024]/80 hover:text-[#3A643B] hover:bg-[#E6E4C6]/20 transition-colors duration-150 ease-out transform hover:translate-x-1"
                            onClick={toggleMobileMenu}
                            style={{
                              animation: `fadeInUp 300ms cubic-bezier(0.16, 1, 0.3, 1) ${index * 30}ms both`,
                            }}
                          >
                            <div className="font-medium">{item.label}</div>
                            {item.description && (
                              <div className="text-xs text-[#1E3024]/60 mt-0.5">
                                {item.description}
                              </div>
                            )}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* All Products */}
                <Link
                  href="/products"
                  className={`block py-3 px-4 text-base font-semibold uppercase tracking-wider transition-colors duration-150 ease-out ${isActive("/products")
                    ? "text-[#3A643B] bg-[#E6E4C6]/30"
                    : "text-[#1E3024] hover:bg-[#E6E4C6]/20"
                    }`}
                  onClick={toggleMobileMenu}
                >
                  All Products
                </Link>

                {/* Book a Consultation */}
                <Link
                  href="/consultation"
                  className={`block py-3 px-4 text-base font-semibold uppercase tracking-wider transition-colors duration-150 ease-out ${isActive("/consultation")
                    ? "text-[#3A643B] bg-[#E6E4C6]/30"
                    : "text-[#1E3024] hover:bg-[#E6E4C6]/20"
                    }`}
                  onClick={toggleMobileMenu}
                >
                  Book a Consultation
                </Link>

                {/* Rewards */}
                <Link
                  href="/rewards"
                  className={`block py-3 px-4 text-base font-semibold uppercase tracking-wider transition-colors duration-150 ease-out ${isActive("/rewards")
                    ? "text-[#3A643B] bg-[#E6E4C6]/30"
                    : "text-[#1E3024] hover:bg-[#E6E4C6]/20"
                    }`}
                  onClick={toggleMobileMenu}
                >
                  Rewards
                </Link>

                {/* Auth Section */}
                <div className="border-t border-[#1E3024]/10 mt-4 pt-4">
                  {isAuthenticated && user ? (
                    <>
                      {/* User Info */}
                      <div className="px-4 py-3 mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#3A643B] flex items-center justify-center text-white text-lg font-semibold uppercase">
                            {user.first_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[#1E3024]">
                              {user.first_name} {user.last_name}
                            </p>
                            <p className="text-xs text-[#1E3024]/60 truncate max-w-[180px]">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Account Links */}
                      <Link
                        href="/profile"
                        className={`flex items-center gap-3 py-3 px-4 text-sm font-medium transition-colors duration-150 ease-out ${isActive("/profile")
                          ? "text-[#3A643B] bg-[#E6E4C6]/30"
                          : "text-[#1E3024] hover:bg-[#E6E4C6]/20"
                          }`}
                        onClick={toggleMobileMenu}
                      >
                        <UserIcon className="w-5 h-5" />
                        My Profile
                      </Link>
                      <Link
                        href="/order-history"
                        className={`flex items-center gap-3 py-3 px-4 text-sm font-medium transition-colors duration-150 ease-out ${isActive("/order-history")
                          ? "text-[#3A643B] bg-[#E6E4C6]/30"
                          : "text-[#1E3024] hover:bg-[#E6E4C6]/20"
                          }`}
                        onClick={toggleMobileMenu}
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <title>Orders</title>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        My Orders
                      </Link>

                      {/* Sign Out */}
                      <button
                        type="button"
                        onClick={async () => {
                          toggleMobileMenu();
                          await logout();
                          router.push('/');
                        }}
                        className="flex items-center gap-3 w-full py-3 px-4 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors duration-150 ease-out"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <title>Sign Out</title>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <div className="px-4 py-2 space-y-2">
                      <Link
                        href="/auth/signin"
                        className="flex items-center justify-center gap-2 w-full py-3 px-4 text-sm font-semibold text-white bg-[#3A643B] rounded-lg hover:bg-[#2d4e2e] transition-colors duration-150 ease-out"
                        onClick={toggleMobileMenu}
                      >
                        <UserIcon className="w-4 h-4" />
                        Sign In
                      </Link>
                      <Link
                        href="/auth/signup"
                        className="flex items-center justify-center gap-2 w-full py-3 px-4 text-sm font-semibold text-[#3A643B] border border-[#3A643B] rounded-lg hover:bg-[#3A643B]/5 transition-colors duration-150 ease-out"
                        onClick={toggleMobileMenu}
                      >
                        Create Account
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Blur Overlay - Covers page content below header when search is focused - Mobile only */}
      {isSearchFocused && (
        <button
          type="button"
          className="lg:hidden fixed left-0 right-0 bottom-0 bg-[#1E3024]/10 backdrop-blur-sm z-[45] transition-opacity duration-250 ease-out animate-[fadeIn_250ms_cubic-bezier(0.16,1,0.3,1)] pointer-events-auto"
          onClick={handleSearchBlur}
          style={{
            top: "var(--header-height, auto)",
            height: "calc(100vh - var(--header-height, 0px))",
          }}
          aria-label="Close search overlay"
        />
      )}

      {/* Desktop Navigation */}
      <nav className="border-b border-gray-200 hidden md:block mx-auto w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8 flex justify-center items-center h-14 space-x-20">
          <NavLink
            href="/about"
            hasDropdown
            isActive={isActive("/about")}
            onMouseEnter={() => handleDropdownEnter("about")}
            onMouseLeave={handleDropdownLeave}
            isOpen={openDropdown === "about"}
            dropdownMenu={dropdownMenus.about}
            onCloseDropdown={() => setOpenDropdown(null)}
          >
            About Us
          </NavLink>

          <NavLink
            href="/brands"
            hasDropdown
            isActive={isActive("/brands")}
            onMouseEnter={() => handleDropdownEnter("brands")}
            onMouseLeave={handleDropdownLeave}
            isOpen={openDropdown === "brands"}
            dropdownMenu={dropdownMenus.brands}
            onCloseDropdown={() => setOpenDropdown(null)}
          >
            Brands
          </NavLink>

          <NavLink
            href="/products?category=face-care"
            hasDropdown
            isActive={pathname.includes("face-care")}
            onMouseEnter={() => handleDropdownEnter("face")}
            onMouseLeave={handleDropdownLeave}
            isOpen={openDropdown === "face"}
            dropdownMenu={dropdownMenus.face}
            onCloseDropdown={() => setOpenDropdown(null)}
          >
            Face
          </NavLink>

          <NavLink
            href="/products?category=body-care"
            hasDropdown
            isActive={pathname.includes("body-care")}
            onMouseEnter={() => handleDropdownEnter("body")}
            onMouseLeave={handleDropdownLeave}
            isOpen={openDropdown === "body"}
            dropdownMenu={dropdownMenus.body}
            onCloseDropdown={() => setOpenDropdown(null)}
          >
            Bath & Body
          </NavLink>

          <NavLink href="/products" isActive={isActive("/products")}>
            All Products
          </NavLink>

          <NavLink href="/consultation" isActive={isActive("/consultation")}>
            Book a Consultation
          </NavLink>
          <NavLink href="/rewards" isActive={isActive("/rewards")}>
            Rewards
          </NavLink>
        </div>
      </nav>
    </header>
  );
};
