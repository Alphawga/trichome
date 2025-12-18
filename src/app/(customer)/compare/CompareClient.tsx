"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ComparisonTable } from "@/components/products/ComparisonTable";
import { ChevronRightIcon } from "@/components/ui/icons";
import { trpc } from "@/utils/trpc";
import { useCompare } from "@/app/contexts/compare-context";

export default function CompareClient() {
  const router = useRouter();
  const { comparedProductIds, removeFromCompare, addToCompare } = useCompare();

  // Use context IDs instead of URL params
  const { data: products, isLoading } = trpc.getProductsByIds.useQuery(
    { ids: comparedProductIds },
    {
      enabled: comparedProductIds.length > 0,
      refetchOnWindowFocus: false,
    },
  );

  const handleRemove = (productId: string) => {
    removeFromCompare(productId);
  };


  const handleAddProduct = () => {
    router.push("/products?addToCompare=true");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-12 sm:pb-16 max-w-[2200px]">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-white rounded w-1/3"></div>
            <div className="h-64 bg-white rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-12 sm:pb-16 max-w-[2200px]">
          <h1 className="text-2xl font-heading font-semibold text-gray-900 mb-6">
            Compare Products
          </h1>
          <div className="bg-white p-12 rounded-sm border border-gray-200 shadow-sm text-center">
            <p className="text-gray-900/60 font-body mb-4">
              No products to compare.
            </p>
            <Link
              href="/products"
              className="inline-block bg-[#1E3024] text-white py-3 px-6 rounded-full hover:bg-[#1E3024]/90 font-semibold transition-all duration-150 ease-out text-sm font-body"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const comparisonProducts = products.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug || product.id,
    price: Number(product.price),
    image:
      product.images?.find((img) => img.is_primary)?.url ||
      product.images?.[0]?.url,
    description: product.short_description ?? product.description ?? undefined,
    category: product.category ? { name: product.category.name } : undefined,
    rating: 0,
    reviewCount: 0,
    inStock: product.track_quantity ? (product.quantity || 0) > 0 : true,
    weight: product.weight ? Number(product.weight) : undefined,
  }));

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-12 sm:pb-16 max-w-[2200px]">
        <ComparisonTable
          products={comparisonProducts}
          maxProducts={4}
          onRemove={handleRemove}
          onAddProduct={handleAddProduct}
        />
      </div>
    </div>
  );
}


