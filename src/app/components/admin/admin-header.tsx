'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { LogoIcon, ChevronDownIcon } from '../ui/icons';

interface AdminHeaderProps {
  onExitAdmin?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onExitAdmin }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleExitAdmin = () => {
    if (onExitAdmin) {
      onExitAdmin();
    }
    setDropdownOpen(false);
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-20 h-20 flex items-center px-6 lg:px-8 flex-shrink-0">
      <div className="flex items-center">
        <LogoIcon />
        <span className="ml-2 text-xl font-medium text-[#4CAF50]">TRICHOMES</span>
        <span className="ml-3 text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">Admin</span>
      </div>

      <div className="ml-auto flex items-center space-x-4">
        {/* Notifications */}
        <button className="p-2 text-gray-400 hover:text-gray-600 relative">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM13 3L8 21l1-7H4l5-11h4z" />
          </svg>
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            3
          </span>
        </button>

        {/* User Menu */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100"
          >
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">A</span>
            </div>
            <span className="font-medium">Admin User</span>
            <ChevronDownIcon />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-50">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">Admin User</p>
                <p className="text-sm text-gray-500">admin@trichomes.com</p>
              </div>

              <Link
                href="/admin/profile"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setDropdownOpen(false)}
              >
                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Profile Settings
              </Link>

              <button
                onClick={handleExitAdmin}
                className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Back to Store
              </button>

              <div className="border-t border-gray-100 mt-1">
                <button
                  onClick={() => {
                    alert('Logout functionality will be implemented with authentication');
                    setDropdownOpen(false);
                  }}
                  className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};