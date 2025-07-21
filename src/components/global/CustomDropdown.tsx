// src/components/global/CustomDropdown.tsx
import React, { useState, useRef, useEffect } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

type Option = {
  value: any;
  label: string;
};

interface CustomDropdownProps {
  label: string;
  options: Option[];
  value: any;
  onChange: (value: any) => void;
  placeholder?: string;
  widthClass?: string;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = "Select...",
  widthClass = "w-32", // Default width
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((option) => option.value === value);

  const handleSelect = (optionValue: any) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative ${widthClass}`} ref={dropdownRef}>
      <label
        htmlFor={`dropdown-${label}`}
        className="block text-sm font-medium text-gray-700 mb-1 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        {label}
      </label>
      <div
        id={`dropdown-${label}`}
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm cursor-pointer flex items-center justify-between"
        role="button"
        tabIndex={0}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setIsOpen(!isOpen);
        }}
      >
        <span className="text-gray-900 truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDownIcon
          className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
            isOpen ? "transform rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </div>
      {isOpen && (
        <div
          className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
          role="listbox"
        >
          {options.map((option) => (
            <div
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={`px-3 py-2 text-sm cursor-pointer hover:bg-indigo-50 ${
                value === option.value
                  ? "bg-indigo-100 text-indigo-700 font-semibold"
                  : "text-gray-800"
              }`}
              role="option"
              aria-selected={value === option.value}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleSelect(option.value);
                }
              }}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;
