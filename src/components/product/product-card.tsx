"use client";

import Image from "next/image";
import type React from "react";
import { useState } from "react";
import { HeartIcon, MinusIcon, PlusIcon } from "../ui/icons";
import type { ProductWithRelations } from "./product-grid";

interface ProductCardProps {
  product: ProductWithRelations;
  onProductClick: (product: ProductWithRelations) => void;
  onAddToCart: (product: ProductWithRelations, quantity: number) => void;
  wishlist: string[]; // Array of product IDs
  onToggleWishlist: (product: ProductWithRelations) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onProductClick: _onProductClick,
  onAddToCart,
  wishlist,
  onToggleWishlist,
}) => {
  const [quantity, setQuantity] = useState(1);
  const isInWishlist = wishlist.includes(product.id);

  // Get the primary image or first image
  const primaryImage =
    product.images?.find((img) => img.is_primary) || product.images?.[0];
  const imageUrl =
    primaryImage?.url ||
    `https://placehold.co/400x400/e6e4c6/3a643b?text=${encodeURIComponent(product.name.charAt(0))}`;

  // Check if product is in stock
  const inStock = !product.track_quantity || product.quantity > 0;
  const maxQuantity = product.track_quantity ? product.quantity : 999;

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuantity((prev) => Math.min(maxQuantity, prev + 1));
  };

  const handleAddToBag = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inStock) {
      onAddToCart(product, quantity);
    }
  };

  const handleToggleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleWishlist(product);
  };

  return (
    <div className="bg-white border border-[#1E3024]/10 flex flex-col group transition-all duration-200 ease-in-out hover:shadow-lg hover:scale-[1.02] h-full w-full overflow-hidden rounded-3xl">
      {/* Product Image */}
      <div className="relative overflow-hidden mb-3 aspect-square w-full flex-shrink-0">
        <Image
          src={imageUrl}
          alt={primaryImage?.alt_text || product.name}
          width={400}
          height={400}
          className="w-full h-full object-cover "
          priority={false}
        />
        {!inStock && (
          <div className="absolute top-1.5 right-1.5 bg-red-600 text-white px-2 py-0.5  text-[11px] font-body font-semibold shadow-md">
            Out of Stock
          </div>
        )}
      </div>

      {/* Product Information */}
      <div className="flex flex-col flex-grow min-h-0 p-3">
        {/* Category - appears first */}
        <p className="text-[12px] font-body font-medium text-[#1E3024]/80 mb-1 uppercase tracking-wide">
          {product.category.name}
        </p>
        {/* Product Name - appears second */}
        <h3 className="text-[14px] leading-tight font-body font-medium text-[#1E3024] mb-2 line-clamp-2">
          {product.name}
        </h3>
        {/* Price */}
        <div className="flex items-baseline gap-1.5 mb-4">
          <p className="text-[16px] font-body font-semibold text-[#1E3024]">
            ₦{Number(product.price).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          {product.compare_price &&
            Number(product.compare_price) > Number(product.price) && (
              <p className="text-[12px] font-body text-[#1E3024]/40 line-through">
                ₦{Number(product.compare_price).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 mt-auto">
          {/* Quantity Selector */}
          <div className="flex items-center border border-[#1E3024]/20 rounded overflow-hidden flex-shrink-0">
            <button
              type="button"
              onClick={handleDecrement}
              className="px-2.5 py-1.5 text-[#1E3024]/70 hover:text-[#1E3024] hover:bg-[#E6E4C6]/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150 ease-out text-sm"
              disabled={quantity <= 1}
            >
              <MinusIcon className="w-3.5 h-3.5" />
            </button>
            <span className="px-3 py-1.5 text-center min-w-[2rem] text-[13px] font-body font-semibold text-[#1E3024] border-x border-[#1E3024]/10">
              {quantity}
            </span>
            <button
              type="button"
              onClick={handleIncrement}
              className="px-2.5 py-1.5 text-[#1E3024]/70 hover:text-[#1E3024] hover:bg-[#E6E4C6]/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150 ease-out text-sm"
              disabled={quantity >= maxQuantity}
            >
              <PlusIcon className="w-3.5 h-3.5" />
            </button>
          </div>
          {/* Add to bag button - dark grey */}
          <button
            type="button"
            onClick={handleAddToBag}
            disabled={!inStock}
            className="flex-1 bg-[#4A5568] text-white py-2 px-3 hover:bg-[#3A3F47] hover:shadow-md transition-all duration-150 ease-out font-body font-semibold disabled:bg-[#1E3024]/20 disabled:text-[#1E3024]/40 disabled:cursor-not-allowed text-[13px] whitespace-nowrap rounded"
          >
            {inStock ? "Add to bag" : "Out of Stock"}
          </button>
        </div>
      </div>
    </div>
  );
};
