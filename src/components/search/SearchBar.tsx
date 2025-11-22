"use client";

import { usePathname, useRouter } from "next/navigation";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/app/contexts/auth-context";
import { ClockIcon, SearchIcon, XIcon } from "@/components/ui/icons";
import { trpc } from "@/utils/trpc";

interface SearchBarProps {
  /** Initial search query */
  initialQuery?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Show search suggestions */
  showSuggestions?: boolean;
  /** Show search history */
  showHistory?: boolean;
  /** Show popular searches */
  showPopular?: boolean;
  /** Callback when search is submitted */
  onSearch?: (query: string) => void;
  /** Additional className */
  className?: string;
  /** Size variant */
  size?: "sm" | "md" | "lg";
}

/**
 * SearchBar Component
 *
 * Reusable search component with autocomplete, history, and popular searches.
 *
 * Follows Trichomes Design Guide principles:
 * - Reusable component
 * - Type-safe
 * - Proper loading states
 * - Error handling
 */
export function SearchBar({
  initialQuery = "",
  placeholder = "Search for products...",
  showSuggestions = true,
  showHistory = true,
  showPopular = true,
  onSearch,
  className = "",
  size = "md",
}: SearchBarProps) {
  const router = useRouter();
  const _pathname = usePathname();
  const { isAuthenticated: _isAuthenticated, user: _user } = useAuth();
  const [query, setQuery] = useState(initialQuery);
  const [isFocused, setIsFocused] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Search suggestions (autocomplete)
  const { data: suggestions = [], isLoading: suggestionsLoading } =
    trpc.searchProducts.useQuery(
      {
        query: query.trim(),
        limit: 5,
      },
      {
        enabled: showSuggestions && query.trim().length >= 2 && isFocused,
        refetchOnWindowFocus: false,
      },
    );

  // Popular searches (top searched products/categories)
  const { data: popularSearches = [] } = trpc.getPopularSearches?.useQuery(
    { limit: 5 },
    {
      enabled: showPopular && isFocused && !query.trim(),
      refetchOnWindowFocus: false,
    },
  ) || { data: [] };

  // Search history (from localStorage)
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const history = localStorage.getItem("trichomes_search_history");
      return history ? JSON.parse(history) : [];
    } catch {
      return [];
    }
  });

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((searchQuery: string) => {
      if (searchQuery.trim().length >= 2) {
        // Trigger suggestions query
      }
    }, 300),
    [],
  );

  useEffect(() => {
    if (query) {
      debouncedSearch(query);
    }
  }, [query, debouncedSearch]);

  // Save to search history
  const saveToHistory = (searchQuery: string) => {
    if (!searchQuery.trim() || !showHistory) return;

    const trimmedQuery = searchQuery.trim().toLowerCase();
    const updatedHistory = [
      trimmedQuery,
      ...searchHistory.filter((item) => item.toLowerCase() !== trimmedQuery),
    ].slice(0, 10); // Keep only last 10 searches

    setSearchHistory(updatedHistory);
    try {
      localStorage.setItem(
        "trichomes_search_history",
        JSON.stringify(updatedHistory),
      );
    } catch (error) {
      console.error("Failed to save search history:", error);
    }
  };

  // Clear search history
  const clearHistory = () => {
    setSearchHistory([]);
    try {
      localStorage.removeItem("trichomes_search_history");
    } catch (error) {
      console.error("Failed to clear search history:", error);
    }
  };

  // Handle search submission
  const handleSearch = (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;

    saveToHistory(searchQuery.trim());
    setShowDropdown(false);
    setIsFocused(false);

    if (onSearch) {
      onSearch(searchQuery.trim());
    } else {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setShowDropdown(value.length > 0 || isFocused);
  };

  // Handle input focus
  const handleFocus = () => {
    setIsFocused(true);
    setShowDropdown(true);
  };

  // Handle input blur
  const handleBlur = (_e: React.FocusEvent) => {
    // Delay to allow clicking on dropdown items
    setTimeout(() => {
      if (!dropdownRef.current?.contains(document.activeElement)) {
        setIsFocused(false);
        setShowDropdown(false);
      }
    }, 200);
  };

  // Clear search
  const clearSearch = () => {
    setQuery("");
    searchInputRef.current?.focus();
  };

  // Select suggestion
  type Suggestion = { id?: string; name?: string; title?: string } | string;
  const selectSuggestion = (suggestion: Suggestion) => {
    const searchQuery = suggestion.name || suggestion.title || suggestion;
    setQuery(searchQuery);
    handleSearch(searchQuery);
  };

  // Select history item
  const selectHistoryItem = (historyItem: string) => {
    setQuery(historyItem);
    handleSearch(historyItem);
  };

  // Size classes
  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-3 text-base",
    lg: "px-5 py-4 text-lg",
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Search Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch();
        }}
        className="relative"
      >
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="w-5 h-5 text-trichomes-forest/40" />
          </div>
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            className={`w-full ${sizeClasses[size]} pl-10 pr-10 border border-trichomes-forest/15 bg-trichomes-soft focus:ring-1 focus:ring-trichomes-primary focus:border-trichomes-primary outline-none rounded-lg font-body placeholder:text-trichomes-forest/40`}
          />
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-trichomes-forest/40 hover:text-trichomes-forest transition-colors duration-150"
            >
              <XIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </form>

      {/* Dropdown with suggestions, history, and popular searches */}
      {showDropdown && isFocused && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-xl border border-trichomes-forest/10 shadow-lg max-h-[400px] overflow-y-auto">
          {/* Search Suggestions */}
          {showSuggestions && query.trim().length >= 2 && (
            <div className="p-4 border-b border-trichomes-forest/10">
              <h3 className="text-xs font-semibold text-trichomes-forest/60 uppercase mb-2 font-body">
                Suggestions
              </h3>
              {suggestionsLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-12 bg-trichomes-soft rounded animate-pulse"
                    ></div>
                  ))}
                </div>
              ) : suggestions.length > 0 ? (
                <div className="space-y-1">
                  {suggestions.map((suggestion: Suggestion) => (
                    <button
                      type="button"
                      key={suggestion.id || suggestion}
                      onClick={() => selectSuggestion(suggestion)}
                      className="w-full text-left px-3 py-2 hover:bg-trichomes-soft rounded transition-colors duration-150 flex items-center gap-3 group"
                    >
                      <SearchIcon className="w-4 h-4 text-trichomes-forest/40 group-hover:text-trichomes-primary transition-colors duration-150" />
                      <span className="flex-1 text-sm text-trichomes-forest font-body group-hover:text-trichomes-primary transition-colors duration-150">
                        {suggestion.name || suggestion.title || suggestion}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                query.trim().length >= 2 && (
                  <p className="text-sm text-trichomes-forest/60 font-body py-2">
                    No suggestions found
                  </p>
                )
              )}
            </div>
          )}

          {/* Search History */}
          {showHistory && !query.trim() && searchHistory.length > 0 && (
            <div className="p-4 border-b border-trichomes-forest/10">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-trichomes-forest/60 uppercase font-body">
                  Recent Searches
                </h3>
                <button
                  type="button"
                  onClick={clearHistory}
                  className="text-xs text-trichomes-primary hover:text-trichomes-forest font-body transition-colors duration-150"
                >
                  Clear
                </button>
              </div>
              <div className="space-y-1">
                {searchHistory.slice(0, 5).map((historyItem) => (
                  <button
                    type="button"
                    key={historyItem}
                    onClick={() => selectHistoryItem(historyItem)}
                    className="w-full text-left px-3 py-2 hover:bg-trichomes-soft rounded transition-colors duration-150 flex items-center gap-3 group"
                  >
                    <ClockIcon className="w-4 h-4 text-trichomes-forest/40 group-hover:text-trichomes-primary transition-colors duration-150" />
                    <span className="flex-1 text-sm text-trichomes-forest font-body group-hover:text-trichomes-primary transition-colors duration-150">
                      {historyItem}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Popular Searches */}
          {showPopular && !query.trim() && popularSearches.length > 0 && (
            <div className="p-4">
              <h3 className="text-xs font-semibold text-trichomes-forest/60 uppercase mb-2 font-body">
                Popular Searches
              </h3>
              <div className="space-y-1">
                {popularSearches.map((popular: Suggestion, index: number) => (
                  <button
                    type="button"
                    key={
                      typeof popular === "string"
                        ? `pop-${popular}`
                        : String(
                            popular.id ??
                              popular.name ??
                              popular.title ??
                              `pop-${index}`,
                          )
                    }
                    onClick={() => selectSuggestion(popular)}
                    className="w-full text-left px-3 py-2 hover:bg-trichomes-soft rounded transition-colors duration-150 flex items-center gap-3 group"
                  >
                    <span className="text-xs text-trichomes-forest/40 font-body w-4">
                      {index + 1}
                    </span>
                    <span className="flex-1 text-sm text-trichomes-forest font-body group-hover:text-trichomes-primary transition-colors duration-150">
                      {popular.name || popular.title || popular}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {!query.trim() &&
            searchHistory.length === 0 &&
            (!popularSearches || popularSearches.length === 0) && (
              <div className="p-8 text-center">
                <SearchIcon className="w-12 h-12 text-trichomes-forest/20 mx-auto mb-3" />
                <p className="text-sm text-trichomes-forest/60 font-body">
                  Start typing to search for products
                </p>
              </div>
            )}
        </div>
      )}
    </div>
  );
}

// Debounce utility
function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}
