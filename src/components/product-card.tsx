"use client";

import Image from "next/image";
import { ProductCardData } from "@/types/product";

interface ProductCardProps {
  product: ProductCardData;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="bg-white  shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300 group">
      <div className="relative aspect-square overflow-hidden">
        <Image
          src="/product-image.jpg"
          alt={product.images?.[0]?.alt_text || product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {product.isNew && (
          <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 text-xs font-medium rounded">
            New
          </div>
        )}
        {product.isOnSale && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 text-xs font-medium rounded">
            Sale
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 text-sm">
          {product.name}
        </h3>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-semibold text-gray-900">
              ${Number(product.price).toFixed(2)}
            </span>
            {product.compare_price && Number(product.compare_price) > Number(product.price) && (
              <span className="text-sm text-gray-500 line-through">
                ${Number(product.compare_price).toFixed(2)}
              </span>
            )}
          </div>

          {product.rating && (
            <div className="flex items-center text-xs text-gray-600">
              <span className="text-yellow-400 mr-1">★</span>
              <span>{product.rating}</span>
              {product.reviewCount && (
                <span className="ml-1">({product.reviewCount})</span>
              )}
            </div>
          )}
        </div>

        <div className="flex space-x-2">
          <button className="flex-1 bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded text-sm font-medium hover:bg-gray-50 transition-colors duration-200">
            Add to Cart
          </button>
          <button className="px-3 py-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors duration-200">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}