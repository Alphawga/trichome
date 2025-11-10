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
      <div className="min-h-screen bg-trichomes-soft">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-7xl">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-trichomes-primary mx-auto mb-4"></div>
              <p className="text-trichomes-forest/60 font-body">Loading cart...</p>
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
              <h2 className="text-[20px] sm:text-[24px] font-heading font-semibold text-trichomes-forest mb-2">Sign in to view your cart</h2>
              <p className="text-trichomes-forest/60 font-body mb-6">Please sign in to access your shopping cart</p>
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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-12 sm:pb-16 max-w-7xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8">
          <h1 className="text-[24px] sm:text-[32px] lg:text-[36px] font-heading font-semibold text-trichomes-forest">Cart</h1>
          <Link href="/" className="text-trichomes-primary hover:text-trichomes-forest transition-colors duration-150 font-body text-[14px] sm:text-[15px] mt-2 sm:mt-0">
            ← Continue shopping
          </Link>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-12 sm:py-20 bg-white rounded-xl border border-trichomes-forest/10 shadow-sm">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-6 bg-trichomes-sage rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-trichomes-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h10"/>
                </svg>
              </div>
              <h2 className="text-[20px] sm:text-[24px] font-heading font-semibold text-trichomes-forest mb-2">Your cart is empty</h2>
              <p className="text-trichomes-forest/60 font-body mb-6">Add some products to get started</p>
              <Link
                href="/"
                className="inline-block bg-trichomes-primary text-white py-3 px-6 sm:px-8 rounded-full hover:bg-trichomes-primary/90 font-semibold transition-all duration-150 ease-out hover:shadow-lg text-[14px] sm:text-[15px] font-body"
              >
                Start shopping
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
            {/* Cart Items */}
            <div className="lg:w-2/3">
              <div className="space-y-4">
                {cartItems.map(item => {
                  const product = item.product;
                  const primaryImage = product.images[0]?.url || '/placeholder-product.png';
                  const price = Number(product.price);

                  return (
                    <div key={item.id} className="bg-white p-4 sm:p-6 rounded-xl border border-trichomes-forest/10 flex flex-col sm:flex-row items-center gap-4 shadow-sm hover:shadow-md transition-shadow duration-200 ease-out">
                      {/* Product Image */}
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0">
                        <Image
                          src={primaryImage}
                          alt={product.name}
                          fill
                          className="object-cover rounded-lg bg-trichomes-sage"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-grow w-full sm:w-auto text-center sm:text-left">
                        <Link
                          href={`/products/${product.slug}`}
                          className="font-heading font-semibold text-[15px] sm:text-[16px] hover:text-trichomes-primary transition-colors duration-150 text-trichomes-forest"
                        >
                          {product.name}
                        </Link>
                        <p className="text-[13px] sm:text-[14px] text-trichomes-forest/60 mt-1 font-body">
                          Unit price: ₦{price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                        {product.category && (
                          <p className="text-[12px] text-trichomes-forest/50 mt-1 font-body">{product.category.name}</p>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center border-2 border-trichomes-forest/20 rounded-lg">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          className="px-3 py-2 text-trichomes-forest/60 hover:text-trichomes-forest disabled:opacity-50 transition-colors duration-150"
                          disabled={updateCartMutation.isPending}
                        >
                          <MinusIcon />
                        </button>
                        <span className="px-4 text-center w-12 font-body text-trichomes-forest">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          className="px-3 py-2 text-trichomes-forest/60 hover:text-trichomes-forest disabled:opacity-50 transition-colors duration-150"
                          disabled={updateCartMutation.isPending}
                        >
                          <PlusIcon />
                        </button>
                      </div>

                      {/* Price and Actions */}
                      <div className="flex flex-col items-center sm:items-end w-full sm:w-auto gap-3">
                        <p className="text-[16px] sm:text-[18px] font-heading font-semibold text-trichomes-forest">
                          ₦{(price * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleAddToWishlist(product.id, item.id)}
                            className="text-trichomes-forest/60 hover:text-trichomes-primary p-1 disabled:opacity-50 transition-colors duration-150"
                            title="Move to wishlist"
                            disabled={addToWishlistMutation.isPending}
                          >
                            <HeartIcon />
                          </button>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-trichomes-forest/60 hover:text-red-600 p-1 disabled:opacity-50 transition-colors duration-150"
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
              <div className="bg-white p-6 rounded-xl border border-trichomes-forest/10 sticky top-8 shadow-sm">
                <h2 className="text-[20px] sm:text-[24px] font-heading font-semibold mb-4 sm:mb-6 text-trichomes-forest">Order summary</h2>

                <div className="space-y-3 sm:space-y-4 text-trichomes-forest/70 font-body">
                  <div className="flex justify-between text-[14px] sm:text-[15px]">
                    <span>Subtotal ({cartItems.length} items)</span>
                    <span className="font-semibold">₦{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-[14px] sm:text-[15px]">
                    <span>Shipping</span>
                    <span className="font-semibold">
                      {shipping === 0 ? 'Free' : `₦${shipping.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-[14px] sm:text-[15px]">
                    <span>Tax</span>
                    <span className="font-semibold">Calculated at checkout</span>
                  </div>

                  <hr className="my-4 border-trichomes-forest/20"/>

                  <div className="flex justify-between text-[18px] sm:text-[20px] font-heading font-semibold text-trichomes-forest">
                    <span>Total</span>
                    <span>₦{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                <button
                  onClick={handleProceedToCheckout}
                  className="w-full bg-trichomes-gold text-trichomes-forest py-3 sm:py-4 mt-4 sm:mt-6 rounded-full hover:bg-trichomes-gold-hover font-semibold transition-all duration-150 ease-out hover:shadow-lg text-[14px] sm:text-[15px] font-body"
                >
                  Proceed to checkout
                </button>

                <div className="mt-4 text-center">
                  <button className="text-trichomes-primary hover:text-trichomes-forest underline text-[12px] sm:text-[13px] font-body transition-colors duration-150">
                    Use promo code
                  </button>
                </div>

                <div className="mt-6 pt-6 border-t border-trichomes-forest/20 text-[11px] sm:text-[12px] text-trichomes-forest/60 font-body space-y-2">
                  <p className="flex items-center">
                    <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    Secure checkout
                  </p>
                  <p className="flex items-center">
                    <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
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
    </div>
  );
}
