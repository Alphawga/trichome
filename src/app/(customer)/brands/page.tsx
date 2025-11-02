'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ProductGrid } from '@/components/product/product-grid';
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

  const transformedProducts = useMemo(() => {
    if (!productsQuery.data?.products) return [];

    return productsQuery.data.products.map(product => ({
      ...product,
      currency: '₦',
      imageUrl: product.images?.[0]?.url || `/placeholder-product.png`,
      brand: product.brand || 'Generic Brand',
      concerns: ['General Care'],
      ingredients: ['Natural Ingredients'],
      inStock: product.status === 'ACTIVE' && (!product.track_quantity || product.quantity > 0)
    }));
  }, [productsQuery.data]);

  const filteredAndSortedProducts = useMemo(() => {
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
    if (!wishlistQuery.data?.items) return new Set<string>();
    return new Set(wishlistQuery.data.items.map(item => item.product_id));
  }, [wishlistQuery.data]);

  const handleProductClick = (product: any) => {
    router.push(`/products/${product.slug}`);
  };

  const handleAddToCart = (product: any, quantity: number) => {
    addToCartMutation.mutate({ product_id: product.id, quantity });
  };

  const handleToggleWishlist = (product: any) => {
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
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-gray-700">Home</Link>
        <ChevronRightIcon className="w-4 h-4" />
        <span className="text-gray-900 font-medium">Brands</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-8">
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Shop by Brand</h1>
              {productsQuery.isLoading ? (
                <p className="text-gray-600">Loading products...</p>
              ) : productsQuery.error ? (
                <p className="text-red-600">Error loading products</p>
              ) : (
                <p className="text-gray-600">
                  Showing {filteredAndSortedProducts.length} of {productsQuery.data?.pagination.total || 0} products
                </p>
              )}
            </div>

            <div className="flex items-center gap-4 mt-4 sm:mt-0">
              {activeFilters && (
                <button
                  onClick={handleClearFilters}
                  className="text-sm text-gray-500 hover:text-gray-700 underline"
                >
                  Clear all filters
                </button>
              )}

              <div className="flex items-center gap-2">
                <label htmlFor="sort" className="text-sm text-gray-700 whitespace-nowrap">
                  Sort by:
                </label>
                <select
                  id="sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg border p-4 animate-pulse">
                  <div className="w-full h-48 bg-gray-200 rounded-md mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : productsQuery.error ? (
            <div className="text-center py-20 bg-white rounded-lg border">
              <p className="text-xl text-red-600">Error loading products</p>
              <button
                onClick={() => productsQuery.refetch()}
                className="mt-4 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              <ProductGrid
                products={filteredAndSortedProducts}
                onProductClick={handleProductClick}
                onAddToCart={handleAddToCart}
                wishlist={filteredAndSortedProducts.filter(p => wishlistProductIds.has(p.id))}
                onToggleWishlist={handleToggleWishlist}
              />

              {filteredAndSortedProducts.length === 0 && (
                <div className="text-center py-20 bg-white rounded-lg border">
                  <p className="text-xl text-gray-600">No products found.</p>
                  {activeFilters && (
                    <button
                      onClick={handleClearFilters}
                      className="mt-4 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              )}

              {canLoadMore && (
                <div className="text-center mt-12">
                  <button
                    onClick={loadMoreProducts}
                    disabled={productsQuery.isFetching}
                    className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 font-medium disabled:opacity-50"
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
  );
}
