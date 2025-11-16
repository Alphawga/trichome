"use client";

import { ProductStatus } from "@prisma/client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { trpc } from "@/utils/trpc";

interface CategoryViewSheetProps {
  categoryId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CategoryViewSheet({
  categoryId,
  open,
  onOpenChange,
}: CategoryViewSheetProps) {
  const categoryQuery = trpc.getCategoryBySlug.useQuery(
    { slug: categoryId || "" },
    { enabled: !!categoryId && open },
  );

  const category = categoryQuery.data;
  const isLoading = categoryQuery.isLoading;
  const hasError = categoryQuery.error;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl p-0 overflow-y-auto">
        <SheetHeader className="p-6 border-b">
          <SheetTitle>Category Details</SheetTitle>
          <SheetDescription>
            View detailed information about this category
          </SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-12 h-12 border-4 border-[#38761d] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-600">Loading category details...</p>
            </div>
          </div>
        ) : hasError ? (
          <div className="flex items-center justify-center py-12 px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <title>Error</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <div>
                <p className="text-gray-900 font-medium">
                  Failed to load category
                </p>
                <p className="text-gray-600 text-sm mt-1">
                  {categoryQuery.error?.message}
                </p>
              </div>
              <button
                type="button"
                onClick={() => categoryQuery.refetch()}
                className="px-4 py-2 bg-[#38761d] text-white rounded-lg hover:bg-opacity-90"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : category ? (
          <div className="p-6 space-y-6">
            {/* Category Basic Info */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {category.name}
              </h3>
              <p className="text-gray-600 mb-3">
                {category.description || "No description"}
              </p>
              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 text-sm font-semibold rounded-full ${
                    category.status === ProductStatus.ACTIVE
                      ? "bg-green-100 text-green-800"
                      : category.status === ProductStatus.DRAFT
                        ? "bg-yellow-100 text-yellow-800"
                        : category.status === ProductStatus.INACTIVE
                          ? "bg-gray-100 text-gray-800"
                          : "bg-red-100 text-red-800"
                  }`}
                >
                  {category.status}
                </span>
              </div>
            </div>

            {/* Category Information */}
            <div className="border-t pt-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Information
              </h4>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Slug</p>
                  <p className="text-base text-gray-900 font-mono bg-gray-50 px-3 py-2 rounded">
                    {category.slug}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Sort Order</p>
                  <p className="text-base text-gray-900">
                    {category.sort_order}
                  </p>
                </div>
                {category.parent && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      Parent Category
                    </p>
                    <p className="text-base text-gray-900">
                      {category.parent.name}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Statistics */}
            <div className="border-t pt-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Statistics
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-600 mb-1">Products</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {category._count.products}
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-purple-600 mb-1">Subcategories</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {category.children.length}
                  </p>
                </div>
              </div>
            </div>

            {/* Subcategories */}
            {category.children.length > 0 && (
              <div className="border-t pt-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Subcategories
                </h4>
                <div className="space-y-2">
                  {category.children.map((child) => (
                    <div
                      key={child.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {child.name}
                        </p>
                        <p className="text-sm text-gray-600">{child.slug}</p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          child.status === ProductStatus.ACTIVE
                            ? "bg-green-100 text-green-800"
                            : child.status === ProductStatus.DRAFT
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {child.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="border-t pt-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Metadata
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Created</span>
                  <span className="text-gray-900">
                    {new Date(category.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Updated</span>
                  <span className="text-gray-900">
                    {new Date(category.updated_at).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
