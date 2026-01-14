"use client";

import type React from "react";
import { useEffect, useRef, useState, useCallback } from "react";
import { ChevronDownIcon } from "./icons";

interface ComboboxOption {
    readonly label: string;
    readonly value: string;
}

interface ServerSearchComboboxProps {
    /** Current selected value */
    value: string;
    /** Callback when value changes */
    onChange: (value: string, isNew: boolean, newLabel?: string) => void;
    /** Function to search options on the server - returns options array */
    onSearch: (query: string) => Promise<ComboboxOption[]>;
    /** Initial options to show before any search (optional) */
    initialOptions?: readonly ComboboxOption[];
    placeholder?: string;
    createLabel?: string;
    className?: string;
    id?: string;
    disabled?: boolean;
    /** Loading state for external operations */
    isLoading?: boolean;
    /** Label to display when a new value is pending creation (not yet submitted) */
    pendingLabel?: string;
    /** Debounce delay in milliseconds for search */
    debounceMs?: number;
    /** Minimum characters required to trigger search */
    minSearchLength?: number;
}

/**
 * A combobox component that performs server-side search with debouncing.
 * Supports creating new options inline.
 */
export const ServerSearchCombobox: React.FC<ServerSearchComboboxProps> = ({
    value,
    onChange,
    onSearch,
    initialOptions = [],
    placeholder = "Search or type to create...",
    createLabel = "Create",
    className = "",
    id,
    disabled = false,
    isLoading = false,
    pendingLabel,
    debounceMs = 300,
    minSearchLength = 1,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const [searchResults, setSearchResults] = useState<ComboboxOption[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Options to display: search results if we've searched, otherwise initial options
    const displayOptions = hasSearched ? searchResults : [...initialOptions];

    // Get the selected option's label for display
    const selectedOption =
        displayOptions.find((opt) => opt.value === value) ||
        initialOptions.find((opt) => opt.value === value);

    // Check if exact match exists (case-insensitive)
    const exactMatchExists = displayOptions.some(
        (opt) => opt.label.toLowerCase() === inputValue.toLowerCase()
    );

    // Show create option if input has value and no exact match
    const showCreateOption = inputValue.trim() && !exactMatchExists;

    // Debounced search function
    const performSearch = useCallback(
        async (query: string) => {
            if (query.length < minSearchLength) {
                setSearchResults([]);
                setHasSearched(false);
                return;
            }

            setIsSearching(true);
            try {
                const results = await onSearch(query);
                setSearchResults(results);
                setHasSearched(true);
            } catch (error) {
                console.error("Search error:", error);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        },
        [onSearch, minSearchLength]
    );

    // Handle input change with debounce
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInputValue(newValue);

        if (!isOpen) {
            setIsOpen(true);
        }

        // Clear existing timer
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        // Set new debounce timer
        if (newValue.trim().length >= minSearchLength) {
            debounceTimerRef.current = setTimeout(() => {
                performSearch(newValue.trim());
            }, debounceMs);
        } else {
            setSearchResults([]);
            setHasSearched(false);
        }
    };

    // Cleanup debounce timer on unmount
    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, []);

    // Handle click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
                if (selectedOption) {
                    setInputValue("");
                }
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, selectedOption]);

    const handleInputFocus = () => {
        setIsFocused(true);
        setIsOpen(true);
    };

    const handleInputBlur = () => {
        setIsFocused(false);
    };

    const handleSelectOption = (option: ComboboxOption) => {
        onChange(option.value, false);
        setInputValue("");
        setIsOpen(false);
        setHasSearched(false);
        inputRef.current?.blur();
    };

    const handleCreateNew = () => {
        const trimmedValue = inputValue.trim();
        if (trimmedValue) {
            onChange("", true, trimmedValue);
            setInputValue("");
            setIsOpen(false);
            setHasSearched(false);
            inputRef.current?.blur();
        }
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange("", false);
        setInputValue("");
        setHasSearched(false);
        inputRef.current?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Escape") {
            setIsOpen(false);
            inputRef.current?.blur();
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (showCreateOption) {
                handleCreateNew();
            } else if (displayOptions.length === 1) {
                handleSelectOption(displayOptions[0]);
            }
        }
    };

    // Show pending label when a new value is pending creation, otherwise show selected option label
    const displayValue =
        isFocused || isOpen
            ? inputValue
            : pendingLabel || selectedOption?.label || "";

    const showLoading = isLoading || isSearching;

    return (
        <div ref={containerRef} className={`relative ${className}`} id={id}>
            {/* Input with dropdown trigger */}
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={displayValue}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    disabled={disabled || isLoading}
                    className="w-full px-3 py-2 pr-16 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {selectedOption && !isFocused && (
                        <button
                            type="button"
                            onClick={handleClear}
                            disabled={disabled || isLoading}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                            title="Clear selection"
                        >
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <title>Clear</title>
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => {
                            if (!disabled && !isLoading) {
                                setIsOpen(!isOpen);
                                if (!isOpen) {
                                    inputRef.current?.focus();
                                }
                            }
                        }}
                        disabled={disabled || isLoading}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                    >
                        {showLoading ? (
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <title>Loading</title>
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                            </svg>
                        ) : (
                            <ChevronDownIcon
                                className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                            />
                        )}
                    </button>
                </div>
            </div>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                    {/* Create new option */}
                    {showCreateOption && (
                        <button
                            type="button"
                            onClick={handleCreateNew}
                            className="w-full text-left px-3 py-2 text-sm text-green-700 bg-green-50 hover:bg-green-100 transition-colors flex items-center gap-2 border-b border-gray-100"
                        >
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <title>Create new</title>
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 4v16m8-8H4"
                                />
                            </svg>
                            <span>
                                {createLabel}: <strong>{inputValue.trim()}</strong>
                            </span>
                        </button>
                    )}

                    {/* Search indicator */}
                    {isSearching && (
                        <div className="px-3 py-2 text-sm text-gray-500 text-center flex items-center justify-center gap-2">
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <title>Searching</title>
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                            </svg>
                            Searching...
                        </div>
                    )}

                    {/* Existing options */}
                    {!isSearching && displayOptions.length > 0 ? (
                        displayOptions.map((option) => {
                            const isSelected = option.value === value;
                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => handleSelectOption(option)}
                                    className={`w-full text-left px-3 py-2 text-sm transition-colors ${isSelected
                                            ? "bg-green-50 text-green-700 font-medium"
                                            : "text-gray-900 hover:bg-gray-100"
                                        }`}
                                >
                                    {option.label}
                                </button>
                            );
                        })
                    ) : (
                        !isSearching &&
                        !showCreateOption && (
                            <div className="px-3 py-2 text-sm text-gray-500 text-center">
                                {hasSearched
                                    ? "No results found"
                                    : inputValue.length < minSearchLength
                                        ? `Type at least ${minSearchLength} character${minSearchLength > 1 ? "s" : ""} to search`
                                        : "No options available"}
                            </div>
                        )
                    )}
                </div>
            )}
        </div>
    );
};
