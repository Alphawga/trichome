"use client";

import type React from "react";
import { SearchIcon } from "@/components/ui/icons";

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
  onToggleFilter: (
    category: "brands" | "concerns" | "ingredients",
    value: string,
  ) => void;
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
      <div className="bg-white border border-trichomes-forest/10 p-6 sticky top-24 shadow-sm">
        <h2 className="text-[18px] font-heading font-semibold mb-6 text-trichomes-forest">
          Filters
        </h2>

        {/* Search */}
        {showSearch && (
          <div className="mb-6">
            <label
              htmlFor="product-filter-search"
              className="block text-[14px] font-body font-semibold mb-2 text-trichomes-forest"
            >
              Search Products
            </label>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-trichomes-forest/40" />
              <input
                type="text"
                id="product-filter-search"
                value={searchTerm}
                onChange={(e) => onSearchTermChange(e.target.value)}
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 border border-trichomes-forest/15 bg-trichomes-soft focus:ring-1 focus:ring-trichomes-primary/20 focus:border-trichomes-primary outline-none text-trichomes-forest placeholder-trichomes-forest/40 text-[14px] font-body transition-all duration-150"
              />
            </div>
          </div>
        )}

        {/* Price Range */}
        {showPrice && (
          <div className="mb-6">
            <label
              htmlFor="product-filter-price"
              className="block text-[14px] font-body font-semibold mb-2 text-trichomes-forest"
            >
              Price Range: ₦0 - ₦{price.toLocaleString()}
            </label>
            <input
              type="range"
              id="product-filter-price"
              min="0"
              max="100000"
              step="5000"
              value={price}
              onChange={(e) => onPriceChange(Number(e.target.value))}
              className="w-full h-2 bg-trichomes-sage appearance-none cursor-pointer accent-trichomes-primary"
            />
            <div className="flex justify-between text-[12px] text-trichomes-forest/60 mt-1 font-body">
              <span>₦0</span>
              <span>₦100,000</span>
            </div>
          </div>
        )}

        {/* Categories */}
        {showCategories &&
          filterOptions.categories &&
          filterOptions.categories.length > 0 && (
            <div className="mb-6">
              <h3 className="text-[14px] font-body font-semibold mb-3 text-trichomes-forest">
                Categories
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {filterOptions.categories.map((category) => (
                  <div key={category.name}>
                    <button
                      type="button"
                      onClick={() => onToggleFilter("brands", category.name)}
                      className={`w-full text-left px-3 py-2 text-[13px] font-body transition-colors duration-150 ${selectedCategory === category.name
                          ? "bg-trichomes-sage text-trichomes-forest font-medium"
                          : "hover:bg-trichomes-soft text-trichomes-forest/70"
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
        {showBrands &&
          filterOptions.brands &&
          filterOptions.brands.length > 0 && (
            <div className="mb-6">
              <h3 className="text-[14px] font-body font-semibold mb-3 text-trichomes-forest">
                Brands
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {filterOptions.brands.map((brand) => (
                  <label
                    key={brand}
                    className="flex items-center space-x-2 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(brand)}
                      onChange={() => onToggleFilter("brands", brand)}
                      className="w-4 h-4 border-trichomes-forest/20 text-trichomes-primary focus:ring-trichomes-primary/20 focus:ring-1 accent-trichomes-primary"
                    />
                    <span className="text-[13px] font-body text-trichomes-forest/70 group-hover:text-trichomes-forest transition-colors duration-150">
                      {brand}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

        {/* Skin Concerns */}
        {showConcerns &&
          filterOptions.concerns &&
          filterOptions.concerns.length > 0 && (
            <div className="mb-6">
              <h3 className="text-[14px] font-body font-semibold mb-3 text-trichomes-forest">
                Skin Concerns
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {filterOptions.concerns.map((concern) => (
                  <label
                    key={concern}
                    className="flex items-center space-x-2 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={selectedConcerns.includes(concern)}
                      onChange={() => onToggleFilter("concerns", concern)}
                      className="w-4 h-4 border-trichomes-forest/20 text-trichomes-primary focus:ring-trichomes-primary/20 focus:ring-1 accent-trichomes-primary"
                    />
                    <span className="text-[13px] font-body text-trichomes-forest/70 group-hover:text-trichomes-forest transition-colors duration-150">
                      {concern}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

        {/* Key Ingredients */}
        {showIngredients &&
          filterOptions.ingredients &&
          filterOptions.ingredients.length > 0 && (
            <div className="mb-6">
              <h3 className="text-[14px] font-body font-semibold mb-3 text-trichomes-forest">
                Key Ingredients
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {filterOptions.ingredients.map((ingredient) => (
                  <label
                    key={ingredient}
                    className="flex items-center space-x-2 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={selectedIngredients.includes(ingredient)}
                      onChange={() => onToggleFilter("ingredients", ingredient)}
                      className="w-4 h-4 border-trichomes-forest/20 text-trichomes-primary focus:ring-trichomes-primary/20 focus:ring-1 accent-trichomes-primary"
                    />
                    <span className="text-[13px] font-body text-trichomes-forest/70 group-hover:text-trichomes-forest transition-colors duration-150">
                      {ingredient}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={onApplyFilters}
            className="w-full bg-trichomes-primary text-trichomes-soft py-2.5 px-4 hover:bg-trichomes-primary/90 transition-all duration-150 ease-out font-semibold font-body text-[14px] shadow-sm hover:shadow-md"
          >
            Apply Filters
          </button>
          {onClearFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className="w-full border border-trichomes-forest/20 text-trichomes-forest py-2.5 px-4 hover:bg-trichomes-soft transition-all duration-150 ease-out font-semibold font-body text-[14px]"
            >
              Clear All
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
