"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ChevronDownIcon, FilterIcon, SearchIcon } from "../ui/icons";
import { RangeSlider } from "../ui/range-slider";

// Temporary interfaces for migration
interface Product {
  id: number;
  name: string;
  price: number;
  currency: string;
  imageUrl: string;
}

interface Category {
  name: string;
  subcategories?: string[];
}

interface SidebarProps {
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  price: number;
  onPriceChange: (price: number) => void;
  minPrice?: number;
  onMinPriceChange?: (price: number) => void;
  selectedBrands: string[];
  selectedConcerns: string[];
  selectedIngredients: string[];
  onToggleFilter: (
    category: "brands" | "concerns" | "ingredients",
    value: string,
  ) => void;
  onApplyFilters: () => void;
  searchResults?: Product[];
  categories: Category[];
  filterOptions: {
    brands: string[];
    concerns: string[];
    ingredients: string[];
  };
}

const SearchResultItem: React.FC<{ product: Product }> = ({ product }) => (
  <div className="flex items-center p-2.5 hover:bg-[#E6E4C6]/30 cursor-pointer transition-colors duration-150 ease-out">
    <Image
      src={product.imageUrl}
      alt={product.name}
      width={40}
      height={40}
      className="w-10 h-10 object-cover mr-2.5"
    />
    <div className="flex-1 min-w-0">
      <p className="text-[13px] font-body text-[#1E3024] truncate">
        {product.name}
      </p>
      <p className="text-[13px] font-body font-medium text-[#1E3024]">
        {product.currency}
        {product.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
      </p>
    </div>
  </div>
);

const FilterPill: React.FC<{
  label: string;
  isSelected: boolean;
  onClick: () => void;
}> = ({ label, isSelected, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1 text-[12px] font-body border transition-all duration-150 ease-out ${
        isSelected
          ? "bg-[#1E3024] text-white border-[#1E3024]"
          : "bg-[#FAFAF7] text-[#1E3024] border-[#1E3024]/20 hover:bg-[#E6E4C6]/50 hover:border-[#1E3024]/40"
      }`}
    >
      {label}
    </button>
  );
};

const CategoryAccordion: React.FC<{ category: Category }> = ({ category }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="py-2">
      <button
        type="button"
        className="w-full flex justify-between items-center text-left text-xs font-body text-black hover:text-black/50 transition-colors duration-150 ease-out border-b border-black/10 pb-2"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span>{category.name}</span>
        <span
          className={`transform transition-transform duration-300 ease-out ${isOpen ? "rotate-180" : ""}`}
        >
          <ChevronDownIcon className="w-4 h-4 text-black/60" />
        </span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-out ${
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        {category.subcategories && category.subcategories.length > 0 && (
          <div className="pt-3 pl-4">
            <ul className="space-y-1.5">
              {category.subcategories.map((subcategory, index) => (
                <li
                  key={subcategory}
                  className={`transform transition-all duration-300 ease-out ${
                    isOpen
                      ? "translate-y-0 opacity-100"
                      : "-translate-y-2 opacity-0"
                  }`}
                  style={{
                    transitionDelay: isOpen ? `${index * 30}ms` : "0ms",
                  }}
                >
                  <button
                    type="button"
                    className="text-[9px] font-body text-black/70 hover:text-black/80 transition-colors duration-150 ease-out"
                  >
                    {subcategory}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export const FilterSidebar: React.FC<SidebarProps> = ({
  searchTerm,
  onSearchTermChange,
  price,
  onPriceChange,
  minPrice = 0,
  onMinPriceChange,
  selectedBrands,
  selectedConcerns,
  selectedIngredients,
  onToggleFilter,
  onApplyFilters,
  searchResults = [],
  categories,
  filterOptions,
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [tempMinPrice, setTempMinPrice] = useState(minPrice);
  const [tempMaxPrice, setTempMaxPrice] = useState(price);

  // Update temp values when props change
  useEffect(() => {
    setTempMinPrice(minPrice);
    setTempMaxPrice(price);
  }, [minPrice, price]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    onSearchTermChange(term);
    // Mock search logic for dropdown
    setShowSearchResults(term.length > 0 && searchResults.length > 0);
    if (!term) {
      setShowSearchResults(false);
    }
  };

  return (
    <aside className="w-full lg:w-72 ">
      {/* Search input - Hidden on mobile, visible on desktop */}
      <div className="hidden lg:block relative mb-4 sm:mb-5">
        <input
          type="text"
          placeholder="Search product name or conditions"
          className="w-full pl-9 pr-9 py-2.5 rounded-sm border border-[#1E3024]/15  focus:ring-none focus:ring-none outline-none bg-white text-black text-[12px] md:text-xs font-body transition-all duration-150 ease-out placeholder:text-[#1E3024]/40"
          value={searchTerm}
          onChange={handleSearchChange}
          onFocus={() =>
            searchTerm.length > 0 &&
            searchResults.length > 0 &&
            setShowSearchResults(true)
          }
          onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
        />
        <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#1E3024]/40 pointer-events-none">
          <SearchIcon className="w-4 h-4" />
        </div>
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#1E3024]/40 hover:text-[#3A643B] transition-colors duration-150 ease-out"
          aria-label="Toggle filters"
        >
          <FilterIcon className="w-4 h-4" />
        </button>

        {showSearchResults && searchResults.length > 0 && (
          <div className="absolute top-full mt-2 w-full bg-[#FAFAF7] border border-[#1E3024]/15 shadow-lg z-10">
            <div className="max-h-80 overflow-y-auto">
              {searchResults.map((p) => (
                <SearchResultItem key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Filter by Price Section - Always Visible */}
      <div className="bg-white p-4 sm:p-5 border border-[#1E3024]/10 shadow-sm mb-4 sm:mb-5 rounded-sm">
        <div className="space-y-4">
          {/* Title */}
          <div className="flex items-center justify-between pb-2 border-b border-[#1E3024]/10">
            <h4 className="text-[13px] font-body text-[#1E3024]">
              Filter by price
            </h4>
          </div>

          {/* Range Slider */}
          <div className="py-3 sm:py-4">
            <RangeSlider
              min={0}
              max={100000}
              minValue={tempMinPrice}
              maxValue={tempMaxPrice}
              onChange={(min, max) => {
                setTempMinPrice(min);
                setTempMaxPrice(max);
              }}
              step={1000}
            />
          </div>

          {/* Filter Button and Price Display */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => {
                if (onMinPriceChange) onMinPriceChange(tempMinPrice);
                onPriceChange(tempMaxPrice);
                onApplyFilters();
              }}
              className="bg-black text-white px-4 py-2 sm:py-2.5 text-[12px] font-body font-medium uppercase hover:bg-black/80 transition-colors duration-150 ease-out w-full sm:w-auto rounded-sm"
            >
              FILTER
            </button>
            <div className="text-[12px] sm:text-[13px] font-body text-[#1E3024] text-center sm:text-right ">
              Price: ₦{tempMinPrice.toLocaleString()} — ₦
              {tempMaxPrice.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {showFilters ? (
        <div className="space-y-5 bg-[#FAFAF7] p-4 sm:p-5 border border-[#1E3024]/10 shadow-sm rounded-sm">
          <h3 className="text-[16px] font-body font-medium text-[#1E3024]">
            Search filter
          </h3>

          {filterOptions.brands.length > 0 && (
            <div>
              <h4 className="text-[13px] font-body text-[#1E3024] mb-2.5">
                By brands
              </h4>
              <div className="flex flex-wrap gap-2">
                {filterOptions.brands.map((b) => (
                  <FilterPill
                    key={b}
                    label={b}
                    isSelected={selectedBrands.includes(b)}
                    onClick={() => onToggleFilter("brands", b)}
                  />
                ))}
              </div>
            </div>
          )}
          {filterOptions.concerns.length > 0 && (
            <div>
              <h4 className="text-[13px] font-body text-[#1E3024] mb-2.5">
                By specific concerns
              </h4>
              <div className="flex flex-wrap gap-2">
                {filterOptions.concerns.map((c) => (
                  <FilterPill
                    key={c}
                    label={c}
                    isSelected={selectedConcerns.includes(c)}
                    onClick={() => onToggleFilter("concerns", c)}
                  />
                ))}
              </div>
            </div>
          )}
          {filterOptions.ingredients.length > 0 && (
            <div>
              <h4 className="text-[13px] font-body text-[#1E3024] mb-2.5">
                By ingredients
              </h4>
              <div className="flex flex-wrap gap-2">
                {filterOptions.ingredients.map((i) => (
                  <FilterPill
                    key={i}
                    label={i}
                    isSelected={selectedIngredients.includes(i)}
                    onClick={() => onToggleFilter("ingredients", i)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-1">
          {categories.map((cat) => (
            <CategoryAccordion key={cat.name} category={cat} />
          ))}
        </div>
      )}
    </aside>
  );
};
