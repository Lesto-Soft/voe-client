// src/components/forms/partials/CategorySelectionDropdown.tsx
import React, { useState, useRef, useEffect, useMemo } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { ICategory } from "../../../db/interfaces"; // Adjust path if needed

interface CategorySelectionDropdownProps {
  label: string;
  allCategories: ICategory[];
  selectedCategoryIds: string[];
  onSelectionChange: (ids: string[]) => void;
  isLoading: boolean;
  placeholder?: string;
  errorPlaceholderClass: string;
  disabled?: boolean; // ADDED: New prop to control editability
}

const CategorySelectionDropdown: React.FC<CategorySelectionDropdownProps> = ({
  label,
  allCategories,
  selectedCategoryIds,
  onSelectionChange,
  isLoading,
  placeholder = "Избери категории...",
  errorPlaceholderClass,
  disabled = false, // ADDED: Destructure with a default value
}) => {
  console.log("SELECTED: ", selectedCategoryIds);
  console.log("ALL: ", allCategories);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const displayInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ADDED: This effect will close the dropdown if it becomes disabled while open
  useEffect(() => {
    if (disabled) {
      setIsDropdownVisible(false);
    }
  }, [disabled]);

  const categoryNameCache = useMemo(() => {
    const cache: Record<string, string> = {};
    allCategories.forEach((cat) => {
      cache[cat._id] = cat.name;
    });
    return cache;
  }, [allCategories]);

  // --- MODIFIED SECTION ---
  const selectedCategoryNames = useMemo(() => {
    return (
      selectedCategoryIds
        .map((id) => categoryNameCache[id]) // CORRECTED: from userNameCache to categoryNameCache
        .filter((name) => !!name)
        .join(", ") ||
      (selectedCategoryIds.length > 0
        ? `${selectedCategoryIds.length} избрани`
        : "")
    );
  }, [selectedCategoryIds, categoryNameCache]); // CORRECTED: Dependency updated

  const displayableCategories = useMemo(() => {
    if (!searchTerm.trim()) {
      return allCategories;
    }
    return allCategories.filter((cat) =>
      cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allCategories, searchTerm]);

  const handleCategoryToggle = (categoryId: string) => {
    onSelectionChange(
      selectedCategoryIds.includes(categoryId)
        ? selectedCategoryIds.filter((id) => id !== categoryId)
        : [...selectedCategoryIds, categoryId]
    );
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        displayInputRef.current &&
        !displayInputRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <label
        htmlFor={`category-select-${label}`}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          id={`category-select-${label}`}
          ref={displayInputRef}
          value={selectedCategoryNames}
          onClick={() => !disabled && setIsDropdownVisible((v) => !v)} // MODIFIED: Prevent opening if disabled
          readOnly
          disabled={disabled} // ADDED: Disable the input
          className="bg-white w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm cursor-pointer truncate disabled:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-70" // MODIFIED: Added disabled styles
          placeholder={placeholder}
        />
        {selectedCategoryIds.length > 0 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectionChange([]);
              setSearchTerm("");
            }}
            disabled={disabled} // ADDED: Disable the clear button
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50" // MODIFIED: Added disabled styles
            title={`Изчисти ${label}`}
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
      </div>
      {isDropdownVisible && (
        <div
          ref={dropdownRef}
          className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto"
        >
          <div className="p-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Търси категория..."
              className="w-full px-2 py-1 mb-2 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
              autoFocus
            />
          </div>
          {isLoading ? (
            <div className="px-3 py-2 text-sm text-gray-500">Зареждане...</div>
          ) : displayableCategories.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">
              {searchTerm
                ? "Няма намерени категории."
                : "Няма налични категории."}
            </div>
          ) : (
            displayableCategories.map((cat) => (
              <label
                key={cat._id}
                className="flex items-center px-3 py-2 cursor-pointer hover:bg-indigo-50"
              >
                <input
                  type="checkbox"
                  checked={selectedCategoryIds.includes(cat._id)}
                  onChange={() => handleCategoryToggle(cat._id)}
                  className="form-checkbox h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-800">{cat.name}</span>
              </label>
            ))
          )}
        </div>
      )}
      <p className={`${errorPlaceholderClass}`}>&nbsp;</p>
    </div>
  );
};

export default CategorySelectionDropdown;
