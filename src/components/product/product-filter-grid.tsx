'use client';

import React, { useState, useMemo } from 'react';
import { FilterSidebar } from '@/components/filters/filter-sidebar';
import { ProductGrid, type ProductWithRelations } from './product-grid';
import { ChevronLeftIcon, ChevronRightIcon } from '../ui/icons';

interface Category {
  name: string;
  subcategories?: string[];
}

interface FilterOptions {
  brands: string[];
  concerns: string[];
  ingredients: string[];
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface ProductFilterGridProps {
  // Products data
  products: ProductWithRelations[];
  pagination?: PaginationInfo;
  isLoading?: boolean;
  error?: unknown;
  
  // Filter state
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  price: number;
  onPriceChange: (price: number) => void;
  minPrice?: number;
  onMinPriceChange?: (price: number) => void;
  selectedBrands?: string[];
  selectedConcerns?: string[];
  selectedIngredients?: string[];
  onToggleFilter?: (category: 'brands' | 'concerns' | 'ingredients', value: string) => void;
  onApplyFilters: () => void;
  categories: Category[];
  filterOptions: FilterOptions;
  
  // Product actions
  onProductClick: (product: ProductWithRelations) => void;
  onAddToCart: (product: ProductWithRelations, quantity: number) => void;
  wishlist: string[];
  onToggleWishlist: (product: ProductWithRelations) => void;
  
  // Pagination
  currentPage: number;
  onPageChange: (page: number) => void;
  
  // Optional
  emptyMessage?: string;
  emptyDescription?: string;
  onRetry?: () => void;
}

export const ProductFilterGrid: React.FC<ProductFilterGridProps> = ({
  products,
  pagination,
  isLoading = false,
  error = null,
  searchTerm,
  onSearchTermChange,
  price,
  onPriceChange,
  minPrice = 0,
  onMinPriceChange,
  selectedBrands = [],
  selectedConcerns = [],
  selectedIngredients = [],
  onToggleFilter = () => {},
  onApplyFilters,
  categories,
  filterOptions,
  onProductClick,
  onAddToCart,
  wishlist,
  onToggleWishlist,
  currentPage,
  onPageChange,
  emptyMessage = 'No products match your criteria.',
  emptyDescription = 'Try adjusting your filters or search terms.',
  onRetry
}) => {
  const startItem = pagination ? ((currentPage - 1) * pagination.limit) + 1 : 0;
  const endItem = pagination ? Math.min(currentPage * pagination.limit, pagination.total) : 0;

  return (
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
      {/* Filter Sidebar */}
      <FilterSidebar
        searchTerm={searchTerm}
        onSearchTermChange={onSearchTermChange}
        price={price}
        onPriceChange={onPriceChange}
        minPrice={minPrice}
        onMinPriceChange={onMinPriceChange}
        selectedBrands={selectedBrands}
        selectedConcerns={selectedConcerns}
        selectedIngredients={selectedIngredients}
        onToggleFilter={onToggleFilter}
        onApplyFilters={onApplyFilters}
        categories={categories}
        filterOptions={filterOptions}
      />

      {/* Main Content Area */}
      <div className="flex-1 min-w-0">
        {/* Loading State */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white border border-[#1E3024]/10 p-4 animate-pulse shadow-sm">
                <div className="w-full aspect-square bg-[#E6E4C6] mb-3"></div>
                <div className="h-3 bg-[#E6E4C6] rounded mb-2"></div>
                <div className="h-3 bg-[#E6E4C6] rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          /* Error State */
          <div className="text-center py-12 sm:py-16 bg-white rounded-[12px] border border-[#1E3024]/10 shadow-sm">
            <p className="text-[16px] text-red-600 font-body mb-2">Error loading products</p>
            <p className="text-[14px] text-[#1E3024]/60 font-body mb-4">Please try again later.</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="px-6 py-2.5 bg-[#3A643B] text-white rounded-full hover:bg-[#3A643B]/90 font-body font-medium transition-all duration-150 ease-out hover:shadow-md text-[14px]"
              >
                Retry
              </button>
            )}
          </div>
        ) : products.length === 0 ? (
          /* Empty State */
          <div className="text-center py-12 sm:py-16 bg-white rounded-[12px] border border-[#1E3024]/10 shadow-sm">
            <p className="text-[16px] text-[#1E3024]/70 font-body mb-2">{emptyMessage}</p>
            <p className="text-[14px] text-[#1E3024]/60 font-body">{emptyDescription}</p>
          </div>
        ) : (
          <>
            {/* Products Grid */}
            <ProductGrid
              products={products}
              onProductClick={onProductClick}
              onAddToCart={onAddToCart}
              wishlist={wishlist}
              onToggleWishlist={onToggleWishlist}
            />

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#1E3024]/10">
                <p className="text-[13px] text-[#1E3024]/60 font-body">
                  Showing {startItem} to {endItem} of {pagination.total} products
                </p>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 border border-[#1E3024]/20 rounded-lg hover:bg-[#E6E4C6]/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 ease-out text-[#1E3024] disabled:hover:bg-transparent"
                    aria-label="Previous page"
                  >
                    <ChevronLeftIcon className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                      let pageNum: number;
                      if (pagination.pages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= pagination.pages - 2) {
                        pageNum = pagination.pages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => onPageChange(pageNum)}
                          className={`px-3 py-1.5 min-w-[2.25rem] rounded-lg text-[13px] font-body transition-all duration-150 ease-out ${
                            currentPage === pageNum
                              ? 'bg-[#3A643B] text-white'
                              : 'border border-[#1E3024]/20 text-[#1E3024] hover:bg-[#E6E4C6]/50'
                          }`}
                          aria-label={`Go to page ${pageNum}`}
                          aria-current={currentPage === pageNum ? 'page' : undefined}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === pagination.pages}
                    className="px-3 py-2 border border-[#1E3024]/20 rounded-lg hover:bg-[#E6E4C6]/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 ease-out text-[#1E3024] disabled:hover:bg-transparent"
                    aria-label="Next page"
                  >
                    <ChevronRightIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

