// src/components/shared/CategoryMultiSelect.tsx
import React, { useState, useEffect, useRef, useMemo } from "react";
import { useLazyQuery } from "@apollo/client";
import { GET_ACTIVE_CATEGORIES } from "../../graphql/query/category"; // Adjust path
import { ICategory } from "../../db/interfaces"; // Adjust path
import { ChevronDownIcon } from "@heroicons/react/24/outline";

interface CategoryMultiSelectProps {
  selectedCategoryIds: string[];
  onChange: (selectedIds: string[]) => void;
  t: (key: string, options?: any) => string;
  initialCategoryObjects?: ICategory[]; // Full objects for initially selected IDs
  placeholder?: string;
  disabled?: boolean;
  label?: string;
  className?: string;
  dropdownZIndex?: string;
}

const CategoryMultiSelect: React.FC<CategoryMultiSelectProps> = ({
  selectedCategoryIds,
  onChange,
  t,
  initialCategoryObjects = [], // Default to empty array
  placeholder,
  disabled = false,
  label,
  className = "",
  dropdownZIndex = "z-20",
}) => {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const displayInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [serverFetchedCategories, setServerFetchedCategories] = useState<
    ICategory[]
  >([]);
  const [categorySearch, setCategorySearch] = useState("");

  // --- DEBUG LOG ---
  // console.log("CategoryMultiSelect PROPS:", { selectedCategoryIds, initialCategoryObjects });
  // console.log("CategoryMultiSelect STATE:", { serverFetchedCategories, loadingCategories });
  // -----------------

  const [
    fetchCategories,
    { loading: loadingCategories, error: categoriesError },
  ] = useLazyQuery<{ getLeanActiveCategories: ICategory[] }>(
    GET_ACTIVE_CATEGORIES,
    {
      onCompleted: (data) => {
        setServerFetchedCategories(data?.getLeanActiveCategories || []);
      },
      onError: (error) => {
        console.error("Error fetching categories:", error);
      },
    }
  );

  useEffect(() => {
    if (
      isDropdownVisible &&
      !disabled &&
      serverFetchedCategories.length === 0 &&
      !loadingCategories
    ) {
      fetchCategories();
    }
  }, [
    isDropdownVisible,
    disabled,
    serverFetchedCategories.length,
    fetchCategories,
    loadingCategories,
  ]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        displayInputRef.current &&
        !displayInputRef.current.contains(event.target as Node)
      ) {
        setIsDropdownVisible(false);
      }
    };
    if (isDropdownVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownVisible]);

  const handleInputClick = () => {
    if (!disabled) setIsDropdownVisible((v) => !v);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCategorySearch(e.target.value);
  };

  const handleCategoryToggle = (catId: string) => {
    const newCategoryIds = selectedCategoryIds.includes(catId)
      ? selectedCategoryIds.filter((id) => id !== catId)
      : [...selectedCategoryIds, catId];
    onChange(newCategoryIds);
  };

  const selectedCategoryNames = useMemo(() => {
    // --- DEBUG LOG ---
    // console.log("Calculating selectedCategoryNames:", {
    //   selectedCategoryIds,
    //   initialCategoryObjectsLength: initialCategoryObjects.length,
    //   serverFetchedCategoriesLength: serverFetchedCategories.length,
    //   loadingCategories
    // });
    // -----------------

    if (!selectedCategoryIds || selectedCategoryIds.length === 0) {
      return "";
    }

    const names: string[] = [];
    let allNamesFoundFromAvailableData = true;

    for (const id of selectedCategoryIds) {
      let name = null;
      // Prioritize server-fetched data as it's the live source
      const serverCat = serverFetchedCategories.find((cat) => cat._id === id);
      if (serverCat) {
        name = serverCat.name;
      } else {
        // Fallback to initial objects for initial render or if server data doesn't have it (unlikely if ID is valid)
        const initialCat = initialCategoryObjects.find((cat) => cat._id === id);
        if (initialCat) {
          name = initialCat.name;
        }
      }

      if (name) {
        names.push(name);
      } else {
        names.push(id); // Fallback: push the ID itself if name is not found in any source
        allNamesFoundFromAvailableData = false;
      }
    }

    // If not all names were found using initial/server data, AND we are currently loading the full server list
    if (
      !allNamesFoundFromAvailableData &&
      serverFetchedCategories.length === 0 &&
      loadingCategories
    ) {
      return `${t("categories_loading_names_placeholder", {
        count: selectedCategoryIds.length,
      })} Selected (${selectedCategoryIds.length}) - names loading...`;
    }

    return names.join(", ");
  }, [
    selectedCategoryIds,
    serverFetchedCategories,
    initialCategoryObjects,
    t,
    loadingCategories,
  ]);

  const filteredCategories = useMemo(() => {
    const search = categorySearch.trim().toLowerCase();
    if (!search) return serverFetchedCategories;
    return serverFetchedCategories.filter((cat) =>
      cat.name.toLowerCase().includes(search)
    );
  }, [serverFetchedCategories, categorySearch]);

  const inputId = useMemo(
    () => `category-multiselect-${Math.random().toString(36).substring(2, 9)}`,
    []
  );

  return (
    <div className={`relative w-full ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          type="text"
          ref={displayInputRef}
          value={selectedCategoryNames} // This is where the names (or IDs) are displayed
          onClick={handleInputClick}
          readOnly
          disabled={disabled}
          className={`bg-white w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none sm:text-sm ${
            disabled
              ? "cursor-not-allowed bg-gray-100 text-gray-500"
              : "cursor-pointer focus:ring-indigo-500 focus:border-indigo-500"
          }`}
          placeholder={
            placeholder ||
            t("choose_categories_placeholder", "Choose categories...")
          }
          autoComplete="off"
        />
        {!disabled && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
            <ChevronDownIcon
              className={`h-5 w-5 text-gray-400 transition-transform duration-200 ease-in-out ${
                isDropdownVisible ? "rotate-180" : ""
              }`}
            />
          </div>
        )}
      </div>

      {isDropdownVisible && !disabled && (
        <div
          ref={dropdownRef}
          className={`absolute mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 ${dropdownZIndex}`}
        >
          <div className="p-2 sticky top-0 bg-white border-b border-gray-200 z-10">
            <input
              type="text"
              value={categorySearch}
              onChange={handleSearchChange}
              placeholder={t(
                "search_categories_placeholder",
                "Search categories..."
              )}
              className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
              autoFocus
            />
          </div>
          <div
            className="overflow-y-auto"
            style={{
              maxHeight:
                "calc(15rem - 3rem)" /* max-h-60 minus search bar height approx */,
            }}
          >
            {loadingCategories && serverFetchedCategories.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500">
                {t("loading", "Loading...")}
              </div>
            ) : categoriesError ? (
              <div className="px-3 py-2 text-sm text-red-600">
                {t("error_loading_categories", "Error loading categories")}:{" "}
                {categoriesError.message}
              </div>
            ) : serverFetchedCategories.length > 0 &&
              filteredCategories.length === 0 &&
              categorySearch ? (
              <div className="px-3 py-2 text-sm text-gray-500">
                {t("no_categories_match_search", "No categories match search")}
              </div>
            ) : serverFetchedCategories.length === 0 &&
              !loadingCategories &&
              !categoriesError ? (
              <div className="px-3 py-2 text-sm text-gray-500">
                {t("no_categories_available", "No categories available")}
              </div>
            ) : (
              filteredCategories.map((cat) => (
                <label
                  key={cat._id}
                  className="flex items-center px-3 py-2.5 cursor-pointer hover:bg-indigo-50 transition-colors duration-150 ease-in-out"
                >
                  <input
                    type="checkbox"
                    checked={selectedCategoryIds.includes(cat._id)}
                    onChange={() => handleCategoryToggle(cat._id)}
                    className="form-checkbox h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span className="ml-2.5 text-sm text-gray-800">
                    {cat.name}
                  </span>
                </label>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryMultiSelect;
