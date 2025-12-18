"use client";

import Image from "next/image";
import type React from "react";
import { useState } from "react";
import { HeartIcon, MinusIcon, PlusIcon, CompareIcon } from "../ui/icons";
import type { ProductWithRelations } from "./product-grid";
import { useCompare } from "@/app/contexts/compare-context";

interface ProductCardProps {
  product: ProductWithRelations;
  onProductClick: (product: ProductWithRelations) => void;
  onAddToCart: (product: ProductWithRelations, quantity: number) => void;
  wishlist: string[]; // Array of product IDs
  onToggleWishlist: (product: ProductWithRelations) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onProductClick,
  onAddToCart,
  wishlist,
  onToggleWishlist,
}) => {
  const [quantity, setQuantity] = useState(1);
  const isInWishlist = wishlist.includes(product.id);
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  const isCompared = isInCompare(product.id);


  const primaryImage =
    product.images?.find((img) => img.is_primary) || product.images?.[0];
  const imageUrl =
    primaryImage?.url ||
    `https://placehold.co/400x400/e6e4c6/3a643b?text=${encodeURIComponent(product.name.charAt(0))}`;


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

  const handleToggleCompareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCompared) {
      removeFromCompare(product.id);
    } else {
      addToCompare(product.id);
    }
  };

  const handleCardClick = () => {
    onProductClick(product);
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white pb-5 group transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl h-full w-full overflow-hidden rounded-xl flex flex-col cursor-pointer"
    >
      {/* Product Image */}
      <div className="relative overflow-hidden aspect-square w-full bg-[#F3F3F3] shrink-0">
        <Image
          src={imageUrl}
          alt={primaryImage?.alt_text || product.name}
          fill
          className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />
        {!inStock && (
          <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 text-[10px] font-medium uppercase tracking-wider shadow-sm rounded-sm">
            Out of Stock
          </div>
        )}
        {/* Hover Actions */}
        <div className="absolute top-2 left-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            type="button"
            onClick={handleToggleCompareClick}
            className={`p-1.5 rounded-full shadow-sm transition-colors duration-200 ${isCompared
              ? "bg-[#1E3024] text-white"
              : "bg-white text-[#1E3024] hover:bg-[#1E3024] hover:text-white"
              }`}
            title={isCompared ? "Remove from compare" : "Add to compare"}
          >
            <CompareIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Product Information */}
      <div className="flex flex-col grow md:p-4 p-2">
        {/* Category Pill */}
        <div className="mb-2">
          <span className="inline-block px-2 py-0.5 text-[5px] md:text-xs font-medium uppercase tracking-wider text-[#1E3024]/80 border border-[#1E3024]/20 rounded-full bg-transparent">
            {product.category.name}
          </span>
        </div>

        {/* Product Name */}
        <h3 className="text-xs md:text-[12px] leading-snug font-body font-normal text-[#1E3024] mb-1 line-clamp-2 min-h-[2.5em]">
          {product.name}
        </h3>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-4">
          <p className="text-sm md:text-base font-body font-bold text-[#1E3024]">
            ₦{Number(product.price).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          {product.compare_price &&
            Number(product.compare_price) > Number(product.price) && (
              <p className="text-[8px] md:text-xs font-body text-[#1E3024]/40 line-through decoration-[#1E3024]/40">
                ₦{Number(product.compare_price).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-3 mt-auto h-7 md:h-10">
          {/* Quantity Selector */}
          <div className="flex items-center border border-[#1E3024]/20 rounded-md overflow-hidden h-full  bg-white shrink-0">
            <button
              type="button"
              onClick={handleDecrement}
              className="md:px-3 px-1 h-full text-[#1E3024]/60 hover:text-[#1E3024] hover:bg-[#1E3024]/5 disabled:opacity-30 transition-colors duration-150 flex items-center justify-center"
              disabled={quantity <= 1}
            >
              <MinusIcon className="w-2 h-2 md:w-3 md:h-3" />
            </button>
            <span className="md:px-1 px-0.5 text-center min-w-6 text-[8px] md:text-[14px] font-body font-medium text-[#1E3024]">
              {quantity}
            </span>
            <button
              type="button"
              onClick={handleIncrement}
              className="md:px-3 pr-1 h-full text-[#1E3024]/60 hover:text-[#1E3024] hover:bg-[#1E3024]/5 disabled:opacity-30 transition-colors duration-150 flex items-center justify-center"
              disabled={quantity >= maxQuantity}
            >
              <PlusIcon className="w-2 h-2 md:w-3 md:h-3" />
            </button>
          </div>

          {/* Add to bag button */}
          <button
            type="button"
            onClick={handleAddToBag}
            disabled={!inStock}
            className="md:px-3 px-1.5 h-full bg-black text-white hover:bg-[#2A4030] hover:shadow-md transition-all duration-200 ease-out font-body font-medium text-xs md:text-base rounded-md whitespace-nowrap flex items-center justify-center disabled:bg-[#1E3024]/20 disabled:text-[#1E3024]/40 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {inStock ? "Add to bag" : "Out of Stock"}
          </button>
        </div>
      </div>
    </div>
  );
};
