"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ProductGrid } from "@/components/product/product-grid";
import type { ProductWithRelations } from "@/components/product/product-grid";
import { Hero } from "@/components/sections/hero";
import { ChevronRightIcon } from "@/components/ui/icons";
import { trpc } from "@/utils/trpc";
import { useAuth } from "@/app/contexts/auth-context";
import { toast } from "sonner";
import { ProductStatus } from "@prisma/client";

export default function Page() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  // Fetch top-level categories from backend
  const categoriesQuery = trpc.getCategoryTree.useQuery(undefined, {
    staleTime: 60000, // Cache for 1 minute
    refetchOnWindowFocus: false,
  });

  // Fetch featured products
  const featuredProductsQuery = trpc.getProducts.useQuery({
    page: 1,
    limit: 4,
    status: ProductStatus.ACTIVE,
    is_featured: true,
    sort_by: 'featured',
  }, {
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  // Fetch top sellers (popular products)
  const topSellersQuery = trpc.getProducts.useQuery({
    page: 1,
    limit: 4,
    status: ProductStatus.ACTIVE,
    sort_by: 'popular',
  }, {
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  // Wishlist state
  const [wishlist, setWishlist] = useState<string[]>([]);

  // Cart mutation
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

  // Handlers
  const handleProductClick = (product: ProductWithRelations) => {
    router.push(`/products/${product.id}`);
  };

  const handleAddToCart = (product: ProductWithRelations, quantity: number) => {
    addToCartMutation.mutate({ product_id: product.id, quantity });
  };

  const handleToggleWishlist = (product: ProductWithRelations) => {
    const isInWishlist = wishlist.includes(product.id);
    if (isInWishlist) {
      setWishlist(wishlist.filter(id => id !== product.id));
    } else {
      setWishlist([...wishlist, product.id]);
    }
  };

  // Get first 4 top-level categories for the collection section
  const collections = categoriesQuery.data?.slice(0, 4) || [];
  
  // Get products
  const featuredProducts = featuredProductsQuery.data?.products || [];
  const topSellers = topSellersQuery.data?.products || [];


  return (
    <main className="bg-trichomes-soft">
      <Hero />

      
      <section className="py-12 sm:py-16 lg:py-20 bg-trichomes-soft">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <h2 className="text-[28px] sm:text-[36px] lg:text-[40px]  text-center sm:text-left mb-2 sm:mb-3 text-trichomes-forest font-heading">
            Our Collection
          </h2>
          <div className="w-16 sm:w-20 h-1 bg-trichomes-primary mb-8 sm:mb-12 mx-auto sm:mx-0"></div>
          
          {categoriesQuery.isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="text-center animate-pulse">
                  <div className="w-full h-80 sm:h-96 bg-trichomes-sage rounded-lg mb-4 sm:mb-6"></div>
                  <div className="h-12 bg-trichomes-sage rounded"></div>
                </div>
              ))}
            </div>
          ) : categoriesQuery.error ? (
            <div className="text-center py-12">
              <p className="text-trichomes-forest/70 text-lg">Unable to load collections. Please try again later.</p>
            </div>
          ) : collections.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-trichomes-forest/70 text-lg">No collections available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {collections.map((category) => (
                <Link
                  key={category.id}
                  href={`/products?category=${category.slug}`}
                  className="text-center group block"
                >
                  <div className="overflow-hidden mb-4 sm:mb-6 shadow-sm">
                    {category.image ? (
                      <div className="relative w-full h-80 sm:h-96">
                        <Image
                          src={category.image}
                          alt={category.name}
                          fill
                          className="object-cover transition-transform duration-200 ease-in-out group-hover:scale-105"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-80 sm:h-96 bg-trichomes-sage flex items-center justify-center">
                        <span className="text-6xl font-bold text-trichomes-forest/20">
                          {category.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="w-full text-[15px] sm:text-[16px] font-semibold py-2.5 sm:py-3 px-5 sm:px-6 border-2 border-trichomes-primary text-trichomes-primary group-hover:bg-trichomes-primary group-hover:text-white transition-all duration-150 ease-out font-body">
                    {category.name}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Items - Design Guide: White background, clean spacing */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <h2 className="text-[28px] sm:text-[36px] lg:text-[40px]  text-center sm:text-left mb-2 sm:mb-3 text-trichomes-forest font-heading">
            Featured Items
          </h2>
          <div className="w-16 sm:w-20 h-1 bg-trichomes-primary mb-8 sm:mb-12 mx-auto sm:mx-0"></div>
          
          {featuredProductsQuery.isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-white border border-[#1E3024]/10 flex flex-col h-full">
                    <div className="aspect-square w-full bg-trichomes-sage"></div>
                    <div className="p-3 space-y-2">
                      <div className="h-4 bg-trichomes-sage rounded w-3/4"></div>
                      <div className="h-3 bg-trichomes-sage rounded w-1/2"></div>
                      <div className="h-6 bg-trichomes-sage rounded w-1/3"></div>
                      <div className="h-8 bg-trichomes-sage rounded mt-4"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : featuredProductsQuery.error ? (
            <div className="text-center py-12">
              <p className="text-trichomes-forest/70 text-lg">Unable to load featured products. Please try again later.</p>
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-trichomes-forest/70 text-lg">No featured products available at the moment.</p>
            </div>
          ) : (
            <>
              <ProductGrid
                products={featuredProducts}
                onProductClick={handleProductClick}
                onAddToCart={handleAddToCart}
                wishlist={wishlist}
                onToggleWishlist={handleToggleWishlist}
              />
              <div className="text-center mt-8 sm:mt-12">
                <button
                  onClick={() => router.push('/products?sort=featured')}
                  className="text-[15px] sm:text-[17px] font-semibold flex items-center justify-center mx-auto text-trichomes-primary hover:text-trichomes-forest transition-colors duration-150 font-body"
                >
                  View All <ChevronRightIcon />
                </button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Top Sellers - Design Guide: Sage background for sections */}
      <section className="py-12 sm:py-16 lg:py-20 bg-trichomes-sage">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <h2 className="text-[28px] sm:text-[36px] lg:text-[40px]  text-center sm:text-left mb-2 sm:mb-3 text-trichomes-forest font-heading">
            Top Sellers
          </h2>
          <div className="w-16 sm:w-20 h-1 bg-trichomes-primary mb-8 sm:mb-12 mx-auto sm:mx-0"></div>
          
          {topSellersQuery.isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-white border border-[#1E3024]/10 flex flex-col h-full">
                    <div className="aspect-square w-full bg-trichomes-soft"></div>
                    <div className="p-3 space-y-2">
                      <div className="h-4 bg-trichomes-soft rounded w-3/4"></div>
                      <div className="h-3 bg-trichomes-soft rounded w-1/2"></div>
                      <div className="h-6 bg-trichomes-soft rounded w-1/3"></div>
                      <div className="h-8 bg-trichomes-soft rounded mt-4"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : topSellersQuery.error ? (
            <div className="text-center py-12">
              <p className="text-trichomes-forest/70 text-lg">Unable to load top sellers. Please try again later.</p>
            </div>
          ) : topSellers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-trichomes-forest/70 text-lg">No top sellers available at the moment.</p>
            </div>
          ) : (
            <>
              <ProductGrid
                products={topSellers}
                onProductClick={handleProductClick}
                onAddToCart={handleAddToCart}
                wishlist={wishlist}
                onToggleWishlist={handleToggleWishlist}
              />
              <div className="text-center mt-8 sm:mt-12">
                <button
                  onClick={() => router.push('/products?sort=popular')}
                  className="text-[15px] sm:text-[17px] font-semibold flex items-center justify-center mx-auto text-trichomes-primary hover:text-trichomes-forest transition-colors duration-150 font-body"
                >
                  View All <ChevronRightIcon />
                </button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Banners - Design Guide: Warm Sand for lifestyle sections, Gold buttons */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-12 sm:py-16 lg:py-20 bg-trichomes-soft">
        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
          <div
            className="flex-1 bg-cover bg-center rounded-xl min-h-[300px] sm:min-h-[400px] flex items-end p-6 sm:p-8 shadow-md"
            style={{backgroundImage: "url('/back-instock.png')"}}
          >
            <button className="bg-trichomes-gold text-trichomes-forest font-semibold py-3 px-8 sm:py-4 sm:px-10 rounded-full text-base sm:text-lg hover:bg-trichomes-gold-hover transition-all duration-150 ease-out hover:shadow-lg font-body">
              Top Sellers <ChevronRightIcon className="inline-block" />
            </button>
          </div>
          <div
            className="flex-1 bg-cover bg-center rounded-xl min-h-[300px] sm:min-h-[400px] flex items-end p-6 sm:p-8 shadow-md"
            style={{backgroundImage: "url('/new-arrival.png')"}}
          >
            <button className="bg-trichomes-gold text-trichomes-forest font-semibold py-3 px-8 sm:py-4 sm:px-10 rounded-full text-base sm:text-lg hover:bg-trichomes-gold-hover transition-all duration-150 ease-out hover:shadow-lg font-body">
              New arrivals <ChevronRightIcon className="inline-block" />
            </button>
          </div>
        </div>
      </section>

      {/* Consultation - Design Guide: Sage background */}
      <section className="py-12 sm:py-16 lg:py-20 bg-trichomes-sage">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl text-center text-trichomes-forest">
          <h2 className="text-[28px] sm:text-[36px] lg:text-[40px]  max-w-3xl mx-auto leading-tight font-heading">
            Unlock your best skin, style, and scent. Book a 1-on-1 session.
          </h2>
          <p className="mt-4 sm:mt-6 max-w-3xl mx-auto text-[15px] sm:text-[17px] leading-relaxed text-trichomes-forest/80 px-4 font-body font-normal">
            Stop guessing, start glowing. Your beauty journey is unique, and true refinement requires expert guidance. Our private consultations are designed to go beyond surface-level advice, offering you a tailored roadmap across Skincare, Haircare, Bodycare, Decorative Artistry, and Fragrance.
          </p>
          <button className="mt-6 sm:mt-8 bg-trichomes-gold text-trichomes-forest font-semibold py-3 px-8 sm:py-4 sm:px-10 rounded-full text-base sm:text-lg hover:bg-trichomes-gold-hover transition-all duration-150 ease-out hover:shadow-lg font-body">
            Book my session
          </button>
        </div>
      </section>

      {/* Why Choose Us - Design Guide: Clean, minimal with ample spacing */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <h2 className="text-[28px] sm:text-[36px] lg:text-[40px]  text-center mb-2 sm:mb-3 text-trichomes-forest font-heading">
            Why Choose Trichomes?
          </h2>
          <div className="w-20 sm:w-24 h-1 bg-trichomes-primary mx-auto mb-10 sm:mb-16"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-trichomes-sage rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-trichomes-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-[20px] sm:text-[24px] font-semibold mb-2 sm:mb-3 text-trichomes-forest font-heading">
                Premium Quality
              </h3>
              <p className="text-[15px] sm:text-[16px] text-trichomes-primary leading-relaxed px-2 font-body font-normal">
                Only the finest ingredients, scientifically proven to deliver results.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-trichomes-sage rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-trichomes-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-[20px] sm:text-[24px] font-semibold mb-2 sm:mb-3 text-trichomes-forest font-heading">
                Expert Guidance
              </h3>
              <p className="text-[15px] sm:text-[16px] text-trichomes-primary leading-relaxed px-2 font-body font-normal">
                Personalized consultations to help you find your perfect routine.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-trichomes-sage rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-trichomes-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-[20px] sm:text-[24px] font-semibold mb-2 sm:mb-3 text-trichomes-forest font-heading">
                Trusted by Thousands
              </h3>
              <p className="text-[15px] sm:text-[16px] text-trichomes-primary leading-relaxed px-2 font-body font-normal">
                Join our community of satisfied customers who've transformed their skin.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
