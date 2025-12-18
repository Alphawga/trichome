"use client";

import Image from "next/image";
import Link from "next/link";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CustomersIcon,
  DocumentTextIcon,
  ExportIcon,
  FilterIcon,
  OrdersIcon,
  ProductsIcon,
  SearchIcon,
  ViewAllArrowIcon,
} from "@/components/ui/icons";
import { trpc } from "@/utils/trpc";
import { exportToCSV, type CSVColumn } from "@/utils/csv-export";

interface AdminProduct {
  id: string;
  imageUrl: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: "In stock" | "Out of stock";
  totalSold: number;
}

interface StatCardProps {
  title: string;
  value: string;
  trend: string;
  trendPositive?: boolean;
  icon: React.ReactNode;
}

interface ViewAllCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  href: string;
}

interface ProductRowProps {
  product: AdminProduct;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  total: number;
  status: string;
  date: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, trend, icon }) => {
  const trendValue = Number.parseFloat(trend);
  const isPositive = trendValue >= 0;

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <div className="text-gray-400">{icon}</div>
      </div>
      <div className="flex items-center text-sm mt-4">
        <span
          className={`flex items-center mr-2 ${isPositive ? "text-green-600" : "text-red-600"}`}
        >
          {isPositive ? (
            <ArrowUpIcon className="w-4 h-4" />
          ) : (
            <ArrowDownIcon className="w-4 h-4" />
          )}
          {Math.abs(trendValue)}%
        </span>
        <span className="text-gray-500">Since last month</span>
      </div>
    </div>
  );
};

const ViewAllCard: React.FC<ViewAllCardProps> = ({ title, value, icon, href }) => (
  <div className="bg-white p-6 rounded-lg border border-gray-200">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-3xl font-bold mt-2">{value}</p>
      </div>
      <div className="text-gray-400">{icon}</div>
    </div>
    <Link
      href={href}
      className="flex items-center text-sm mt-4 text-gray-500 hover:text-gray-800 transition-colors"
    >
      View all <ViewAllArrowIcon className="ml-1" />
    </Link>
  </div>
);

const ProductRow: React.FC<ProductRowProps> = ({ product }) => (
  <tr className="border-b last:border-0 hover:bg-gray-50">
    <td className="p-4 flex items-center">
      <div className="relative w-10 h-10 mr-4 flex-shrink-0">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="rounded-md object-cover"
        />
      </div>
      <span className="font-medium">{product.name}</span>
    </td>
    <td className="p-4 text-gray-600">{product.category}</td>
    <td className="p-4 text-gray-600">₦{product.price.toLocaleString()}</td>
    <td className="p-4 text-gray-600">{product.stock}pcs</td>
    <td className="p-4">
      <span
        className={`px-2 py-1 text-xs font-semibold rounded-full ${product.status === "In stock"
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800"
          }`}
      >
        {product.status}
      </span>
    </td>
  </tr>
);

