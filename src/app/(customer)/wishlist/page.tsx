"use client";

import type {
  WishlistItem as PrismaWishlistItem,
  Product,
  ProductImage,
} from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type React from "react";
import { toast } from "sonner";
import { ChevronRightIcon, HeartIcon, TrashIcon } from "@/components/ui/icons";
import { addToLocalCart } from "@/utils/local-cart";
import { trpc } from "@/utils/trpc";
import { useAuth } from "../../contexts/auth-context";

type WishlistItemWithProduct = PrismaWishlistItem & {
  product: Product & {
    images: ProductImage[];
    // API returns a narrowed selection; accept minimal shape
    category?: { name: string; slug: string } | null;
  };
};

interface WishlistItemProps {
  item: WishlistItemWithProduct;
  onRemove: (id: string) => void;
  onAddToCart: (productId: string, quantity: number) => void;
  onProductClick: (slug: string) => void;
}

const WishlistItem: React.FC<WishlistItemProps> = ({
  item,
  onRemove,
  onAddToCart,
  onProductClick,
}) => {
  const product = item.product;
  const primaryImage = product.images[0]?.url || "/placeholder-product.png";
  const price = Number(product.price as unknown as number);
  const isInStock =
    product.status === "ACTIVE" &&
    (!product.track_quantity || product.quantity > 0);

  return (
    <div className="bg-white p-4 sm:p-6 border border-trichomes-forest/10 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow duration-200 ease-out">
      <div className="flex items-center gap-4 sm:gap-6 flex-grow w-full sm:w-auto">
        <button
          className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 cursor-pointer overflow-hidden"
          onClick={() => onProductClick(product.slug)}
          type="button"
        >
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            className="object-cover bg-trichomes-sage"
          />
        </button>
        <div className="flex-grow">
          <button
            type="button"
            onClick={() => onProductClick(product.slug)}
            className="font-heading text-[15px] sm:text-[16px] text-left hover:text-trichomes-primary transition-colors duration-150 text-trichomes-forest"
          >
            {product.name}
          </button>
          <p className="text-[13px] sm:text-[14px] text-trichomes-forest/60 mt-1 font-body">
            {isInStock ? "In stock" : "Out of stock"}
          </p>
          {product.category && (
            <p className="text-[12px] text-trichomes-forest/50 mt-1 font-body">
              {product.category.name}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto justify-between sm:justify-end">
        <p className="text-[16px] sm:text-[18px] font-heading text-trichomes-forest">
          ₦{price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </p>
        <div className="flex items-center gap-3 sm:gap-4">
          {isInStock ? (
            <button
              type="button"
              onClick={() => onAddToCart(product.id, 1)}
              className="bg-trichomes-primary text-trichomes-soft py-2 px-4 sm:px-6 hover:bg-trichomes-primary/90 transition-all duration-150 ease-out hover:shadow-lg whitespace-nowrap text-[13px] sm:text-[14px] font-body"
            >
              Add to cart
            </button>
          ) : (
            <p className="text-red-500 text-center w-28 text-[13px] sm:text-[14px] font-body">
              Out of stock
            </p>
          )}
          <button
            type="button"
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
      toast.success("Removed from wishlist");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to remove from wishlist");
    },
  });

  const addToCartMutation = trpc.addToCart.useMutation({
    onSuccess: () => {
      utils.getCart.invalidate();
      toast.success("Added to cart");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add to cart");
    },
  });

  const wishlistItems = wishlistQuery.data?.items || [];

  const handleRemoveFromWishlist = (wishlistItemId: string) => {
    removeFromWishlistMutation.mutate({ id: wishlistItemId });
  };

  const handleAddToCart = (productId: string, quantity: number) => {
    if (!isAuthenticated) {
      // Add to localStorage for unauthenticated users
      addToLocalCart(productId, quantity);
      toast.success("Added to cart");
      // Trigger a custom event to update cart count in header
      window.dispatchEvent(new Event("localCartUpdated"));
    } else {
      // Use tRPC mutation for authenticated users
      addToCartMutation.mutate({ product_id: productId, quantity });
    }
  };

  const handleProductClick = (slug: string) => {
    router.push(`/products/${slug}`);
  };

  const handleGoToShop = () => {
    router.push("/");
  };

  // Show loading state
  if (isLoading || wishlistQuery.isLoading) {
    return (
      <div className="min-h-screen bg-trichomes-soft">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-7xl">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-trichomes-primary mx-auto mb-4"></div>
              <p className="text-trichomes-forest/60 font-body">
                Loading wishlist...
              </p>
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
          <div className="text-center py-12 sm:py-20 bg-white border border-trichomes-forest/10 shadow-sm">
            <div className="max-w-md mx-auto">
              <h2 className="text-[20px] sm:text-[24px] font-heading text-trichomes-forest mb-2">
                Sign in to view your wishlist
              </h2>
              <p className="text-trichomes-forest/60 font-body mb-6">
                Please sign in to access your wishlist
              </p>
              <Link
                href="/auth/signin"
                className="inline-block bg-trichomes-primary text-trichomes-soft py-3 px-6 sm:px-8 hover:bg-trichomes-primary/90 transition-all duration-150 ease-out hover:shadow-lg text-[14px] sm:text-[15px] font-body"
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
      {/* Hero Header Section */}
      <div className="bg-trichomes-sand w-full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 lg:pt-20 pb-12 sm:pb-16 lg:pb-20">
          <div className="flex flex-col items-start">
            {/* Main Title */}
            <h1 className="text-[40px] sm:text-[48px] lg:text-[56px] font-heading text-trichomes-forest leading-tight mb-4">
              My Wishlist
            </h1>

            {/* Breadcrumbs */}
            <nav className="flex items-center space-x-2">
              <Link
                href="/"
                className="text-[14px] text-trichomes-forest/70 hover:text-trichomes-forest transition-colors duration-150 ease-out font-body"
              >
                Home
              </Link>
              <ChevronRightIcon className="w-4 h-4 text-trichomes-forest/50" />
              <span className="text-[14px] text-trichomes-forest font-body">
                Wishlist
              </span>
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-16 sm:pb-20 lg:pb-24 max-w-[1500px]">
        {wishlistItems.length === 0 ? (
          <div className="text-center py-12 sm:py-20 bg-white border border-trichomes-forest/10 shadow-sm">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-6 bg-trichomes-sage flex items-center justify-center">
                <HeartIcon className="w-16 h-16 text-trichomes-forest/40" />
              </div>
              <h2 className="text-[20px] sm:text-[24px] font-heading text-trichomes-forest mb-2">
                Your wishlist is empty
              </h2>
              <p className="text-trichomes-forest/60 font-body mb-6">
                Save items you love for later. They'll appear here.
              </p>
              <button
                type="button"
                onClick={handleGoToShop}
                className="bg-trichomes-primary text-trichomes-soft py-3 px-6 sm:px-8 hover:bg-trichomes-primary/90 transition-all duration-150 ease-out hover:shadow-lg text-[14px] sm:text-[15px] font-body"
              >
                Start shopping
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4 sm:mb-6 flex items-center justify-between">
              <p className="text-trichomes-forest/60 font-body text-[14px] sm:text-[15px]">
                {wishlistItems.length}{" "}
                {wishlistItems.length === 1 ? "item" : "items"} saved
              </p>
              <Link
                href="/"
                className="text-[13px] text-trichomes-primary hover:text-trichomes-forest underline font-body transition-colors duration-150 ease-out"
              >
                Continue shopping
              </Link>
            </div>

            <div className="space-y-4">
              {wishlistItems.map((item) => (
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
            <div className="mt-6 sm:mt-8 bg-white p-4 sm:p-6 border border-trichomes-forest/10 shadow-sm">
              <h3 className="font-heading text-[16px] sm:text-[17px] mb-3 sm:mb-4 text-trichomes-forest">
                Quick Actions
              </h3>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="button"
                  onClick={() => {
                    const inStockItems = wishlistItems.filter((item) => {
                      const product = item.product;
                      return (
                        product.status === "ACTIVE" &&
                        (!product.track_quantity || product.quantity > 0)
                      );
                    });
                    inStockItems.forEach((item) => {
                      handleAddToCart(item.product.id, 1);
                    });
                  }}
                  className="bg-trichomes-primary text-trichomes-soft py-2 sm:py-3 px-6 sm:px-8 hover:bg-trichomes-primary/90 transition-all duration-150 ease-out hover:shadow-lg disabled:opacity-50 text-[14px] sm:text-[15px] font-body"
                  disabled={
                    addToCartMutation.isPending ||
                    !wishlistItems.some((item) => {
                      const product = item.product;
                      return (
                        product.status === "ACTIVE" &&
                        (!product.track_quantity || product.quantity > 0)
                      );
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
