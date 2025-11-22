"use client";

import type { Category, Product, ProductImage } from "@prisma/client";
import type React from "react";
import { ProductCard } from "./product-card";

export type ProductWithRelations = Product & {
  category: Pick<Category, "id" | "name" | "slug">;
  images: ProductImage[];
};

interface ProductGridProps {
  products: ProductWithRelations[];
  onProductClick: (product: ProductWithRelations) => void;
  onAddToCart: (product: ProductWithRelations, quantity: number) => void;
  wishlist: string[]; // Array of product IDs
  onToggleWishlist: (product: ProductWithRelations) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  onProductClick,
  onAddToCart,
  wishlist,
  onToggleWishlist,
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
      {products.map((product, index) => (
        <div
          key={product.id}
          style={{
            animation: `staggerFadeIn 500ms cubic-bezier(0.16, 1, 0.3, 1) ${index * 50}ms both`,
          }}
        >
          <ProductCard
            product={product}
            onProductClick={onProductClick}
            onAddToCart={onAddToCart}
            wishlist={wishlist}
            onToggleWishlist={onToggleWishlist}
          />
        </div>
      ))}
    </div>
  );
};
