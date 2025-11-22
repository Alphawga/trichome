"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import { ChevronDownIcon } from "./icons";

interface SelectOption {
  readonly label: string;
  readonly value: string;
}

interface CustomSelectProps {
  options: readonly SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select...",
  className = "",
  id,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div ref={selectRef} className={`relative ${className}`} id={id}>
      {/* Select Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 pr-8 border border-gray-200 focus:border-black focus:ring-1 focus:ring-black/10 outline-none bg-white text-gray-900 text-[12px] sm:text-[13px] font-body font-medium transition-all duration-150 ease-out appearance-none cursor-pointer flex items-center justify-between hover:border-gray-300 rounded-sm"
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDownIcon
          className={`w-4 h-4 text-gray-600 transition-transform duration-300 ease-out ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown Menu */}
      <div
        className={`absolute z-50 w-full mt-1 bg-white border border-gray-200 shadow-lg max-h-60 overflow-auto rounded-sm transition-all duration-200 ease-out ${
          isOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
        }`}
      >
        {options.map((option, index) => {
          const isSelected = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              className={`w-full text-left px-3 py-2 text-[12px] sm:text-[13px] font-body transition-all duration-150 ease-out ${
                isSelected
                  ? "bg-black text-white font-medium"
                  : "text-gray-900 hover:bg-gray-100"
              }`}
              style={{
                transitionDelay: isOpen ? `${index * 20}ms` : "0ms",
              }}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
