'use client';

import React from 'react';
import { ProductCard } from './product-card';
import type { Product, Category, ProductImage } from '@prisma/client';

export type ProductWithRelations = Product & {
  category: Pick<Category, 'id' | 'name' | 'slug'>;
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
  onToggleWishlist
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          onProductClick={onProductClick}
          onAddToCart={onAddToCart}
          wishlist={wishlist}
          onToggleWishlist={onToggleWishlist}
        />
      ))}
    </div>
  );
};