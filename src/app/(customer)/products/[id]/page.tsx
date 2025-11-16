"use client";

import type { Category, Product, ProductImage } from "@prisma/client";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
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
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const { data: session } = useSession();
  const utils = trpc.useUtils();
  const {
    data: product,
    isLoading,
    error,
  } = trpc.getProductById.useQuery({ id: id as string });
  console.log(product);
  const [wishlist, setWishlist] = useState<ProductForDisplay[]>([]);
  const [quantity, setQuantity] = useState(1);

  const isInWishlist = wishlist.some((item) => item.id === product?.id);

  const handleToggleWishlist = (product: ProductForDisplay) => {
    const isInWishlist = wishlist.find((item) => item.id === product.id);
    if (isInWishlist) {
      setWishlist(wishlist.filter((item) => item.id !== product.id));
    } else {
      setWishlist([...wishlist, product]);
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
      <div className="min-h-screen bg-trichomes-soft flex justify-center items-center p-10">
        <div className="text-center">
          <Loader2 className="animate-spin text-trichomes-primary w-8 h-8 mx-auto mb-4" />
          <p className="text-trichomes-forest/60 font-body">
            Loading product...
          </p>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen bg-trichomes-soft flex justify-center items-center p-10">
        <div className="text-center max-w-md mx-auto">
          <h2 className="text-[32px] sm:text-[40px] font-heading font-bold text-trichomes-forest mb-4">
            Product Not Found
          </h2>
          <p className="text-[16px] sm:text-[18px] text-red-600 font-body mb-8">
            {error.message}
          </p>
          <Link
            href="/"
            className="inline-block bg-trichomes-primary text-white py-3 px-8 hover:bg-trichomes-primary/90 font-semibold transition-all duration-150 ease-out hover:shadow-lg text-[14px] sm:text-[15px] font-body"
          >
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-trichomes-soft">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-12 sm:pb-16 max-w-7xl">
        {/* Breadcrumb */}
        <div className="mb-6">
          <nav className="flex items-center space-x-2 text-[14px] font-body">
            <Link
              href="/"
              className="text-trichomes-primary hover:text-trichomes-forest transition-colors duration-150"
            >
              Home
            </Link>
            <span className="text-trichomes-forest/40">/</span>
            <Link
              href="/"
              className="text-trichomes-primary hover:text-trichomes-forest transition-colors duration-150"
            >
              Products
            </Link>
            <span className="text-trichomes-forest/40">/</span>
            <span className="text-trichomes-forest/60 font-medium">
              {product?.name}
            </span>
          </nav>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
          {/* Product Image */}
          <div className="relative w-full aspect-square overflow-hidden bg-trichomes-sage shadow-sm border border-trichomes-forest/10">
            <Image
              src={product?.images?.[0]?.url || "/placeholder.png"}
              alt={product?.name || "Product Image"}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <h1 className="text-[28px] sm:text-[36px] lg:text-[40px] font-heading  mb-3 text-trichomes-forest">
              {product?.name}
            </h1>

            <div className="mb-4">
              <span className="inline-block px-4 py-1 bg-trichomes-sage text-trichomes-forest text-[13px] sm:text-[14px] font-body font-medium">
                {product?.category?.name || "Uncategorized"}
              </span>
            </div>

            <p className="text-trichomes-forest/70 font-body text-[15px] sm:text-[16px] mb-6 leading-relaxed">
              {product?.description}
            </p>

            <div className="flex gap-4 items-baseline mb-8">
              <p className="text-[32px] sm:text-[40px] font-heading font-bold text-trichomes-forest">
                ₦
                {Number(product?.price || 0).toLocaleString("en-NG", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              {product?.compare_price && (
                <p className="text-[20px] sm:text-[24px] font-heading font-semibold text-trichomes-forest/40 line-through">
                  ₦
                  {Number(product.compare_price).toLocaleString("en-NG", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              )}
            </div>

            {/* Stock Status */}
            <div className="mb-6">
              <p className="text-[14px] sm:text-[15px] font-body font-medium text-trichomes-primary">
                {product?.status === "ACTIVE" ? "In Stock" : "Out of Stock"}
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mt-auto">
              <button
                type="button"
                onClick={() =>
                  handleToggleWishlist(product as ProductForDisplay)
                }
                className="p-3 sm:p-4 border-2 border-trichomes-forest/20 hover:bg-trichomes-sage hover:border-trichomes-primary transition-all duration-150 ease-out text-trichomes-forest/60 hover:text-trichomes-primary"
                title={
                  isInWishlist ? "Remove from wishlist" : "Add to wishlist"
                }
              >
                <HeartIcon
                  filled={isInWishlist}
                  className={isInWishlist ? "text-trichomes-primary" : ""}
                />
              </button>

              <div className="flex items-center border-2 border-trichomes-forest/20">
                <button
                  type="button"
                  onClick={handleDecrement}
                  className="px-4 py-3 sm:py-4 text-trichomes-forest/60 hover:text-trichomes-forest hover:bg-trichomes-soft transition-all duration-150"
                >
                  <MinusIcon />
                </button>
                <span className="px-4 text-center w-14 font-body text-trichomes-forest font-bold text-[16px]">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={handleIncrement}
                  className="px-4 py-3 sm:py-4 text-trichomes-forest/60 hover:text-trichomes-forest hover:bg-trichomes-soft transition-all duration-150"
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
                className="flex-grow bg-trichomes-gold text-trichomes-forest py-4 px-8 hover:bg-trichomes-gold-hover transition-all duration-150 ease-out hover:shadow-lg font-bold text-[15px] sm:text-[16px] font-body uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addToCartMutation.isPending ? "Adding..." : "Add to Cart"}
              </button>

              {/* WhatsApp Button */}
              <div className="mt-3">
                <WhatsAppButton
                  phoneNumber={
                    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "2341234567890"
                  }
                  message={`Hi! I'm interested in ${product?.name}. Can you tell me more about it?`}
                  variant="inline"
                  size="sm"
                  showLabel={true}
                  className="w-full justify-center"
                />
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-8 pt-8 border-t border-trichomes-forest/20 space-y-3 text-[13px] sm:text-[14px] text-trichomes-forest/60 font-body">
              <p className="flex items-center">
                <svg
                  className="w-5 h-5 mr-3 flex-shrink-0 text-trichomes-primary"
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
                <span className="font-medium">Secure checkout</span>
              </p>
              <p className="flex items-center">
                <svg
                  className="w-5 h-5 mr-3 flex-shrink-0 text-trichomes-primary"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <title>Fast delivery</title>
                  <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                  <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                </svg>
                <span className="font-medium">Fast delivery</span>
              </p>
              <p className="flex items-center">
                <svg
                  className="w-5 h-5 mr-3 flex-shrink-0 text-trichomes-primary"
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
                <span className="font-medium">30-day return policy</span>
              </p>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {product && (
          <div className="mt-12 sm:mt-16">
            <RelatedProducts productId={product.id} limit={4} />
          </div>
        )}

        {/* Reviews Section */}
        {product && (
          <div className="mt-12 sm:mt-16">
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
  );
}
