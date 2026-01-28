"use client";

import type { Category, Product, ProductImage } from "@prisma/client";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/app/contexts/auth-context";
import { RelatedProducts } from "@/components/products/RelatedProducts";
import { ReviewList } from "@/components/reviews/ReviewList";
import { HeartIcon, MinusIcon, PlusIcon } from "@/components/ui/icons";
import { WhatsAppButton } from "@/components/whatsapp/WhatsAppButton";
import { addToLocalCart } from "@/utils/local-cart";
import { trpc } from "@/utils/trpc";
import { useCompare } from "@/app/contexts/compare-context";
import { CompareIcon } from "@/components/ui/icons";

type ProductWithRelations = Product & {
  category: Pick<Category, "id" | "name" | "slug">;
  images: ProductImage[];
};

interface ProductForDisplay extends ProductWithRelations {
  currency?: string;
  imageUrl?: string;
  brand?: string;
  concerns?: string[];
  ingredients?: string[];
  inStock?: boolean;
}

export default function ProductDetailsPage() {
  const router = useRouter(); // Added router for redirection
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const { data: session } = useSession();
  const utils = trpc.useUtils();
  const {
    data: product,
    isLoading,
    error,
  } = trpc.getProductById.useQuery({ id: String(id) }, { enabled: !!id });

  const [quantity, setQuantity] = useState(1);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  const isCompared = product ? isInCompare(product.id) : false;

  const handleToggleCompare = () => {
    if (!product) return;
    if (isCompared) {
      removeFromCompare(product.id);
    } else {
      addToCompare(product.id);
    }
  };

  // Wishlist TRPC integration


  const addToWishlistMutation = trpc.addToWishlist.useMutation({
    onSuccess: () => {
      utils.isInWishlist.invalidate({ product_id: product?.id });
      utils.getWishlist.invalidate(); // Update global wishlist count if needed
      toast.success("Added to wishlist");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add to wishlist");
    },
  });

  const removeFromWishlistMutation = trpc.removeFromWishlist.useMutation({
    onSuccess: () => {
      utils.isInWishlist.invalidate({ product_id: product?.id });
      utils.getWishlist.invalidate();
      toast.success("Removed from wishlist");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to remove from wishlist");
    },
  });



  // Re-writing the replacement to use getWishlist instead
  const wishlistQuery = trpc.getWishlist.useQuery(undefined, {
    enabled: isAuthenticated
  });

  const wishlistItem = wishlistQuery.data?.items.find(item => item.product_id === product?.id);
  const isInWishlist = !!wishlistItem;
  const isWishlistLoading = wishlistQuery.isLoading || addToWishlistMutation.isPending || removeFromWishlistMutation.isPending;

  const handleToggleWishlist = async () => {
    if (!product) return;

    if (!isAuthenticated) {
      toast.error("Please sign in to add items to wishlist");
      if (typeof window !== 'undefined') {
        localStorage.setItem("trichomes_redirect_url", window.location.pathname);
      }
      router.push("/auth/signin");
      return;
    }

    if (isInWishlist && wishlistItem) {
      removeFromWishlistMutation.mutate({ id: wishlistItem.id });
    } else {
      addToWishlistMutation.mutate({ product_id: product.id });
    }
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuantity((prev) => prev + 1);
  };

  const addToCartMutation = trpc.addToCart.useMutation({
    onSuccess: () => {
      utils.getCart.invalidate();
      toast.success("Added to cart");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add to cart");
    },
  });

  const handleAddToCart = (product: ProductForDisplay, quantity: number) => {
    if (!isAuthenticated) {
      // Add to localStorage for unauthenticated users
      addToLocalCart(product.id, quantity);
      toast.success("Added to cart");
      // Trigger a custom event to update cart count in header
      window.dispatchEvent(new Event("localCartUpdated"));
    } else {
      // Use tRPC mutation for authenticated users
      addToCartMutation.mutate({ product_id: product.id, quantity });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center p-10">
        <div className="text-center">
          <Loader2 className="animate-spin text-black w-8 h-8 mx-auto mb-4" />
          <p className="text-gray-600 font-body">
            Loading product...
          </p>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center p-10">
        <div className="text-center max-w-md mx-auto">
          <h2 className="text-[32px] sm:text-[40px] font-bold text-gray-900 mb-4">
            Product Not Found
          </h2>
          <p className="text-[16px] sm:text-[18px] text-red-600 font-body mb-8">
            {error.message}
          </p>
          <Link
            href="/products"
            className="inline-block bg-[#1E3024] text-white py-3 px-8 hover:bg-[#2A4030] font-semibold transition-all duration-150 ease-out hover:shadow-lg text-[14px] sm:text-[15px] font-body rounded-full"
          >
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Header Section */}
      <div className="relative w-full h-[250px] sm:h-[300px] lg:h-[350px] animate-[sectionEntrance_600ms_ease-out]">
        {/* Background Image */}
        <div className="absolute inset-0">
          <div
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: "url('/banners/product-banner.jpg')" }}
          />
          {/* Gradient Overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to right, rgba(64, 112, 41, 0.9), rgba(64, 112, 41, 0.7), transparent)'
            }}
          ></div>
        </div>

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-center px-4 sm:px-6 lg:px-8 max-w-[2200px] mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-[13px] sm:text-[14px] mb-4 animate-[fadeInUp_500ms_ease-out_100ms_both]">
            <Link
              href="/"
              className="text-white/90 hover:text-white transition-colors duration-150"
            >
              Home
            </Link>
            <span className="text-white/60">/</span>
            <Link
              href="/products"
              className="text-white/90 hover:text-white transition-colors duration-150"
            >
              Products
            </Link>
            <span className="text-white/60">/</span>
            <span className="text-white font-medium">
              {product?.name || "Product Details"}
            </span>
          </nav>

          {/* Title */}
          <h1 className="text-[28px] sm:text-[36px] lg:text-[42px] font-bold text-white mb-2 animate-[fadeInUp_500ms_ease-out_200ms_both] max-w-3xl">
            {product?.name || "Product Details"}
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pb-12 sm:pb-16 max-w-[2200px]">
          {/* Product Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-10 max-w-6xl mx-auto mb-12 sm:mb-16">
            {/* Product Image */}
            <div
              className="relative w-full aspect-square overflow-hidden bg-gray-100 shadow-sm border border-gray-200 rounded-sm cursor-pointer group"
              onClick={() => setImageModalOpen(true)}
            >
              <Image
                src={product?.images?.[0]?.url || "/placeholder.png"}
                alt={product?.name || "Product Image"}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                priority
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 rounded-full p-3">
                  <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Product Info */}
            <div className="flex flex-col">
              <h2 className="text-[24px] sm:text-[28px] lg:text-[32px] font-bold mb-3 text-gray-900">
                {product?.name}
              </h2>

              <div className="mb-4">
                <span className="inline-block px-3 py-1.5 bg-gray-100 border border-gray-200 text-gray-900 text-[12px] sm:text-[13px] font-medium rounded-sm">
                  {product?.category?.name || "Uncategorized"}
                </span>
              </div>

              <p className="text-gray-600 text-[14px] sm:text-[15px] mb-6 leading-relaxed whitespace-pre-wrap">
                {product?.description}
              </p>

              <div className="flex gap-3 items-baseline mb-6">
                <p className="text-[26px] sm:text-[30px] font-bold text-gray-900">
                  ₦
                  {Number(product?.price || 0).toLocaleString("en-NG", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
                {product?.compare_price && (
                  <p className="text-[16px] sm:text-[18px] font-semibold text-gray-400 line-through">
                    ₦
                    {Number(product.compare_price).toLocaleString("en-NG", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                )}
              </div>

              {/* Stock Status */}
              <div className="mb-5">
                <p className="text-[13px] sm:text-[14px] font-medium text-[#40702A]">
                  {product?.status === "ACTIVE" ? "✓ In Stock" : "Out of Stock"}
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-auto">
                <button
                  type="button"
                  onClick={handleToggleWishlist}
                  disabled={isWishlistLoading}
                  className="p-3 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-150 ease-out text-gray-600 hover:text-[#40702A] rounded-sm disabled:opacity-50"
                  title={
                    isInWishlist ? "Remove from wishlist" : "Add to wishlist"
                  }
                >
                  <HeartIcon
                    filled={isInWishlist}
                    className={isInWishlist ? "text-[#40702A]" : ""}
                  />
                </button>

                <button
                  type="button"
                  onClick={handleToggleCompare}
                  className={`p-3 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-150 ease-out rounded-sm ${isCompared ? "text-[#1E3024] bg-gray-100" : "text-gray-600"
                    }`}
                  title={isCompared ? "Remove from compare" : "Add to compare"}
                >
                  <CompareIcon className={isCompared ? "text-[#1E3024]" : ""} />
                </button>

                <div className="flex items-center border border-gray-200 rounded-sm">
                  <button
                    type="button"
                    onClick={handleDecrement}
                    className="px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-150"
                  >
                    <MinusIcon />
                  </button>
                  <span className="px-4 text-center w-14 text-gray-900 font-bold text-[15px]">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={handleIncrement}
                    className="px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-150"
                  >
                    <PlusIcon />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handleAddToCart(product as ProductForDisplay, quantity)
                  }
                  disabled={
                    addToCartMutation.isPending || product?.status !== "ACTIVE"
                  }
                  className="grow bg-[#1E3024] text-white py-3 px-6 hover:bg-[#2A4030] transition-all duration-150 ease-out hover:shadow-lg font-bold text-[14px] sm:text-[15px] uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed rounded-full"
                >
                  {addToCartMutation.isPending ? "Adding..." : "Add to Cart"}
                </button>
              </div>

              {/* WhatsApp Button */}
              <div className="mt-3">
                <WhatsAppButton
                  phoneNumber={
                    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "2348087098720"
                  }
                  message={`Hi! I'm interested in ${product?.name}. Can you tell me more about it?`}
                  variant="inline"
                  size="sm"
                  showLabel={true}
                  className="w-full justify-center"
                />
              </div>

              {/* Additional Info */}
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-2 text-[12px] sm:text-[13px] text-gray-600">
                <p className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-2 shrink-0 text-[#40702A]"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <title>Secure checkout</title>
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Secure checkout</span>
                </p>
                <p className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-2 shrink-0 text-[#40702A]"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <title>Fast delivery</title>
                    <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                    <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                  </svg>
                  <span>Fast delivery</span>
                </p>
                <p className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-2 shrink-0 text-[#40702A]"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <title>30-day return policy</title>
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>30-day return policy</span>
                </p>
              </div>
            </div>
          </div>

          {/* Related Products */}
          {product && (
            <div className="max-w-6xl mx-auto">
              <RelatedProducts productId={product.id} limit={4} />
            </div>
          )}

          {/* Reviews Section */}
          {product && (
            <div className="mt-12 sm:mt-16 max-w-6xl mx-auto">
              <ReviewList
                productId={product.id}
                userId={
                  isAuthenticated ? (session?.user?.id as string) : undefined
                }
              />
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {imageModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 animate-in fade-in duration-200"
          onClick={() => setImageModalOpen(false)}
        >
          <button
            onClick={() => setImageModalOpen(false)}
            className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white rounded-full p-2 transition-colors duration-150"
            aria-label="Close"
          >
            <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div
            className="relative max-w-5xl max-h-[90vh] w-full h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={product?.images?.[0]?.url || "/placeholder.png"}
              alt={product?.name || "Product Image"}
              fill
              className="object-contain"
              quality={100}
            />
          </div>
        </div>
      )}
    </div>
  );
}
