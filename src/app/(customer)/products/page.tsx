'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ProductGrid } from '@/components/product/product-grid';
import { FilterSidebar } from '@/components/filters/filter-sidebar';
import { ChevronRightIcon } from '@/components/ui/icons';
import { trpc } from '@/utils/trpc';
import { ProductStatus, type Product, type Category, type ProductImage } from '@prisma/client';

type ProductWithRelations = Product & {
  category: Pick<Category, 'id' | 'name' | 'slug'>;
  images: ProductImage[];
};

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
  category?: string;
}

interface ProductForDisplay extends ProductWithRelations {
  currency: string;
  imageUrl: string;
  brand?: string;
  concerns?: string[];
  ingredients?: string[];
  inStock: boolean;
}

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');

  const [cart, setCart] = useState<ProductForDisplay[]>([]);
  const [wishlist, setWishlist] = useState<ProductForDisplay[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [price, setPrice] = useState(50000);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('featured');
  const [currentPage, setCurrentPage] = useState(1);

  // Active filters stores the state of filters when 'Apply' is clicked
  const [activeFilters, setActiveFilters] = useState<FilterState | null>(
    categoryParam ? {
      price: 50000,
      brands: [],
      concerns: [],
      ingredients: [],
      category: categoryParam
    } : null
  );

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

  const categoriesQuery = trpc.getCategoryTree.useQuery(undefined, {
    staleTime: 60000,
    refetchOnWindowFocus: false
  });

  const transformedCategories = useMemo(() => {
    if (!categoriesQuery.data) return [];

    return categoriesQuery.data.map(cat => ({
      name: cat.name,
      subcategories: cat.children.map(child => child.name)
    }));
  }, [categoriesQuery.data]);

  const transformedProducts = useMemo((): ProductForDisplay[] => {
    if (!productsQuery.data?.products) return [];

    return productsQuery.data.products.map(product => ({
      ...product,
      currency: '₦',
      imageUrl: product.images?.[0]?.url || `https://placehold.co/400x400/38761d/white?text=${product.name.charAt(0)}`,
      brand: 'Generic Brand',
      concerns: ['General Care'],
      ingredients: ['Natural Ingredients'],
      inStock: product.quantity > 0
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
      if (activeFilters.category) {
        products = products.filter(p => p.category.name === activeFilters.category);
      }
    }

    // Sort products
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
        // Featured - use backend order or sort by is_featured
        products.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
        break;
    }

    return products;
  }, [transformedProducts, activeFilters, sortBy]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeFilters]);

  const loadMoreProducts = () => {
    setCurrentPage(prev => prev + 1);
  };

  const canLoadMore = productsQuery.data ?
    currentPage < productsQuery.data.pagination.pages : false;

  const handleProductClick = (product: ProductForDisplay) => {
    router.push(`/products/${product.slug}`);
  };

  const handleAddToCart = (product: ProductForDisplay, quantity: number) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id ? { ...item, quantity: (item.quantity || 0) + quantity } : item
      ));
    } else {
      setCart([...cart, { ...product, quantity }]);
    }
    console.log(`Added ${quantity} ${product.name} to cart`);
  };

  const handleToggleWishlist = (product: ProductForDisplay) => {
    const isInWishlist = wishlist.find(item => item.id === product.id);
    if (isInWishlist) {
      setWishlist(wishlist.filter(item => item.id !== product.id));
    } else {
      setWishlist([...wishlist, product]);
    }
  };

  const handleApplyFilters = () => {
    setActiveFilters({
      price,
      brands: selectedBrands,
      concerns: selectedConcerns,
      ingredients: selectedIngredients,
      category: categoryParam || undefined
    });
    setCurrentPage(1); // Reset to first page when applying filters
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
    setPrice(50000);
    router.push('/products');
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-gray-700">
          Home
        </Link>
        <ChevronRightIcon className="w-4 h-4" />
        <span className="text-gray-900 font-medium">
          {categoryParam ? `${categoryParam} Products` : 'All Products'}
        </span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-8">
        <FilterSidebar
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          price={price}
          onPriceChange={setPrice}
          selectedBrands={selectedBrands}
          selectedConcerns={selectedConcerns}
          selectedIngredients={selectedIngredients}
          onToggleFilter={handleToggleFilter}
          onApplyFilters={handleApplyFilters}
          categories={transformedCategories}
          filterOptions={{
            brands: [],
            concerns: [],
            ingredients: []
          }}
        />

        <div className="w-full">
          {/* Header with results count and sorting */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {categoryParam ? `${categoryParam} Products` : 'All Products'}
              </h1>
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
              {/* Clear filters */}
              {activeFilters && (
                <button
                  onClick={handleClearFilters}
                  className="text-sm text-gray-500 hover:text-gray-700 underline"
                >
                  Clear all filters
                </button>
              )}

              {/* Sort dropdown */}
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

          {/* Active filters display */}
          {activeFilters && (
            <div className="flex flex-wrap gap-2 mb-6">
              {activeFilters.category && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Category: {activeFilters.category}
                  <button
                    onClick={() => {
                      setActiveFilters(prev => prev ? { ...prev, category: undefined } : null);
                      router.push('/products');
                    }}
                    className="ml-2 text-green-600 hover:text-green-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {activeFilters.brands.map(brand => (
                <span key={brand} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {brand}
                  <button
                    onClick={() => {
                      setSelectedBrands(prev => prev.filter(b => b !== brand));
                      setActiveFilters(prev => prev ? { ...prev, brands: prev.brands.filter(b => b !== brand) } : null);
                    }}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

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
              <p className="text-gray-500 mt-2">Please try again later.</p>
              <button
                onClick={() => productsQuery.refetch()}
                className="mt-4 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
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
                wishlist={wishlist}
                onToggleWishlist={handleToggleWishlist}
              />

              {filteredAndSortedProducts.length === 0 && (
                <div className="text-center py-20 bg-white rounded-lg border">
                  <p className="text-xl text-gray-600">No products match your criteria.</p>
                  <p className="text-gray-500 mt-2">Try adjusting your filters or search terms.</p>
                  {activeFilters && (
                    <button
                      onClick={handleClearFilters}
                      className="mt-4 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
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
                    className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors font-medium disabled:opacity-50"
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