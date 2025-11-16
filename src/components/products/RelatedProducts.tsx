"use client";

import Image from "next/image";
import Link from "next/link";

import { trpc } from "@/utils/trpc";

interface RelatedProductsProps {
  /** Current product ID */
  productId: string;
  /** Maximum number of products to show */
  limit?: number;
  /** Additional className */
  className?: string;
}

/**
 * RelatedProducts Component
 *
 * Displays related products based on category.
 * Used on product detail pages.
 *
 * Follows Trichomes Design Guide principles:
 * - Reusable component
 * - Type-safe
 * - Proper loading states
 * - Error handling
 */
export function RelatedProducts({
  productId,
  limit = 4,
  className = "",
}: RelatedProductsProps) {
  const { data: products, isLoading } = trpc.getRelatedProducts.useQuery(
    {
      productId,
      limit,
    },
    {
      refetchOnWindowFocus: false,
    },
  );

  if (isLoading) {
    return (
      <div className={`${className}`}>
        <h3 className="text-xl font-heading font-semibold text-trichomes-forest mb-6">
          Related Products
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square bg-trichomes-soft rounded border border-trichomes-forest/15 mb-3"></div>
              <div className="h-4 bg-trichomes-soft rounded mb-2"></div>
              <div className="h-4 bg-trichomes-soft rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className={`${className}`}>
      <h3 className="text-xl font-heading font-semibold text-trichomes-forest mb-6">
        Related Products
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {products.map((product) => {
          const primaryImage =
            product.images?.find((img) => img.is_primary) ||
            product.images?.[0];
          const imageUrl = primaryImage?.url || "/placeholder-product.jpg";

          return (
            <Link
              key={product.id}
              href={`/products/${product.slug || product.id}`}
              className="group bg-white rounded-xl border border-trichomes-forest/10 shadow-sm hover:shadow-md transition-all duration-200 ease-out overflow-hidden"
            >
              <div className="aspect-square relative overflow-hidden bg-trichomes-soft">
                <Image
                  src={imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>
              <div className="p-4">
                <h4 className="font-medium text-trichomes-forest mb-2 line-clamp-2 group-hover:text-trichomes-primary transition-colors duration-150 font-body">
                  {product.name}
                </h4>
                <p className="text-lg font-semibold text-trichomes-forest font-body">
                  ₦{Number(product.price).toLocaleString()}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
