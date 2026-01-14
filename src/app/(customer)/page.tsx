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
import { CONTENT_TYPES } from "@/lib/constants/content-types";
import { addToLocalCart } from "@/utils/local-cart";
import { trpc } from "@/utils/trpc";

// Default content for fallbacks
const DEFAULTS = {
  collectionTitle: "Our Collection",
  featuredTitle: "Featured Items",
  topSellersTitle: "Top Sellers",
  bannerLeft: {
    buttonText: "Top Sellers",
    buttonLink: "/products?sort=popular",
    imageUrl: "/banners/new-arrivals.jpg",
  },
  bannerRight: {
    buttonText: "New arrivals",
    buttonLink: "/products?sort=newest",
    imageUrl: "/banners/top-seller.jpg",
  },
  bookSession: {
    title: "Unlock your best skin, style, and scent. Book a 1 on 1 session.",
    description:
      "Stop guessing, start glowing. Your beauty journey is unique, and true refinement requires expert guidance. Our private consultations are designed to go beyond surface-level advice, offering you a tailored roadmap across Skincare, Haircare, Bodycare, Decorative Artistry, and Fragrance.",
    buttonText: "Book my session",
    buttonLink: "/consultation",
    imageUrl: "/book-a-session.jpg",
  },
  whyChoose: {
    title: "Why Choose Trichomes?",
    imageUrl: "/store.png",
  },
};

