"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import { ChevronDownIcon } from "./icons";

interface ComboboxOption {
    readonly label: string;
    readonly value: string;
}

interface CreatableComboboxProps {
    options: readonly ComboboxOption[];
    value: string;
    onChange: (value: string, isNew: boolean, newLabel?: string) => void;
    placeholder?: string;
    createLabel?: string;
    className?: string;
    id?: string;
    disabled?: boolean;
    isLoading?: boolean;
    /** Label to display when a new value is pending creation (not yet submitted) */
    pendingLabel?: string;
}

export const CreatableCombobox: React.FC<CreatableComboboxProps> = ({
    options,
    value,
    onChange,
    placeholder = "Search or type to create...",
    createLabel = "Create",
    className = "",
    id,
    disabled = false,
    isLoading = false,
    pendingLabel,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Get the selected option's label for display
    const selectedOption = options.find((opt) => opt.value === value);

    // Filter options based on input
    const filteredOptions = inputValue
        ? options.filter((opt) =>
            opt.label.toLowerCase().includes(inputValue.toLowerCase()),
        )
        : options;

    // Check if exact match exists (case-insensitive)
    const exactMatchExists = options.some(
        (opt) => opt.label.toLowerCase() === inputValue.toLowerCase(),
    );

    // Show create option if input has value and no exact match
    const showCreateOption = inputValue.trim() && !exactMatchExists;

    // Handle click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
                // Reset input to selected value label when closing without selection
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
        if (!isOpen) {
            setIsOpen(true);
        }
    };

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
        inputRef.current?.blur();
    };

    const handleCreateNew = () => {
        const trimmedValue = inputValue.trim();
        if (trimmedValue) {
            onChange("", true, trimmedValue);
            setInputValue("");
            setIsOpen(false);
            inputRef.current?.blur();
        }
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange("", false);
        setInputValue("");
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
            } else if (filteredOptions.length === 1) {
                handleSelectOption(filteredOptions[0]);
            }
        }
    };

    // Show pending label when a new value is pending creation, otherwise show selected option label
    const displayValue = isFocused || isOpen
        ? inputValue
        : pendingLabel || selectedOption?.label || "";

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
                        {isLoading ? (
                            <svg
                                className="w-4 h-4 animate-spin"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
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

                    {/* Existing options */}
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((option) => {
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
                        !showCreateOption && (
                            <div className="px-3 py-2 text-sm text-gray-500 text-center">
                                No options found
                            </div>
                        )
                    )}
                </div>
            )}
        </div>
    );
};