const getStatusColor = (status: string) => {
  switch (status) {
    case "PENDING":
      return "bg-yellow-100 text-yellow-800";
    case "PROCESSING":
      return "bg-blue-100 text-blue-800";
    case "SHIPPED":
      return "bg-purple-100 text-purple-800";
    case "DELIVERED":
      return "bg-green-100 text-green-800";
    case "CANCELLED":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch dashboard stats
  const dashboardStatsQuery = trpc.getDashboardStats.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  // Fetch top products
  const topProductsQuery = trpc.getTopProducts.useQuery(
    { limit: 10 },
    { refetchOnWindowFocus: false },
  );

  // Fetch recent orders
  const recentOrdersQuery = trpc.getOrders.useQuery(
    { page: 1, limit: 5 },
    { refetchOnWindowFocus: false },
  );

  const stats = dashboardStatsQuery.data;
  const topProducts = topProductsQuery.data || [];

  // Transform recent orders for display
  const recentOrders: RecentOrder[] = (recentOrdersQuery.data?.orders || []).map((order) => ({
    id: order.id,
    orderNumber: order.order_number,
    customerName: order.user
      ? `${order.user.first_name} ${order.user.last_name}`.trim()
      : `${order.first_name} ${order.last_name}`.trim(),
    total: Number(order.total),
    status: order.status,
    date: new Date(order.created_at).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
  }));

  const filteredProducts = topProducts.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleExportCSV = () => {
    if (topProducts.length === 0) {
      toast.error("No products to export");
      return;
    }

    const columns: CSVColumn<AdminProduct>[] = [
      { key: "name", label: "Product Name" },
      { key: "category", label: "Category" },
      { key: (p) => `₦${p.price.toLocaleString()}`, label: "Price" },
      { key: "stock", label: "Stock" },
      { key: "status", label: "Status" },
      { key: "totalSold", label: "Total Sold" },
    ];

    exportToCSV(topProducts, columns, `top-products-${new Date().toISOString().split("T")[0]}`);
  };

  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Dashboard Overview
        </h1>
        <p className="text-gray-600">
          Welcome back! Here's what's happening with your store today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {dashboardStatsQuery.isLoading ? (
          [1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-lg border border-gray-200 animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-16 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
            </div>
          ))
        ) : stats ? (
          <>
            <StatCard
              title="Products sold"
              value={stats.productsSold.value.toString()}
              trend={stats.productsSold.trend}
              icon={<ProductsIcon />}
            />
            <StatCard
              title="Completed orders"
              value={stats.completedOrders.value.toString()}
              trend={stats.completedOrders.trend}
              icon={<OrdersIcon />}
            />
            <ViewAllCard
              title="Pending orders"
              value={stats.pendingOrders.toString()}
              icon={<DocumentTextIcon />}
              href="/admin/orders?status=PENDING"
            />
            <ViewAllCard
              title="Out of stock items"
              value={stats.outOfStockItems.toString()}
              icon={<CustomersIcon />}
              href="/admin/products?status=INACTIVE"
            />
          </>
        ) : (
          <div className="col-span-4 text-center py-8 text-gray-500">
            Failed to load dashboard statistics
          </div>
        )}
      </div>

      {/* Recent Orders Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Recent Orders</h2>
          <Link
            href="/admin/orders"
            className="flex items-center text-sm text-[#38761d] hover:text-[#2d5a16] font-medium transition-colors"
          >
            View all orders <ViewAllArrowIcon className="ml-1" />
          </Link>
        </div>
        <div className="bg-white rounded-lg border overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 font-semibold text-sm text-gray-700">Order ID</th>
                <th className="p-4 font-semibold text-sm text-gray-700">Customer</th>
                <th className="p-4 font-semibold text-sm text-gray-700">Total</th>
                <th className="p-4 font-semibold text-sm text-gray-700">Status</th>
                <th className="p-4 font-semibold text-sm text-gray-700">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrdersQuery.isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-6 h-6 border-2 border-[#38761d] border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-gray-600">Loading orders...</span>
                    </div>
                  </td>
                </tr>
              ) : recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <tr key={order.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="p-4">
                      <Link
                        href={`/admin/orders?search=${order.orderNumber}`}
                        className="text-[#38761d] hover:underline font-medium"
                      >
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="p-4 text-gray-600">{order.customerName}</td>
                    <td className="p-4 font-medium">₦{order.total.toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600">{order.date}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    No orders yet. Orders will appear here when customers place them.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Products Section */}
      <div>
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
          <h2 className="text-xl font-bold">Top performing products</h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <SearchIcon />
              </div>
            </div>
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 font-medium transition-colors"
            >
              <FilterIcon /> Filter (last month)
            </button>
            <button
              type="button"
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 border border-transparent rounded-lg bg-[#38761d] text-white hover:bg-opacity-90 font-medium transition-colors"
            >
              <ExportIcon /> Export CSV
            </button>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg border overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 font-semibold text-sm text-gray-700">
                  Product
                </th>
                <th className="p-4 font-semibold text-sm text-gray-700">
                  Category
                </th>
                <th className="p-4 font-semibold text-sm text-gray-700">
                  Price
                </th>
                <th className="p-4 font-semibold text-sm text-gray-700">
                  Stock
                </th>
                <th className="p-4 font-semibold text-sm text-gray-700">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {topProductsQuery.isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-6 h-6 border-2 border-[#38761d] border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-gray-600">Loading products...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <ProductRow key={product.id} product={product} />
                ))
              ) : topProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    No products available yet. Start by adding some products!
                  </td>
                </tr>
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    No products found matching "{searchTerm}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredProducts.length > 10 && (
          <div className="mt-4 flex justify-center">
            <Link
              href="/admin/products"
              className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              View all products
            </Link>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/products?action=new"
            className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors block"
          >
            <div className="text-green-600 mb-2">
              <ProductsIcon />
            </div>
            <p className="font-medium">Add Product</p>
            <p className="text-sm text-gray-500">
              Create a new product listing
            </p>
          </Link>

          <Link
            href="/admin/orders"
            className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors block"
          >
            <div className="text-blue-600 mb-2">
              <OrdersIcon />
            </div>
            <p className="font-medium">View Orders</p>
            <p className="text-sm text-gray-500">Manage customer orders</p>
          </Link>

          <Link
            href="/admin/customers"
            className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors block"
          >
            <div className="text-purple-600 mb-2">
              <CustomersIcon />
            </div>
            <p className="font-medium">Customer List</p>
            <p className="text-sm text-gray-500">View customer details</p>
          </Link>

          <Link
            href="/admin/analytics"
            className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors block"
          >
            <div className="text-orange-600 mb-2">
              <DocumentTextIcon />
            </div>
            <p className="font-medium">View Analytics</p>
            <p className="text-sm text-gray-500">View sales reports</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
