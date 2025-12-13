"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ProductStatus } from "@prisma/client";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { ImageUploader } from "@/components/ui/image-uploader";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { trpc } from "@/utils/trpc";

const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  image: z.string().optional(),
  status: z.nativeEnum(ProductStatus),
  sort_order: z.number().int(),
  parent_id: z.string().optional(),
});

type CategoryInput = z.infer<typeof categorySchema>;

interface CategoryFormSheetProps {
  categoryId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CategoryFormSheet({
  categoryId,
  open,
  onOpenChange,
  onSuccess,
}: CategoryFormSheetProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      image: "",
      status: ProductStatus.ACTIVE,
      sort_order: 0,
      parent_id: "",
    },
  });

  const categoryQuery = trpc.getCategoryById.useQuery(
    categoryId ? { id: categoryId } : { id: "" },
    { enabled: !!categoryId },
  );

  const categoriesQuery = trpc.getCategories.useQuery({});

  const createMutation = trpc.createCategory.useMutation({
    onSuccess: () => {
      onSuccess?.();
      onOpenChange(false);
      reset();
      toast.success("Category created successfully");
    },
    onError: (error) => {
      toast.error(`Failed to create category: ${error.message}`);
    },
  });

  const updateMutation = trpc.updateCategory.useMutation({
    onSuccess: () => {
      onSuccess?.();
      onOpenChange(false);
      toast.success("Category updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update category: ${error.message}`);
    },
  });

  // Auto-generate slug from category name (only for new categories)
  const categoryName = watch("name");
  useEffect(() => {
    if (categoryName && !categoryId) {
      const slug = categoryName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      setValue("slug", slug);
    }
  }, [categoryName, categoryId, setValue]);

  // Load category data when editing
  useEffect(() => {
    if (open && categoryId && categoryQuery.data) {
      const category = categoryQuery.data;
      reset({
        name: category.name,
        slug: category.slug,
        description: category.description || "",
        image: category.image || "",
        status: category.status,
        sort_order: category.sort_order,
        parent_id: category.parent_id || "",
      });
    } else if (open && !categoryId) {
      // Reset to default values when creating new category
      reset({
        name: "",
        slug: "",
        description: "",
        image: "",
        status: ProductStatus.ACTIVE,
        sort_order: 0,
        parent_id: "",
      });
    }
  }, [open, categoryId, categoryQuery.data, reset]);

  const onSubmit = async (data: CategoryInput) => {
    try {
      const payload = {
        ...data,
        parent_id: data.parent_id || undefined,
        description: data.description || undefined,
        image: data.image || undefined,
      };

      if (categoryId) {
        await updateMutation.mutateAsync({ id: categoryId, ...payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
    } catch (error) {
      console.error("Submission error:", error);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;
  const isLoadingCategory = categoryId && categoryQuery.isLoading;
  const hasError = categoryId && categoryQuery.error;

  const parentCategories =
    categoriesQuery.data?.filter((c) => !c.parent_id && c.id !== categoryId) ||
    [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl p-5 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {categoryId ? "Edit Category" : "Add New Category"}
          </SheetTitle>
          <SheetDescription>
            {categoryId
              ? "Update category information"
              : "Create a new product category"}
          </SheetDescription>
        </SheetHeader>

        {isLoadingCategory ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-12 h-12 border-4 border-[#38761d] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-600">Loading category data...</p>
            </div>
          </div>
        ) : hasError ? (
          <div className="flex items-center justify-center py-12">
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
                  {categoryQuery.error.message}
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
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 px-1 md:px-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Category Name
              </label>
              <input
                type="text"
                id="name"
                {...register("name")}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors text-gray-900"
                placeholder="Enter category name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="slug"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Slug
              </label>
              <input
                type="text"
                id="slug"
                {...register("slug")}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors text-gray-900"
                placeholder="category-slug"
              />
              {errors.slug && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.slug.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Description
              </label>
              <textarea
                id="description"
                {...register("description")}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors text-gray-900"
                placeholder="Enter category description"
              />
            </div>

            <div>
              <label
                htmlFor="category-image"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Category Image
              </label>
              <ImageUploader
                inputId="category-image"
                value={watch("image")}
                onChange={(url) => setValue("image", url)}
                onRemove={() => setValue("image", "")}
                disabled={isLoading || isSubmitting}
                folder="categories"
              />
            </div>

            <div>
              <label
                htmlFor="parent_id"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Parent Category
              </label>
              <select
                id="parent_id"
                {...register("parent_id")}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors text-gray-900"
              >
                <option value="">None (Top Level Category)</option>
                {parentCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Status
                </label>
                <select
                  id="status"
                  {...register("status")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors text-gray-900"
                >
                  <option value={ProductStatus.ACTIVE}>Active</option>
                  <option value={ProductStatus.DRAFT}>Draft</option>
                  <option value={ProductStatus.INACTIVE}>Inactive</option>
                  <option value={ProductStatus.ARCHIVED}>Archived</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="sort_order"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Sort Order
                </label>
                <input
                  type="number"
                  id="sort_order"
                  {...register("sort_order", { valueAsNumber: true })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors text-gray-900"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                disabled={isLoading || isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || isSubmitting}
                className="flex-1 bg-[#38761d] text-white py-3 px-4 rounded-lg hover:bg-opacity-90 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading || isSubmitting
                  ? "Saving..."
                  : categoryId
                    ? "Update Category"
                    : "Create Category"}
              </button>
            </div>
          </form>
        )}
      </SheetContent>
    </Sheet>
  );
}
