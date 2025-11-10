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
    <div className="bg-white p-4 sm:p-6 rounded-xl border border-trichomes-forest/10 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow duration-200 ease-out">
      <div className="flex items-center gap-4 sm:gap-6 flex-grow w-full sm:w-auto">
        <div
          className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 cursor-pointer rounded-lg overflow-hidden"
          onClick={() => onProductClick(product.slug)}
        >
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            className="object-cover bg-trichomes-sage"
          />
        </div>
        <div className="flex-grow">
          <button
            onClick={() => onProductClick(product.slug)}
            className="font-heading font-semibold text-[15px] sm:text-[16px] text-left hover:text-trichomes-primary transition-colors duration-150 text-trichomes-forest"
          >
            {product.name}
          </button>
          <p className="text-[13px] sm:text-[14px] text-trichomes-forest/60 mt-1 font-body">
            {isInStock ? 'In stock' : 'Out of stock'}
          </p>
          {product.category && (
            <p className="text-[12px] text-trichomes-forest/50 mt-1 font-body">{product.category.name}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto justify-between sm:justify-end">
        <p className="text-[16px] sm:text-[18px] font-heading font-semibold text-trichomes-forest">
          ₦{price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </p>
        <div className="flex items-center gap-3 sm:gap-4">
          {isInStock ? (
            <button
              onClick={() => onAddToCart(product.id, 1)}
              className="bg-trichomes-primary text-white py-2 px-4 sm:px-6 rounded-full hover:bg-trichomes-primary/90 transition-all duration-150 ease-out hover:shadow-lg font-semibold whitespace-nowrap text-[13px] sm:text-[14px] font-body"
            >
              Add to cart
            </button>
          ) : (
            <p className="text-red-500 font-semibold text-center w-28 text-[13px] sm:text-[14px] font-body">Out of stock</p>
          )}
          <button
            onClick={() => onRemove(item.id)}
            className="text-trichomes-forest/60 hover:text-red-600 p-1 transition-colors duration-150"
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
      <div className="min-h-screen bg-trichomes-soft">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-7xl">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-trichomes-primary mx-auto mb-4"></div>
              <p className="text-trichomes-forest/60 font-body">Loading wishlist...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-trichomes-soft">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-7xl">
          <div className="text-center py-12 sm:py-20 bg-white rounded-xl border border-trichomes-forest/10 shadow-sm">
            <div className="max-w-md mx-auto">
              <h2 className="text-[20px] sm:text-[24px] font-heading font-semibold text-trichomes-forest mb-2">Sign in to view your wishlist</h2>
              <p className="text-trichomes-forest/60 font-body mb-6">Please sign in to access your wishlist</p>
              <Link
                href="/auth/signin"
                className="inline-block bg-trichomes-primary text-white py-3 px-6 sm:px-8 rounded-full hover:bg-trichomes-primary/90 font-semibold transition-all duration-150 ease-out hover:shadow-lg text-[14px] sm:text-[15px] font-body"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-trichomes-soft">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-12 sm:pb-16 max-w-7xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8">
          <h1 className="text-[24px] sm:text-[32px] lg:text-[36px] font-heading font-semibold text-trichomes-forest">My Wishlist</h1>
          <Link href="/" className="text-trichomes-primary hover:text-trichomes-forest transition-colors duration-150 font-body text-[14px] sm:text-[15px] mt-2 sm:mt-0">
            Continue shopping
          </Link>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-12 sm:py-20 bg-white rounded-xl border border-trichomes-forest/10 shadow-sm">
            <div className="max-w-md mx-auto">
              <HeartIcon className="mx-auto w-16 h-16 text-trichomes-sage mb-6" />
              <h2 className="text-[20px] sm:text-[24px] font-heading font-semibold text-trichomes-forest mb-2">Your wishlist is empty</h2>
              <p className="text-trichomes-forest/60 font-body mb-6">Save items you love for later. They'll appear here.</p>
              <button
                onClick={handleGoToShop}
                className="bg-trichomes-primary text-white py-3 px-6 sm:px-8 rounded-full hover:bg-trichomes-primary/90 font-semibold transition-all duration-150 ease-out hover:shadow-lg text-[14px] sm:text-[15px] font-body"
              >
                Start shopping
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4 sm:mb-6">
              <p className="text-trichomes-forest/60 font-body text-[14px] sm:text-[15px]">
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
            <div className="mt-6 sm:mt-8 bg-white p-4 sm:p-6 rounded-xl border border-trichomes-forest/10 shadow-sm">
              <h3 className="font-heading font-semibold text-[16px] sm:text-[17px] mb-3 sm:mb-4 text-trichomes-forest">Quick Actions</h3>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => {
                    const inStockItems = wishlistItems.filter(item => {
                      const product = item.product;
                      return product.status === 'ACTIVE' && (!product.track_quantity || product.quantity > 0);
                    });
                    inStockItems.forEach(item => handleAddToCart(item.product.id, 1));
                  }}
                  className="bg-trichomes-primary text-white py-2 sm:py-3 px-6 sm:px-8 rounded-full hover:bg-trichomes-primary/90 font-semibold transition-all duration-150 ease-out hover:shadow-lg disabled:opacity-50 text-[14px] sm:text-[15px] font-body"
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