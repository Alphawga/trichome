"use client";

import { useParams } from "next/navigation";
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

  if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;
  if (error) return <div className="text-red-500 text-center p-10">{error.message}</div>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="relative w-full aspect-square">
          <Image
            src={product?.images?.[0]?.url || "/placeholder.png"}
            alt={product?.name!}
            fill
            className="rounded-2xl object-cover"
          />
        </div>
        <div>
          <h1 className="text-3xl font-semibold mb-4">{product?.name}</h1>
          <p className="text-gray-500 mb-2">Category: {product?.category?.name || "Uncategorized"}</p>
          <p className="text-gray-700 mb-6">{product?.description}</p>
          <div className="flex gap-6 items-center">
          <p className="text-2xl font-bold text-green-600">
            ₦{product?.price?.toLocaleString()}
          </p>
          <p className="text-2xl font-bold text-green-600 line-through">
            ₦{product?.compare_price?.toLocaleString()}
          </p>
          </div>
          <div className="flex items-center space-x-2 mt-4">
        <button onClick={() => handleToggleWishlist(product as ProductForDisplay)} className="p-2 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors text-gray-500 hover:text-red-500">
          <HeartIcon filled={isInWishlist} className={isInWishlist ? 'text-red-500' : ''} />
        </button>
        <div className="flex items-center border border-gray-300 rounded-md">
          <button onClick={handleDecrement} className="px-3 py-2 text-gray-500 hover:text-black">
            <MinusIcon />
          </button>
          <span onClick={(e) => e.stopPropagation()} className="px-4 text-center w-12">{quantity}</span>
          <button onClick={handleIncrement} className="px-3 py-2 text-gray-500 hover:text-black">
            <PlusIcon />
          </button>
        </div>
        <button onClick={() => handleAddToCart(product as ProductForDisplay, quantity)} className="flex-grow bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors font-medium">
          Add to Cart
        </button>
      </div>
        </div>
      </div>
    </div>
  );
}
