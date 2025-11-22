"use client";

import type { Product as PrismaProduct } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { OrderSummary } from "@/components/orders/OrderSummary";
import {
  ChevronRightIcon,
  HeartIcon,
  MinusIcon,
  PlusIcon,
  TrashIcon,
} from "@/components/ui/icons";
import {
  getLocalCart,
  removeFromLocalCart,
  updateLocalCartItem,
} from "@/utils/local-cart";
import { trpc } from "@/utils/trpc";
import { useAuth } from "../../contexts/auth-context";

export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const utils = trpc.useUtils();
  const [localCartItems, setLocalCartItems] = useState(getLocalCart());

  // Fetch cart data for authenticated users
  const cartQuery = trpc.getCart.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchOnWindowFocus: false,
  });

  // Fetch products for localStorage cart items
  const localCartProductIds = useMemo(
    () => localCartItems.map((item) => item.product_id),
    [localCartItems],
  );
  const localProductsQuery = trpc.getProductsByIds.useQuery(
    { ids: localCartProductIds },
    { enabled: !isAuthenticated && localCartProductIds.length > 0 },
  );

  // Mutations
  const updateCartMutation = trpc.updateCartItem.useMutation({
    onSuccess: () => {
      utils.getCart.invalidate();
      toast.success("Cart updated");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update cart");
    },
  });

  const removeCartMutation = trpc.removeFromCart.useMutation({
    onSuccess: () => {
      utils.getCart.invalidate();
      toast.success("Item removed from cart");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to remove item");
    },
  });

  const addToWishlistMutation = trpc.addToWishlist.useMutation({
    onSuccess: () => {
      utils.getWishlist.invalidate();
      toast.success("Added to wishlist");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add to wishlist");
    },
  });

  // Update local cart when localStorage changes
  useEffect(() => {
    const handleCartUpdate = () => {
      setLocalCartItems(getLocalCart());
    };
    window.addEventListener("localCartUpdated", handleCartUpdate);
    return () =>
      window.removeEventListener("localCartUpdated", handleCartUpdate);
  }, []);

  // Build cart items from either authenticated cart or localStorage
  const cartItems = useMemo(() => {
    if (isAuthenticated) {
      return cartQuery.data?.items || [];
    } else {
      // Build cart items from localStorage and fetched products
      if (!localProductsQuery.data) return [];

      return localCartItems
        .map((localItem) => {
          const product = localProductsQuery.data.find(
            (p) => p.id === localItem.product_id,
          );
          if (!product) return null;

          return {
            id: `local-${product.id}`,
            product_id: product.id,
            quantity: localItem.quantity,
            product: {
              ...(product as PrismaProduct),
              slug:
                (product as PrismaProduct & { slug?: string | null }).slug ||
                product.id,
            } as PrismaProduct,
          };
        })
        .filter(
          (
            item,
          ): item is {
            id: string;
            product_id: string;
            quantity: number;
            product: PrismaProduct;
          } => Boolean(item),
        );
    }
  }, [
    isAuthenticated,
    cartQuery.data,
    localCartItems,
    localProductsQuery.data,
  ]);

  // Calculate totals
  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const price = Number(item.product.price as unknown as number);
      return sum + price * item.quantity;
    }, 0);
  }, [cartItems]);

  const shipping = subtotal > 0 ? 4500.0 : 0;
  const total = subtotal + shipping;

  const handleUpdateQuantity = (cartItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(cartItemId);
    } else {
      if (isAuthenticated) {
        updateCartMutation.mutate({ id: cartItemId, quantity: newQuantity });
      } else {
        // Update localStorage
        const productId = cartItemId.replace("local-", "");
        updateLocalCartItem(productId, newQuantity);
        setLocalCartItems(getLocalCart());
        window.dispatchEvent(new Event("localCartUpdated"));
      }
    }
  };

  const handleRemoveItem = (cartItemId: string) => {
    if (isAuthenticated) {
      removeCartMutation.mutate({ id: cartItemId });
    } else {
      // Remove from localStorage
      const productId = cartItemId.replace("local-", "");
      removeFromLocalCart(productId);
      setLocalCartItems(getLocalCart());
      window.dispatchEvent(new Event("localCartUpdated"));
      toast.success("Item removed from cart");
    }
  };

  const handleAddToWishlist = (productId: string, cartItemId: string) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to add items to wishlist");
      // Store current page for redirect after sign-in
      if (typeof window !== 'undefined') {
        localStorage.setItem("trichomes_redirect_url", window.location.pathname);
      }
      router.push("/auth/signin");
      return;
    }
    addToWishlistMutation.mutate(
      { product_id: productId },
      {
        onSuccess: () => {
          // Optionally remove from cart after adding to wishlist
          handleRemoveItem(cartItemId);
        },
      },
    );
  };

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      // Store current cart for after authentication
      localStorage.setItem("trichomes_checkout_redirect", "true");
      localStorage.setItem("trichomes_redirect_url", "/checkout");
      // Redirect to sign in page
      router.push("/auth/signin");
    } else {
      // User is authenticated, proceed to checkout
      router.push("/checkout");
    }
  };

  // Show loading state
  if (
    isLoading ||
    (isAuthenticated && cartQuery.isLoading) ||
    (!isAuthenticated &&
      localProductsQuery.isLoading &&
      localCartItems.length > 0)
  ) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-[2200px]">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin h-12 w-12 border-b-2 border-black mx-auto mb-4 rounded-full"></div>
              <p className="text-gray-600 font-body">
                Loading cart...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Header Section */}
      <div className="relative w-full h-[300px] sm:h-[350px] lg:h-[400px] overflow-hidden">
        <Image
          src="/banners/product-banner.jpg"
          alt="Shopping Cart"
          fill
          className="object-cover"
          priority
        />
        <div 
          className="absolute inset-0" 
          style={{ 
            background: 'linear-gradient(to right, rgba(64, 112, 41, 0.9), rgba(64, 112, 41, 0.7), transparent)'
          }}
        />
        <div className="relative h-full mx-auto px-4 sm:px-6 lg:px-8 max-w-[2200px] flex flex-col justify-center">
          <h1 className="text-[40px] sm:text-[48px] lg:text-[56px] font-heading text-white leading-tight mb-4">
            Shopping Cart
          </h1>
          <nav className="flex items-center space-x-2">
            <Link
              href="/"
              className="text-[14px] text-white/90 hover:text-white transition-colors duration-150 ease-out font-body"
            >
              Home
            </Link>
            <ChevronRightIcon className="w-4 h-4 text-white/70" />
            <span className="text-[14px] text-white font-body">
              Cart
            </span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-12 sm:pb-16 max-w-[2200px]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8">
          <Link
            href="/"
            className="text-[#407029] hover:text-gray-900 transition-colors duration-150 font-body font-medium text-[14px] sm:text-[15px] mt-2 sm:mt-0"
          >
            ← Continue shopping
          </Link>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-12 sm:py-20 bg-gray-50 border border-gray-200 shadow-sm rounded-sm">
            <div className="max-w-md mx-auto px-4">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-sm flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <title>Shopping cart</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h10"
                  />
                </svg>
              </div>
              <h2 className="text-[32px] sm:text-[40px] font-heading font-bold text-gray-900 mb-4">
                Your cart is empty
              </h2>
              <p className="text-[16px] sm:text-[18px] text-gray-600 font-body mb-8">
                Add some products to get started
              </p>
              <Link
                href="/"
                className="inline-block bg-[#1E3024] text-white rounded-full py-3 px-8 hover:bg-[#1E3024]/90 font-semibold transition-all duration-150 ease-out hover:shadow-lg text-[14px] sm:text-[15px] font-body"
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
                {cartItems.map((item) => {
                  const product = item.product;
                  const primaryImage =
                    (product as unknown as { images?: { url: string }[] })
                      .images?.[0]?.url || "/placeholder-product.png";
                  const price = Number(product.price as unknown as number);

                  return (
                    <div
                      key={item.id}
                      className="bg-white p-4 sm:p-6 border border-gray-200 rounded-sm flex flex-col sm:flex-row items-center gap-4 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200 ease-out"
                    >
                      {/* Product Image */}
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0">
                        <Image
                          src={primaryImage}
                          alt={product.name}
                          fill
                          className="object-cover bg-gray-100 rounded-sm"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-grow w-full sm:w-auto text-center sm:text-left">
                        <Link
                          href={`/products/${product.id}`}
                          className="font-heading text-[16px] sm:text-[18px] hover:text-[#407029] transition-colors duration-150 text-gray-900"
                        >
                          {product.name}
                        </Link>
                        <p className="text-[14px] sm:text-[15px] text-gray-600 mt-1 font-body">
                          Unit price: ₦
                          {price.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                        {(
                          product as unknown as {
                            category?: { name: string } | null;
                          }
                        ).category?.name && (
                          <p className="text-[13px] text-gray-500 mt-1 font-body">
                            {
                              (
                                product as unknown as {
                                  category?: { name: string } | null;
                                }
                              ).category?.name
                            }
                          </p>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center border border-gray-200 rounded-sm">
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateQuantity(item.id, item.quantity - 1)
                          }
                          className="px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 disabled:opacity-50 transition-all duration-150"
                          disabled={updateCartMutation.isPending}
                        >
                          <MinusIcon />
                        </button>
                        <span className="px-4 text-center w-12 font-body font-semibold text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateQuantity(item.id, item.quantity + 1)
                          }
                          className="px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 disabled:opacity-50 transition-all duration-150"
                          disabled={updateCartMutation.isPending}
                        >
                          <PlusIcon />
                        </button>
                      </div>

                      {/* Price and Actions */}
                      <div className="flex flex-col items-center sm:items-end w-full sm:w-auto gap-3">
                        <p className="text-[18px] sm:text-[20px] font-heading font-bold text-gray-900">
                          ₦
                          {(price * item.quantity).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                        <div className="flex space-x-3">
                          <button
                            type="button"
                            onClick={() =>
                              handleAddToWishlist(product.id, item.id)
                            }
                            className="text-gray-600 hover:text-[#407029] p-2 disabled:opacity-50 transition-colors duration-150"
                            title="Move to wishlist"
                            disabled={addToWishlistMutation.isPending}
                          >
                            <HeartIcon />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-gray-600 hover:text-red-600 p-2 disabled:opacity-50 transition-colors duration-150"
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
              <OrderSummary
                items={cartItems.map((item) => ({
                  id: item.id,
                  product_name: item.product.name,
                  quantity: item.quantity,
                  price: Number(item.product.price as unknown as number),
                  total:
                    Number(item.product.price as unknown as number) *
                    item.quantity,
                  product: {
                    name: item.product.name,
                    images:
                      (
                        item.product as unknown as {
                          images?: { url: string }[];
                        }
                      ).images ?? [],
                  },
                }))}
                subtotal={subtotal}
                shipping={shipping}
                tax={0}
                discount={0}
                total={total}
                variant="checkout"
                showItemDetails={false}
                showActions={true}
                actionButton={
                  <>
                    <button
                      type="button"
                      onClick={handleProceedToCheckout}
                      className="w-full bg-[#1E3024] text-white rounded-full py-4 hover:bg-[#1E3024]/90 font-bold transition-all duration-150 ease-out hover:shadow-lg text-[15px] sm:text-[16px] font-body uppercase tracking-wide"
                    >
                      Proceed to Checkout
                    </button>

                    <div className="mt-6 text-center">
                      <button
                        type="button"
                        className="text-[#407029] hover:text-gray-900 underline text-[13px] sm:text-[14px] font-body font-medium transition-colors duration-150"
                      >
                        Have a promo code?
                      </button>
                    </div>
                  </>
                }
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
