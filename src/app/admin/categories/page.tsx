'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { PlusIcon, EditIcon, TrashIcon } from '@/components/ui/icons';
import { trpc } from '@/utils/trpc';
import { ProductStatus, type Category } from '@prisma/client';
import { DataTable, type Column } from '@/components/ui/data-table';
import { toast } from 'sonner';
import { CategoryFormSheet } from './CategoryFormSheet';

type CategoryWithRelations = Category & {
  parent: Category | null;
  children: Category[];
  _count: {
    products: number;
  };
};

export default function AdminCategoriesPage() {
  const router = useRouter();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | undefined>(undefined);
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);

  const categoriesQuery = trpc.getCategories.useQuery({}, {
    staleTime: 30000,
    refetchOnWindowFocus: false
  });

  const deleteCategoryMutation = trpc.deleteCategory.useMutation({
    onSuccess: () => {
      categoriesQuery.refetch();
      setDeletingCategoryId(null);
      toast.success('Category deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete category: ' + error.message);
      setDeletingCategoryId(null);
    }
  });

  const handleAddCategory = () => {
    setEditingCategoryId(undefined);
    setSheetOpen(true);
  };

  const handleEditCategory = (id: string) => {
    setEditingCategoryId(id);
    setSheetOpen(true);
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) {
      return;
    }

    setDeletingCategoryId(id);
    try {
      await deleteCategoryMutation.mutateAsync({ id });
    } catch (error) {
    }
  };

  const handleFormSuccess = () => {
    categoriesQuery.refetch();
  };

  const columns: Column<CategoryWithRelations>[] = useMemo(() => [
    {
      header: 'Name',
      cell: (category) => (
        <div>
          <span className="font-medium text-gray-900">{category.name}</span>
          <p className="text-sm text-gray-500">{category.slug}</p>
        </div>
      )
    },
    {
      header: 'Parent Category',
      cell: (category) => (
        <span className="text-gray-600">{category.parent?.name || '-'}</span>
      )
    },
    {
      header: 'Products',
      cell: (category) => <span className="text-gray-600">{category._count.products}</span>
    },
    {
      header: 'Subcategories',
      cell: (category) => <span className="text-gray-600">{category.children.length}</span>
    },
    {
      header: 'Status',
      cell: (category) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
          category.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
          category.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {category.status}
        </span>
      )
    },
    {
      header: 'Sort Order',
      cell: (category) => <span className="text-gray-600">{category.sort_order}</span>
    },
    {
      header: 'Actions',
      cell: (category) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleEditCategory(category.id)}
            className="p-1 text-gray-400 hover:text-green-600 transition-colors"
            title="Edit category"
          >
            <EditIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteCategory(category.id)}
            disabled={deletingCategoryId === category.id}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
            title="Delete category"
          >
            {deletingCategoryId === category.id ? (
              <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <TrashIcon className="w-4 h-4" />
            )}
          </button>
        </div>
      )
    }
  ], [deletingCategoryId]);

  return (
    <div>
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories Management</h1>
          <p className="text-gray-600">Manage product categories and subcategories</p>
        </div>
        <button
          onClick={handleAddCategory}
          className="flex items-center gap-2 px-4 py-2 bg-[#38761d] text-white rounded-lg hover:bg-opacity-90 font-medium transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          Add New Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <div className="w-6 h-6 text-blue-600">📁</div>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Total Categories</p>
              <p className="text-2xl font-bold text-gray-900">
                {categoriesQuery.isLoading ? '...' : categoriesQuery.data?.length || 0}
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
              <p className="text-sm text-gray-500">Active</p>
              <p className="text-2xl font-bold text-gray-900">
                {categoriesQuery.isLoading ? '...' : categoriesQuery.data?.filter(c => c.status === 'ACTIVE').length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <div className="w-6 h-6 text-purple-600">📂</div>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Parent Categories</p>
              <p className="text-2xl font-bold text-gray-900">
                {categoriesQuery.isLoading ? '...' : categoriesQuery.data?.filter(c => !c.parent_id).length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <div className="w-6 h-6 text-yellow-600">📄</div>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Subcategories</p>
              <p className="text-2xl font-bold text-gray-900">
                {categoriesQuery.isLoading ? '...' : categoriesQuery.data?.filter(c => c.parent_id).length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={categoriesQuery.data || []}
        isLoading={categoriesQuery.isLoading}
        error={categoriesQuery.error}
        onRetry={() => categoriesQuery.refetch()}
        emptyMessage="No categories found"
        keyExtractor={(category) => category.id}
      />

      <CategoryFormSheet
        categoryId={editingCategoryId}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}
