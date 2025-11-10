'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ProductGrid } from '@/components/product/product-grid';
import type { ProductWithRelations } from '@/components/product/product-grid';
import { ProductFilter, FilterOptions } from '@/components/product/product-filter';
import { ChevronRightIcon } from '@/components/ui/icons';
import { trpc } from '@/utils/trpc';
import { ProductStatus } from '@prisma/client';
import { toast } from 'sonner';
import { useAuth } from '@/app/contexts/auth-context';

const sortOptions = [
  { label: 'Featured', value: 'featured' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Name: A to Z', value: 'name-asc' },
  { label: 'Name: Z to A', value: 'name-desc' },
];

interface FilterState {
  price: number;
  brands: string[];
  concerns: string[];
  ingredients: string[];
}

// Extended product type with additional filter properties
type ExtendedProduct = ProductWithRelations & {
  brand: string;
  concerns: string[];
  ingredients: string[];
  inStock: boolean;
};

export default function BrandsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  const [searchTerm, setSearchTerm] = useState('');
  const [price, setPrice] = useState(100000);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('featured');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilters, setActiveFilters] = useState<FilterState | null>(null);

  const productsQuery = trpc.getProducts.useQuery({
    page: currentPage,
    limit: 12,
    search: searchTerm.trim() || undefined,
    max_price: activeFilters?.price || undefined,
    status: ProductStatus.ACTIVE,
  }, {
    staleTime: 30000,
    refetchOnWindowFocus: false
  });

  // Mutations for cart and wishlist
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

  const addToWishlistMutation = trpc.addToWishlist.useMutation({
    onSuccess: () => {
      utils.getWishlist.invalidate();
      toast.success('Added to wishlist');
    },
    onError: (error) => {
      if (!isAuthenticated) {
        toast.error('Please sign in to add items to wishlist');
        router.push('/auth/signin');
      } else {
        toast.error(error.message || 'Failed to add to wishlist');
      }
    },
  });

  const removeFromWishlistMutation = trpc.removeFromWishlist.useMutation({
    onSuccess: () => {
      utils.getWishlist.invalidate();
      toast.success('Removed from wishlist');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to remove from wishlist');
    },
  });

  const wishlistQuery = trpc.getWishlist.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchOnWindowFocus: false,
  });

  const transformedProducts = useMemo((): ExtendedProduct[] => {
    if (!productsQuery.data?.products) return [];

    return productsQuery.data.products.map(product => ({
      ...product,
      brand: product.category?.name || 'Uncategorized',
      concerns: ['General Care'],
      ingredients: ['Natural Ingredients'],
      inStock: product.status === 'ACTIVE' && (!product.track_quantity || product.quantity > 0)
    }));
  }, [productsQuery.data]);

  const filteredAndSortedProducts = useMemo((): ExtendedProduct[] => {
    let products = [...transformedProducts];

    if (activeFilters) {
      if (activeFilters.brands.length > 0) {
        products = products.filter(p => p.brand && activeFilters.brands.includes(p.brand));
      }
      if (activeFilters.concerns.length > 0) {
        products = products.filter(p => p.concerns && p.concerns.some(c => activeFilters.concerns.includes(c)));
      }
      if (activeFilters.ingredients.length > 0) {
        products = products.filter(p => p.ingredients && p.ingredients.some(i => activeFilters.ingredients.includes(i)));
      }
    }

    switch (sortBy) {
      case 'price-asc':
        products.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case 'price-desc':
        products.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case 'name-asc':
        products.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        products.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        products.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
        break;
    }

    return products;
  }, [transformedProducts, activeFilters, sortBy]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeFilters]);

  const wishlistProductIds = useMemo(() => {
    if (!wishlistQuery.data?.items) return [];
    return wishlistQuery.data.items.map(item => item.product_id);
  }, [wishlistQuery.data]);

  const handleProductClick = (product: ProductWithRelations) => {
    router.push(`/products/${product.id}`);
  };

  const handleAddToCart = (product: ProductWithRelations, quantity: number) => {
    addToCartMutation.mutate({ product_id: product.id, quantity });
  };

  const handleToggleWishlist = (product: ProductWithRelations) => {
    const wishlistItem = wishlistQuery.data?.items.find(item => item.product_id === product.id);

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
  };

  const handleToggleFilter = (category: 'brands' | 'concerns' | 'ingredients', value: string) => {
    switch (category) {
      case 'brands':
        setSelectedBrands(prev =>
          prev.includes(value) ? prev.filter(b => b !== value) : [...prev, value]
        );
        break;
      case 'concerns':
        setSelectedConcerns(prev =>
          prev.includes(value) ? prev.filter(c => c !== value) : [...prev, value]
        );
        break;
      case 'ingredients':
        setSelectedIngredients(prev =>
          prev.includes(value) ? prev.filter(i => i !== value) : [...prev, value]
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
    setSearchTerm('');
  };

  const loadMoreProducts = () => {
    setCurrentPage(prev => prev + 1);
  };

  const canLoadMore = productsQuery.data ?
    currentPage < productsQuery.data.pagination.pages : false;

  // Extract unique brands from products
  const availableBrands = useMemo(() => {
    const brands = new Set<string>();
    transformedProducts.forEach(p => {
      if (p.brand) brands.add(p.brand);
    });
    return Array.from(brands).sort();
  }, [transformedProducts]);

  const filterOptions: FilterOptions = {
    brands: availableBrands,
    concerns: ['Acne', 'Dry Skin', 'Oily Skin', 'Anti-Aging', 'Sensitive Skin', 'Dark Spots'],
    ingredients: ['Hyaluronic Acid', 'Vitamin C', 'Retinol', 'Niacinamide', 'Salicylic Acid'],
  };

  return (
    <div className="min-h-screen bg-trichomes-soft">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-12 sm:pb-16 max-w-7xl">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-sm text-trichomes-forest/60 mb-6 sm:mb-8 font-body">
          <Link href="/" className="hover:text-trichomes-forest transition-colors duration-150">Home</Link>
          <ChevronRightIcon className="w-4 h-4" />
          <span className="text-trichomes-forest font-medium">Brands</span>
        </nav>

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
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8">
              <div>
                <h1 className="text-[24px] sm:text-[32px] lg:text-[36px] font-heading font-semibold text-trichomes-forest mb-2">Shop by Brand</h1>
                {productsQuery.isLoading ? (
                  <p className="text-trichomes-forest/60 font-body">Loading products...</p>
                ) : productsQuery.error ? (
                  <p className="text-red-600 font-body">Error loading products</p>
                ) : (
                  <p className="text-trichomes-forest/60 font-body text-[14px] sm:text-[15px]">
                    Showing {filteredAndSortedProducts.length} of {productsQuery.data?.pagination.total || 0} products
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mt-4 sm:mt-0">
                {activeFilters && (
                  <button
                    onClick={handleClearFilters}
                    className="text-[14px] sm:text-[15px] text-trichomes-primary hover:text-trichomes-forest underline font-body transition-colors duration-150"
                  >
                    Clear all filters
                  </button>
                )}

                <div className="flex items-center gap-2">
                  <label htmlFor="sort" className="text-[14px] sm:text-[15px] text-trichomes-forest whitespace-nowrap font-body">
                    Sort by:
                  </label>
                  <select
                    id="sort"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border border-trichomes-forest/20 rounded-lg text-[14px] sm:text-[15px] focus:ring-2 focus:ring-trichomes-primary focus:border-trichomes-primary outline-none bg-white text-trichomes-forest font-body"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Products */}
            {productsQuery.isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border border-trichomes-forest/10 p-4 animate-pulse shadow-sm">
                    <div className="w-full h-48 bg-trichomes-sage rounded-lg mb-4"></div>
                    <div className="h-4 bg-trichomes-sage rounded mb-2"></div>
                    <div className="h-4 bg-trichomes-sage rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : productsQuery.error ? (
              <div className="text-center py-12 sm:py-20 bg-white rounded-xl border border-trichomes-forest/10 shadow-sm">
                <p className="text-[18px] sm:text-[20px] text-red-600 font-body mb-4">Error loading products</p>
                <button
                  onClick={() => productsQuery.refetch()}
                  className="px-6 py-3 bg-trichomes-primary text-white rounded-full hover:bg-trichomes-primary/90 font-semibold transition-all duration-150 ease-out hover:shadow-lg text-[14px] sm:text-[15px] font-body"
                >
                  Retry
                </button>
              </div>
            ) : (
              <>
                <ProductGrid
                  products={filteredAndSortedProducts as ProductWithRelations[]}
                  onProductClick={handleProductClick}
                  onAddToCart={handleAddToCart}
                  wishlist={wishlistProductIds}
                  onToggleWishlist={handleToggleWishlist}
                />

                {filteredAndSortedProducts.length === 0 && (
                  <div className="text-center py-12 sm:py-20 bg-white rounded-xl border border-trichomes-forest/10 shadow-sm">
                    <p className="text-[18px] sm:text-[20px] text-trichomes-forest/70 font-body mb-4">No products found.</p>
                    {activeFilters && (
                      <button
                        onClick={handleClearFilters}
                        className="px-6 py-3 bg-trichomes-primary text-white rounded-full hover:bg-trichomes-primary/90 font-semibold transition-all duration-150 ease-out hover:shadow-lg text-[14px] sm:text-[15px] font-body"
                      >
                        Clear all filters
                      </button>
                    )}
                  </div>
                )}

                {canLoadMore && (
                  <div className="text-center mt-8 sm:mt-12">
                    <button
                      onClick={loadMoreProducts}
                      disabled={productsQuery.isFetching}
                      className="px-6 sm:px-8 py-3 border-2 border-trichomes-primary text-trichomes-primary rounded-full hover:bg-trichomes-primary hover:text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 ease-out text-[14px] sm:text-[15px] font-body"
                    >
                      {productsQuery.isFetching ? 'Loading...' : 'Load more products'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
