"use client";

import { ProductStatus } from "@prisma/client";
import Image from "next/image";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { LogoLoader } from "@/components/ui/logo-loader";
import { trpc } from "@/utils/trpc";

interface ProductViewSheetProps {
  productId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductViewSheet({
  productId,
  open,
  onOpenChange,
}: ProductViewSheetProps) {
  const productQuery = trpc.getProductById.useQuery(
    productId ? { id: productId } : { id: "" },
    { enabled: !!productId && open },
  );

  const product = productQuery.data;
  const isLoading = productQuery.isLoading;
  const hasError = productQuery.error;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl p-0 overflow-y-auto">
        <SheetHeader className="p-6 border-b">
          <SheetTitle>Product Details</SheetTitle>
          <SheetDescription>
            View detailed information about this product
          </SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LogoLoader size="lg" text="Loading product details..." />
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
        ) : product ? (
          <div className="p-6 space-y-6">
            {/* Product Image and Basic Info */}
            <div className="flex gap-6">
              <div className="relative w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden border">
                <Image
                  src={
                    product.images?.[0]?.url ||
                    `https://placehold.co/400x400/38761d/white?text=${product.name.charAt(0)}`
                  }
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {product.name}
                </h3>
                <p className="text-gray-600 mb-3">
                  {product.short_description || "No short description"}
                </p>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 text-sm font-semibold rounded-full ${product.status === ProductStatus.ACTIVE
                        ? "bg-green-100 text-green-800"
                        : product.status === ProductStatus.DRAFT
                          ? "bg-yellow-100 text-yellow-800"
                          : product.status === ProductStatus.INACTIVE
                            ? "bg-gray-100 text-gray-800"
                            : "bg-red-100 text-red-800"
                      }`}
                  >
                    {product.status}
                  </span>
                  {product.is_featured && (
                    <span className="px-3 py-1 text-sm font-semibold rounded-full bg-purple-100 text-purple-800">
                      Featured
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Pricing Information */}
            <div className="border-t pt-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Pricing
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Price</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₦{Number(product.price).toLocaleString()}
                  </p>
                </div>
                {product.compare_price && Number(product.compare_price) > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Compare Price</p>
                    <p className="text-xl font-semibold text-gray-700">
                      ₦{Number(product.compare_price).toLocaleString()}
                    </p>
                  </div>
                )}
                {product.cost_price && Number(product.cost_price) > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Cost Price</p>
                    <p className="text-xl font-semibold text-gray-700">
                      ₦{Number(product.cost_price).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Inventory Information */}
            <div className="border-t pt-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Inventory
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Stock Quantity</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {product.quantity} units
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    Low Stock Threshold
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {product.low_stock_threshold} units
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">SKU</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {product.sku}
                  </p>
                </div>
                {product.barcode && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Barcode</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {product.barcode}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Product Details */}
            <div className="border-t pt-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Details
              </h4>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Category</p>
                  <p className="text-base text-gray-900">
                    {product.category.name}
                  </p>
                </div>
                {product.description && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Description</p>
                    <p className="text-base text-gray-900 whitespace-pre-wrap">
                      {product.description}
                    </p>
                  </div>
                )}
                {product.weight && Number(product.weight) > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Weight</p>
                    <p className="text-base text-gray-900">
                      {Number(product.weight)} kg
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Product Attributes */}
            <div className="border-t pt-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Attributes
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center">
                  <span
                    className={`w-3 h-3 rounded-full mr-2 ${product.track_quantity ? "bg-green-500" : "bg-gray-300"}`}
                  ></span>
                  <span className="text-sm text-gray-700">Track Quantity</span>
                </div>
                <div className="flex items-center">
                  <span
                    className={`w-3 h-3 rounded-full mr-2 ${product.is_digital ? "bg-green-500" : "bg-gray-300"}`}
                  ></span>
                  <span className="text-sm text-gray-700">Digital Product</span>
                </div>
                <div className="flex items-center">
                  <span
                    className={`w-3 h-3 rounded-full mr-2 ${product.requires_shipping ? "bg-green-500" : "bg-gray-300"}`}
                  ></span>
                  <span className="text-sm text-gray-700">
                    Requires Shipping
                  </span>
                </div>
                <div className="flex items-center">
                  <span
                    className={`w-3 h-3 rounded-full mr-2 ${product.taxable ? "bg-green-500" : "bg-gray-300"}`}
                  ></span>
                  <span className="text-sm text-gray-700">Taxable</span>
                </div>
              </div>
            </div>

            {/* Metadata */}
            <div className="border-t pt-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Metadata
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Created</span>
                  <span className="text-gray-900">
                    {new Date(product.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Updated</span>
                  <span className="text-gray-900">
                    {new Date(product.updated_at).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Sales</span>
                  <span className="text-gray-900">
                    {product.sale_count || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Views</span>
                  <span className="text-gray-900">
                    {product.view_count || 0}
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
