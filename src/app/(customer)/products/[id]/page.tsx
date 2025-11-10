"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { trpc } from "@/utils/trpc";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from 'next/navigation';
import { ProductStatus, type Product, type Category, type ProductImage } from '@prisma/client';
import { HeartIcon, PlusIcon, MinusIcon } from '@/components/ui/icons';
import { useState } from "react";
import { toast } from 'sonner';
import { useAuth } from '@/app/contexts/auth-context';
type ProductWithRelations = Product & {
    category: Pick<Category, 'id' | 'name' | 'slug'>;
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
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const { data: product, isLoading, error } = trpc.getProductById.useQuery({ id: id as string });
  console.log(product);
  const [wishlist, setWishlist] = useState<ProductForDisplay[]>([]);
  const [quantity, setQuantity] = useState(1);



  const isInWishlist = wishlist.some(item => item.id === product?.id);

  const handleToggleWishlist = (product: ProductForDisplay) => {
    const isInWishlist = wishlist.find(item => item.id === product.id);
    if (isInWishlist) {
      setWishlist(wishlist.filter(item => item.id !== product.id));
    } else {
      setWishlist([...wishlist, product]);
    }
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuantity(prev => Math.max(1, prev - 1));
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuantity(prev => prev + 1);
  };

  const addToCartMutation = trpc.addToCart.useMutation({
    onSuccess: () => {
      utils.getCart.invalidate();
      toast.success('Added to cart');
    },
    onError: (error) => {
      if (!isAuthenticated) {
        toast.error('Please sign in to add items to cart');
        router.push('/auth/signin');
      } else {
        toast.error(error.message || 'Failed to add to cart');
      }
    },
  });

  const handleAddToCart = (product: ProductForDisplay, quantity: number) => {
    addToCartMutation.mutate({ product_id: product.id, quantity });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-trichomes-soft flex justify-center items-center p-10">
        <div className="text-center">
          <Loader2 className="animate-spin text-trichomes-primary w-8 h-8 mx-auto mb-4" />
          <p className="text-trichomes-forest/60 font-body">Loading product...</p>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen bg-trichomes-soft flex justify-center items-center p-10">
        <div className="text-center">
          <p className="text-red-600 font-body mb-4">{error.message}</p>
          <Link href="/products" className="inline-block bg-trichomes-primary text-white py-3 px-6 rounded-full hover:bg-trichomes-primary/90 font-semibold transition-all duration-150 ease-out hover:shadow-lg text-[14px] sm:text-[15px] font-body">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-trichomes-soft">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-12 sm:pb-16 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
          <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-trichomes-sage shadow-sm">
            <Image
              src={product?.images?.[0]?.url || "/placeholder.png"}
              alt={product?.name!}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h1 className="text-[24px] sm:text-[28px] lg:text-[32px] font-heading font-semibold mb-3 sm:mb-4 text-trichomes-forest">{product?.name}</h1>
            <p className="text-trichomes-forest/60 font-body text-[14px] sm:text-[15px] mb-2">Category: {product?.category?.name || "Uncategorized"}</p>
            <p className="text-trichomes-forest/70 font-body text-[15px] sm:text-[16px] mb-4 sm:mb-6 leading-relaxed">{product?.description}</p>
            <div className="flex gap-4 sm:gap-6 items-center mb-4 sm:mb-6">
              <p className="text-[24px] sm:text-[28px] font-heading font-semibold text-trichomes-primary">
                ₦{product?.price?.toLocaleString()}
              </p>
              {product?.compare_price && (
                <p className="text-[20px] sm:text-[24px] font-heading font-semibold text-trichomes-forest/40 line-through">
                  ₦{product?.compare_price?.toLocaleString()}
                </p>
              )}
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <button 
                onClick={() => handleToggleWishlist(product as ProductForDisplay)} 
                className="p-3 border-2 border-trichomes-forest/20 rounded-lg hover:bg-trichomes-sage transition-all duration-150 ease-out text-trichomes-forest/60 hover:text-trichomes-primary"
              >
                <HeartIcon filled={isInWishlist} className={isInWishlist ? 'text-trichomes-primary' : ''} />
              </button>
              <div className="flex items-center border-2 border-trichomes-forest/20 rounded-lg">
                <button onClick={handleDecrement} className="px-3 sm:px-4 py-2 sm:py-3 text-trichomes-forest/60 hover:text-trichomes-forest transition-colors duration-150">
                  <MinusIcon />
                </button>
                <span onClick={(e) => e.stopPropagation()} className="px-4 text-center w-12 font-body text-trichomes-forest font-semibold">{quantity}</span>
                <button onClick={handleIncrement} className="px-3 sm:px-4 py-2 sm:py-3 text-trichomes-forest/60 hover:text-trichomes-forest transition-colors duration-150">
                  <PlusIcon />
                </button>
              </div>
              <button 
                onClick={() => handleAddToCart(product as ProductForDisplay, quantity)} 
                className="flex-grow bg-trichomes-primary text-white py-3 sm:py-4 px-6 sm:px-8 rounded-full hover:bg-trichomes-primary/90 transition-all duration-150 ease-out hover:shadow-lg font-semibold text-[14px] sm:text-[15px] font-body"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
