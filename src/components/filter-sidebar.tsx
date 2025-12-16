"use client";

import { useState } from "react";
import type { FilterState, ProductCategory } from "@/types/product";

interface FilterSidebarProps {
  categories: ProductCategory[];
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

export default function FilterSidebar({
  categories,
  filters,
  onFiltersChange,
}: FilterSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleCategoryToggle = (categoryId: string) => {
    const newCategories = filters.categories.includes(categoryId)
      ? filters.categories.filter((id) => id !== categoryId)
      : [...filters.categories, categoryId];

    onFiltersChange({
      ...filters,
      categories: newCategories,
    });
  };

  const handleSortChange = (sortBy: FilterState["sortBy"]) => {
    onFiltersChange({
      ...filters,
      sortBy,
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      categories: [],
      priceRange: { min: 0, max: 1000 },
      sortBy: "name",
    });
  };

  return (
    <>
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden mb-4">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <title>Filters</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z"
            />
          </svg>
          <span className="text-sm font-medium">Filters</span>
        </button>
      </div>

      {/* Filter Sidebar */}
      <div
        className={`bg-white border-r border-gray-200 lg:block ${isOpen ? "block" : "hidden"} lg:w-64 w-full`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear all
            </button>
          </div>

          {/* Categories */}
          <div className="mb-8">
            <h3 className="text-sm font-medium text-gray-900 mb-4">
              Categories
            </h3>
            <div className="space-y-3">
              {categories.map((category) => (
                <label key={category.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.categories.includes(category.id)}
                    onChange={() => handleCategoryToggle(category.id)}
                    className="w-4 h-4 rounded border-gray-300 text-trichomes-primary shadow-sm focus:border-trichomes-primary focus:ring focus:ring-trichomes-primary/20 focus:ring-opacity-50 accent-trichomes-primary"
                  />
                  <span className="ml-3 text-sm text-gray-600">
                    {category.name} ({category.productCount})
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Sort By */}
          <div className="mb-8">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Sort By</h3>
            <select
              value={filters.sortBy}
              onChange={(e) =>
                handleSortChange(e.target.value as FilterState["sortBy"])
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="name">Name (A-Z)</option>
              <option value="price-low">Price (Low to High)</option>
              <option value="price-high">Price (High to Low)</option>
              <option value="newest">Newest First</option>
            </select>
          </div>

          {/* Price Range */}
          <div className="mb-8">
            <h3 className="text-sm font-medium text-gray-900 mb-4">
              Price Range
            </h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.priceRange.min}
                  onChange={(e) =>
                    onFiltersChange({
                      ...filters,
                      priceRange: {
                        ...filters.priceRange,
                        min: Number(e.target.value),
                      },
                    })
                  }
                  className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.priceRange.max}
                  onChange={(e) =>
                    onFiltersChange({
                      ...filters,
                      priceRange: {
                        ...filters.priceRange,
                        max: Number(e.target.value),
                      },
                    })
                  }
                  className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <button
          type="button"
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
          aria-label="Close filters"
        />
      )}
    </>
  );
}
