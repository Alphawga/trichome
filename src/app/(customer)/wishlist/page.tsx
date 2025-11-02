'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { HeartIcon, TrashIcon } from '@/components/ui/icons';
import { trpc } from '@/utils/trpc';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/auth-context';

interface WishlistItemProps {
  item: any;
  onRemove: (id: string) => void;
  onAddToCart: (productId: string, quantity: number) => void;
  onProductClick: (slug: string) => void;
}

const WishlistItem: React.FC<WishlistItemProps> = ({ item, onRemove, onAddToCart, onProductClick }) => {
  const product = item.product;
  const primaryImage = product.images[0]?.url || '/placeholder-product.png';
  const price = Number(product.price);
  const isInStock = product.status === 'ACTIVE' && (!product.track_quantity || product.quantity > 0);

  return (
    <div className="bg-white p-6 rounded-lg border flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-6 flex-grow w-full sm:w-auto">
        <div
          className="relative w-24 h-24 flex-shrink-0 cursor-pointer"
          onClick={() => onProductClick(product.slug)}
        >
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            className="object-cover rounded-md bg-gray-100"
          />
        </div>
        <div className="flex-grow">
          <button
            onClick={() => onProductClick(product.slug)}
            className="font-semibold text-left hover:text-green-600 transition-colors"
          >
            {product.name}
          </button>
          <p className="text-sm text-gray-500 mt-1">
            {isInStock ? 'In stock' : 'Out of stock'}
          </p>
          {product.category && (
            <p className="text-xs text-gray-500 mt-1">{product.category.name}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-6 w-full sm:w-auto">
        <p className="text-lg font-bold w-32 text-left sm:text-center">
          ₦{price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </p>
        <div className="flex items-center gap-4">
          {isInStock ? (
            <button
              onClick={() => onAddToCart(product.id, 1)}
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
  const { isAuthenticated, isLoading } = useAuth();
  const utils = trpc.useUtils();

  // Fetch wishlist data
  const wishlistQuery = trpc.getWishlist.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchOnWindowFocus: false,
  });

  // Mutations
  const removeFromWishlistMutation = trpc.removeFromWishlist.useMutation({
    onSuccess: () => {
      utils.getWishlist.invalidate();
      toast.success('Removed from wishlist');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to remove from wishlist');
    },
  });

  const addToCartMutation = trpc.addToCart.useMutation({
    onSuccess: () => {
      utils.getCart.invalidate();
      toast.success('Added to cart');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to add to cart');
    },
  });

  const wishlistItems = wishlistQuery.data?.items || [];

  const handleRemoveFromWishlist = (wishlistItemId: string) => {
    removeFromWishlistMutation.mutate({ id: wishlistItemId });
  };

  const handleAddToCart = (productId: string, quantity: number) => {
    addToCartMutation.mutate({ product_id: productId, quantity });
  };

  const handleProductClick = (slug: string) => {
    router.push(`/products/${slug}`);
  };

  const handleGoToShop = () => {
    router.push('/');
  };

  // Show loading state
  if (isLoading || wishlistQuery.isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading wishlist...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-20 bg-white rounded-lg border">
          <div className="max-w-md mx-auto">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Sign in to view your wishlist</h2>
            <p className="text-gray-600 mb-6">Please sign in to access your wishlist</p>
            <Link
              href="/auth/signin"
              className="inline-block bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 font-medium"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
                    const inStockItems = wishlistItems.filter(item => {
                      const product = item.product;
                      return product.status === 'ACTIVE' && (!product.track_quantity || product.quantity > 0);
                    });
                    inStockItems.forEach(item => handleAddToCart(item.product.id, 1));
                  }}
                  className="bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700 font-semibold transition-colors disabled:opacity-50"
                  disabled={
                    addToCartMutation.isPending ||
                    !wishlistItems.some(item => {
                      const product = item.product;
                      return product.status === 'ACTIVE' && (!product.track_quantity || product.quantity > 0);
                    })
                  }
                >
                  Add all in-stock items to cart
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}