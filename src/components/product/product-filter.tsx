'use client';

import React from 'react';
import { SearchIcon } from '@/components/ui/icons';

export interface FilterOptions {
  brands?: string[];
  concerns?: string[];
  ingredients?: string[];
  categories?: Array<{
    name: string;
    subcategories?: string[];
  }>;
}

export interface ProductFilterProps {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  price: number;
  onPriceChange: (value: number) => void;
  selectedBrands: string[];
  selectedConcerns: string[];
  selectedIngredients: string[];
  selectedCategory?: string;
  onToggleFilter: (category: 'brands' | 'concerns' | 'ingredients', value: string) => void;
  onApplyFilters: () => void;
  onClearFilters?: () => void;
  filterOptions: FilterOptions;
  showSearch?: boolean;
  showPrice?: boolean;
  showCategories?: boolean;
  showBrands?: boolean;
  showConcerns?: boolean;
  showIngredients?: boolean;
}

export const ProductFilter: React.FC<ProductFilterProps> = ({
  searchTerm,
  onSearchTermChange,
  price,
  onPriceChange,
  selectedBrands,
  selectedConcerns,
  selectedIngredients,
  selectedCategory,
  onToggleFilter,
  onApplyFilters,
  onClearFilters,
  filterOptions,
  showSearch = true,
  showPrice = true,
  showCategories = false,
  showBrands = true,
  showConcerns = true,
  showIngredients = true,
}) => {
  return (
    <div className="w-full lg:w-64 flex-shrink-0">
      <div className="bg-white rounded-lg border p-6 sticky top-24">
        <h2 className="text-lg font-bold mb-6">Filters</h2>

        {/* Search */}
        {showSearch && (
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2">Search Products</label>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchTermChange(e.target.value)}
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              />
            </div>
          </div>
        )}

        {/* Price Range */}
        {showPrice && (
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2">
              Price Range: ₦0 - ₦{price.toLocaleString()}
            </label>
            <input
              type="range"
              min="0"
              max="100000"
              step="5000"
              value={price}
              onChange={(e) => onPriceChange(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>₦0</span>
              <span>₦100,000</span>
            </div>
          </div>
        )}

        {/* Categories */}
        {showCategories && filterOptions.categories && filterOptions.categories.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-3">Categories</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {filterOptions.categories.map((category) => (
                <div key={category.name}>
                  <button
                    onClick={() => onToggleFilter('brands', category.name)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      selectedCategory === category.name
                        ? 'bg-green-50 text-green-700 font-medium'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {category.name}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Brands */}
        {showBrands && filterOptions.brands && filterOptions.brands.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-3">Brands</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {filterOptions.brands.map((brand) => (
                <label key={brand} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(brand)}
                    onChange={() => onToggleFilter('brands', brand)}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm">{brand}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Skin Concerns */}
        {showConcerns && filterOptions.concerns && filterOptions.concerns.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-3">Skin Concerns</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {filterOptions.concerns.map((concern) => (
                <label key={concern} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedConcerns.includes(concern)}
                    onChange={() => onToggleFilter('concerns', concern)}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm">{concern}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Key Ingredients */}
        {showIngredients && filterOptions.ingredients && filterOptions.ingredients.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-3">Key Ingredients</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {filterOptions.ingredients.map((ingredient) => (
                <label key={ingredient} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedIngredients.includes(ingredient)}
                    onChange={() => onToggleFilter('ingredients', ingredient)}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm">{ingredient}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={onApplyFilters}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors font-semibold"
          >
            Apply Filters
          </button>
          {onClearFilters && (
            <button
              onClick={onClearFilters}
              className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition-colors font-semibold"
            >
              Clear All
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
