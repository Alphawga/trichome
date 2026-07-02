"use client";

import { CloudinaryImage as Image } from "@/components/ui/cloudinary-image";
import Link from "next/link";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { type Column, DataTable } from "@/components/ui/data-table";
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
import { StatusBadge, type StatusVariant } from "@/components/ui/status-badge";
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
    <Card>
      <CardContent>
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
      </CardContent>
    </Card>
  );
};

const ViewAllCard: React.FC<ViewAllCardProps> = ({ title, value, icon, href }) => (
  <Card>
    <CardContent>
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
    </CardContent>
  </Card>
);

const getOrderStatusVariant = (status: string): StatusVariant => {
  switch (status) {
    case "PENDING":
      return "warning";
    case "PROCESSING":
    case "SHIPPED":
      return "info";
    case "DELIVERED":
      return "success";
    case "CANCELLED":
      return "danger";
    default:
      return "neutral";
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

  const recentOrderColumns: Column<RecentOrder>[] = [
    {
      header: "Order ID",
      cell: (order) => (
        <Link
          href={`/admin/orders?search=${order.orderNumber}`}
          className="text-primary hover:underline font-medium"
        >
          {order.orderNumber}
        </Link>
      ),
    },
    {
      header: "Customer",
      cell: (order) => (
        <span className="text-gray-600">{order.customerName}</span>
      ),
    },
    {
      header: "Total",
      cell: (order) => (
        <span className="font-medium">₦{order.total.toLocaleString()}</span>
      ),
    },
    {
      header: "Status",
      cell: (order) => (
        <StatusBadge variant={getOrderStatusVariant(order.status)}>
          {order.status}
        </StatusBadge>
      ),
    },
    {
      header: "Date",
      cell: (order) => <span className="text-gray-600">{order.date}</span>,
    },
  ];

  const topProductColumns: Column<AdminProduct>[] = [
    {
      header: "Product",
      cell: (product) => (
        <div className="flex items-center">
          <div className="relative w-10 h-10 mr-4 flex-shrink-0">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="rounded-md object-cover"
            />
          </div>
          <span className="font-medium">{product.name}</span>
        </div>
      ),
    },
    {
      header: "Category",
      cell: (product) => (
        <span className="text-gray-600">{product.category}</span>
      ),
    },
    {
      header: "Price",
      cell: (product) => (
        <span className="text-gray-600">
          ₦{product.price.toLocaleString()}
        </span>
      ),
    },
    {
      header: "Stock",
      cell: (product) => (
        <span className="text-gray-600">{product.stock}pcs</span>
      ),
    },
    {
      header: "Status",
      cell: (product) => (
        <StatusBadge
          variant={product.status === "In stock" ? "success" : "danger"}
        >
          {product.status}
        </StatusBadge>
      ),
    },
  ];

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
            className="flex items-center text-sm text-primary hover:text-primary/80 font-medium transition-colors"
          >
            View all orders <ViewAllArrowIcon className="ml-1" />
          </Link>
        </div>
        <DataTable
          columns={recentOrderColumns}
          data={recentOrders}
          isLoading={recentOrdersQuery.isLoading}
          keyExtractor={(order) => order.id}
          emptyMessage="No orders yet. Orders will appear here when customers place them."
        />
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
              className="flex items-center gap-2 px-4 py-2 border border-transparent rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-medium transition-colors"
            >
              <ExportIcon /> Export CSV
            </button>
          </div>
        </div>

        {/* Products Table */}
        <DataTable
          columns={topProductColumns}
          data={filteredProducts}
          isLoading={topProductsQuery.isLoading}
          keyExtractor={(product) => product.id}
          emptyMessage={
            topProducts.length === 0
              ? "No products available yet. Start by adding some products!"
              : `No products found matching "${searchTerm}"`
          }
        />

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
