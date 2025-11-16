"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ComparisonTable } from "@/components/products/ComparisonTable";
import { trpc } from "@/utils/trpc";

export default function CompareClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [productIds, setProductIds] = useState<string[]>(() => {
    const ids = searchParams.get("products")?.split(",").filter(Boolean) || [];
    return ids.slice(0, 4);
  });

  const { data: products, isLoading } = trpc.getProductsByIds.useQuery(
    { ids: productIds },
    {
      enabled: productIds.length > 0,
      refetchOnWindowFocus: false,
    },
  );

  const handleRemove = (productId: string) => {
    const newIds = productIds.filter((id) => id !== productId);
    setProductIds(newIds);

    if (newIds.length > 0) {
      router.push(`/compare?products=${newIds.join(",")}`);
    } else {
      router.push("/compare");
    }
  };

  const handleAddProduct = () => {
    router.push("/products?addToCompare=true");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-trichomes-soft">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-12 sm:pb-16 max-w-7xl">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-trichomes-soft rounded w-1/3"></div>
            <div className="h-64 bg-trichomes-soft rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="min-h-screen bg-trichomes-soft">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-12 sm:pb-16 max-w-7xl">
          <h1 className="text-2xl font-heading font-semibold text-trichomes-forest mb-6">
            Compare Products
          </h1>
          <div className="bg-white p-12 rounded-xl border border-trichomes-forest/10 shadow-sm text-center">
            <p className="text-trichomes-forest/60 font-body mb-4">
              No products to compare.
            </p>
            <Link
              href="/products"
              className="inline-block bg-trichomes-primary text-white py-3 px-6 rounded-full hover:bg-trichomes-primary/90 font-semibold transition-all duration-150 ease-out text-sm font-body"
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
    <div className="min-h-screen bg-trichomes-soft">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-12 sm:pb-16 max-w-7xl">
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


