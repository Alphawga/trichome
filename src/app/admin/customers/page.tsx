'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { SearchIcon, ExportIcon, EyeIcon, EditIcon, MailIcon } from '@/components/ui/icons';
import { trpc } from '@/utils/trpc';
import { UserStatus } from '@prisma/client';
import type { User, Address } from '@prisma/client';
import { DataTable, type Column } from '@/components/ui/data-table';
import { toast } from 'sonner';
import { CustomerViewSheet } from './CustomerViewSheet';
import { CustomerEditSheet } from './CustomerEditSheet';

// Type for customer from backend (extending Prisma User with computed fields)
type Customer = Pick<
  User,
  'id' | 'email' | 'first_name' | 'last_name' | 'phone' | 'status' | 'role' | 'image' | 'created_at' | 'last_login_at'
> & {
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: Date;
  loyaltyPoints: number;
  addresses: Array<Pick<Address, 'city' | 'state' | 'country'>>;
};

// Actions dropdown component
interface ActionsDropdownProps {
  customer: Customer;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onContact: (email: string) => void;
  openDropdownId: string | null;
  setOpenDropdownId: (id: string | null) => void;
}

const ActionsDropdown: React.FC<ActionsDropdownProps> = ({
  customer,
  onView,
  onEdit,
  onContact,
  openDropdownId,
  setOpenDropdownId
}) => (
  <div className="relative">
    <button
      onClick={() => setOpenDropdownId(openDropdownId === customer.id ? null : customer.id)}
      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
      title="Actions"
    >
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
      </svg>
    </button>

    {openDropdownId === customer.id && (
      <>
        <div
          className="fixed inset-0 z-10"
          onClick={() => setOpenDropdownId(null)}
        />
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
          <button
            onClick={() => {
              onView(customer.id);
              setOpenDropdownId(null);
            }}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <EyeIcon className="w-4 h-4" />
            View Details
          </button>
          <button
            onClick={() => {
              onEdit(customer.id);
              setOpenDropdownId(null);
            }}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <EditIcon className="w-4 h-4" />
            Edit Customer
          </button>
          <div className="border-t border-gray-100 my-1" />
          <button
            onClick={() => {
              onContact(customer.email);
              setOpenDropdownId(null);
            }}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <MailIcon className="w-4 h-4" />
            Contact Customer
          </button>
        </div>
      </>
    )}
  </div>
);

