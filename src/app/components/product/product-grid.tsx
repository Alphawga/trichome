'use client';

import React from 'react';
import { ProductCard } from './product-card';

// Temporary interface for migration - will be replaced with Prisma types
interface Product {
  id: number;
  name: string;
  price: number;
  currency: string;
  imageUrl: string;
  description?: string;
  brand?: string;
  inStock?: boolean;
}

interface ProductGridProps {
  products: Product[];
  onProductClick: (product: Product) => void;
  onAddToCart: (product: Product, quantity: number) => void;
  wishlist: Product[];
  onToggleWishlist: (product: Product) => void;
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