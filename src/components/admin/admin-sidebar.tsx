"use client";

import type React from "react";
import { useAuth } from "@/app/contexts/auth-context";
import type { Permission } from "@/lib/permissions";
import {
  AnalyticsIcon,
  BrandsIcon,
  CategoriesIcon,
  ConsultationsIcon,
  CustomersIcon,
  InventoryIcon,
  OrdersIcon,
  PermissionsIcon,
  ProductsIcon,
  PromotionsIcon,
  ReviewsIcon,
  SettingsIcon,
} from "../ui/icons";

interface AdminSidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  requiredPermission?: Permission;
}

const navItems: NavItem[] = [
  { path: "/admin", label: "Dashboard", icon: <InventoryIcon /> },
  { path: "/admin/products", label: "Products", icon: <ProductsIcon />, requiredPermission: "products.read" },
  { path: "/admin/categories", label: "Categories", icon: <CategoriesIcon />, requiredPermission: "categories.read" },
  { path: "/admin/brands", label: "Brands", icon: <BrandsIcon />, requiredPermission: "brands.read" },
  { path: "/admin/orders", label: "Orders", icon: <OrdersIcon />, requiredPermission: "orders.read" },
  { path: "/admin/customers", label: "Customers", icon: <CustomersIcon />, requiredPermission: "customers.read" },
  { path: "/admin/promotions", label: "Promotions", icon: <PromotionsIcon />, requiredPermission: "promotions.read" },
  { path: "/admin/consultations", label: "Consultations", icon: <ConsultationsIcon />, requiredPermission: "consultations.read" },
  { path: "/admin/reviews", label: "Reviews", icon: <ReviewsIcon />, requiredPermission: "reviews.read" },
  { path: "/admin/analytics", label: "Analytics", icon: <AnalyticsIcon /> },
  { path: "/admin/settings", label: "Settings", icon: <SettingsIcon />, requiredPermission: "settings.update" },
  { path: "/admin/permissions", label: "Permissions", icon: <PermissionsIcon />, requiredPermission: "users.manage_permissions" },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentPath,
  onNavigate,
}) => {
  const { hasPermission } = useAuth();

  // Filter nav items based on permissions
  const visibleNavItems = navItems.filter((item) => {
    if (!item.requiredPermission) return true;
    return hasPermission(item.requiredPermission);
  });

  const isActive = (itemPath: string) => {
    if (itemPath === "/admin") {
      return currentPath === "/admin";
    }
    return currentPath.startsWith(itemPath);
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 shrink-0 min-h-screen sticky top-0">
      <div className="h-20 flex items-center px-6">
        <h2 className="text-lg font-semibold text-gray-800">Admin Panel</h2>
      </div>
      <nav className="px-4">
        <ul className="space-y-2">
          {visibleNavItems.map((item) => (
            <li key={item.path}>
              <button
                type="button"
                onClick={() => onNavigate(item.path)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left font-medium transition-colors ${isActive(item.path)
                    ? "bg-green-100 text-[#38761d]"
                    : "text-gray-600 hover:bg-gray-100"
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
