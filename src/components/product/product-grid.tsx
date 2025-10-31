'use client';

import React from 'react';
import { ProductCard } from './product-card';
import type { Product, Category, ProductImage } from '@prisma/client';

type ProductWithRelations = Product & {
  category: Pick<Category, 'id' | 'name' | 'slug'>;
  images: ProductImage[];
};

interface ProductForDisplay extends ProductWithRelations {
  currency: string;
  imageUrl: string;
  brand?: string;
  inStock: boolean;
}

interface ProductGridProps {
  products: ProductForDisplay[];
  onProductClick: (product: ProductForDisplay) => void;
  onAddToCart: (product: ProductForDisplay, quantity: number) => void;
  wishlist: ProductForDisplay[];
  onToggleWishlist: (product: ProductForDisplay) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  onProductClick,
  onAddToCart,
  wishlist,
  onToggleWishlist
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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