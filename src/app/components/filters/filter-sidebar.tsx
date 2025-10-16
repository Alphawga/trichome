'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { SearchIcon, FilterIcon, ChevronDownIcon, ChevronUpIcon } from '../ui/icons';

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
    selectedBrands: string[];
    selectedConcerns: string[];
    selectedIngredients: string[];
    onToggleFilter: (category: 'brands' | 'concerns' | 'ingredients', value: string) => void;
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
    <div className="flex items-center p-2 hover:bg-gray-100 cursor-pointer">
        <Image
            src={product.imageUrl}
            alt={product.name}
            width={48}
            height={48}
            className="w-12 h-12 object-cover rounded-md mr-3"
        />
        <div>
            <p className="text-sm font-medium text-gray-800">{product.name}</p>
            <p className="text-sm font-semibold text-gray-900">{product.currency}{product.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        </div>
    </div>
);

const FilterPill: React.FC<{ label: string, isSelected: boolean, onClick: () => void }> = ({ label, isSelected, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`px-3 py-1 text-sm border rounded-full transition-colors ${isSelected ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}`}
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
                className="w-full flex justify-between items-center text-left text-2xl font-semibold text-gray-800 hover:text-black"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
            >
                <span>{category.name}</span>
                {isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
            </button>
            {isOpen && category.subcategories && (
                <div className="pt-4 pl-4">
                    <ul className="space-y-2">
                        {category.subcategories.map((subcategory) => (
                            <li key={subcategory}>
                                <button className="text-gray-600 hover:text-black text-base font-normal">{subcategory}</button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export const FilterSidebar: React.FC<SidebarProps> = ({
    searchTerm,
    onSearchTermChange,
    price,
    onPriceChange,
    selectedBrands,
    selectedConcerns,
    selectedIngredients,
    onToggleFilter,
    onApplyFilters,
    searchResults = [],
    categories,
    filterOptions
}) => {
    const [showFilters, setShowFilters] = useState(false);
    const [showSearchResults, setShowSearchResults] = useState(false);

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
        <aside className="w-full lg:w-80 lg:flex-shrink-0">
            <div className="relative mb-6">
                <input
                    type="text"
                    placeholder="Search product name or conditions"
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-300 focus:border-green-400 outline-none"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    onFocus={() => searchTerm.length > 0 && searchResults.length > 0 && setShowSearchResults(true)}
                    onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><SearchIcon /></div>
                <button onClick={() => setShowFilters(!showFilters)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><FilterIcon /></button>

                {showSearchResults && searchResults.length > 0 && (
                     <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-10">
                        <div className="max-h-80 overflow-y-auto">
                            {searchResults.map(p => <SearchResultItem key={p.id} product={p}/>)}
                        </div>
                    </div>
                )}
            </div>

            {showFilters ? (
                <div className="space-y-6 bg-white p-4 rounded-md border">
                    <h3 className="text-lg font-bold">Search filter</h3>
                    <div>
                        <label htmlFor="price-range" className="block text-sm font-medium mb-2">By price</label>
                        <input id="price-range" type="range" min="0" max="50000" step="1000" value={price} onChange={(e) => onPriceChange(Number(e.target.value))} className="w-full" />
                        <div className="flex justify-between text-sm text-gray-500 mt-1">
                            <span>Price: ₦0</span>
                            <span>₦{price.toLocaleString()}</span>
                        </div>
                    </div>
                     <div>
                        <h4 className="font-semibold mb-2">By brands</h4>
                        <div className="flex flex-wrap gap-2">
                           {filterOptions.brands.map(b => <FilterPill key={b} label={b} isSelected={selectedBrands.includes(b)} onClick={() => onToggleFilter('brands', b)} />)}
                        </div>
                    </div>
                     <div>
                        <h4 className="font-semibold mb-2">By specific concerns</h4>
                        <div className="flex flex-wrap gap-2">
                           {filterOptions.concerns.map(c => <FilterPill key={c} label={c} isSelected={selectedConcerns.includes(c)} onClick={() => onToggleFilter('concerns', c)} />)}
                        </div>
                    </div>
                     <div>
                        <h4 className="font-semibold mb-2">By ingredients</h4>
                        <div className="flex flex-wrap gap-2">
                           {filterOptions.ingredients.map(i => <FilterPill key={i} label={i} isSelected={selectedIngredients.includes(i)} onClick={() => onToggleFilter('ingredients', i)} />)}
                        </div>
                    </div>
                    <button onClick={onApplyFilters} className="w-full bg-[#343A40] text-white py-2 rounded-md hover:bg-black font-semibold">Apply filter</button>
                </div>
            ) : (
                 <div className="space-y-2">
                    {categories.map((cat) => (
                        <CategoryAccordion key={cat.name} category={cat} />
                    ))}
                </div>
            )}
        </aside>
    );
};