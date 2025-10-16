'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { HeartIcon, TrashIcon } from '../../components/ui/icons';

// Temporary interface for migration
interface Product {
  id: number;
  name: string;
  price: number;
  currency: string;
  imageUrl: string;
  inStock?: boolean;
  slug?: string;
}

interface WishlistItemProps {
  item: Product;
  onRemove: (id: number) => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onProductClick: (product: Product) => void;
}

const WishlistItem: React.FC<WishlistItemProps> = ({ item, onRemove, onAddToCart, onProductClick }) => {
  const isInStock = item.inStock !== false;

  return (
    <div className="bg-white p-6 rounded-lg border flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-6 flex-grow w-full sm:w-auto">
        <div
          className="relative w-24 h-24 flex-shrink-0 cursor-pointer"
          onClick={() => onProductClick(item)}
        >
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            className="object-cover rounded-md bg-gray-100"
          />
        </div>
        <div className="flex-grow">
          <button
            onClick={() => onProductClick(item)}
            className="font-semibold text-left hover:text-green-600 transition-colors"
          >
            {item.name}
          </button>
          <p className="text-sm text-gray-500 mt-1">
            {isInStock ? 'In stock' : 'Out of stock'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6 w-full sm:w-auto">
        <p className="text-lg font-bold w-32 text-left sm:text-center">
          {item.currency}{item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </p>
        <div className="flex items-center gap-4">
          {isInStock ? (
            <button
              onClick={() => onAddToCart(item, 1)}
              className="bg-[#38761d] text-white py-2 px-6 rounded-lg hover:bg-opacity-90 transition-colors font-semibold whitespace-nowrap"
            >
              Add to cart
            </button>
          ) : (
            <p className="text-red-500 font-semibold text-center w-28">Out of stock</p>
          )}
          <button
            onClick={() => onRemove(item.id)}
            className="text-gray-500 hover:text-red-600 p-1"
            title="Remove from wishlist"
          >
            <TrashIcon />
          </button>
        </div>
      </div>
    </div>
  );
};

export default function WishlistPage() {
  const router = useRouter();

  // Mock wishlist data - will be replaced with global state/context
  const [wishlistItems, setWishlistItems] = useState<Product[]>([
    {
      id: 4,
      name: 'The Ordinary Niacinamide 10% + Zinc 1%',
      price: 8900.00,
      currency: '₦',
      imageUrl: 'https://picsum.photos/seed/4/400/400',
      slug: 'the-ordinary-niacinamide-zinc',
      inStock: true
    },
    {
      id: 5,
      name: 'Good Molecules Gentle Retinol Cream',
      price: 11000.00,
      currency: '₦',
      imageUrl: 'https://picsum.photos/seed/5/400/400',
      slug: 'good-molecules-retinol-cream',
      inStock: false
    }
  ]);

  const [cart, setCart] = useState<any[]>([]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = wishlistItems.length;

  const handleRemoveFromWishlist = (productId: number) => {
    setWishlistItems(prev => prev.filter(item => item.id !== productId));
  };

  const handleAddToCart = (product: Product, quantity: number) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
      ));
    } else {
      setCart([...cart, { ...product, quantity }]);
    }
    console.log(`Added ${quantity} ${product.name} to cart`);

    // Optionally remove from wishlist after adding to cart
    // handleRemoveFromWishlist(product.id);
  };

  const handleProductClick = (product: Product) => {
    router.push(`/products/${product.slug || product.id}`);
  };

  const handleGoToShop = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#343A40]">
      

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">My Wishlist</h1>
          <Link href="/" className="text-green-600 hover:underline">
            Continue shopping
          </Link>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg border">
            <div className="max-w-md mx-auto">
              <HeartIcon className="mx-auto w-16 h-16 text-gray-300 mb-6" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h2>
              <p className="text-gray-600 mb-6">Save items you love for later. They'll appear here.</p>
              <button
                onClick={handleGoToShop}
                className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 font-semibold transition-colors"
              >
                Start shopping
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-gray-600">
                {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
              </p>
            </div>

            <div className="space-y-4">
              {wishlistItems.map(item => (
                <WishlistItem
                  key={item.id}
                  item={item}
                  onRemove={handleRemoveFromWishlist}
                  onAddToCart={handleAddToCart}
                  onProductClick={handleProductClick}
                />
              ))}
            </div>

            {/* Quick Actions */}
            <div className="mt-8 bg-white p-6 rounded-lg border">
              <h3 className="font-semibold mb-4">Quick Actions</h3>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => {
                    const inStockItems = wishlistItems.filter(item => item.inStock !== false);
                    inStockItems.forEach(item => handleAddToCart(item, 1));
                  }}
                  className="bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700 font-semibold transition-colors"
                  disabled={!wishlistItems.some(item => item.inStock !== false)}
                >
                  Add all in-stock items to cart
                </button>
                <button
                  onClick={() => setWishlistItems([])}
                  className="border border-gray-300 text-gray-700 py-2 px-6 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
                >
                  Clear wishlist
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}