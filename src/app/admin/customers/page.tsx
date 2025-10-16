'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { SearchIcon, FilterIcon, ExportIcon, EyeIcon, EditIcon, MailIcon, PhoneIcon } from '../../components/ui/icons';

// Temporary interfaces for migration
interface CustomerOrder {
  id: string;
  date: string;
  total: number;
  status: 'Completed' | 'Pending' | 'Cancelled';
}

interface AdminCustomer {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  location: string;
  joinDate: string;
  totalOrders: number;
  totalSpent: number;
  status: 'Active' | 'Inactive' | 'Blocked';
  lastOrder: string;
  recentOrders: CustomerOrder[];
  loyaltyPoints: number;
}

interface CustomerRowProps {
  customer: AdminCustomer;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onContact: (email: string) => void;
}

const CustomerRow: React.FC<CustomerRowProps> = ({ customer, onView, onEdit, onContact }) => (
  <tr className="border-b last:border-0 hover:bg-gray-50">
    <td className="p-4 flex items-center">
      <div className="relative w-10 h-10 mr-4 flex-shrink-0">
        <Image
          src={customer.avatar}
          alt={customer.name}
          fill
          className="rounded-full object-cover"
        />
      </div>
      <div>
        <span className="font-medium text-gray-900">{customer.name}</span>
        <p className="text-sm text-gray-500">ID: {customer.id}</p>
      </div>
    </td>
    <td className="p-4">
      <div>
        <span className="text-gray-900">{customer.email}</span>
        <p className="text-sm text-gray-500">{customer.phone}</p>
      </div>
    </td>
    <td className="p-4 text-gray-600">{customer.location}</td>
    <td className="p-4 text-gray-600">{customer.totalOrders}</td>
    <td className="p-4 text-gray-900 font-medium">₦{customer.totalSpent.toLocaleString()}</td>
    <td className="p-4 text-gray-600">{customer.loyaltyPoints}</td>
    <td className="p-4">
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
        customer.status === 'Active' ? 'bg-green-100 text-green-800' :
        customer.status === 'Inactive' ? 'bg-gray-100 text-gray-800' :
        'bg-red-100 text-red-800'
      }`}>
        {customer.status}
      </span>
    </td>
    <td className="p-4 text-gray-600">{customer.lastOrder}</td>
    <td className="p-4">
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onView(customer.id)}
          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
          title="View customer details"
        >
          <EyeIcon className="w-4 h-4" />
        </button>
        <button
          onClick={() => onEdit(customer.id)}
          className="p-1 text-gray-400 hover:text-green-600 transition-colors"
          title="Edit customer"
        >
          <EditIcon className="w-4 h-4" />
        </button>
        <button
          onClick={() => onContact(customer.email)}
          className="p-1 text-gray-400 hover:text-purple-600 transition-colors"
          title="Contact customer"
        >
          <MailIcon className="w-4 h-4" />
        </button>
      </div>
    </td>
  </tr>
);

export default function AdminCustomersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [locationFilter, setLocationFilter] = useState('All');
  const [sortBy, setSortBy] = useState('joinDate');

  // Mock data - will be replaced with tRPC calls
  const locations = ['Lagos', 'Abuja', 'Port Harcourt', 'Ibadan', 'Kano', 'Enugu'];

  const mockCustomers: AdminCustomer[] = Array.from({ length: 30 }, (_, i) => {
    const statuses: AdminCustomer['status'][] = ['Active', 'Inactive', 'Blocked'];
    const orderCount = Math.floor(Math.random() * 20) + 1;
    const spent = Math.floor(Math.random() * 500000) + 10000;

    const recentOrders: CustomerOrder[] = Array.from({ length: Math.min(orderCount, 5) }, (_, j) => ({
      id: `ORD-${String((i * 5) + j + 1).padStart(4, '0')}`,
      date: `2023-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      total: Math.floor(Math.random() * 100000) + 5000,
      status: ['Completed', 'Pending', 'Cancelled'][Math.floor(Math.random() * 3)] as CustomerOrder['status']
    }));

    return {
      id: i + 1,
      name: `Customer ${i + 1}`,
      email: `customer${i + 1}@example.com`,
      phone: `+234${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      avatar: `https://picsum.photos/seed/${i + 100}/80/80`,
      location: locations[Math.floor(Math.random() * locations.length)],
      joinDate: `2023-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      totalOrders: orderCount,
      totalSpent: spent,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      lastOrder: `2023-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      recentOrders: recentOrders,
      loyaltyPoints: Math.floor(spent / 1000)
    };
  });

  const filteredCustomers = mockCustomers.filter(customer => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm);
    const matchesStatus = statusFilter === 'All' || customer.status === statusFilter;
    const matchesLocation = locationFilter === 'All' || customer.location === locationFilter;
    return matchesSearch && matchesStatus && matchesLocation;
  });

  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'totalSpent':
        return b.totalSpent - a.totalSpent;
      case 'totalOrders':
        return b.totalOrders - a.totalOrders;
      case 'joinDate':
      default:
        return new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime();
    }
  });

  const handleViewCustomer = (id: number) => {
    console.log('View customer:', id);
    // TODO: Navigate to customer detail view
  };

  const handleEditCustomer = (id: number) => {
    console.log('Edit customer:', id);
    // TODO: Navigate to customer edit form
  };

  const handleContactCustomer = (email: string) => {
    console.log('Contact customer:', email);
    // TODO: Open email client or messaging system
  };

  const handleExportCSV = () => {
    console.log('Export customers CSV');
    // TODO: Implement CSV export
  };

  const statuses = ['All', 'Active', 'Inactive', 'Blocked'];
  const locationOptions = ['All', ...locations];

  // Calculate stats
  const activeCustomers = mockCustomers.filter(c => c.status === 'Active').length;
  const totalRevenue = mockCustomers.reduce((sum, c) => sum + c.totalSpent, 0);
  const avgOrderValue = totalRevenue / mockCustomers.reduce((sum, c) => sum + c.totalOrders, 0);
  const totalOrders = mockCustomers.reduce((sum, c) => sum + c.totalOrders, 0);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Customers Management</h1>
        <p className="text-gray-600">Manage customer relationships and data</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <div className="w-6 h-6 text-blue-600">👥</div>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Total Customers</p>
              <p className="text-2xl font-bold">{mockCustomers.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <div className="w-6 h-6 text-green-600">✅</div>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Active Customers</p>
              <p className="text-2xl font-bold">{activeCustomers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <div className="w-6 h-6 text-purple-600">💰</div>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold">₦{totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <div className="w-6 h-6 text-orange-600">📊</div>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Avg Order Value</p>
              <p className="text-2xl font-bold">₦{Math.round(avgOrderValue).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search customers by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <SearchIcon />
            </div>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none"
          >
            {statuses.map(status => (
              <option key={status} value={status}>{status} Status</option>
            ))}
          </select>

          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none"
          >
            {locationOptions.map(location => (
              <option key={location} value={location}>{location} Location</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none"
          >
            <option value="joinDate">Sort by Join Date</option>
            <option value="name">Sort by Name</option>
            <option value="totalSpent">Sort by Total Spent</option>
            <option value="totalOrders">Sort by Total Orders</option>
          </select>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 font-medium transition-colors"
          >
            <ExportIcon /> Export CSV
          </button>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-lg border overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-semibold text-sm text-gray-700">Customer</th>
              <th className="p-4 font-semibold text-sm text-gray-700">Contact</th>
              <th className="p-4 font-semibold text-sm text-gray-700">Location</th>
              <th className="p-4 font-semibold text-sm text-gray-700">Orders</th>
              <th className="p-4 font-semibold text-sm text-gray-700">Total Spent</th>
              <th className="p-4 font-semibold text-sm text-gray-700">Loyalty Points</th>
              <th className="p-4 font-semibold text-sm text-gray-700">Status</th>
              <th className="p-4 font-semibold text-sm text-gray-700">Last Order</th>
              <th className="p-4 font-semibold text-sm text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedCustomers.length > 0 ? (
              sortedCustomers.map(customer => (
                <CustomerRow
                  key={customer.id}
                  customer={customer}
                  onView={handleViewCustomer}
                  onEdit={handleEditCustomer}
                  onContact={handleContactCustomer}
                />
              ))
            ) : (
              <tr>
                <td colSpan={9} className="p-8 text-center text-gray-500">
                  No customers found matching your filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {sortedCustomers.length > 20 && (
        <div className="mt-6 flex justify-center">
          <button className="px-6 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
            Load More Customers
          </button>
        </div>
      )}

      {/* Customer Insights */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Top Customers by Spending</h3>
          <div className="space-y-3">
            {mockCustomers
              .sort((a, b) => b.totalSpent - a.totalSpent)
              .slice(0, 5)
              .map(customer => (
                <div key={customer.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="relative w-8 h-8 mr-3">
                      <Image
                        src={customer.avatar}
                        alt={customer.name}
                        fill
                        className="rounded-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium">{customer.name}</p>
                      <p className="text-sm text-gray-500">{customer.totalOrders} orders</p>
                    </div>
                  </div>
                  <p className="font-semibold">₦{customer.totalSpent.toLocaleString()}</p>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Customer Distribution by Location</h3>
          <div className="space-y-3">
            {locations.map(location => {
              const count = mockCustomers.filter(c => c.location === location).length;
              const percentage = Math.round((count / mockCustomers.length) * 100);
              return (
                <div key={location} className="flex items-center justify-between">
                  <span className="font-medium">{location}</span>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium w-12">{count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}