'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { PlusIcon, MinusIcon, HeartIcon, TrashIcon } from '@/components/ui/icons';
import { useAuth } from '../../contexts/auth-context';
import { trpc } from '@/utils/trpc';
import { toast } from 'sonner';

export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const utils = trpc.useUtils();

  // Fetch cart data
  const cartQuery = trpc.getCart.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchOnWindowFocus: false,
  });

  // Mutations
  const updateCartMutation = trpc.updateCartItem.useMutation({
    onSuccess: () => {
      utils.getCart.invalidate();
      toast.success('Cart updated');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update cart');
    },
  });

  const removeCartMutation = trpc.removeFromCart.useMutation({
    onSuccess: () => {
      utils.getCart.invalidate();
      toast.success('Item removed from cart');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to remove item');
    },
  });

  const addToWishlistMutation = trpc.addToWishlist.useMutation({
    onSuccess: () => {
      utils.getWishlist.invalidate();
      toast.success('Added to wishlist');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to add to wishlist');
    },
  });

  const cartItems = cartQuery.data?.items || [];
  const subtotal = cartQuery.data?.total || 0;
  const shipping = subtotal > 0 ? 4500.00 : 0;
  const total = subtotal + shipping;

  const handleUpdateQuantity = (cartItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(cartItemId);
    } else {
      updateCartMutation.mutate({ id: cartItemId, quantity: newQuantity });
    }
  };

  const handleRemoveItem = (cartItemId: string) => {
    removeCartMutation.mutate({ id: cartItemId });
  };

  const handleAddToWishlist = (productId: string, cartItemId: string) => {
    addToWishlistMutation.mutate(
      { product_id: productId },
      {
        onSuccess: () => {
          // Optionally remove from cart after adding to wishlist
          handleRemoveItem(cartItemId);
        },
      }
    );
  };

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      // Store current cart for after authentication
      localStorage.setItem('trichomes_checkout_redirect', 'true');
      // Redirect to account selection page
      router.push('/account');
    } else {
      // User is authenticated, proceed to checkout
      router.push('/checkout');
    }
  };

  // Show loading state
  if (isLoading || cartQuery.isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading cart...</p>
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
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Sign in to view your cart</h2>
            <p className="text-gray-600 mb-6">Please sign in to access your shopping cart</p>
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
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Cart</h1>
          <Link href="/" className="text-green-600 hover:underline">
            ← Continue shopping
          </Link>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg border">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h10"/>
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
              <p className="text-gray-600 mb-6">Add some products to get started</p>
              <Link
                href="/"
                className="inline-block bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 font-medium"
              >
                Start shopping
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cart Items */}
            <div className="lg:w-2/3">
              <div className="space-y-4">
                {cartItems.map(item => {
                  const product = item.product;
                  const primaryImage = product.images[0]?.url || '/placeholder-product.png';
                  const price = Number(product.price);

                  return (
                    <div key={item.id} className="bg-white p-6 rounded-lg border flex items-center">
                      {/* Product Image */}
                      <div className="relative w-24 h-24 mr-6 flex-shrink-0">
                        <Image
                          src={primaryImage}
                          alt={product.name}
                          fill
                          className="object-cover rounded-md bg-gray-100"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-grow">
                        <Link
                          href={`/products/${product.slug}`}
                          className="font-semibold hover:text-green-600"
                        >
                          {product.name}
                        </Link>
                        <p className="text-sm text-gray-600 mt-1">
                          Unit price: ₦{price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                        {product.category && (
                          <p className="text-xs text-gray-500 mt-1">{product.category.name}</p>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center border border-gray-300 rounded-md mx-6">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          className="px-3 py-2 text-gray-500 hover:text-black disabled:opacity-50"
                          disabled={updateCartMutation.isPending}
                        >
                          <MinusIcon />
                        </button>
                        <span className="px-4 text-center w-12">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          className="px-3 py-2 text-gray-500 hover:text-black disabled:opacity-50"
                          disabled={updateCartMutation.isPending}
                        >
                          <PlusIcon />
                        </button>
                      </div>

                      {/* Price and Actions */}
                      <div className="flex flex-col items-end w-48">
                        <p className="text-lg font-bold mb-4">
                          ₦{(price * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                        <div className="flex space-x-4">
                          <button
                            onClick={() => handleAddToWishlist(product.id, item.id)}
                            className="text-gray-500 hover:text-gray-800 p-1 disabled:opacity-50"
                            title="Move to wishlist"
                            disabled={addToWishlistMutation.isPending}
                          >
                            <HeartIcon />
                          </button>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-gray-500 hover:text-red-600 p-1 disabled:opacity-50"
                            title="Remove item"
                            disabled={removeCartMutation.isPending}
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:w-1/3">
              <div className="bg-white p-6 rounded-lg border sticky top-8">
                <h2 className="text-xl font-bold mb-6">Order summary</h2>

                <div className="space-y-4 text-gray-700">
                  <div className="flex justify-between">
                    <span>Subtotal ({cartItems.length} items)</span>
                    <span>₦{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>
                      {shipping === 0 ? 'Free' : `₦${shipping.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>Calculated at checkout</span>
                  </div>

                  <hr className="my-4"/>

                  <div className="flex justify-between text-lg font-bold text-black">
                    <span>Total</span>
                    <span>₦{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                <button
                  onClick={handleProceedToCheckout}
                  className="w-full bg-green-600 text-white py-3 mt-6 rounded-lg hover:bg-green-700 font-semibold transition-colors"
                >
                  Proceed to checkout
                </button>

                <div className="mt-4 text-center">
                  <button className="text-green-600 hover:underline text-sm">
                    Use promo code
                  </button>
                </div>

                <div className="mt-6 pt-6 border-t text-xs text-gray-500">
                  <p className="flex items-center mb-2">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    Secure checkout
                  </p>
                  <p className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Free returns within 30 days
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}