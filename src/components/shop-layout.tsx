"use client";

import { useMemo, useState } from "react";
import type {
  FilterState,
  ProductCardData,
  ProductCategory,
} from "@/types/product";
import FilterSidebar from "./filter-sidebar";
import ProductGrid from "./product-grid";

interface ShopLayoutProps {
  products: ProductCardData[];
  categories: ProductCategory[];
  isLoading?: boolean;
}

export default function ShopLayout({
  products,
  categories,
  isLoading,
}: ShopLayoutProps) {
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    priceRange: { min: 0, max: 1000 },
    sortBy: "name",
  });

  const [searchQuery, setSearchQuery] = useState("");

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          product.category.name
            .toLowerCase()
            .includes(searchQuery.toLowerCase()),
      );
    }

    // Filter by categories
    if (filters.categories.length > 0) {
      filtered = filtered.filter((product) =>
        filters.categories.includes(product.category_id),
      );
    }

    // Filter by price range
    filtered = filtered.filter((product) => {
      const price = Number(product.price);
      return price >= filters.priceRange.min && price <= filters.priceRange.max;
    });

    // Sort products
    switch (filters.sortBy) {
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "price-low":
        filtered.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case "price-high":
        filtered.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case "newest":
        filtered.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
        break;
    }

    return filtered;
  }, [products, filters, searchQuery]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Shop</h1>
              <div className="hidden md:block text-sm text-gray-600">
                {filteredAndSortedProducts.length} products
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-lg mx-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <title>Search</title>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Results count for mobile */}
            <div className="md:hidden text-sm text-gray-600">
              {filteredAndSortedProducts.length}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <FilterSidebar
                categories={categories}
                filters={filters}
                onFiltersChange={setFilters}
              />
            </div>
          </div>

          {/* Mobile Filter */}
          <div className="lg:hidden w-full">
            <FilterSidebar
              categories={categories}
              filters={filters}
              onFiltersChange={setFilters}
            />
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            <ProductGrid
              products={filteredAndSortedProducts}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
