'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { SearchIcon, FilterIcon, ExportIcon, PlusIcon, EditIcon, TrashIcon, EyeIcon } from '../../components/ui/icons';
import { trpc } from '@/utils/trpc';
import { ProductStatus, type Product, type Category } from '@prisma/client';
import type { RouterOutputs } from '@/utils/trpc';

// Use Prisma-generated types
type ProductWithCategory = RouterOutputs['product']['getAll']['data'][0];
type ProductStats = RouterOutputs['product']['getStats'];

// Admin display interface extending Prisma types
interface AdminProductDisplay extends ProductWithCategory {
  imageUrl: string;
  stock: number;
  statusDisplay: 'Active' | 'Draft' | 'Inactive' | 'Out of stock';
  sales: number;
}

interface ProductRowProps {
  product: AdminProductDisplay;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
  isDeleting: boolean;
}

const ProductRow: React.FC<ProductRowProps> = ({ product, onEdit, onDelete, onView, isDeleting }) => (
  <tr className="border-b last:border-0 hover:bg-gray-50">
    <td className="p-4 flex items-center">
      <div className="relative w-12 h-12 mr-4 flex-shrink-0">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="rounded-md object-cover"
        />
      </div>
      <div>
        <span className="font-medium text-gray-900">{product.name}</span>
        <p className="text-sm text-gray-500">SKU: {product.sku}</p>
      </div>
    </td>
    <td className="p-4 text-gray-600">{product.category.name}</td>
    <td className="p-4 text-gray-900 font-medium">₦{Number(product.price).toLocaleString()}</td>
    <td className="p-4 text-gray-600">{product.stock} units</td>
    <td className="p-4">
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
        product.statusDisplay === 'Active' ? 'bg-green-100 text-green-800' :
        product.statusDisplay === 'Draft' ? 'bg-yellow-100 text-yellow-800' :
        'bg-red-100 text-red-800'
      }`}>
        {product.statusDisplay}
      </span>
    </td>
    <td className="p-4 text-gray-600">{product.sales}</td>
    <td className="p-4 text-gray-600">{new Date(product.created_at).toLocaleDateString()}</td>
    <td className="p-4">
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onView(product.id)}
          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
          title="View product"
        >
          <EyeIcon className="w-4 h-4" />
        </button>
        <button
          onClick={() => onEdit(product.id)}
          className="p-1 text-gray-400 hover:text-green-600 transition-colors"
          title="Edit product"
        >
          <EditIcon className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(product.id)}
          disabled={isDeleting}
          className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
          title="Delete product"
        >
          {isDeleting ? (
            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <TrashIcon className="w-4 h-4" />
          )}
        </button>
      </div>
    </td>
  </tr>
);

export default function AdminProductsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProductStatus | 'All'>('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  // tRPC queries with proper Prisma types
  const productsQuery = trpc.product.getAll.useQuery({
    page: currentPage,
    limit: 20,
    search: searchTerm.trim() || undefined,
    status: statusFilter === 'All' ? undefined : statusFilter,
    inStock: undefined
  }, {
    staleTime: 30000,
    refetchOnWindowFocus: false
  });

  const statsQuery = trpc.product.getStats.useQuery(undefined, {
    staleTime: 60000,
    refetchOnWindowFocus: false
  });

  const deleteProductMutation = trpc.product.delete.useMutation({
    onSuccess: () => {
      productsQuery.refetch();
      statsQuery.refetch();
      setDeletingProductId(null);
    },
    onError: (error) => {
      console.error('Failed to delete product:', error);
      setDeletingProductId(null);
    }
  });

  // Transform backend data to admin display format
  const transformToAdminDisplay = (products: ProductWithCategory[]): AdminProductDisplay[] => {
    return products.map(product => ({
      ...product,
      imageUrl: product.images?.[0]?.url || `https://picsum.photos/seed/${product.id}/80/80`,
      stock: product.quantity,
      statusDisplay: product.quantity === 0 ? 'Out of stock' :
                    product.status === ProductStatus.ACTIVE ? 'Active' :
                    product.status === ProductStatus.DRAFT ? 'Draft' : 'Inactive',
      sales: product.sale_count
    }));
  };

  const adminProducts = productsQuery.data?.data ? transformToAdminDisplay(productsQuery.data.data) : [];

  // Client-side filtering for category (if needed)
  const filteredProducts = adminProducts.filter(product => {
    const matchesCategory = categoryFilter === 'All' || product.category.name === categoryFilter;
    return matchesCategory;
  });

  const handleAddProduct = () => {
    router.push('/admin/products/form');
  };

  const handleEditProduct = (id: string) => {
    router.push(`/admin/products/form?id=${id}`);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    setDeletingProductId(id);
    try {
      await deleteProductMutation.mutateAsync({ id });
    } catch (error) {
      // Error handling is done in mutation callbacks
    }
  };

  const handleViewProduct = (id: string) => {
    router.push(`/products/${adminProducts.find(p => p.id === id)?.slug}`);
  };

  const handleExportCSV = () => {
    console.log('Export products CSV');
    // TODO: Implement CSV export
  };

  const categories = ['All', ...Array.from(new Set(adminProducts.map(p => p.category.name)))];
  const statuses: (ProductStatus | 'All')[] = ['All', ProductStatus.ACTIVE, ProductStatus.DRAFT, ProductStatus.INACTIVE];
  const statusLabels = {
    All: 'All Status',
    [ProductStatus.ACTIVE]: 'Active',
    [ProductStatus.DRAFT]: 'Draft',
    [ProductStatus.INACTIVE]: 'Inactive'
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products Management</h1>
          <p className="text-gray-600">Manage your product catalog and inventory</p>
        </div>
        <button
          onClick={handleAddProduct}
          className="flex items-center gap-2 px-4 py-2 bg-[#38761d] text-white rounded-lg hover:bg-opacity-90 font-medium transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          Add New Product
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <div className="w-6 h-6 text-blue-600">📦</div>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Total Products</p>
              <p className="text-2xl font-bold">
                {statsQuery.isLoading ? '...' : statsQuery.data?.total || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <div className="w-6 h-6 text-green-600">✅</div>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Active Products</p>
              <p className="text-2xl font-bold">
                {statsQuery.isLoading ? '...' : statsQuery.data?.active || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <div className="w-6 h-6 text-red-600">⚠️</div>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Out of Stock</p>
              <p className="text-2xl font-bold">
                {statsQuery.isLoading ? '...' : statsQuery.data?.outOfStock || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <div className="w-6 h-6 text-yellow-600">📝</div>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Featured Products</p>
              <p className="text-2xl font-bold">
                {statsQuery.isLoading ? '...' : statsQuery.data?.featured || 0}
              </p>
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
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <SearchIcon />
            </div>
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none"
          >
            {categories.map(category => (
              <option key={category} value={category}>{category} Category</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ProductStatus | 'All')}
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

      {/* Products Table */}
      <div className="bg-white rounded-lg border overflow-x-auto">
        {productsQuery.isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-pulse space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : productsQuery.error ? (
          <div className="p-8 text-center text-red-600">
            <p>Error loading products</p>
            <button
              onClick={() => productsQuery.refetch()}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 font-semibold text-sm text-gray-700">Product</th>
                <th className="p-4 font-semibold text-sm text-gray-700">Category</th>
                <th className="p-4 font-semibold text-sm text-gray-700">Price</th>
                <th className="p-4 font-semibold text-sm text-gray-700">Stock</th>
                <th className="p-4 font-semibold text-sm text-gray-700">Status</th>
                <th className="p-4 font-semibold text-sm text-gray-700">Sales</th>
                <th className="p-4 font-semibold text-sm text-gray-700">Date Added</th>
                <th className="p-4 font-semibold text-sm text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map(product => (
                  <ProductRow
                    key={product.id}
                    product={product}
                    onEdit={handleEditProduct}
                    onDelete={handleDeleteProduct}
                    onView={handleViewProduct}
                    isDeleting={deletingProductId === product.id}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-500">
                    No products found matching your filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {filteredProducts.length > 20 && (
        <div className="mt-6 flex justify-center">
          <button className="px-6 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
            Load More Products
          </button>
        </div>
      )}
    </div>
  );
}