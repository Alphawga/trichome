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
  brands: string[];
  concerns: string[];
  ingredients: string[];
}

type ExtendedProduct = ProductWithRelations & {
  brand: string;
  concerns: string[];
  ingredients: string[];
  inStock: boolean;
};

function BrandsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const brandParam = searchParams?.get("brand");
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  const [searchTerm, setSearchTerm] = useState("");
  const [price, setPrice] = useState(100000);
  const [selectedBrands, setSelectedBrands] = useState<string[]>(
    brandParam ? [brandParam] : [],
  );
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("featured");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilters, setActiveFilters] = useState<FilterState | null>(null);
  const [showProducts, setShowProducts] = useState(!!brandParam);

  const productsQuery = trpc.getProducts.useQuery(
    {
      page: currentPage,
      limit: 12,
      search: searchTerm.trim() || undefined,
      max_price: activeFilters?.price || undefined,
      status: ProductStatus.ACTIVE,
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

  const transformedProducts = useMemo((): ExtendedProduct[] => {
    if (!productsQuery.data?.products) return [];

    return productsQuery.data.products.map((product) => ({
      ...product,
      brand: product.category?.name || "Uncategorized",
      concerns: ["General Care"],
      ingredients: ["Natural Ingredients"],
      inStock:
        product.status === "ACTIVE" &&
        (!product.track_quantity || product.quantity > 0),
    }));
  }, [productsQuery.data]);

  const filteredAndSortedProducts = useMemo((): ExtendedProduct[] => {
    let products = [...transformedProducts];

    if (activeFilters) {
      if (activeFilters.brands.length > 0) {
        products = products.filter(
          (p) => p.brand && activeFilters.brands.includes(p.brand),
        );
      }
      if (activeFilters.concerns.length > 0) {
        products = products.filter((p) =>
          p.concerns?.some((c) => activeFilters.concerns.includes(c)),
        );
      }
      if (activeFilters.ingredients.length > 0) {
        products = products.filter((p) =>
          p.ingredients?.some((i) => activeFilters.ingredients.includes(i)),
        );
      }
    }

    switch (sortBy) {
      case "price-asc":
        products.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case "price-desc":
        products.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case "name-asc":
        products.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        products.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        products.sort(
          (a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0),
        );
        break;
    }

    return products;
  }, [transformedProducts, activeFilters, sortBy]);

  useEffect(() => {
    setCurrentPage(1);
  }, []);

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
        setSelectedBrands((prev) =>
          prev.includes(value)
            ? prev.filter((b) => b !== value)
            : [...prev, value],
        );
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

  // Extract unique brands from products
  const availableBrands = useMemo(() => {
    const brands = new Set<string>();
    transformedProducts.forEach((p) => {
      if (p.brand) brands.add(p.brand);
    });
    return Array.from(brands).sort();
  }, [transformedProducts]);

  // Group brands alphabetically
  const groupedBrands = useMemo(() => {
    const groups: Record<string, string[]> = {};
    availableBrands.forEach((brand) => {
      const firstLetter = brand.charAt(0).toUpperCase();
      if (!groups[firstLetter]) {
        groups[firstLetter] = [];
      }
      groups[firstLetter].push(brand);
    });
    return groups;
  }, [availableBrands]);

  const filterOptions: FilterOptions = {
    brands: availableBrands,
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

  return (
    <div className="min-h-screen bg-trichomes-soft">
      {/* Hero Header Section */}
      <div className="bg-trichomes-sand w-full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 lg:pt-20 pb-12 sm:pb-16 lg:pb-20">
          <div className="flex flex-col items-start">
            {/* Main Title */}
            <h1 className="text-[40px] sm:text-[48px] lg:text-[56px] font-heading text-trichomes-forest leading-tight mb-4">
              {showProducts && selectedBrands.length > 0
                ? selectedBrands.join(", ")
                : "Shop by Brand"}
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
                Brands
              </span>
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-16 sm:pb-20 lg:pb-24 max-w-[1500px]">
        {!showProducts ? (
          /* Brand List View */
          <div className="w-full">
            {/* Alphabetical Brand List */}
            <div className="bg-white border border-trichomes-forest/10 p-6 sm:p-8 shadow-sm">
              {Object.keys(groupedBrands)
                .sort()
                .map((letter) => (
                  <div key={letter} className="mb-8 last:mb-0">
                    <h2 className="text-[24px] font-heading text-trichomes-primary mb-4 pb-2 border-b border-trichomes-forest/10">
                      {letter}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                      {groupedBrands[letter].map((brand) => (
                        <button
                          key={brand}
                          type="button"
                          onClick={() => {
                            setSelectedBrands([brand]);
                            handleApplyFilters();
                            setShowProducts(true);
                          }}
                          className="text-left px-4 py-3 border border-trichomes-forest/10 bg-white hover:bg-trichomes-sage hover:border-trichomes-primary transition-all duration-150 ease-out font-body text-[14px] sm:text-[15px] text-trichomes-forest/80 hover:text-trichomes-forest shadow-sm hover:shadow-md"
                        >
                          {brand}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

              {Object.keys(groupedBrands).length === 0 && (
                <div className="text-center py-12">
                  <p className="text-trichomes-forest/60 font-body text-[15px] sm:text-[16px]">
                    No brands available at the moment.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Filtered Products View */
          <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
            <ProductFilter
              searchTerm={searchTerm}
              onSearchTermChange={setSearchTerm}
              price={price}
              onPriceChange={setPrice}
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
                <div className="flex items-center gap-4">
                  {/* Results count */}
                  {!productsQuery.isLoading && !productsQuery.error && (
                    <p className="text-[13px] text-trichomes-forest/60 font-body">
                      {filteredAndSortedProducts.length} of{" "}
                      {productsQuery.data?.pagination.total || 0} products
                    </p>
                  )}

                  {/* Back to brands link */}
                  <button
                    type="button"
                    onClick={() => setShowProducts(false)}
                    className="text-[13px] text-trichomes-primary hover:text-trichomes-forest underline font-body transition-colors duration-150 ease-out"
                  >
                    ← Back to brands
                  </button>

                  {/* Clear filters */}
                  {activeFilters && (
                    <button
                      type="button"
                      onClick={handleClearFilters}
                      className="text-[13px] text-trichomes-primary hover:text-trichomes-forest underline font-body transition-colors duration-150 ease-out"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>

                {/* Sort dropdown */}
                <div className="flex items-center gap-2.5">
                  <label
                    htmlFor="sort"
                    className="text-[13px] text-trichomes-forest whitespace-nowrap font-body"
                  >
                    Sort by:
                  </label>
                  <select
                    id="sort"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border border-trichomes-forest/20 text-[14px] focus:ring-1 focus:ring-trichomes-primary/20 focus:border-trichomes-primary outline-none bg-trichomes-soft text-trichomes-forest font-body transition-all duration-150 min-w-[180px]"
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                  {["p1", "p2", "p3", "p4", "p5", "p6"].map((key) => (
                    <div
                      key={key}
                      className="bg-white border border-trichomes-forest/10 p-4 animate-pulse shadow-sm"
                    >
                      <div className="w-full h-64 bg-trichomes-sage mb-4"></div>
                      <div className="h-4 bg-trichomes-sage mb-2"></div>
                      <div className="h-4 bg-trichomes-sage w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : productsQuery.error ? (
                <div className="text-center py-12 sm:py-20 bg-white border border-trichomes-forest/10 shadow-sm">
                  <p className="text-[18px] sm:text-[20px] text-red-600 font-body mb-4">
                    Error loading products
                  </p>
                  <button
                    type="button"
                    onClick={() => productsQuery.refetch()}
                    className="px-6 py-3 bg-trichomes-primary text-trichomes-soft hover:bg-trichomes-primary/90 font-semibold transition-all duration-150 ease-out hover:shadow-lg text-[14px] sm:text-[15px] font-body"
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <>
                  <ProductGrid
                    products={
                      filteredAndSortedProducts as ProductWithRelations[]
                    }
                    onProductClick={handleProductClick}
                    onAddToCart={handleAddToCart}
                    wishlist={wishlistProductIds}
                    onToggleWishlist={handleToggleWishlist}
                  />

                  {filteredAndSortedProducts.length === 0 && (
                    <div className="text-center py-12 sm:py-20 bg-white border border-trichomes-forest/10 shadow-sm">
                      <p className="text-[18px] sm:text-[20px] text-trichomes-forest/70 font-body mb-4">
                        No products found for this brand.
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowProducts(false)}
                        className="px-6 py-3 bg-trichomes-primary text-trichomes-soft hover:bg-trichomes-primary/90 font-semibold transition-all duration-150 ease-out hover:shadow-lg text-[14px] sm:text-[15px] font-body"
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
                        className="px-6 sm:px-8 py-3 border-2 border-trichomes-primary text-trichomes-primary hover:bg-trichomes-primary hover:text-trichomes-soft font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 ease-out text-[14px] sm:text-[15px] font-body shadow-sm hover:shadow-md"
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
    <Suspense fallback={<div className="min-h-screen bg-trichomes-soft flex items-center justify-center">
      <div className="text-center">
        <p className="text-trichomes-forest font-body">Loading...</p>
      </div>
    </div>}>
      <BrandsPageContent />
    </Suspense>
  );
}
