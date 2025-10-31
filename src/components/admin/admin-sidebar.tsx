'use client';

import React from 'react';
import { InventoryIcon, ProductsIcon, OrdersIcon, CustomersIcon, PromotionsIcon, PermissionsIcon } from '../ui/icons';

type AdminView = 'analytics' | 'products' | 'orders' | 'customers' | 'promotions' | 'permissions';

interface AdminSidebarProps {
  activeView: AdminView;
  onNavigate: (view: AdminView) => void;
}

const navItems: { view: AdminView; label: string; icon: React.ReactNode }[] = [
  { view: 'analytics', label: 'Inventory Analytics', icon: <InventoryIcon /> },
  { view: 'products', label: 'Products', icon: <ProductsIcon /> },
  { view: 'orders', label: 'Orders', icon: <OrdersIcon /> },
  { view: 'customers', label: 'Customers', icon: <CustomersIcon /> },
  { view: 'promotions', label: 'Promotions', icon: <PromotionsIcon /> },
  { view: 'permissions', label: 'Permissions', icon: <PermissionsIcon /> },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeView, onNavigate }) => {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0 min-h-screen sticky top-0">
      <div className="h-20 flex items-center px-6">
        <h2 className="text-lg font-semibold text-gray-800">Admin Panel</h2>
      </div>
      <nav className="px-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.view}>
              <button
                onClick={() => onNavigate(item.view)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left font-medium transition-colors ${
                  activeView === item.view
                    ? 'bg-green-100 text-[#38761d]'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="text-xs text-gray-500 text-center">
          <p>Admin Dashboard v1.0</p>
        </div>
      </div>
    </aside>
  );
};