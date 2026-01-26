"use client";

import { ProductStatus } from "@prisma/client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/app/contexts/auth-context";
import {
  type FilterOptions,
  ProductFilter,
} from "@/components/product/product-filter";
import type { ProductWithRelations } from "@/components/product/product-grid";
import { ProductGrid } from "@/components/product/product-grid";
import { ChevronRightIcon } from "@/components/ui/icons";
import { addToLocalCart } from "@/utils/local-cart";
import { trpc } from "@/utils/trpc";

const sortOptions = [
  { label: "Featured", value: "featured" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Name: A to Z", value: "name-asc" },
  { label: "Name: Z to A", value: "name-desc" },
];

interface FilterState {
  price: number;
  brands: string[]; // slugs
  concerns: string[];
  ingredients: string[];
}

function BrandsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const brandSlugParam = searchParams?.get("brand");
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  // Fetch all active brands
  const brandsQuery = trpc.getBrands.useQuery({
    status: ProductStatus.ACTIVE,
  }, {
    staleTime: 300000, // 5 mins
    refetchOnWindowFocus: false
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [price, setPrice] = useState(100000);

  // Helper to find initial brand name if slug is in param
  const initialBrandSlug = brandSlugParam;
  const initialBrandName = useMemo(() => {
    if (!initialBrandSlug || !brandsQuery.data?.brands) return initialBrandSlug;
    return brandsQuery.data.brands.find(b => b.slug === initialBrandSlug)?.name || initialBrandSlug;
  }, [initialBrandSlug, brandsQuery.data]);

  // Store brand NAMES in selectedBrands (to match ProductFilter behavior)
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);

  // Update selected brands when query data loads if param exists
  useEffect(() => {
    if (initialBrandName && brandsQuery.data?.brands) {
      const name = brandsQuery.data.brands.find(b => b.slug === initialBrandSlug)?.name;
      if (name) setSelectedBrands([name]);
    }
  }, [initialBrandName, brandsQuery.data, initialBrandSlug]);

  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("featured");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilters, setActiveFilters] = useState<FilterState | null>(null);
  const [showProducts, setShowProducts] = useState(!!brandSlugParam);

  // Helper to get slug from name
  const getSlugByName = (name: string) => {
    return brandsQuery.data?.brands.find(b => b.name === name)?.slug;
  };

  // Fetch products based on filters
  const productsQuery = trpc.getProducts.useQuery(
    {
      page: currentPage,
      limit: 12,
      search: searchTerm.trim() || undefined,
      max_price: activeFilters?.price || undefined,
      status: ProductStatus.ACTIVE,
      // Map selected brand name to slug
      brand_slug: activeFilters?.brands[0] ? getSlugByName(activeFilters.brands[0]) : undefined,
    },
    {
      staleTime: 30000,
      refetchOnWindowFocus: false,
      enabled: showProducts,
    },
  );

  // Mutations for cart and wishlist
  const addToCartMutation = trpc.addToCart.useMutation({
    onSuccess: () => {
      utils.getCart.invalidate();
      toast.success("Added to cart");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add to cart");
    },
  });

  const addToWishlistMutation = trpc.addToWishlist.useMutation({
    onSuccess: () => {
      utils.getWishlist.invalidate();
      toast.success("Added to wishlist");
    },
    onError: (error) => {
      if (!isAuthenticated) {
        toast.error("Please sign in to add items to wishlist");
        router.push("/auth/signin");
      } else {
        toast.error(error.message || "Failed to add to wishlist");
      }
    },
  });

  const removeFromWishlistMutation = trpc.removeFromWishlist.useMutation({
    onSuccess: () => {
      utils.getWishlist.invalidate();
      toast.success("Removed from wishlist");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to remove from wishlist");
    },
  });

  const wishlistQuery = trpc.getWishlist.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchOnWindowFocus: false,
  });

  const wishlistProductIds = useMemo(() => {
    if (!wishlistQuery.data?.items) return [];
    return wishlistQuery.data.items.map((item) => item.product_id);
  }, [wishlistQuery.data]);

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
    const wishlistItem = wishlistQuery.data?.items.find(
      (item) => item.product_id === product.id,
    );

    if (wishlistItem) {
      removeFromWishlistMutation.mutate({ id: wishlistItem.id });
    } else {
      addToWishlistMutation.mutate({ product_id: product.id });
    }
  };

  const handleApplyFilters = () => {
    setActiveFilters({
      price,
      brands: selectedBrands,
      concerns: selectedConcerns,
      ingredients: selectedIngredients,
    });
    setCurrentPage(1);
    setShowProducts(true);
  };

  const handleToggleFilter = (
    category: "brands" | "concerns" | "ingredients",
    value: string,
  ) => {
    switch (category) {
      case "brands":
        // For now, enforce single selection for brands compatible with getProducts query
        // Or toggle logic if we want to support multi-select later (requires backend update)
        // Let's implement single select behavior or toggle.
        // Given current backend limitation, let's just REPLACE the selection.
        if (selectedBrands.includes(value)) {
          setSelectedBrands([]);
        } else {
          setSelectedBrands([value]);
        }
        break;
      case "concerns":
        setSelectedConcerns((prev) =>
          prev.includes(value)
            ? prev.filter((c) => c !== value)
            : [...prev, value],
        );
        break;
      case "ingredients":
        setSelectedIngredients((prev) =>
          prev.includes(value)
            ? prev.filter((i) => i !== value)
            : [...prev, value],
        );
        break;
    }
  };

  const handleClearFilters = () => {
    setActiveFilters(null);
    setSelectedBrands([]);
    setSelectedConcerns([]);
    setSelectedIngredients([]);
    setPrice(100000);
    setSearchTerm("");
    setShowProducts(false);
  };

  const loadMoreProducts = () => {
    setCurrentPage((prev) => prev + 1);
  };

  const canLoadMore = productsQuery.data
    ? currentPage < productsQuery.data.pagination.pages
    : false;

  // Group brands alphabetically
  const groupedBrands = useMemo(() => {
    const groups: Record<string, any[]> = {};
    if (!brandsQuery.data?.brands) return groups;

    brandsQuery.data.brands.forEach((brand) => {
      const firstLetter = (Array.from(brand.name)[0] || "").toUpperCase();
      if (!groups[firstLetter]) {
        groups[firstLetter] = [];
      }
      groups[firstLetter]?.push(brand);
    });
    return groups;
  }, [brandsQuery.data]);

  const filterOptions: FilterOptions = {
    brands: brandsQuery.data?.brands ? brandsQuery.data.brands.map(b => b.name) : [],
    concerns: [
      "Acne",
      "Dry Skin",
      "Oily Skin",
      "Anti-Aging",
      "Sensitive Skin",
      "Dark Spots",
    ],
    ingredients: [
      "Hyaluronic Acid",
      "Vitamin C",
      "Retinol",
      "Niacinamide",
      "Salicylic Acid",
    ],
  };

  // Helper to get brand name from slug
  const getBrandName = (slug: string) => {
    return brandsQuery.data?.brands.find(b => b.slug === slug)?.name || slug;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Header Section */}
      <div className="relative w-full h-[300px] sm:h-[350px] lg:h-[400px] animate-[sectionEntrance_600ms_ease-out]">
        {/* Background Image */}
        <div className="absolute inset-0">
          <div
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: "url('/bg-image.png')" }}
          />
          {/* Gradient Overlay - Elegant gray/charcoal tone */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to right, rgba(75, 75, 75, 0.88), rgba(75, 75, 75, 0.70), rgba(75, 75, 75, 0.35))'
            }}
          ></div>
        </div>

        {/* Content */}
        <div className="relative h-full mx-auto px-4 sm:px-6 lg:px-8 max-w-[2200px] flex flex-col justify-center">
          <div className="flex flex-col items-start max-w-2xl">
            {/* Main Title */}
            <h1 className="text-[40px] sm:text-[48px] lg:text-[56px] font-heading text-white leading-tight mb-4 animate-[fadeInUp_400ms_cubic-bezier(0.16,1,0.3,1)]">
              {showProducts && selectedBrands.length > 0
                ? selectedBrands[0]
                : "Shop by Brand"}
            </h1>

            {/* Breadcrumbs */}
            <nav
              className="flex items-center space-x-2 animate-[fadeInUp_400ms_cubic-bezier(0.16,1,0.3,1)]"
              style={{ animationDelay: "100ms", animationFillMode: "both" }}
            >
              <Link
                href="/"
                className="text-[14px] text-white/80 hover:text-white transition-colors duration-150 ease-out font-body"
              >
                Home
              </Link>
              <ChevronRightIcon className="w-4 h-4 text-white/60" />
              <span className="text-[14px] text-white font-body">
                Brands
              </span>
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-16 sm:pb-20 lg:pb-24 max-w-[2200px] animate-[sectionEntrance_600ms_ease-out]">
        {!showProducts ? (
          /* Brand List View */
          <div className="w-full">
            {brandsQuery.isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-[#38761d] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : brandsQuery.error ? (
              <div className="text-center py-12">
                <p className="text-red-500">Failed to load brands</p>
              </div>
            ) : (
              /* Alphabetical Brand List */
              <div className="bg-white border border-gray-200 p-6 sm:p-8 rounded-sm shadow-sm">
                {Object.keys(groupedBrands)
                  .sort()
                  .map((letter) => (
                    <div key={letter} className="mb-8 last:mb-0">
                      <h2 className="text-[24px] font-heading text-gray-900 mb-4 pb-2 border-b border-gray-200">
                        {letter}
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        {groupedBrands[letter]?.map((brand) => (
                          <button
                            key={brand.id}
                            type="button"
                            onClick={() => {
                              setSelectedBrands([brand.name]);
                              // Directly set active filters here since we are navigating
                              setActiveFilters({
                                price,
                                brands: [brand.name], // Use name here
                                concerns: selectedConcerns,
                                ingredients: selectedIngredients
                              });
                              setShowProducts(true);
                            }}
                            className="text-left px-4 py-3 rounded-sm border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all duration-150 ease-out font-body text-[14px] sm:text-[15px] text-gray-900 shadow-sm hover:shadow-md flex justify-between items-center"
                          >
                            <span>{brand.name}</span>
                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{brand._count.products}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}

                {(!brandsQuery.data?.brands || brandsQuery.data.brands.length === 0) && (
                  <div className="text-center py-12">
                    <p className="text-gray-600 font-body text-[15px] sm:text-[16px]">
                      No brands available at the moment.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Filtered Products View */
          <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
            <ProductFilter
              searchTerm={searchTerm}
              onSearchTermChange={setSearchTerm}
              price={price}
              onPriceChange={setPrice}
              // Map slugs back to names for display if needed, but the Filter component might expect just strings
              // We need to check ProductFilter implementation later if it expects specific values.
              // For now, passing slugs.
              selectedBrands={selectedBrands}
              selectedConcerns={selectedConcerns}
              selectedIngredients={selectedIngredients}
              onToggleFilter={handleToggleFilter}
              onApplyFilters={handleApplyFilters}
              onClearFilters={handleClearFilters}
              filterOptions={filterOptions}
            />

            <div className="w-full">
              {/* Controls Bar - Sort and Clear Filters */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4 flex-wrap">
                  {/* Results count */}
                  {!productsQuery.isLoading && !productsQuery.error && (
                    <p className="text-[13px] text-gray-600 font-body">
                      {productsQuery.data?.products.length || 0} of{" "}
                      {productsQuery.data?.pagination.total || 0} products
                    </p>
                  )}

                  {/* Back to brands link */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowProducts(false);
                      setSelectedBrands([]);
                      setActiveFilters(null);
                    }}
                    className="text-[13px] text-[#40702A] hover:text-gray-900 underline font-body transition-colors duration-150 ease-out"
                  >
                    ← Back to brands
                  </button>

                  {/* Clear filters */}
                  {activeFilters && (
                    <button
                      type="button"
                      onClick={handleClearFilters}
                      className="text-[13px] text-[#40702A] hover:text-gray-900 underline font-body transition-colors duration-150 ease-out"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>

                {/* Sort dropdown */}
                <div className="flex items-center gap-2.5">
                  <label
                    htmlFor="sort"
                    className="text-[13px] text-gray-900 whitespace-nowrap font-body font-medium"
                  >
                    Sort by:
                  </label>
                  <select
                    id="sort"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 rounded-sm border border-gray-200 text-[13px] focus:ring-1 focus:ring-black/10 focus:border-black outline-none bg-white text-gray-900 font-body transition-all duration-150 min-w-[180px]"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Products */}
              {productsQuery.isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {["p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8"].map((key) => (
                    <div
                      key={key}
                      className="bg-[#FAFAF7] rounded-sm overflow-hidden animate-pulse"
                    >
                      <div className="w-full aspect-3/4 bg-gray-200"></div>
                      <div className="p-4">
                        <div className="h-4 bg-gray-200 mb-2 rounded"></div>
                        <div className="h-6 bg-gray-200 mb-4 w-1/2 rounded"></div>
                        <div className="flex items-center justify-between">
                          <div className="h-8 w-8 bg-gray-200 rounded"></div>
                          <div className="h-8 w-24 bg-gray-200 rounded-full"></div>
                          <div className="h-8 w-20 bg-gray-200 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : productsQuery.error ? (
                <div className="text-center py-12 sm:py-20 bg-white border border-gray-200 rounded-sm shadow-sm">
                  <p className="text-[18px] sm:text-[20px] text-red-600 font-body mb-4">
                    Error loading products
                  </p>
                  <button
                    type="button"
                    onClick={() => productsQuery.refetch()}
                    className="px-6 py-3 bg-[#1E3024] text-white rounded-full hover:bg-[#1E3024]/90 font-medium transition-all duration-150 ease-out hover:shadow-md text-[14px] sm:text-[15px] font-body"
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <>
                  <ProductGrid
                    products={
                      (productsQuery.data?.products || []) as ProductWithRelations[]
                    }
                    onProductClick={handleProductClick}
                    onAddToCart={handleAddToCart}
                    wishlist={wishlistProductIds}
                    onToggleWishlist={handleToggleWishlist}
                  />

                  {(!productsQuery.data?.products || productsQuery.data.products.length === 0) && (
                    <div className="text-center py-12 sm:py-20 bg-white border border-gray-200 rounded-sm shadow-sm">
                      <p className="text-[18px] sm:text-[20px] text-gray-600 font-body mb-4">
                        No products found for this brand.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setShowProducts(false);
                          setActiveFilters(null);
                          setSelectedBrands([]);
                        }}
                        className="px-6 py-3 bg-[#1E3024] text-white rounded-full hover:bg-[#1E3024]/90 font-medium transition-all duration-150 ease-out hover:shadow-md text-[14px] sm:text-[15px] font-body"
                      >
                        Browse all brands
                      </button>
                    </div>
                  )}

                  {canLoadMore && (
                    <div className="text-center mt-8 sm:mt-12">
                      <button
                        type="button"
                        onClick={loadMoreProducts}
                        disabled={productsQuery.isFetching}
                        className="px-6 sm:px-8 py-3 border-2 border-[#1E3024] text-[#1E3024] rounded-full hover:bg-[#1E3024] hover:text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 ease-out text-[14px] sm:text-[15px] font-body shadow-sm hover:shadow-md"
                      >
                        {productsQuery.isFetching
                          ? "Loading..."
                          : "Load more products"}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BrandsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-900 font-body">Loading...</p>
      </div>
    </div>}>
      <BrandsPageContent />
    </Suspense>
  );
}