export default function Page() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  // Fetch all home page content from database
  const contentQuery = trpc.getPageContent.useQuery(
    {
      types: [
        CONTENT_TYPES.HOME_COLLECTION_TITLE,
        CONTENT_TYPES.HOME_FEATURED_TITLE,
        CONTENT_TYPES.HOME_TOPSELLERS_TITLE,
        CONTENT_TYPES.HOME_BANNER_LEFT,
        CONTENT_TYPES.HOME_BANNER_RIGHT,
        CONTENT_TYPES.HOME_BOOK_SESSION,
        CONTENT_TYPES.HOME_WHY_CHOOSE,
      ],
    },
    {
      staleTime: 60000,
      refetchOnWindowFocus: false,
    },
  );

  // Extract content with fallbacks
  const contentMap = contentQuery.data || {};
  const collectionTitle =
    contentMap[CONTENT_TYPES.HOME_COLLECTION_TITLE]?.title ||
    DEFAULTS.collectionTitle;
  const featuredTitle =
    contentMap[CONTENT_TYPES.HOME_FEATURED_TITLE]?.title ||
    DEFAULTS.featuredTitle;
  const topSellersTitle =
    contentMap[CONTENT_TYPES.HOME_TOPSELLERS_TITLE]?.title ||
    DEFAULTS.topSellersTitle;

  const bannerLeft = {
    buttonText:
      contentMap[CONTENT_TYPES.HOME_BANNER_LEFT]?.button_text ||
      DEFAULTS.bannerLeft.buttonText,
    buttonLink:
      contentMap[CONTENT_TYPES.HOME_BANNER_LEFT]?.button_link ||
      DEFAULTS.bannerLeft.buttonLink,
    imageUrl:
      contentMap[CONTENT_TYPES.HOME_BANNER_LEFT]?.image_url ||
      DEFAULTS.bannerLeft.imageUrl,
  };

  const bannerRight = {
    buttonText:
      contentMap[CONTENT_TYPES.HOME_BANNER_RIGHT]?.button_text ||
      DEFAULTS.bannerRight.buttonText,
    buttonLink:
      contentMap[CONTENT_TYPES.HOME_BANNER_RIGHT]?.button_link ||
      DEFAULTS.bannerRight.buttonLink,
    imageUrl:
      contentMap[CONTENT_TYPES.HOME_BANNER_RIGHT]?.image_url ||
      DEFAULTS.bannerRight.imageUrl,
  };

  const bookSession = {
    title:
      contentMap[CONTENT_TYPES.HOME_BOOK_SESSION]?.title ||
      DEFAULTS.bookSession.title,
    description:
      contentMap[CONTENT_TYPES.HOME_BOOK_SESSION]?.description ||
      DEFAULTS.bookSession.description,
    buttonText:
      contentMap[CONTENT_TYPES.HOME_BOOK_SESSION]?.button_text ||
      DEFAULTS.bookSession.buttonText,
    buttonLink:
      contentMap[CONTENT_TYPES.HOME_BOOK_SESSION]?.button_link ||
      DEFAULTS.bookSession.buttonLink,
    imageUrl:
      contentMap[CONTENT_TYPES.HOME_BOOK_SESSION]?.image_url ||
      DEFAULTS.bookSession.imageUrl,
  };

  const whyChoose = {
    title:
      contentMap[CONTENT_TYPES.HOME_WHY_CHOOSE]?.title ||
      DEFAULTS.whyChoose.title,
    imageUrl:
      contentMap[CONTENT_TYPES.HOME_WHY_CHOOSE]?.image_url ||
      DEFAULTS.whyChoose.imageUrl,
  };

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

  const collections = categoriesQuery.data?.slice(0, 4) || [];

  const featuredProducts = featuredProductsQuery.data?.products || [];
  const topSellers = topSellersQuery.data?.products || [];

  return (
    <main className="bg-white overflow-x-hidden">
      <Hero />

      <section className="py-8 sm:py-12 lg:py-20 bg-white animate-[sectionEntrance_600ms_ease-out] mx-auto max-w-[2200px]">
        <div className="w-full mx-auto px-4 md:px-6">
          <h2 className="text-[24px] sm:text-[32px] lg:text-[40px] text-center mb-2 sm:mb-3 text-trichomes-forest font-heading">
            {collectionTitle}
          </h2>
          <div className="w-16 sm:w-20 h-1 bg-trichomes-primary mb-6 sm:mb-8 lg:mb-12 mx-auto rounded-full" />

          {categoriesQuery.isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-4">
              {["c1", "c2", "c3", "c4"].map((key) => (
                <div key={key} className="animate-pulse">
                  <div className="relative mx-auto w-full h-[280px] md:h-[650px] bg-gray-200 rounded-lg overflow-hidden shadow-sm">
                    <div className="absolute inset-0 bg-gray-200" />
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
                  <div className="relative mx-auto h-[280px] md:h-[650px] bg-white border border-trichomes-forest/10 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-200">
                    {/* Category image/products display area - now full bleeding */}
                    <div className="w-full h-full">
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
                    </div>

                    {/* Dark gradient overlay for tunable opacity (bottom darker) */}
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none" />

                    {/* Category name and accent bar */}
                    <div className="absolute bottom-0 left-0 right-0 z-10 px-4 md:px-8 py-6 md:py-8">
                      <h3 className="text-white text-xl md:text-2xl text-left font-body leading-tight line-clamp-1">
                        {category.name}
                      </h3>
                      <div className="w-10 md:w-14 h-1 bg-trichomes-primary mt-2 rounded-full" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-8 sm:py-12 lg:py-20 bg-white animate-[sectionEntrance_600ms_ease-out] mx-auto max-w-[2200px] ">
        <div className="w-full mx-auto px-4 md:px-6">
          <h2 className="text-[24px] sm:text-[32px] lg:text-[40px] text-center mb-2 sm:mb-3 text-trichomes-forest font-heading">
            {featuredTitle}
          </h2>
          <div className="w-16 sm:w-20 h-1 bg-trichomes-primary mb-6 sm:mb-8 lg:mb-12 mx-auto rounded-full" />

          {featuredProductsQuery.isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {["f1", "f2", "f3", "f4"].map((key) => (
                <div
                  key={key}
                  className="animate-pulse bg-white rounded-xl overflow-hidden border border-gray-100"
                >
                  <div className="aspect-square w-full bg-gray-200" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto" />
                    <div className="h-5 bg-gray-200 rounded w-1/2 mx-auto" />
                    <div className="flex justify-center gap-2 pt-2">
                      <div className="h-8 w-8 bg-gray-200 rounded-md" />
                      <div className="h-8 w-24 bg-gray-200 rounded-full" />
                      <div className="h-8 w-24 bg-gray-200 rounded-full" />
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
      <section className="py-8 sm:py-12 lg:py-20 bg-[#E1D1C14D]/30 animate-[sectionEntrance_600ms_ease-out] mx-auto w-full">
        <div className="max-w-[2200px] mx-auto ">
          <div className=" w-full mx-auto px-4 md:px-6">
            <h2 className="text-[24px] sm:text-[32px] lg:text-[40px] text-center mb-2 sm:mb-3 text-trichomes-forest font-heading">
              {topSellersTitle}
            </h2>
            <div className="w-16 sm:w-20 h-1 bg-trichomes-primary mb-6 sm:mb-8 lg:mb-12 mx-auto rounded-full" />

            {topSellersQuery.isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mx-auto max-w-[2200px] ">
                {["t1", "t2", "t3", "t4"].map((key) => (
                  <div
                    key={key}
                    className="animate-pulse bg-white rounded-xl overflow-hidden border border-gray-100"
                  >
                    <div className="aspect-square w-full bg-gray-200" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto" />
                      <div className="h-5 bg-gray-200 rounded w-1/2 mx-auto" />
                      <div className="flex justify-center gap-2 pt-2">
                        <div className="h-8 w-8 bg-gray-200 rounded-md" />
                        <div className="h-8 w-24 bg-gray-200 rounded-full" />
                        <div className="h-8 w-24 bg-gray-200 rounded-full" />
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
        </div>
      </section>

      {/* Banners - Design Guide: Warm Sand for lifestyle sections, Gold buttons */}
      <section className=" mx-auto px-4 sm:px-6 lg:px-8 w-full py-8 sm:py-12 lg:py-20  animate-[sectionEntrance_600ms_ease-out]">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8 max-w-[2200px] mx-auto">
          <Link
            href={bannerLeft.buttonLink}
            className="flex-1 bg-cover bg-center min-h-[250px]  md:min-h-[600px] flex items-end p-4 sm:p-6 lg:p-8 shadow-md overflow-hidden group rounded-2xl"
            style={{ backgroundImage: `url('${bannerLeft.imageUrl}')` }}
          >
            <span className="bg-[#407029] text-white font-semibold py-3 px-6 sm:py-3 sm:px-8 lg:py-4 lg:px-10 text-sm sm:text-base lg:text-lg hover:bg-[#528C35] transition-all duration-200 ease-out hover:shadow-lg hover:scale-105 font-body rounded-lg">
              {bannerLeft.buttonText}{" "}
              <ChevronRightIcon className="inline-block w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 group-hover:translate-x-1" />
            </span>
          </Link>
          <Link
            href={bannerRight.buttonLink}
            className="flex-1 bg-cover bg-center min-h-[250px] md:min-h-[600px] flex items-end p-4 sm:p-6 lg:p-8 shadow-md overflow-hidden group rounded-2xl"
            style={{ backgroundImage: `url('${bannerRight.imageUrl}')` }}
          >
            <span className="bg-[#407029] text-white font-semibold py-3 px-6 sm:py-3 sm:px-8 lg:py-4 lg:px-10 text-sm sm:text-base lg:text-lg hover:bg-[#528C35] transition-all duration-200 ease-out hover:shadow-lg hover:scale-105 font-body rounded-lg">
              {bannerRight.buttonText}{" "}
              <ChevronRightIcon className="inline-block w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 group-hover:translate-x-1" />
            </span>
          </Link>
        </div>
      </section>

      {/* Unlock Section - Full width background style with overlay content */}
      <section className="relative w-full bg-white py-16 sm:py-24 lg:py-32 overflow-hidden h-[800px]">
        {/* Background Image - Absolute */}
        <div className="absolute inset-0 w-full h-full">
          <Image
            src={bookSession.imageUrl}
            alt="Woman with glowing skin"
            fill
            className="object-cover object-center opacity-100"
          />
          {/* Gradient Overlay for text readability */}
          <div className="absolute inset-0 bg-[#F6F1EC] opacity-85" />
        </div>

        <div className="relative mx-auto px-4 sm:px-6 lg:px-8 w-full max-w-[2200px] h-full flex flex-col justify-center items-center text-center">
          <div className=" max-w-7xl animate-[fadeInUp_600ms_ease-out]">
            <h2 className="text-[32px] sm:text-[42px] lg:text-[56px] leading-[1.1] font-heading text-trichomes-forest mb-6">
              {bookSession.title}
            </h2>
            <p className="text-[15px] md:text-[16px] leading-relaxed text-trichomes-forest/80 mb-8 ] font-body text-center ">
              {bookSession.description}
            </p>
            <Link
              href={bookSession.buttonLink}
              className="bg-[#407029] text-white font-medium py-3.5 px-8 sm:py-4 sm:px-10 text-[15px] sm:text-[16px] hover:bg-[#528C35] transition-all duration-200 ease-out hover:shadow-lg rounded-md font-body inline-block"
            >
              {bookSession.buttonText}
            </Link>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 lg:py-24 bg-white animate-[sectionEntrance_600ms_ease-out]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1440px]">
          <div className="flex flex-col lg:flex-row gap-8 sm:gap-12 lg:gap-20 items-center">
            <div className="w-full lg:w-1/2 order-2 lg:order-1 relative">
              {/* Container with background image */}
              <div
                className="relative w-full h-[500px] sm:h-[600px] lg:h-[650px]"
                style={{
                  backgroundImage: `url(${whyChoose.imageUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                {/* White overlay covering entire background */}
                <div className="absolute inset-0 bg-white z-10" />

                {/* Left Window - reveals background at this exact position */}
                <div
                  className="absolute top-[22%] left-5  w-[45%] h-[60%] rounded-[32px] overflow-hidden shadow-xl z-20"
                  style={{
                    backgroundImage: `url(${whyChoose.imageUrl})`,
                    backgroundSize: "calc(120% / 0.48) calc(120% / 0.60)",
                    backgroundPosition: "calc(18% / 0.90) calc(28% / 0.60)",
                    backgroundRepeat: "no-repeat",
                  }}
                />

                {/* Right Window - reveals background at this exact position */}
                <div
                  className="absolute top-[30%] right-0 w-[45%] h-[60%] rounded-[32px] overflow-hidden shadow-xl z-20"
                  style={{
                    backgroundImage: `url(${whyChoose.imageUrl})`,
                    backgroundSize: "calc(120% / 0.48) calc(120% / 0.60)",
                    backgroundPosition: "calc(100%) calc(36% / 0.60)",
                    backgroundRepeat: "no-repeat",
                  }}
                />
              </div>
            </div>

            {/* Right Side - Content */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center order-1 lg:order-2">
              <h2 className="text-[32px] sm:text-[40px] lg:text-[48px] text-trichomes-forest font-heading mb-8 sm:mb-10 lg:mb-12 leading-tight">
                {whyChoose.title}
              </h2>

              <div className="space-y-8 sm:space-y-10">
                <div className="animate-[fadeInUp_400ms_cubic-bezier(0.16,1,0.3,1)]">
                  <h3 className="text-[20px] sm:text-[22px] font-heading text-trichomes-forest mb-3 font-semibold">
                    Premium Quality
                  </h3>
                  <div className="w-full h-px bg-trichomes-forest/10 mb-4" />
                  <p className="text-[15px] sm:text-[16px] text-trichomes-forest/70 leading-relaxed font-body">
                    Only the finest ingredients, scientifically proven to
                    deliver results. Our modern clinic space combines advanced
                    skin analysis technology with expert care.
                  </p>
                </div>

                <div
                  className="animate-[fadeInUp_400ms_cubic-bezier(0.16,1,0.3,1)]"
                  style={{ animationDelay: "100ms" }}
                >
                  <h3 className="text-[20px] sm:text-[22px] font-heading text-trichomes-forest mb-3 font-semibold">
                    Expert Guidance
                  </h3>
                  <div className="w-full h-px bg-trichomes-forest/10 mb-4" />
                  <p className="text-[15px] sm:text-[16px] text-trichomes-forest/70 leading-relaxed font-body">
                    Personalized consultations to help you find your perfect
                    routine. Every visit is an opportunity to understand your
                    unique needs and discover products that truly work.
                  </p>
                </div>

                <div
                  className="animate-[fadeInUp_400ms_cubic-bezier(0.16,1,0.3,1)]"
                  style={{ animationDelay: "200ms" }}
                >
                  <h3 className="text-[20px] sm:text-[22px] font-heading text-trichomes-forest mb-3 font-semibold">
                    Educate First
                  </h3>
                  <div className="w-full h-px bg-trichomes-forest/10 mb-4" />
                  <p className="text-[15px] sm:text-[16px] text-trichomes-forest/70 leading-relaxed font-body">
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
