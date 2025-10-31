'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { SearchIcon, ExportIcon, PlusIcon, EditIcon, TrashIcon, EyeIcon } from '@/components/ui/icons';
import { trpc } from '@/utils/trpc';
import { ProductStatus, type Product, type Category, type ProductImage } from '@prisma/client';
import { ProductFormSheet } from './ProductFormSheet';
import { DataTable, type Column } from '@/components/ui/data-table';
import { toast } from 'sonner';

type ProductWithRelations = Product & {
  category: Pick<Category, 'id' | 'name' | 'slug'>;
  images: ProductImage[];
  imageUrl: string;
  stock: number;
  statusDisplay: string;
  sales: number;
}

export default function AdminProductsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProductStatus | 'All'>('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | undefined>(undefined);

  const productsQuery = trpc.getProducts.useQuery({
    page: currentPage,
    limit: 20,
    search: searchTerm.trim() || undefined,
    status: statusFilter === 'All' ? undefined : statusFilter,
  }, {
    staleTime: 30000,
    refetchOnWindowFocus: false
  });

  const statsQuery = trpc.getProducts.useQuery({
    page: 1,
    limit: 1000,
  }, {
    staleTime: 60000,
    refetchOnWindowFocus: false,
    select: (data) => ({
      total: data.pagination.total,
      active: data.products.filter(p => p.status === 'ACTIVE').length,
      outOfStock: data.products.filter(p => p.quantity === 0).length,
      featured: data.products.filter(p => p.is_featured).length,
    })
  });

  const deleteProductMutation = trpc.deleteProduct.useMutation({
    onSuccess: () => {
      productsQuery.refetch();
      setDeletingProductId(null);
      toast.success('Product deleted successfully');
    },
    onError: (error) => {
      console.error('Failed to delete product:', error);
      toast.error('Failed to delete product: ' + error.message);
      setDeletingProductId(null);
    }
  });

  const adminProducts = productsQuery.data?.products?.map(product => ({
    ...product,
    imageUrl: product.images?.[0]?.url || `https://placehold.co/80x80/38761d/white?text=${product.name.charAt(0)}`,
    stock: product.quantity,
    statusDisplay: product.quantity === 0 ? 'Out of stock' :
                  product.status === 'ACTIVE' ? 'Active' :
                  product.status === 'DRAFT' ? 'Draft' : 'Inactive',
    sales: product.sale_count || 0
  })) || [];

  const filteredProducts = adminProducts.filter(product => {
    const matchesCategory = categoryFilter === 'All' || product.category.name === categoryFilter;
    return matchesCategory;
  });

  const handleAddProduct = () => {
    setEditingProductId(undefined);
    setSheetOpen(true);
  };

  const handleEditProduct = (id: string) => {
    setEditingProductId(id);
    setSheetOpen(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    setDeletingProductId(id);
    try {
      await deleteProductMutation.mutateAsync({ id });
    } catch (error) {
    }
  };

  const handleViewProduct = (id: string) => {
    router.push(`/products/${adminProducts.find(p => p.id === id)?.slug}`);
  };

  const handleExportCSV = () => {
    console.log('Export products CSV');
  };

  const handleFormSuccess = () => {
    productsQuery.refetch();
    statsQuery.refetch();
  };

  const categories = ['All', ...Array.from(new Set(adminProducts.map(p => p.category.name)))];
  const statuses = ['All', 'ACTIVE', 'DRAFT', 'INACTIVE', 'ARCHIVED'] as const;
  const statusLabels: Record<string, string> = {
    All: 'All Status',
    ACTIVE: 'Active',
    DRAFT: 'Draft',
    INACTIVE: 'Inactive',
    ARCHIVED: 'Archived'
  };

  const columns: Column<ProductWithRelations>[] = useMemo(() => [
    {
      header: 'Product',
      cell: (product) => (
        <div className="flex items-center">
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
        </div>
      )
    },
    {
      header: 'Category',
      cell: (product) => <span className="text-gray-600">{product.category.name}</span>
    },
    {
      header: 'Price',
      cell: (product) => <span className="text-gray-900 font-medium">₦{Number(product.price).toLocaleString()}</span>
    },
    {
      header: 'Stock',
      cell: (product) => <span className="text-gray-600">{product.stock} units</span>
    },
    {
      header: 'Status',
      cell: (product) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
          product.statusDisplay === 'Active' ? 'bg-green-100 text-green-800' :
          product.statusDisplay === 'Draft' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {product.statusDisplay}
        </span>
      )
    },
    {
      header: 'Sales',
      cell: (product) => <span className="text-gray-600">{product.sales}</span>
    },
    {
      header: 'Date Added',
      cell: (product) => <span className="text-gray-600">{new Date(product.created_at).toLocaleDateString()}</span>
    },
    {
      header: 'Actions',
      cell: (product) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleViewProduct(product.id)}
            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
            title="View product"
          >
            <EyeIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleEditProduct(product.id)}
            className="p-1 text-gray-400 hover:text-green-600 transition-colors"
            title="Edit product"
          >
            <EditIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteProduct(product.id)}
            disabled={deletingProductId === product.id}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
            title="Delete product"
          >
            {deletingProductId === product.id ? (
              <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <TrashIcon className="w-4 h-4" />
            )}
          </button>
        </div>
      )
    }
  ], [deletingProductId]);

  return (
    <div>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <div className="w-6 h-6 text-blue-600">📦</div>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">
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
              <p className="text-2xl font-bold text-gray-900">
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
              <p className="text-2xl font-bold text-gray-900">
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
              <p className="text-2xl font-bold text-gray-900">
                {statsQuery.isLoading ? '...' : statsQuery.data?.featured || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

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

      <DataTable
        columns={columns}
        data={filteredProducts}
        isLoading={productsQuery.isLoading}
        error={productsQuery.error}
        onRetry={() => productsQuery.refetch()}
        emptyMessage="No products found matching your filters"
        keyExtractor={(product) => product.id}
      />

      {filteredProducts.length > 20 && (
        <div className="mt-6 flex justify-center">
          <button className="px-6 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
            Load More Products
          </button>
        </div>
      )}

      <ProductFormSheet
        productId={editingProductId}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}
