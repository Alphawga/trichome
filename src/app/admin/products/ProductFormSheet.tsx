"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ProductStatus } from "@prisma/client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { CreatableCombobox } from "@/components/ui/creatable-combobox";
import { ServerSearchCombobox } from "@/components/ui/server-search-combobox";
import { ImageUploader } from "@/components/ui/image-uploader";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { LogoLoader } from "@/components/ui/logo-loader";
import { type CreateProductInput, createProductSchema } from "@/lib/dto";
import { trpc } from "@/utils/trpc";

interface ProductFormSheetProps {
  productId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ProductFormSheet({
  productId,
  open,
  onOpenChange,
  onSuccess,
}: ProductFormSheetProps) {
  const [productImages, setProductImages] = useState<
    Array<{ url: string; alt_text?: string; is_primary?: boolean }>
  >([]);
  // State for pending brand creation (when user types a new brand name)
  const [pendingBrandName, setPendingBrandName] = useState<string | null>(null);
  // State for pending category creation (when user types a new category name)
  const [pendingCategoryName, setPendingCategoryName] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateProductInput>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      name: "",
      slug: "",
      sku: "",
      price: 0,
      category_id: "",
      status: ProductStatus.DRAFT,
      track_quantity: true,
      quantity: 0,
      low_stock_threshold: 10,
      is_featured: false,
      is_digital: false,
      requires_shipping: true,
      taxable: true,
      brand_id: undefined,
    },
  });

  // Debug: log form errors when they change
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.log("Form validation errors:", errors);
    }
  }, [errors]);

  const productQuery = trpc.getProductById.useQuery(
    productId ? { id: productId } : { id: "" },
    { enabled: !!productId },
  );

  const categoriesQuery = trpc.getCategories.useQuery({});
  // Note: Brands now use server-side search instead of loading all at once
  const utils = trpc.useUtils();

  const getOrCreateBrandMutation = trpc.getOrCreateBrand.useMutation({
    onSuccess: () => {
      // Refetch brands to include the new brand in the dropdown
      utils.getBrands.invalidate();
    },
  });

  const getOrCreateCategoryMutation = trpc.getOrCreateCategory.useMutation({
    onSuccess: () => {
      // Refetch categories to include the new category in the dropdown
      utils.getCategories.invalidate();
    },
  });

  const createMutation = trpc.createProduct.useMutation({
    onSuccess: () => {
      // Invalidate products list to show the new product
      utils.getProducts.invalidate();
      onSuccess?.();
      onOpenChange(false);
      reset();
      toast.success("Product created successfully");
    },
    onError: (error) => {
      toast.error(`Failed to create product: ${error.message}`);
    },
  });

  const updateMutation = trpc.updateProduct.useMutation({
    onSuccess: () => {
      // Invalidate products list and the specific product to refresh data
      utils.getProducts.invalidate();
      if (productId) {
        utils.getProductById.invalidate({ id: productId });
      }
      onSuccess?.();
      onOpenChange(false);
      toast.success("Product updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update product: ${error.message}`);
    },
  });

  // Auto-generate slug from product name (only for new products)
  const productName = watch("name");
  useEffect(() => {
    if (productName && !productId) {
      const slug = productName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      setValue("slug", slug);
    }
  }, [productName, productId, setValue]);

  // Load product data when editing
  useEffect(() => {
    if (open && productId && productQuery.data) {
      const product = productQuery.data;
      reset({
        name: product.name,
        slug: product.slug,
        description: product.description || "",
        short_description: product.short_description || "",
        sku: product.sku,
        barcode: product.barcode || "",
        price: Number(product.price),
        compare_price: Number(product.compare_price || 0),
        cost_price: Number(product.cost_price || 0),
        track_quantity: product.track_quantity,
        quantity: product.quantity,
        low_stock_threshold: product.low_stock_threshold,
        weight: Number(product.weight || 0),
        status: product.status,
        is_featured: product.is_featured,
        is_digital: product.is_digital,
        requires_shipping: product.requires_shipping,
        taxable: product.taxable,
        seo_title: product.seo_title || "",
        seo_description: product.seo_description || "",
        category_id: product.category_id,
        brand_id: product.brand_id || undefined,
      });
      // Load product images
      if (product.images && product.images.length > 0) {
        setProductImages(
          product.images.map((img) => ({
            url: img.url,
            alt_text: img.alt_text || "",
            is_primary: img.is_primary || false,
          })),
        );
      }
    } else if (open && !productId) {
      setProductImages([]);
      // Reset to default values when creating new product
      reset({
        name: "",
        slug: "",
        sku: "",
        price: 0,
        category_id: "",
        status: ProductStatus.DRAFT,
        track_quantity: true,
        quantity: 0,
        low_stock_threshold: 10,
        is_featured: false,
        is_digital: false,
        requires_shipping: true,
        taxable: true,
        description: "",
        short_description: "",
        barcode: "",
        compare_price: 0,
        cost_price: 0,
        weight: 0,
        seo_title: "",
        seo_description: "",
        brand_id: undefined,
      });
    }
  }, [open, productId, productQuery.data, reset]);

  const onSubmit = async (data: CreateProductInput) => {
    try {
      // Validate that category is provided (either selected or pending creation)
      if (!data.category_id && !pendingCategoryName) {
        toast.error("Category is required");
        return;
      }

      // Clean up optional numeric fields - remove if 0 or undefined
      const cleanedData = { ...data };
      if (!cleanedData.cost_price || cleanedData.cost_price === 0) {
        delete cleanedData.cost_price;
      }
      if (!cleanedData.compare_price || cleanedData.compare_price === 0) {
        delete cleanedData.compare_price;
      }
      if (!cleanedData.weight || cleanedData.weight === 0) {
        delete cleanedData.weight;
      }

      // Handle brand creation if user typed a new brand name
      let finalBrandId = cleanedData.brand_id;
      if (pendingBrandName) {
        const result = await getOrCreateBrandMutation.mutateAsync({
          name: pendingBrandName,
        });
        finalBrandId = result.brand.id;
        if (result.created) {
          toast.success(`Brand "${pendingBrandName}" created`);
        }
        setPendingBrandName(null);
      }

      // Handle category creation if user typed a new category name
      let finalCategoryId = cleanedData.category_id;
      if (pendingCategoryName) {
        const result = await getOrCreateCategoryMutation.mutateAsync({
          name: pendingCategoryName,
        });
        finalCategoryId = result.category.id;
        if (result.created) {
          toast.success(`Category "${pendingCategoryName}" created`);
        }
        setPendingCategoryName(null);
      }

      // Add images to the data
      const productData = {
        ...cleanedData,
        brand_id: finalBrandId,
        category_id: finalCategoryId,
        images: productImages.map((img, index) => ({
          url: img.url,
          alt_text: img.alt_text || data.name,
          is_primary: index === 0, // First image is primary
          sort_order: index,
        })),
      };

      if (productId) {
        await updateMutation.mutateAsync({ ...productData, id: productId });
      } else {
        await createMutation.mutateAsync(productData);
      }
    } catch (error) {
      console.error("Submission error:", error);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending || getOrCreateBrandMutation.isPending || getOrCreateCategoryMutation.isPending;

  // Server-side brand search function
  const searchBrands = async (query: string) => {
    try {
      const result = await utils.client.getBrands.query({
        search: query,
        limit: 20,
      });
      return result.brands.map((brand) => ({
        label: brand.name,
        value: brand.id,
      }));
    } catch (error) {
      console.error("Brand search error:", error);
      return [];
    }
  };

  // Prepare category options for the combobox
  const categoryOptions = (categoriesQuery.data || []).map((category) => ({
    label: category.name,
    value: category.id,
  }));

  // Handle brand selection or creation
  const handleBrandChange = (value: string, isNew: boolean, newLabel?: string) => {
    if (isNew && newLabel) {
      // User wants to create a new brand
      setPendingBrandName(newLabel);
      setValue("brand_id", ""); // Clear the brand_id since we'll create it on submit
    } else {
      // User selected an existing brand
      setPendingBrandName(null);
      setValue("brand_id", value || undefined);
    }
  };

  // Handle category selection or creation
  const handleCategoryChange = (value: string, isNew: boolean, newLabel?: string) => {
    if (isNew && newLabel) {
      // User wants to create a new category
      setPendingCategoryName(newLabel);
      setValue("category_id", ""); // Clear the category_id since we'll create it on submit
    } else {
      // User selected an existing category
      setPendingCategoryName(null);
      setValue("category_id", value);
    }
  };

  const isLoadingProduct = productId && productQuery.isLoading;
  const hasError = productId && productQuery.error;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl p-5 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {productId ? "Edit Product" : "Add New Product"}
          </SheetTitle>
          <SheetDescription>
            {productId
              ? "Update the product details below."
              : "Fill in the details to create a new product."}
          </SheetDescription>
        </SheetHeader>

        {isLoadingProduct ? (
          <div className="flex items-center justify-center py-12">
            <LogoLoader size="lg" text="Loading product data..." />
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
                  Failed to load product
                </p>
                <p className="text-gray-600 text-sm mt-1">
                  {productQuery.error.message}
                </p>
              </div>
              <button
                type="button"
                onClick={() => productQuery.refetch()}
                className="px-4 py-2 bg-[#38761d] text-white rounded-lg hover:bg-opacity-90"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="product-name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Product Name *
                </label>
                <input
                  id="product-name"
                  {...register("name")}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter product name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="product-slug"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Slug *
                </label>
                <input
                  id="product-slug"
                  {...register("slug")}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  placeholder="product-slug"
                />
                {errors.slug && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.slug.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Image
                </label>
                <ImageUploader
                  value={productImages[0]?.url}
                  onChange={(url) => {
                    if (productImages.length === 0) {
                      setProductImages([{ url, is_primary: true }]);
                    } else {
                      setProductImages([
                        { ...productImages[0], url },
                        ...productImages.slice(1),
                      ]);
                    }
                  }}
                  onRemove={() => {
                    setProductImages(productImages.slice(1));
                  }}
                  disabled={isLoading || isSubmitting}
                  folder="products"
                />
              </div>

              <div>
                <label
                  htmlFor="product-sku"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  SKU *
                </label>
                <input
                  id="product-sku"
                  {...register("sku")}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  placeholder="SKU123"
                />
                {errors.sku && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.sku.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor="product-price"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Price (₦) *
                  </label>
                  <input
                    id="product-price"
                    {...register("price", { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  />
                  {errors.price && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.price.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="product-cost-price"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Cost Price (₦)
                  </label>
                  <input
                    id="product-cost-price"
                    {...register("cost_price", { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  />
                  {errors.cost_price && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.cost_price.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="product-compare-price"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Compare Price (₦)
                  </label>
                  <input
                    id="product-compare-price"
                    {...register("compare_price", { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="product-quantity"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Quantity *
                  </label>
                  <input
                    id="product-quantity"
                    {...register("quantity", { valueAsNumber: true })}
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  />
                  {errors.quantity && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.quantity.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="product-low-stock"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Low Stock Threshold
                  </label>
                  <input
                    id="product-low-stock"
                    {...register("low_stock_threshold", {
                      valueAsNumber: true,
                    })}
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="product-category"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Category *
                </label>
                <CreatableCombobox
                  id="product-category"
                  options={categoryOptions}
                  value={watch("category_id") || ""}
                  onChange={handleCategoryChange}
                  placeholder="Search or type to create category..."
                  createLabel="Create category"
                  disabled={isLoading || isSubmitting}
                  isLoading={categoriesQuery.isLoading}
                  pendingLabel={pendingCategoryName || undefined}
                />
                {pendingCategoryName && (
                  <p className="mt-1 text-sm text-green-600">
                    New category "{pendingCategoryName}" will be created when you save
                  </p>
                )}
                {errors.category_id && !pendingCategoryName && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.category_id.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="product-status"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Status
                </label>
                <select
                  id="product-status"
                  {...register("status")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                >
                  <option value={ProductStatus.DRAFT}>Draft</option>
                  <option value={ProductStatus.ACTIVE}>Active</option>
                  <option value={ProductStatus.INACTIVE}>Inactive</option>
                  <option value={ProductStatus.ARCHIVED}>Archived</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="product-brand"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Brand
                </label>
                <ServerSearchCombobox
                  id="product-brand"
                  value={watch("brand_id") || ""}
                  onChange={handleBrandChange}
                  onSearch={searchBrands}
                  placeholder="Search or type to create brand..."
                  createLabel="Create brand"
                  disabled={isLoading || isSubmitting}
                  pendingLabel={pendingBrandName || undefined}
                  debounceMs={300}
                  minSearchLength={1}
                />
                {pendingBrandName && (
                  <p className="mt-1 text-sm text-green-600">
                    New brand "{pendingBrandName}" will be created when you save
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="product-short-desc"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Short Description
                </label>
                <textarea
                  id="product-short-desc"
                  {...register("short_description")}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  placeholder="Brief product description"
                />
              </div>

              <div>
                <label
                  htmlFor="product-description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description
                </label>
                <textarea
                  id="product-description"
                  {...register("description")}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  placeholder="Detailed product description"
                />
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    {...register("is_featured")}
                    type="checkbox"
                    className="mr-2 w-4 h-4 text-trichomes-primary focus:ring-trichomes-primary/20 accent-trichomes-primary border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">
                    Featured Product
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    {...register("taxable")}
                    type="checkbox"
                    className="mr-2 w-4 h-4 text-trichomes-primary focus:ring-trichomes-primary/20 accent-trichomes-primary border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">Taxable</span>
                </label>

                <label className="flex items-center">
                  <input
                    {...register("requires_shipping")}
                    type="checkbox"
                    className="mr-2 w-4 h-4 text-trichomes-primary focus:ring-trichomes-primary/20 accent-trichomes-primary border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">
                    Requires Shipping
                  </span>
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={isLoading || isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || isSubmitting}
                className="px-4 py-2 bg-[#38761d] text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50"
              >
                {isLoading || isSubmitting
                  ? "Saving..."
                  : productId
                    ? "Update Product"
                    : "Create Product"}
              </button>
            </div>
          </form>
        )}
      </SheetContent>
    </Sheet>
  );
}
