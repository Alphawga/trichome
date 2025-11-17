"use client";

import { ProductStatus } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/app/contexts/auth-context";
import type { ProductWithRelations } from "@/components/product/product-grid";
import { ProductGrid } from "@/components/product/product-grid";
import { Hero } from "@/components/sections/hero";
import { ChevronRightIcon } from "@/components/ui/icons";
import { addToLocalCart } from "@/utils/local-cart";
import { trpc } from "@/utils/trpc";

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
  const featuredProductsQuery = trpc.getProducts.useQuery(
    {
      page: 1,
      limit: 4,
      status: ProductStatus.ACTIVE,
      is_featured: true,
      sort_by: "featured",
    },
    {
      staleTime: 30000,
      refetchOnWindowFocus: false,
    },
  );

  // Fetch top sellers (popular products)
  const topSellersQuery = trpc.getProducts.useQuery(
    {
      page: 1,
      limit: 4,
      status: ProductStatus.ACTIVE,
      sort_by: "popular",
    },
    {
      staleTime: 30000,
      refetchOnWindowFocus: false,
    },
  );

  // Wishlist state
  const [wishlist, setWishlist] = useState<string[]>([]);

  // Cart mutation
  const addToCartMutation = trpc.addToCart.useMutation({
    onSuccess: () => {
      utils.getCart.invalidate();
      toast.success("Added to cart");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add to cart");
    },
  });

  // Handlers
  const handleProductClick = (product: ProductWithRelations) => {
    router.push(`/products/${product.id}`);
  };

  const handleAddToCart = (product: ProductWithRelations, quantity: number) => {
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

  const handleToggleWishlist = (product: ProductWithRelations) => {
    const isInWishlist = wishlist.includes(product.id);
    if (isInWishlist) {
      setWishlist(wishlist.filter((id) => id !== product.id));
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
    <main className="bg-trichomes-soft overflow-x-hidden">
      <Hero />

      <section className="py-8 sm:py-12 lg:py-20 bg-trichomes-soft animate-[sectionEntrance_600ms_ease-out] mx-auto max-w-[2200px]">
        <div className="w-full mx-auto px-4 md:px-6">
          <h2 className="text-[24px] sm:text-[32px] lg:text-[40px] text-center mb-2 sm:mb-3 text-trichomes-forest font-heading">
            Our Collection
          </h2>
          <div className="w-16 sm:w-20 h-1 bg-trichomes-primary mb-6 sm:mb-8 lg:mb-12 mx-auto rounded-full"></div>

          {categoriesQuery.isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-4">
              {["c1", "c2", "c3", "c4"].map((key) => (
                <div key={key} className="animate-pulse">
                  <div className="relative mx-auto md:w-[450px] h-[280px] md:h-[650px] bg-white border border-trichomes-forest/10 rounded-lg overflow-hidden shadow-sm">
                    {/* Image area placeholder */}
                    <div className="absolute inset-0 bg-trichomes-sage/40" />
                    {/* Bottom gradient to mimic overlay */}
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
                    {/* Label placeholder */}
                    <div className="absolute inset-x-0 bottom-0 px-4 py-4">
                      <div className="h-5 w-1/2 bg-white/40 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : categoriesQuery.error ? (
            <div className="text-center py-12">
              <p className="text-trichomes-forest/70 text-lg">
                Unable to load collections. Please try again later.
              </p>
            </div>
          ) : collections.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-trichomes-forest/70 text-lg">
                No collections available at the moment.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-4">
              {collections.map((category, index) => (
                <Link
                  key={category.id}
                  href={`/products?category=${category.slug}`}
                  className="group block"
                  style={{
                    animation: `staggerFadeIn 500ms cubic-bezier(0.16, 1, 0.3, 1) ${index * 100}ms both`,
                  }}
                >
                  {/* Card with rounded corners and image bleed */}
                  <div className="relative mx-auto md:w-[450px] h-[280px] md:h-[650px]  bg-white border border-trichomes-forest/10 rounded-lg overflow-hidden shadow-sm group-hover:shadow-md transition-all duration-200">
                    {/* Category image/products display area - now full bleeding */}
                    <div className="relative w-full h-full">
                      {category.image ? (
                        <Image
                          src={category.image}
                          alt={category.name}
                          fill
                          className="object-cover object-center"
                        />
                      ) : (
                        <div className="w-full h-full bg-trichomes-soft flex items-center justify-center">
                          <span className="text-4xl sm:text-5xl lg:text-6xl font-bold text-trichomes-forest/20">
                            {category.name.charAt(0)}
                          </span>
                        </div>
                      )}

                      {/* Dark gradient overlay for tunable opacity (bottom darker) */}
                      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none" />
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 bg-transparent px-4 md:px-8 py-8 md:py-10">
                      <h3 className="text-white text-2xl text-left font-body leading-tight line-clamp-1">
                        {category.name}
                      </h3>
                      <div className="w-10 md:w-15 h-1 bg-trichomes-primary mb-6 sm:mb-8 lg:mb-12 my-2 rounded-full"></div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-8 sm:py-12 lg:py-20 bg-white animate-[sectionEntrance_600ms_ease-out]">
      <div className="w-full mx-auto px-4 md:px-6">
        <h2 className="text-[24px] sm:text-[32px] lg:text-[40px] text-center mb-2 sm:mb-3 text-trichomes-forest font-heading">
            Featured Items
          </h2>
          <div className="w-16 sm:w-20 h-1 bg-trichomes-primary mb-6 sm:mb-8 lg:mb-12 mx-auto rounded-full"></div>

          {featuredProductsQuery.isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {["f1", "f2", "f3", "f4"].map((key) => (
                <div key={key} className="animate-pulse">
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
              <p className="text-trichomes-forest/70 text-lg">
                Unable to load featured products. Please try again later.
              </p>
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-trichomes-forest/70 text-lg">
                No featured products available at the moment.
              </p>
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
                  type="button"
                  onClick={() => router.push("/products?sort=featured")}
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
      <section className="py-8 sm:py-12 lg:py-20 bg-trichomes-sage animate-[sectionEntrance_600ms_ease-out]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <h2 className="text-[24px] sm:text-[32px] lg:text-[40px] text-center sm:text-left mb-2 sm:mb-3 text-trichomes-forest font-heading">
            Top Sellers
          </h2>
          <div className="w-16 sm:w-20 h-1 bg-trichomes-primary mb-6 sm:mb-8 lg:mb-12 mx-auto sm:mx-0"></div>

          {topSellersQuery.isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {["t1", "t2", "t3", "t4"].map((key) => (
                <div key={key} className="animate-pulse">
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
              <p className="text-trichomes-forest/70 text-lg">
                Unable to load top sellers. Please try again later.
              </p>
            </div>
          ) : topSellers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-trichomes-forest/70 text-lg">
                No top sellers available at the moment.
              </p>
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
                  type="button"
                  onClick={() => router.push("/products?sort=popular")}
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
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-8 sm:py-12 lg:py-20 bg-trichomes-soft animate-[sectionEntrance_600ms_ease-out]">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
          <div
            className="flex-1 bg-cover bg-center min-h-[250px] sm:min-h-[300px] lg:min-h-[400px] flex items-end p-4 sm:p-6 lg:p-8 shadow-md overflow-hidden group"
            style={{ backgroundImage: "url('/back-instock.png')" }}
          >
            <button
              type="button"
              className="bg-trichomes-gold text-trichomes-forest font-semibold py-2.5 px-6 sm:py-3 sm:px-8 lg:py-4 lg:px-10 text-sm sm:text-base lg:text-lg hover:bg-trichomes-gold-hover transition-all duration-200 ease-out hover:shadow-lg hover:scale-105 font-body"
            >
              Top Sellers{" "}
              <ChevronRightIcon className="inline-block w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 group-hover:translate-x-1" />
            </button>
          </div>
          <div
            className="flex-1 bg-cover bg-center min-h-[250px] sm:min-h-[300px] lg:min-h-[400px] flex items-end p-4 sm:p-6 lg:p-8 shadow-md overflow-hidden group"
            style={{ backgroundImage: "url('/new-arrival.png')" }}
          >
            <button
              type="button"
              className="bg-trichomes-gold text-trichomes-forest font-semibold py-2.5 px-6 sm:py-3 sm:px-8 lg:py-4 lg:px-10 text-sm sm:text-base lg:text-lg hover:bg-trichomes-gold-hover transition-all duration-200 ease-out hover:shadow-lg hover:scale-105 font-body"
            >
              New arrivals{" "}
              <ChevronRightIcon className="inline-block w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-12 lg:py-20 bg-trichomes-sage animate-[sectionEntrance_600ms_ease-out]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl text-center text-trichomes-forest">
          <h2 className="text-[22px] sm:text-[28px] lg:text-[40px] max-w-3xl mx-auto leading-tight font-heading px-2">
            Unlock your best skin, style, and scent. Book a 1-on-1 session.
          </h2>
          <p className="mt-4 sm:mt-6 max-w-3xl mx-auto text-[14px] sm:text-[15px] lg:text-[17px] leading-relaxed text-trichomes-forest/80 px-2 sm:px-4 font-body font-normal">
            Stop guessing, start glowing. Your beauty journey is unique, and
            true refinement requires expert guidance. Our private consultations
            are designed to go beyond surface-level advice, offering you a
            tailored roadmap across Skincare, Haircare, Bodycare, Decorative
            Artistry, and Fragrance.
          </p>
          <button
            type="button"
            className="mt-6 sm:mt-8 bg-trichomes-gold text-trichomes-forest font-semibold py-2.5 px-6 sm:py-3 sm:px-8 lg:py-4 lg:px-10 text-sm sm:text-base lg:text-lg hover:bg-trichomes-gold-hover transition-all duration-200 ease-out hover:shadow-lg hover:scale-105 font-body"
          >
            Book my session
          </button>
        </div>
      </section>

      <section className="py-8 sm:py-12 lg:py-20 bg-white animate-[sectionEntrance_600ms_ease-out]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 lg:gap-16 items-stretch">
            {/* Left Side - Store Image */}
            <div className="w-full lg:w-[48%] order-2 lg:order-1">
              <div className="relative w-full aspect-[3/4] sm:aspect-[4/5] lg:aspect-[4/5] group">
                {/* Decorative frame with sage background */}
                <div className="absolute -inset-2 sm:-inset-3 lg:-inset-4 bg-trichomes-sage/20 border-2 border-trichomes-forest/10"></div>

                {/* Image container */}
                <div className="relative w-full h-full shadow-lg overflow-hidden border-2 border-trichomes-forest/5">
                  <Image
                    src="/store.png"
                    alt="Trichomes Store Interior"
                    fill
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                    quality={100}
                    sizes="(max-width: 1024px) 100vw, 48vw"
                  />

                  {/* Subtle gradient overlay for depth */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-trichomes-forest/3 pointer-events-none"></div>
                </div>
              </div>
            </div>

            {/* Right Side - Content */}
            <div className="w-full lg:w-[52%] flex flex-col justify-center order-1 lg:order-2">
              <h2 className="text-[24px] sm:text-[28px] lg:text-[40px] text-trichomes-forest font-heading mb-3 sm:mb-4 lg:mb-6 leading-tight">
                Why Choose Trichomes?
              </h2>
              <div className="w-16 sm:w-20 h-1 bg-trichomes-primary mb-6 sm:mb-8 lg:mb-10"></div>

              <div className="space-y-6 sm:space-y-8 lg:space-y-10">
                <div
                  className="animate-[fadeInUp_400ms_cubic-bezier(0.16,1,0.3,1)]"
                  style={{ animationDelay: "100ms", animationFillMode: "both" }}
                >
                  <h3 className="text-[18px] sm:text-[20px] lg:text-[22px] font-heading text-trichomes-forest mb-2 sm:mb-3 lg:mb-4">
                    Premium Quality
                  </h3>
                  <p className="text-[14px] sm:text-[15px] lg:text-[16px] text-trichomes-forest/70 leading-relaxed font-body">
                    Only the finest ingredients, scientifically proven to
                    deliver results. Our modern clinic space combines advanced
                    skin analysis technology with expert care.
                  </p>
                </div>

                <div
                  className="animate-[fadeInUp_400ms_cubic-bezier(0.16,1,0.3,1)]"
                  style={{ animationDelay: "200ms", animationFillMode: "both" }}
                >
                  <h3 className="text-[18px] sm:text-[20px] lg:text-[22px] font-heading text-trichomes-forest mb-2 sm:mb-3 lg:mb-4">
                    Expert Guidance
                  </h3>
                  <p className="text-[14px] sm:text-[15px] lg:text-[16px] text-trichomes-forest/70 leading-relaxed font-body">
                    Personalized consultations to help you find your perfect
                    routine. Every visit is an opportunity to understand your
                    unique needs and discover products that truly work.
                  </p>
                </div>

                <div
                  className="animate-[fadeInUp_400ms_cubic-bezier(0.16,1,0.3,1)]"
                  style={{ animationDelay: "300ms", animationFillMode: "both" }}
                >
                  <h3 className="text-[18px] sm:text-[20px] lg:text-[22px] font-heading text-trichomes-forest mb-2 sm:mb-3 lg:mb-4">
                    Trusted by Thousands
                  </h3>
                  <p className="text-[14px] sm:text-[15px] lg:text-[16px] text-trichomes-forest/70 leading-relaxed font-body">
                    Join our community of satisfied customers who've transformed
                    their skin. We believe in the power of education first,
                    consultation second, and products third.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
