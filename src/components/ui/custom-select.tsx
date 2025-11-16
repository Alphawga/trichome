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
        className="w-full px-3 py-2 pr-8 border border-[#1E3024]/15 focus:border-[#3A643B] focus:ring-1 focus:ring-[#3A643B]/20 outline-none bg-[#FAFAF7] text-[#1E3024] text-[13px] font-body transition-all duration-150 ease-out appearance-none cursor-pointer flex items-center justify-between hover:border-[#1E3024]/25"
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDownIcon
          className={`w-4 h-4 text-[#1E3024]/60 transition-transform duration-200 ease-out ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-[#FAFAF7] border border-[#1E3024]/15 shadow-lg max-h-60 overflow-auto">
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`w-full text-left px-3 py-2 text-[13px] font-body transition-all duration-150 ease-out ${
                  isSelected
                    ? "bg-[#3A643B] text-white"
                    : "text-[#1E3024] hover:bg-[#E6E4C6]/50 hover:text-[#1E3024]"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
