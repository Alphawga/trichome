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
        <h3 className="text-[20px] sm:text-[24px] font-bold text-gray-900 mb-6">
          Related Products
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square bg-gray-100 rounded-sm border border-gray-200 mb-3"></div>
              <div className="h-3 bg-gray-100 rounded mb-2"></div>
              <div className="h-3 bg-gray-100 rounded w-2/3"></div>
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
      <h3 className="text-[20px] sm:text-[24px] font-bold text-gray-900 mb-6">
        Related Products
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {products.map((product) => {
          const primaryImage =
            product.images?.find((img) => img.is_primary) ||
            product.images?.[0];
          const imageUrl = primaryImage?.url || "/placeholder-product.jpg";

          return (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="group bg-white rounded-sm border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 ease-out overflow-hidden"
            >
              <div className="aspect-square relative overflow-hidden bg-gray-100">
                <Image
                  src={imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                />
              </div>
              <div className="p-3">
                <h4 className="font-medium text-gray-900 mb-1.5 text-[13px] sm:text-[14px] line-clamp-2 group-hover:text-[#40702A] transition-colors duration-150">
                  {product.name}
                </h4>
                <p className="text-[14px] sm:text-[15px] font-bold text-gray-900">
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
