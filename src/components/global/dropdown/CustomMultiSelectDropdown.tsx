// src/components/global/CustomMultiSelectDropdown.tsx
import React, { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

type Option = {
  value: any;
  label: string;
};

interface CustomMultiSelectDropdownProps {
  label: string;
  options: Option[];
  selectedValues: any[];
  onChange: (selected: any[]) => void;
  placeholder?: string;
  widthClass?: string;
}

const CustomMultiSelectDropdown: React.FC<CustomMultiSelectDropdownProps> = ({
  label,
  options,
  selectedValues,
  onChange,
  placeholder = "Избери...",
  widthClass = "w-48", // Default width
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleToggle = (value: any) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter((v) => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  const selectedLabels = useMemo(() => {
    if (selectedValues.length === 0) return "";
    // if (selectedValues.length > 2) return `${selectedValues.length} избрани`;
    return options
      .filter((opt) => selectedValues.includes(opt.value))
      .map((opt) => opt.label)
      .join(", ");
  }, [selectedValues, options]);

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
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
      </label>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-indigo-500 sm:text-sm cursor-pointer flex items-center justify-between"
      >
        <span className="text-gray-900 truncate">
          {selectedLabels || placeholder}
        </span>
        <ChevronDownIcon
          className={`min-h-4.5 min-w-4.5 h-5 w-5 text-gray-400 transition-transform duration-200 ${
            isOpen ? "transform rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </div>
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {options.map((option) => (
            <label
              key={option.value}
              className="flex items-center px-3 py-2 cursor-pointer hover:bg-indigo-50"
            >
              <input
                type="checkbox"
                checked={selectedValues.includes(option.value)}
                onChange={() => handleToggle(option.value)}
                className="form-checkbox h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-800">{option.label}</span>
            </label>
          ))}
          {options.length === 0 && (
            <div className="px-3 py-2 text-sm text-gray-500">
              Няма намерени опции.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomMultiSelectDropdown;
