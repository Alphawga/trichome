"use client";

import { Heart, Minus, Plus } from "lucide-react"; // Assuming lucide-react for icons
import Image from "next/image";
import type { ProductCardData } from "@/types/product";

interface ProductCardProps {
  product: ProductCardData;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="bg-white rounded-xl overflow-hidden group">
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <Image
          src={product.images?.[0]?.url || "/product-image.jpg"} // Use product image URL
          alt={product.images?.[0]?.alt_text || product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      <div className="p-4 bg-[#FAFAF7] flex flex-col items-center text-center">
        <h3 className="font-normal text-base text-gray-900 mb-2 line-clamp-2">
          {product.name}
        </h3>

        <div className="flex items-center justify-center mb-4">
          <span className="text-xl font-medium text-gray-900">
            ₦
            {Number(product.price).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>

        <div className="flex items-center space-x-2 font-xs">
          <button
            type="button"
            className="p-2 border border-gray-300 hover:bg-gray-50 transition-colors duration-200"
          >
            <Heart className="w-2 h-2 text-gray-600" />
          </button>

          <div className="flex-grow flex items-center justify-between border border-gray-300 rounded-full px-4 py-2">
            <button
              type="button"
              className="text-gray-700 hover:text-gray-900 transition-colors duration-200"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="font-medium text-gray-900 mx-3">1</span>
            <button
              type="button"
              className="text-gray-700 hover:text-gray-900 transition-colors duration-200"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            className="bg-[#1E3024] text-white px-5 py-2.5 rounded-full text-base font-medium hover:bg-opacity-90 transition-colors duration-200 shadow-md"
          >
            Add to bag
          </button>
        </div>
      </div>
    </div>
  );
}
