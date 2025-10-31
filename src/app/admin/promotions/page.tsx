'use client';

import React, { useState } from 'react';
import { SearchIcon, FilterIcon, ExportIcon, PlusIcon, EditIcon, TrashIcon, EyeIcon, CopyIcon } from '@/components/ui/icons';

// Temporary interfaces for migration
interface AdminPromotion {
  id: number;
  name: string;
  code: string;
  type: 'Percentage' | 'Fixed Amount' | 'Free Shipping';
  value: number;
  minOrderValue: number;
  maxDiscount?: number;
  status: 'Active' | 'Inactive' | 'Expired' | 'Scheduled';
  startDate: string;
  endDate: string;
  usageLimit: number;
  usedCount: number;
  description: string;
  targetCustomers: 'All' | 'New Customers' | 'VIP' | 'Specific Group';
  createdDate: string;
}

interface PromotionRowProps {
  promotion: AdminPromotion;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onCopy: (code: string) => void;
  onToggleStatus: (id: number) => void;
}

const PromotionRow: React.FC<PromotionRowProps> = ({
  promotion,
  onView,
  onEdit,
  onDelete,
  onCopy,
  onToggleStatus
}) => {
  const getStatusColor = (status: AdminPromotion['status']) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Inactive': return 'bg-gray-100 text-gray-800';
      case 'Expired': return 'bg-red-100 text-red-800';
      case 'Scheduled': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDiscountText = () => {
    switch (promotion.type) {
      case 'Percentage':
        return `${promotion.value}% OFF`;
      case 'Fixed Amount':
        return `₦${promotion.value.toLocaleString()} OFF`;
      case 'Free Shipping':
        return 'FREE SHIPPING';
      default:
        return '';
    }
  };

  return (
    <tr className="border-b last:border-0 hover:bg-gray-50">
      <td className="p-4">
        <div>
          <span className="font-medium text-gray-900">{promotion.name}</span>
          <p className="text-sm text-gray-500">Created {promotion.createdDate}</p>
        </div>
      </td>
      <td className="p-4">
        <div className="flex items-center space-x-2">
          <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
            {promotion.code}
          </code>
          <button
            onClick={() => onCopy(promotion.code)}
            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
            title="Copy code"
          >
            <CopyIcon className="w-3 h-3" />
          </button>
        </div>
      </td>
      <td className="p-4">
        <span className="font-medium text-green-600">{getDiscountText()}</span>
        <p className="text-sm text-gray-500">Min: ₦{promotion.minOrderValue.toLocaleString()}</p>
      </td>
      <td className="p-4">
        <div>
          <span className="text-gray-900">{promotion.usedCount} / {promotion.usageLimit}</span>
          <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
            <div
              className="bg-blue-600 h-1 rounded-full"
              style={{ width: `${Math.min((promotion.usedCount / promotion.usageLimit) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      </td>
      <td className="p-4">
        <div>
          <span className="text-sm text-gray-600">{promotion.startDate}</span>
          <br />
          <span className="text-sm text-gray-600">{promotion.endDate}</span>
        </div>
      </td>
      <td className="p-4">
        <button
          onClick={() => onToggleStatus(promotion.id)}
          className={`px-2 py-1 text-xs font-semibold rounded-full cursor-pointer hover:opacity-80 ${getStatusColor(promotion.status)}`}
        >
          {promotion.status}
        </button>
      </td>
      <td className="p-4 text-gray-600">{promotion.targetCustomers}</td>
      <td className="p-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onView(promotion.id)}
            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
            title="View promotion details"
          >
            <EyeIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(promotion.id)}
            className="p-1 text-gray-400 hover:text-green-600 transition-colors"
            title="Edit promotion"
          >
            <EditIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(promotion.id)}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
            title="Delete promotion"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default function AdminPromotionsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  // Mock data - will be replaced with tRPC calls
  const mockPromotions: AdminPromotion[] = [
    {
      id: 1,
      name: 'New Customer Welcome',
      code: 'WELCOME20',
      type: 'Percentage',
      value: 20,
      minOrderValue: 10000,
      maxDiscount: 5000,
      status: 'Active',
      startDate: '2023-10-01',
      endDate: '2023-12-31',
      usageLimit: 500,
      usedCount: 243,
      description: 'Welcome discount for new customers',
      targetCustomers: 'New Customers',
      createdDate: '2023-09-15'
    },
    {
      id: 2,
      name: 'Free Shipping Promo',
      code: 'FREESHIP',
      type: 'Free Shipping',
      value: 0,
      minOrderValue: 25000,
      status: 'Active',
      startDate: '2023-09-01',
      endDate: '2023-11-30',
      usageLimit: 1000,
      usedCount: 456,
      description: 'Free shipping on orders above ₦25,000',
      targetCustomers: 'All',
      createdDate: '2023-08-20'
    },
    {
      id: 3,
      name: 'VIP Customer Special',
      code: 'VIP15',
      type: 'Percentage',
      value: 15,
      minOrderValue: 5000,
      maxDiscount: 10000,
      status: 'Active',
      startDate: '2023-08-01',
      endDate: '2024-01-31',
      usageLimit: 200,
      usedCount: 87,
      description: 'Exclusive discount for VIP customers',
      targetCustomers: 'VIP',
      createdDate: '2023-07-25'
    },
    {
      id: 4,
      name: 'Black Friday Mega Sale',
      code: 'BLACKFRIDAY50',
      type: 'Percentage',
      value: 50,
      minOrderValue: 15000,
      maxDiscount: 20000,
      status: 'Scheduled',
      startDate: '2023-11-24',
      endDate: '2023-11-27',
      usageLimit: 2000,
      usedCount: 0,
      description: 'Biggest sale of the year',
      targetCustomers: 'All',
      createdDate: '2023-10-15'
    },
    {
      id: 5,
      name: 'Summer Clearance',
      code: 'SUMMER30',
      type: 'Fixed Amount',
      value: 7500,
      minOrderValue: 20000,
      status: 'Expired',
      startDate: '2023-06-01',
      endDate: '2023-08-31',
      usageLimit: 300,
      usedCount: 298,
      description: 'Summer season clearance sale',
      targetCustomers: 'All',
      createdDate: '2023-05-20'
    },
    {
      id: 6,
      name: 'Student Discount',
      code: 'STUDENT10',
      type: 'Percentage',
      value: 10,
      minOrderValue: 5000,
      maxDiscount: 3000,
      status: 'Inactive',
      startDate: '2023-09-01',
      endDate: '2024-05-31',
      usageLimit: 1000,
      usedCount: 156,
      description: 'Special discount for students',
      targetCustomers: 'Specific Group',
      createdDate: '2023-08-25'
    }
  ];

  const filteredPromotions = mockPromotions.filter(promotion => {
    const matchesSearch =
      promotion.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      promotion.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || promotion.status === statusFilter;
    const matchesType = typeFilter === 'All' || promotion.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleAddPromotion = () => {
    console.log('Add new promotion');
    // TODO: Navigate to promotion creation form
  };

  const handleViewPromotion = (id: number) => {
    console.log('View promotion:', id);
    // TODO: Navigate to promotion detail view
  };

  const handleEditPromotion = (id: number) => {
    console.log('Edit promotion:', id);
    // TODO: Navigate to promotion edit form
  };

  const handleDeletePromotion = (id: number) => {
    console.log('Delete promotion:', id);
    // TODO: Implement delete confirmation and action
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    console.log('Copied code:', code);
    // TODO: Show success toast
  };

  const handleToggleStatus = (id: number) => {
    console.log('Toggle status for promotion:', id);
    // TODO: Implement status toggle
  };

  const handleExportCSV = () => {
    console.log('Export promotions CSV');
    // TODO: Implement CSV export
  };

  const statuses = ['All', 'Active', 'Inactive', 'Expired', 'Scheduled'];
  const types = ['All', 'Percentage', 'Fixed Amount', 'Free Shipping'];

  // Calculate stats
  const activePromotions = mockPromotions.filter(p => p.status === 'Active').length;
  const totalUsage = mockPromotions.reduce((sum, p) => sum + p.usedCount, 0);
  const scheduledPromotions = mockPromotions.filter(p => p.status === 'Scheduled').length;
  const expiredPromotions = mockPromotions.filter(p => p.status === 'Expired').length;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Promotions & Discounts</h1>
          <p className="text-gray-600">Manage discount codes and promotional campaigns</p>
        </div>
        <button
          onClick={handleAddPromotion}
          className="flex items-center gap-2 px-4 py-2 bg-[#38761d] text-white rounded-lg hover:bg-opacity-90 font-medium transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          Create Promotion
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <div className="w-6 h-6 text-green-600">✅</div>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Active Promotions</p>
              <p className="text-2xl font-bold">{activePromotions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <div className="w-6 h-6 text-blue-600">📈</div>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Total Usage</p>
              <p className="text-2xl font-bold">{totalUsage.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <div className="w-6 h-6 text-purple-600">⏰</div>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Scheduled</p>
              <p className="text-2xl font-bold">{scheduledPromotions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <div className="w-6 h-6 text-red-600">⏳</div>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Expired</p>
              <p className="text-2xl font-bold">{expiredPromotions}</p>
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
              placeholder="Search promotions by name or code..."
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
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none"
          >
            {types.map(type => (
              <option key={type} value={type}>{type} Type</option>
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

      {/* Promotions Table */}
      <div className="bg-white rounded-lg border overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-semibold text-sm text-gray-700">Promotion Name</th>
              <th className="p-4 font-semibold text-sm text-gray-700">Code</th>
              <th className="p-4 font-semibold text-sm text-gray-700">Discount</th>
              <th className="p-4 font-semibold text-sm text-gray-700">Usage</th>
              <th className="p-4 font-semibold text-sm text-gray-700">Duration</th>
              <th className="p-4 font-semibold text-sm text-gray-700">Status</th>
              <th className="p-4 font-semibold text-sm text-gray-700">Target</th>
              <th className="p-4 font-semibold text-sm text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPromotions.length > 0 ? (
              filteredPromotions.map(promotion => (
                <PromotionRow
                  key={promotion.id}
                  promotion={promotion}
                  onView={handleViewPromotion}
                  onEdit={handleEditPromotion}
                  onDelete={handleDeletePromotion}
                  onCopy={handleCopyCode}
                  onToggleStatus={handleToggleStatus}
                />
              ))
            ) : (
              <tr>
                <td colSpan={8} className="p-8 text-center text-gray-500">
                  No promotions found matching your filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Quick Campaign Templates */}
      <div className="mt-8 bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Quick Campaign Templates</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <button className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="text-green-600 mb-2">🎯</div>
            <p className="font-medium">New Customer Welcome</p>
            <p className="text-sm text-gray-500">20% off first order</p>
          </button>

          <button className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="text-blue-600 mb-2">🚚</div>
            <p className="font-medium">Free Shipping</p>
            <p className="text-sm text-gray-500">Free delivery above minimum order</p>
          </button>

          <button className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="text-purple-600 mb-2">⭐</div>
            <p className="font-medium">VIP Exclusive</p>
            <p className="text-sm text-gray-500">Special discount for loyal customers</p>
          </button>

          <button className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="text-red-600 mb-2">🔥</div>
            <p className="font-medium">Flash Sale</p>
            <p className="text-sm text-gray-500">Limited time mega discount</p>
          </button>

          <button className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="text-orange-600 mb-2">🎓</div>
            <p className="font-medium">Student Discount</p>
            <p className="text-sm text-gray-500">Educational institution discount</p>
          </button>

          <button className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="text-yellow-600 mb-2">🎂</div>
            <p className="font-medium">Birthday Special</p>
            <p className="text-sm text-gray-500">Birthday month celebration</p>
          </button>
        </div>
      </div>
    </div>
  );
}