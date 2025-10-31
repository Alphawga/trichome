'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ArrowUpIcon, ViewAllArrowIcon, SearchIcon, FilterIcon, ExportIcon, DocumentTextIcon, OrdersIcon, CustomersIcon, ProductsIcon } from '@/components/ui/icons';

interface AdminProduct {
  id: number;
  imageUrl: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: 'In stock' | 'Out of stock';
  dateAdded: string;
}

interface StatCardProps {
  title: string;
  value: string;
  trend: string;
  icon: React.ReactNode;
}

interface ViewAllCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
}

interface ProductRowProps {
  product: AdminProduct;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, trend, icon }) => (
  <div className="bg-white p-6 rounded-lg border border-gray-200">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-3xl font-bold mt-2">{value}</p>
      </div>
      <div className="text-gray-400">{icon}</div>
    </div>
    <div className="flex items-center text-sm mt-4">
      <span className="flex items-center text-green-600 mr-2">
        <ArrowUpIcon className="w-4 h-4" />
        {trend}
      </span>
      <span className="text-gray-500">Since last month</span>
    </div>
  </div>
);

const ViewAllCard: React.FC<ViewAllCardProps> = ({ title, value, icon }) => (
  <div className="bg-white p-6 rounded-lg border border-gray-200">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-3xl font-bold mt-2">{value}</p>
      </div>
      <div className="text-gray-400">{icon}</div>
    </div>
    <button className="flex items-center text-sm mt-4 text-gray-500 hover:text-gray-800">
      View all <ViewAllArrowIcon className="ml-1" />
    </button>
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
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
        product.status === 'In stock' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {product.status}
      </span>
    </td>
  </tr>
);

export default function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data - will be replaced with tRPC calls
  const mockTopProducts: AdminProduct[] = Array.from({ length: 10 }, (_, i) => {
    const stock = Math.random() > 0.3 ? Math.floor(Math.random() * 200) + 1 : 0;
    return {
      id: i + 1,
      imageUrl: `https://picsum.photos/seed/${i + 20}/50/50`,
      name: 'La Roche-Posay Effaclar Purifying Foaming Gel',
      category: 'Cleansers',
      price: 15800.00,
      stock: stock,
      status: stock > 0 ? 'In stock' : 'Out of stock',
      dateAdded: `2023-10-${28-i}`
    };
  });

  const filteredProducts = mockTopProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportCSV = () => {
    console.log('Export CSV functionality will be implemented');
    // TODO: Implement CSV export
  };

  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your store today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Products sold" value="465" trend="8.2%" icon={<ProductsIcon />} />
        <StatCard title="Completed orders" value="465" trend="8.2%" icon={<OrdersIcon />} />
        <ViewAllCard title="Pending orders" value="12" icon={<DocumentTextIcon />} />
        <ViewAllCard title="Out of stock items" value="20" icon={<CustomersIcon />} />
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
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 font-medium transition-colors">
              <FilterIcon /> Filter (last month)
            </button>
            <button
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
                <th className="p-4 font-semibold text-sm text-gray-700">Product</th>
                <th className="p-4 font-semibold text-sm text-gray-700">Category</th>
                <th className="p-4 font-semibold text-sm text-gray-700">Price</th>
                <th className="p-4 font-semibold text-sm text-gray-700">Stock</th>
                <th className="p-4 font-semibold text-sm text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map(product => (
                  <ProductRow key={product.id} product={product} />
                ))
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
            <button className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
              Load more products
            </button>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="text-green-600 mb-2">
              <ProductsIcon />
            </div>
            <p className="font-medium">Add Product</p>
            <p className="text-sm text-gray-500">Create a new product listing</p>
          </button>

          <button className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="text-blue-600 mb-2">
              <OrdersIcon />
            </div>
            <p className="font-medium">View Orders</p>
            <p className="text-sm text-gray-500">Manage customer orders</p>
          </button>

          <button className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="text-purple-600 mb-2">
              <CustomersIcon />
            </div>
            <p className="font-medium">Customer List</p>
            <p className="text-sm text-gray-500">View customer details</p>
          </button>

          <button className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="text-orange-600 mb-2">
              <DocumentTextIcon />
            </div>
            <p className="font-medium">Generate Report</p>
            <p className="text-sm text-gray-500">Create sales reports</p>
          </button>
        </div>
      </div>
    </div>
  );
}