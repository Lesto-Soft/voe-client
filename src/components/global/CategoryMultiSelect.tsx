// src/components/global/CategoryMultiSelect.tsx

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useLazyQuery } from "@apollo/client";
import { ICategory } from "../../db/interfaces";
import { GET_ACTIVE_CATEGORIES } from "../../graphql/query/category";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface CategoryMultiSelectProps {
  label: string;
  placeholder: string;
  selectedCategoryIds: string[];
  setSelectedCategoryIds: (ids: string[]) => void;
  t: (key: string) => string;
}

const CategoryMultiSelect: React.FC<CategoryMultiSelectProps> = ({
  label,
  placeholder,
  selectedCategoryIds,
  setSelectedCategoryIds,
  t,
}) => {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [serverFetchedCategories, setServerFetchedCategories] = useState<
    ICategory[]
  >([]);
  const [categorySearch, setCategorySearch] = useState("");

  const [
    fetchCategories,
    { loading: loadingCategories, error: categoriesError },
  ] = useLazyQuery<{ getLeanActiveCategories: ICategory[] }>(
    GET_ACTIVE_CATEGORIES,
    {
      onCompleted: (data) => {
        setServerFetchedCategories(data?.getLeanActiveCategories || []);
      },
    }
  );

  useEffect(() => {
    if (
      selectedCategoryIds.length > 0 &&
      serverFetchedCategories.length === 0
    ) {
      fetchCategories();
    }
  }, [selectedCategoryIds, serverFetchedCategories.length, fetchCategories]);

  useEffect(() => {
    if (isDropdownVisible && serverFetchedCategories.length === 0) {
      fetchCategories();
    }
  }, [isDropdownVisible, serverFetchedCategories.length, fetchCategories]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCategories = useMemo(() => {
    const search = categorySearch.trim().toLowerCase();
    const filtered = serverFetchedCategories.filter((cat) =>
      cat.name.toLowerCase().includes(search)
    );

    filtered.sort((a, b) => {
      const aIsSelected = selectedCategoryIds.includes(a._id);
      const bIsSelected = selectedCategoryIds.includes(b._id);
      if (aIsSelected && !bIsSelected) return -1;
      if (!aIsSelected && bIsSelected) return 1;
      return a.name.localeCompare(b.name);
    });

    return filtered;
  }, [serverFetchedCategories, categorySearch, selectedCategoryIds]);

  const selectedCategoryNames = useMemo(() => {
    return serverFetchedCategories
      .filter((cat) => selectedCategoryIds.includes(cat._id))
      .map((cat) => cat.name)
      .join(", ");
  }, [selectedCategoryIds, serverFetchedCategories]);

  const handleCategoryToggle = (catId: string) => {
    if (selectedCategoryIds.includes(catId)) {
      setSelectedCategoryIds(selectedCategoryIds.filter((id) => id !== catId));
    } else {
      setSelectedCategoryIds([...selectedCategoryIds, catId]);
    }
    setCategorySearch("");
  };

  return (
    <div className="relative flex-1 min-w-[200px]">
      <label
        htmlFor="category"
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          id="category"
          ref={inputRef}
          value={selectedCategoryNames}
          onClick={() => setIsDropdownVisible((v) => !v)}
          readOnly
          className="bg-white w-full px-3 pr-8 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm cursor-pointer"
          placeholder={placeholder}
          autoComplete="off"
        />
        {selectedCategoryIds.length > 0 && (
          <button
            type="button"
            onClick={() => setSelectedCategoryIds([])}
            className="absolute inset-y-0 right-0 flex items-center pr-2 text-gray-400 hover:text-gray-600 cursor-pointer"
            title={t("clear")}
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
      </div>
      {isDropdownVisible && (
        <div
          ref={dropdownRef}
          className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
        >
          <div className="p-2">
            <input
              type="text"
              value={categorySearch}
              onChange={(e) => setCategorySearch(e.target.value)}
              placeholder={t("search")}
              className="w-full px-2 py-1 mb-2 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
            />
          </div>
          {loadingCategories && serverFetchedCategories.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">
              {t("loading")}
            </div>
          ) : categoriesError ? (
            <div className="px-3 py-2 text-sm text-red-600">
              {t("error")}: {categoriesError.message}
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">
              {t("no_categories")}
            </div>
          ) : (
            filteredCategories.map((cat) => (
              <label
                key={cat._id}
                className="flex items-center px-3 py-2 cursor-pointer hover:bg-indigo-50"
              >
                <input
                  type="checkbox"
                  checked={selectedCategoryIds.includes(cat._id)}
                  onChange={() => handleCategoryToggle(cat._id)}
                  className="form-checkbox h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-800">{cat.name}</span>
              </label>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default CategoryMultiSelect;
