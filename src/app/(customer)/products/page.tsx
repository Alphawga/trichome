'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ProductFilterGrid } from '@/components/product/product-filter-grid';
import { ChevronRightIcon } from '@/components/ui/icons';
import { CustomSelect } from '@/components/ui/custom-select';
import { trpc } from '@/utils/trpc';
import { ProductStatus, type Product, type Category, type ProductImage } from '@prisma/client';
import { useAuth } from '@/app/contexts/auth-context';
import { toast } from 'sonner';

type ProductWithRelations = Product & {
  category: Pick<Category, 'id' | 'name' | 'slug'>;
  images: ProductImage[];
};

const sortOptions = [
  { label: 'Featured', value: 'featured' },
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Popular', value: 'popular' },
] as const;

interface FilterState {
  min_price?: number;
  max_price?: number;
  category_slug?: string;
}

function ProductsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  const [wishlist, setWishlist] = useState<string[]>([]); // Store product IDs only
  const [searchTerm, setSearchTerm] = useState('');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(100000);
  const [sortBy, setSortBy] = useState('featured');
  const [currentPage, setCurrentPage] = useState(1);

  // Active filters stores the state of filters when 'Apply' is clicked
  const [activeFilters, setActiveFilters] = useState<FilterState | null>(
    categoryParam ? {
      category_slug: categoryParam
    } : null
  );

  const productsQuery = trpc.getProducts.useQuery({
    page: currentPage,
    limit: 12,
    search: searchTerm.trim() || undefined,
    min_price: activeFilters?.min_price,
    max_price: activeFilters?.max_price,
    category_slug: activeFilters?.category_slug || categoryParam || undefined,
    status: ProductStatus.ACTIVE,
    sort_by: sortBy as 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'popular' | 'featured',
  }, {
    staleTime: 30000,
    refetchOnWindowFocus: false
  });

  const categoriesQuery = trpc.getCategoryTree.useQuery(undefined, {
    staleTime: 60000,
    refetchOnWindowFocus: false
  });

  // Format slug to readable title (fallback)
  const formatCategorySlug = (slug: string): string => {
    if (!slug) return '';
    return slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Helper function to find category name from category tree by slug
  const getCategoryNameFromTree = useMemo(() => {
    if (!categoriesQuery.data) return () => null;
    
    return (slug: string): string | null => {
      if (!slug) return null;
      
      // Flatten all categories (parents, children, grandchildren)
      const allCategories = categoriesQuery.data.flatMap(cat => [
        cat,
        ...(cat.children || []),
        ...(cat.children?.flatMap(child => child.children || []) || [])
      ]);
      
      const found = allCategories.find(c => c.slug === slug);
      return found?.name || null;
    };
  }, [categoriesQuery.data]);

  // Get display name for category
  const categoryDisplayName = useMemo(() => {
    if (!categoryParam) return 'Products';
    
    // First try to find in category tree
    const treeName = getCategoryNameFromTree(categoryParam);
    if (treeName) return treeName;
    
    // Fallback to formatted slug (e.g., "face-care" -> "Face Care")
    return formatCategorySlug(categoryParam);
  }, [categoryParam, getCategoryNameFromTree]);

  const transformedCategories = useMemo(() => {
    if (!categoriesQuery.data) return [];

    return categoriesQuery.data.map(cat => ({
      name: cat.name,
      subcategories: cat.children.map(child => child.name)
    }));
  }, [categoriesQuery.data]);


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

  
  const products = productsQuery.data?.products || [];

  
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeFilters, sortBy]);

  const loadMoreProducts = () => {
    setCurrentPage(prev => prev + 1);
  };

  const canLoadMore = productsQuery.data ?
    currentPage < productsQuery.data.pagination.pages : false;

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

  const handleApplyFilters = () => {
    const filters: FilterState = {};
    
    // Add category filter if exists
    if (categoryParam) {
      filters.category_slug = categoryParam;
    }
    
    // Only add price filters if they're set to non-default values
    if (minPrice && minPrice > 0) {
      filters.min_price = minPrice;
    }
    if (maxPrice && maxPrice < 100000) {
      filters.max_price = maxPrice;
    }
    
    // Only set filters if there's something to filter
    if (filters.min_price !== undefined || filters.max_price !== undefined || filters.category_slug) {
      setActiveFilters(filters);
    } else {
      setActiveFilters(null);
    }
    setCurrentPage(1); // Reset to first page when applying filters
  };


  const handleClearFilters = () => {
    setActiveFilters(null);
    setMinPrice(0);
    setMaxPrice(100000);
    if (categoryParam) {
      router.push('/products');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF7]">
      {/* Hero Header Section */}
      <div className="bg-[#E9DDAA] w-full">
        <div className="container mx-4 px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 lg:pt-20 pb-12 sm:pb-16 lg:pb-20 ">
          <div className="flex flex-col items-start">
            {/* Main Title */}
            <h1 className="text-[40px] sm:text-[48px] lg:text-[56px] font-heading text-[#1E3024] leading-tight mb-4">
              {categoryDisplayName}
            </h1>

            {/* Breadcrumbs */}
            <nav className="flex items-center space-x-2">
              <Link 
                href="/" 
                className="text-[14px] text-[#1E3024]/70 hover:text-[#1E3024] transition-colors duration-150 ease-out font-body"
              >
                Home
              </Link>
              <ChevronRightIcon className="w-4 h-4 text-[#1E3024]/50" />
              <Link 
                href="/shop" 
                className="text-[14px] text-[#1E3024]/70 hover:text-[#1E3024] transition-colors duration-150 ease-out font-body"
              >
                Shop
              </Link>
              {categoryParam && (
                <>
                  <ChevronRightIcon className="w-4 h-4 text-[#1E3024]/50" />
                  <span className="text-[14px] text-[#1E3024] font-body">
                    {categoryDisplayName}
                  </span>
                </>
              )}
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-16 sm:pb-20 lg:pb-24 max-w-[1500px]">
        {/* Controls Bar - Sort and Clear Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            {/* Results count */}
            {!productsQuery.isLoading && !productsQuery.error && (
              <p className="text-[13px] text-[#1E3024]/60 font-body">
                {productsQuery.data?.pagination.total || 0} products
              </p>
            )}

            {/* Clear filters */}
            {activeFilters && (
              <button
                onClick={handleClearFilters}
                className="text-[13px] text-[#3A643B] hover:text-[#1E3024] underline font-body transition-colors duration-150 ease-out"
              >
                Clear all filters
              </button>
            )}
          </div>

          {/* Sort dropdown */}
          <div className="flex items-center gap-2.5">
            <label htmlFor="sort" className="text-[13px] text-[#1E3024] whitespace-nowrap font-body">
              Sort by:
            </label>
            <CustomSelect
              id="sort"
              options={sortOptions}
              value={sortBy}
              onChange={(value) => setSortBy(value)}
              className="min-w-[180px]"
            />
          </div>
        </div>

        {/* Active filters display */}
        {activeFilters && (
          <div className="flex flex-wrap gap-2 mb-6">
            {activeFilters.category_slug && (
              <span className="inline-flex items-center px-3 py-1 text-[12px] bg-[#E6E4C6] text-[#1E3024] font-body border border-[#1E3024]/10">
                Category: {getCategoryNameFromTree(activeFilters.category_slug) || formatCategorySlug(activeFilters.category_slug)}
                <button
                  onClick={() => {
                    const newFilters = { ...activeFilters };
                    delete newFilters.category_slug;
                    setActiveFilters(Object.keys(newFilters).length > 0 && (newFilters.min_price !== undefined || newFilters.max_price !== undefined) ? newFilters : null);
                    router.push('/products');
                  }}
                  className="ml-1.5 text-[#3A643B] hover:text-[#1E3024] transition-colors duration-150 ease-out text-base leading-none"
                  aria-label="Remove category filter"
                >
                  ×
                </button>
              </span>
            )}
            {activeFilters.min_price !== undefined && activeFilters.min_price > 0 && (
              <span className="inline-flex items-center px-3 py-1 text-[12px] bg-[#E6E4C6] text-[#1E3024] font-body border border-[#1E3024]/10">
                Min: ₦{activeFilters.min_price.toLocaleString()}
                <button
                  onClick={() => {
                    const newFilters = { ...activeFilters };
                    delete newFilters.min_price;
                    const hasOtherFilters = newFilters.max_price !== undefined || newFilters.category_slug !== undefined;
                    setActiveFilters(hasOtherFilters ? newFilters : null);
                    setMinPrice(0);
                    // Re-apply filters to update the query
                    if (hasOtherFilters) {
                      handleApplyFilters();
                    }
                  }}
                  className="ml-1.5 text-[#3A643B] hover:text-[#1E3024] transition-colors duration-150 ease-out text-base leading-none"
                  aria-label="Remove min price filter"
                >
                  ×
                </button>
              </span>
            )}
            {activeFilters.max_price !== undefined && activeFilters.max_price < 100000 && (
              <span className="inline-flex items-center px-3 py-1 text-[12px] bg-[#E6E4C6] text-[#1E3024] font-body border border-[#1E3024]/10">
                Max: ₦{activeFilters.max_price.toLocaleString()}
                <button
                  onClick={() => {
                    const newFilters = { ...activeFilters };
                    delete newFilters.max_price;
                    const hasOtherFilters = newFilters.min_price !== undefined || newFilters.category_slug !== undefined;
                    setActiveFilters(hasOtherFilters ? newFilters : null);
                    setMaxPrice(100000);
                    // Re-apply filters to update the query
                    if (hasOtherFilters) {
                      handleApplyFilters();
                    }
                  }}
                  className="ml-1.5 text-[#3A643B] hover:text-[#1E3024] transition-colors duration-150 ease-out text-base leading-none"
                  aria-label="Remove max price filter"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        )}

        {/* Product Filter Grid Component */}
        <ProductFilterGrid
          products={products}
          pagination={productsQuery.data?.pagination}
          isLoading={productsQuery.isLoading}
          error={productsQuery.error as unknown}
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          price={maxPrice}
          onPriceChange={setMaxPrice}
          minPrice={minPrice}
          onMinPriceChange={setMinPrice}
          selectedBrands={[]}
          selectedConcerns={[]}
          selectedIngredients={[]}
          onToggleFilter={() => {}}
          onApplyFilters={handleApplyFilters}
          categories={transformedCategories}
          filterOptions={{
            brands: [],
            concerns: [],
            ingredients: []
          }}
          onProductClick={handleProductClick}
          onAddToCart={handleAddToCart}
          wishlist={wishlist}
          onToggleWishlist={handleToggleWishlist}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onRetry={() => productsQuery.refetch()}
        />
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3A643B] mx-auto mb-4"></div>
            <p className="text-[#1E3024]">Loading...</p>
          </div>
        </div>
      }
    >
      <ProductsPageContent />
    </Suspense>
  );
}