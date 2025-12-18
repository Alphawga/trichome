"use client";

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

interface BrandViewSheetProps {
  brandId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BrandViewSheet({
  brandId,
  open,
  onOpenChange,
}: BrandViewSheetProps) {
  const brandQuery = trpc.getBrandById.useQuery(
    brandId ? { id: brandId } : { id: "" },
    { enabled: !!brandId && open },
  );

  const brand = brandQuery.data;
  const isLoading = brandQuery.isLoading;
  const hasError = brandQuery.error;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg p-0 overflow-y-auto">
        <SheetHeader className="p-6 border-b">
          <SheetTitle>Brand Details</SheetTitle>
          <SheetDescription>
            View detailed information about this brand
          </SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LogoLoader size="lg" text="Loading brand details..." />
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
                  Failed to load brand
                </p>
                <p className="text-gray-600 text-sm mt-1">
                  {brandQuery.error.message}
                </p>
              </div>
              <button
                type="button"
                onClick={() => brandQuery.refetch()}
                className="px-4 py-2 bg-[#38761d] text-white rounded-lg hover:bg-opacity-90"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : brand ? (
          <div className="p-6 space-y-6">
            {/* Brand Image and Basic Info */}
            <div className="flex gap-6">
              <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden border bg-gray-50">
                <Image
                  src={
                    brand.logo ||
                    brand.image ||
                    `https://placehold.co/200x200/38761d/white?text=${brand.name.charAt(0)}`
                  }
                  alt={brand.name}
                  fill
                  className="object-contain"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {brand.name}
                </h3>
                <p className="text-gray-600 mb-3 font-mono text-sm">
                  /{brand.slug}
                </p>
                <span
                  className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${brand.status === "ACTIVE"
                    ? "bg-green-100 text-green-800"
                    : brand.status === "DRAFT"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                    }`}
                >
                  {brand.status === "ACTIVE"
                    ? "Active"
                    : brand.status === "DRAFT"
                      ? "Draft"
                      : "Inactive"}
                </span>
              </div>
            </div>

            {/* Description */}
            {brand.description && (
              <div className="border-t pt-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">
                  Description
                </h4>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {brand.description}
                </p>
              </div>
            )}

            {/* Statistics */}
            <div className="border-t pt-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Statistics
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Total Products</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {brand._count.products}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Sort Order</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {brand.sort_order}
                  </p>
                </div>
              </div>
            </div>

            {/* Recent Products */}
            {brand.products && brand.products.length > 0 && (
              <div className="border-t pt-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Recent Products
                </h4>
                <div className="space-y-3">
                  {brand.products.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="relative w-10 h-10 flex-shrink-0 rounded overflow-hidden border bg-white">
                        <Image
                          src={
                            product.images?.[0]?.url ||
                            `https://placehold.co/80x80/38761d/white?text=${product.name.charAt(0)}`
                          }
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {product.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          ₦{Number(product.price).toLocaleString()}
                        </p>
                      </div>
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
                    {new Date(brand.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Updated</span>
                  <span className="text-gray-900">
                    {new Date(brand.updated_at).toLocaleString()}
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