export default function AdminCustomersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'All'>('All');
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [viewCustomerId, setViewCustomerId] = useState<string | null>(null);
  const [editCustomerId, setEditCustomerId] = useState<string | null>(null);

  // Define table columns
  const columns: Column<Customer>[] = [
    {
      header: 'Customer',
      cell: (customer) => (
        <div className="flex items-center">
          <div className="relative w-10 h-10 mr-4 flex-shrink-0">
            <Image
              src={customer.image || 'https://placehold.co/80x80/38761d/white?text=' + (customer.first_name?.[0] || 'U')}
              alt={`${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Customer'}
              fill
              className="rounded-full object-cover"
            />
          </div>
          <div>
            <span className="font-medium text-gray-900">
              {customer.first_name || customer.last_name
                ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim()
                : 'No name'}
            </span>
            <p className="text-sm text-gray-500">ID: {customer.id.slice(0, 8)}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Contact',
      cell: (customer) => (
        <div>
          <span className="text-gray-900">{customer.email}</span>
          <p className="text-sm text-gray-500">{customer.phone || 'No phone'}</p>
        </div>
      ),
    },
    {
      header: 'Location',
      cell: (customer) => {
        const address = customer.addresses[0];
        return (
          <span className="text-gray-600">
            {address ? `${address.city}, ${address.state}` : 'No address'}
          </span>
        );
      },
    },
    {
      header: 'Orders',
      cell: (customer) => (
        <span className="text-gray-600">{customer.totalOrders}</span>
      ),
    },
    {
      header: 'Total Spent',
      cell: (customer) => (
        <span className="text-gray-900 font-medium">₦{customer.totalSpent.toLocaleString()}</span>
      ),
    },
    {
      header: 'Loyalty Points',
      cell: (customer) => (
        <span className="text-gray-600">{customer.loyaltyPoints}</span>
      ),
    },
    {
      header: 'Status',
      cell: (customer) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
          customer.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
          customer.status === 'INACTIVE' ? 'bg-gray-100 text-gray-800' :
          customer.status === 'SUSPENDED' ? 'bg-red-100 text-red-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {customer.status === 'PENDING_VERIFICATION' ? 'Pending' : customer.status.toLowerCase()}
        </span>
      ),
    },
    {
      header: 'Last Order',
      cell: (customer) => (
        <span className="text-gray-600">
          {customer.lastOrderDate
            ? new Date(customer.lastOrderDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })
            : 'No orders'}
        </span>
      ),
    },
    {
      header: 'Actions',
      cell: (customer) => (
        <ActionsDropdown
          customer={customer}
          onView={handleViewCustomer}
          onEdit={handleEditCustomer}
          onContact={handleContactCustomer}
          openDropdownId={openDropdownId}
          setOpenDropdownId={setOpenDropdownId}
        />
      ),
      className: 'w-20',
    },
  ];

  // Fetch customers from database
  const customersQuery = trpc.getCustomers.useQuery(
    {
      page: 1,
      limit: 100,
      status: statusFilter !== 'All' ? statusFilter : undefined,
      search: searchTerm || undefined,
    },
    {
      refetchOnWindowFocus: false,
    }
  );

  // Fetch customer statistics
  const statsQuery = trpc.getUserStats.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const customers = customersQuery.data?.customers || [];
  const stats = statsQuery.data;

  const handleViewCustomer = (id: string) => {
    setViewCustomerId(id);
  };

  const handleEditCustomer = (id: string) => {
    setEditCustomerId(id);
  };

  const handleContactCustomer = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  // Get selected customers for sheets
  const selectedViewCustomer = customers.find(c => c.id === viewCustomerId) || null;
  const selectedEditCustomer = customers.find(c => c.id === editCustomerId) || null;

  const handleExportCSV = () => {
    console.log('Export customers CSV');
    toast.info('CSV export coming soon');
  };

  const statuses: Array<UserStatus | 'All'> = ['All', 'ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION'];

  const statusLabels: Record<UserStatus | 'All', string> = {
    All: 'All Status',
    ACTIVE: 'Active',
    INACTIVE: 'Inactive',
    SUSPENDED: 'Suspended',
    PENDING_VERIFICATION: 'Pending Verification',
  };

  // Get top customers by spending
  const topCustomers = [...customers]
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 5);

  // Get location distribution
  const locationMap = new Map<string, number>();
  customers.forEach(customer => {
    const location = customer.addresses[0];
    if (location) {
      const key = location.state;
      locationMap.set(key, (locationMap.get(key) || 0) + 1);
    }
  });
  const locationDistribution = Array.from(locationMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Customers Management</h1>
        <p className="text-gray-600">Manage customer relationships and data</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {statsQuery.isLoading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white p-6 rounded-lg border border-gray-200 animate-pulse">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                  <div className="ml-4 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              </div>
            ))}
          </>
        ) : stats ? (
          <>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <div className="w-6 h-6 text-blue-600">👥</div>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Total Customers</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
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
                  <p className="text-2xl font-bold">{stats.active}</p>
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
                  <p className="text-2xl font-bold">₦{Number(stats.revenue).toLocaleString()}</p>
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
                  <p className="text-2xl font-bold">₦{Math.round(stats.avgOrderValue).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="col-span-4 text-center py-8 text-gray-500">
            Failed to load customer statistics
          </div>
        )}
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
            onChange={(e) => setStatusFilter(e.target.value as UserStatus | 'All')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none"
          >
            {statuses.map(status => (
              <option key={status} value={status}>{statusLabels[status]}</option>
            ))}
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
      <DataTable
        columns={columns}
        data={customers}
        isLoading={customersQuery.isLoading}
        error={customersQuery.error}
        onRetry={() => customersQuery.refetch()}
        emptyMessage="No customers found matching your filters"
        keyExtractor={(customer) => customer.id}
      />

      {/* Customer Insights */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Top Customers by Spending</h3>
          <div className="space-y-3">
            {topCustomers.length > 0 ? (
              topCustomers.map(customer => (
                <div key={customer.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="relative w-8 h-8 mr-3">
                      <Image
                        src={customer.image || 'https://placehold.co/80x80/38761d/white?text=' + (customer.first_name?.[0] || 'U')}
                        alt={`${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Customer'}
                        fill
                        className="rounded-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium">
                        {customer.first_name || customer.last_name
                          ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim()
                          : customer.email}
                      </p>
                      <p className="text-sm text-gray-500">{customer.totalOrders} orders</p>
                    </div>
                  </div>
                  <p className="font-semibold">₦{customer.totalSpent.toLocaleString()}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No customer data available</p>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Customer Distribution by Location</h3>
          <div className="space-y-3">
            {locationDistribution.length > 0 ? (
              locationDistribution.map(([location, count]) => {
                const percentage = customers.length > 0
                  ? Math.round((count / customers.length) * 100)
                  : 0;
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
              })
            ) : (
              <p className="text-gray-500 text-center py-4">No location data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Customer View Sheet */}
      <CustomerViewSheet
        customer={selectedViewCustomer}
        open={!!viewCustomerId}
        onOpenChange={(open) => !open && setViewCustomerId(null)}
      />

      {/* Customer Edit Sheet */}
      <CustomerEditSheet
        customer={selectedEditCustomer}
        open={!!editCustomerId}
        onOpenChange={(open) => !open && setEditCustomerId(null)}
        onSuccess={() => {
          customersQuery.refetch();
          setEditCustomerId(null);
        }}
      />
    </div>
  );
}
