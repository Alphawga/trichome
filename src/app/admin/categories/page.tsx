"use client";

import type { Category } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { type Column, DataTable } from "@/components/ui/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EditIcon, EyeIcon, PlusIcon, TrashIcon } from "@/components/ui/icons";
import { trpc } from "@/utils/trpc";
import { CategoryFormSheet } from "./CategoryFormSheet";
import { CategoryViewSheet } from "./CategoryViewSheet";

type CategoryWithRelations = Category & {
  parent: Category | null;
  children: Category[];
  _count: {
    products: number;
  };
};

export default function AdminCategoriesPage() {
  const _router = useRouter();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [viewSheetOpen, setViewSheetOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<
    string | undefined
  >(undefined);
  const [viewingCategoryId, setViewingCategoryId] = useState<
    string | undefined
  >(undefined);
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(
    null,
  );
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const categoriesQuery = trpc.getCategories.useQuery(
    {},
    {
      staleTime: 30000,
      refetchOnWindowFocus: false,
    },
  );

  const deleteCategoryMutation = trpc.deleteCategory.useMutation({
    onSuccess: () => {
      categoriesQuery.refetch();
      setDeletingCategoryId(null);
      toast.success("Category deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete category: ${error.message}`);
      setDeletingCategoryId(null);
    },
  });

  const handleAddCategory = () => {
    setEditingCategoryId(undefined);
    setSheetOpen(true);
  };

  const handleEditCategory = useCallback((id: string) => {
    setEditingCategoryId(id);
    setSheetOpen(true);
  }, []);

  const handleDeleteCategory = useCallback(
    (category: { id: string; name: string }) => {
      setCategoryToDelete(category);
      setDeleteConfirmOpen(true);
    },
    [],
  );

  const confirmDeleteCategory = useCallback(async () => {
    if (!categoryToDelete) return;

    setDeletingCategoryId(categoryToDelete.id);
    try {
      await deleteCategoryMutation.mutateAsync({ id: categoryToDelete.id });
      setDeleteConfirmOpen(false);
      setCategoryToDelete(null);
    } catch (_error) {
      // Error is handled by mutation onError
    }
  }, [categoryToDelete, deleteCategoryMutation]);

  const handleViewCategory = useCallback((slug: string) => {
    setViewingCategoryId(slug);
    setViewSheetOpen(true);
  }, []);

  const handleFormSuccess = () => {
    categoriesQuery.refetch();
  };

  const columns: Column<CategoryWithRelations>[] = useMemo(
    () => [
      {
        header: "Name",
        cell: (category) => (
          <div>
            <span className="font-medium text-gray-900">{category.name}</span>
            <p className="text-sm text-gray-500">{category.slug}</p>
          </div>
        ),
      },
      {
        header: "Parent Category",
        cell: (category) => (
          <span className="text-gray-600">{category.parent?.name || "-"}</span>
        ),
      },
      {
        header: "Products",
        cell: (category) => (
          <span className="text-gray-600">{category._count.products}</span>
        ),
      },
      {
        header: "Subcategories",
        cell: (category) => (
          <span className="text-gray-600">{category.children.length}</span>
        ),
      },
      {
        header: "Status",
        cell: (category) => (
          <span
            className={`px-2 py-1 text-xs font-semibold rounded-full ${category.status === "ACTIVE"
              ? "bg-green-100 text-green-800"
              : category.status === "DRAFT"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
              }`}
          >
            {category.status}
          </span>
        ),
      },
      {
        header: "Sort Order",
        cell: (category) => (
          <span className="text-gray-600">{category.sort_order}</span>
        ),
      },
      {
        header: "Actions",
        cell: (category) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Actions"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <title>Open actions</title>
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => handleViewCategory(category.slug)}
                className="cursor-pointer"
              >
                <EyeIcon className="w-4 h-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleEditCategory(category.id)}
                className="cursor-pointer"
              >
                <EditIcon className="w-4 h-4 mr-2" />
                Edit Category
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() =>
                  handleDeleteCategory({
                    id: category.id,
                    name: category.name,
                  })
                }
                disabled={deletingCategoryId === category.id}
                className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
              >
                <TrashIcon className="w-4 h-4 mr-2" />
                Delete Category
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [
      deletingCategoryId,
      handleViewCategory,
      handleEditCategory,
      handleDeleteCategory,
    ],
  );

  return (
    <div>
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Categories Management
          </h1>
          <p className="text-gray-600">
            Manage product categories and subcategories
          </p>
        </div>
        <button
          type="button"
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
                {categoriesQuery.isLoading
                  ? "..."
                  : categoriesQuery.data?.length || 0}
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
                {categoriesQuery.isLoading
                  ? "..."
                  : categoriesQuery.data?.filter((c) => c.status === "ACTIVE")
                    .length || 0}
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
                {categoriesQuery.isLoading
                  ? "..."
                  : categoriesQuery.data?.filter((c) => !c.parent_id).length ||
                  0}
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
                {categoriesQuery.isLoading
                  ? "..."
                  : categoriesQuery.data?.filter((c) => c.parent_id).length ||
                  0}
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

      <CategoryViewSheet
        categoryId={viewingCategoryId}
        open={viewSheetOpen}
        onOpenChange={setViewSheetOpen}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={(open) => {
          setDeleteConfirmOpen(open);
          if (!open) setCategoryToDelete(null);
        }}
        title="Delete Category"
        description={`Are you sure you want to delete "${categoryToDelete?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={confirmDeleteCategory}
        isLoading={deleteCategoryMutation.isPending}
        variant="danger"
      />
    </div>
  );
}
