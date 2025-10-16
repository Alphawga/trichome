'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { HeartIcon, PlusIcon, MinusIcon } from '../ui/icons';

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

interface ProductCardProps {
  product: Product;
  onProductClick: (product: Product) => void;
  onAddToCart: (product: Product, quantity: number) => void;
  wishlist: Product[];
  onToggleWishlist: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onProductClick,
  onAddToCart,
  wishlist,
  onToggleWishlist
}) => {
  const [quantity, setQuantity] = useState(1);
  const isInWishlist = wishlist.some(item => item.id === product.id);

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuantity(prev => Math.max(1, prev - 1));
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuantity(prev => prev + 1);
  };

  const handleAddToBag = (e: React.MouseEvent) => {
      e.stopPropagation();
      onAddToCart(product, quantity);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleWishlist(product);
  };

  return (
    <div
        className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col group transition-shadow hover:shadow-lg cursor-pointer"
        onClick={() => onProductClick(product)}
    >
      <div className="relative overflow-hidden rounded-md mb-4">
        <Image
          src={product.imageUrl}
          alt={product.name}
          width={400}
          height={256}
          className="w-full h-64 object-cover bg-gray-100"
          priority={false}
        />
      </div>
      <div className="flex-grow">
        <h3 className="text-base font-medium text-gray-800 mb-2 h-12">{product.name}</h3>
        <p className="text-lg font-semibold text-gray-900 mb-4">
          {product.currency}{product.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>
      <div className="flex items-center space-x-2 mt-auto">
        <button onClick={handleToggleWishlist} className="p-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors text-gray-500 hover:text-red-500">
          <HeartIcon filled={isInWishlist} className={isInWishlist ? 'text-red-500' : ''} />
        </button>
        <div className="flex items-center border border-gray-300 rounded-md">
          <button onClick={handleDecrement} className="px-3 py-2 text-gray-500 hover:text-black">
            <MinusIcon />
          </button>
          <span onClick={(e) => e.stopPropagation()} className="px-4 text-center w-12">{quantity}</span>
          <button onClick={handleIncrement} className="px-3 py-2 text-gray-500 hover:text-black">
            <PlusIcon />
          </button>
        </div>
        <button onClick={handleAddToBag} className="flex-grow bg-[#343A40] text-white py-2 px-4 rounded-md hover:bg-black transition-colors font-medium">
          Add to bag
        </button>
      </div>
    </div>
  );
};