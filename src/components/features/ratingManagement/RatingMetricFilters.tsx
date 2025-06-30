// src/components/features/ratingManagement/RatingMetricFilters.tsx
import React, { useState, useRef, useEffect } from "react";
import { ArchivedFilterStatus } from "../../../hooks/useRatingMetricManagement"; // Adjust path
import { ChevronDownIcon } from "@heroicons/react/24/solid";

interface RatingMetricFiltersProps {
  filterName: string;
  setFilterName: (value: string) => void;
  filterDescription: string;
  setFilterDescription: (value: string) => void;
  archivedStatus: ArchivedFilterStatus;
  setArchivedStatus: (value: ArchivedFilterStatus) => void;
}

const statusOptions: { label: string; value: ArchivedFilterStatus }[] = [
  { label: "Всички", value: "all" },
  { label: "Активни", value: "active" },
  { label: "Архивирани", value: "archived" },
];

const RatingMetricFilters: React.FC<RatingMetricFiltersProps> = ({
  filterName,
  setFilterName,
  filterDescription,
  setFilterDescription,
  archivedStatus,
  setArchivedStatus,
}) => {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const selectedStatusLabel =
    statusOptions.find((opt) => opt.value === archivedStatus)?.label ||
    "Всички";

  const handleStatusSelect = (value: ArchivedFilterStatus) => {
    setArchivedStatus(value);
    setIsDropdownVisible(false);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsDropdownVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="pt-2.5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-3 items-start">
        {/* Filter by Name */}
        <div>
          <label
            htmlFor="filterName"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Име на метрика
          </label>
          <input
            type="text"
            id="filterName"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
            placeholder="Търси по име..."
          />
        </div>

        {/* Filter by Description */}
        <div>
          <label
            htmlFor="filterDescription"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Описание
          </label>
          <input
            type="text"
            id="filterDescription"
            value={filterDescription}
            onChange={(e) => setFilterDescription(e.target.value)}
            className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
            placeholder="Търси по описание..."
          />
        </div>

        {/* Status Dropdown Filter */}
        <div className="relative">
          <label
            htmlFor="filterStatusDisplay"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Статус
          </label>
          <div
            id="filterStatusDisplay"
            ref={triggerRef}
            onClick={() => setIsDropdownVisible(!isDropdownVisible)}
            className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm cursor-pointer flex items-center justify-between"
            role="button"
            tabIndex={0}
          >
            <span>{selectedStatusLabel}</span>
            <ChevronDownIcon
              className={`h-5 w-5 text-gray-400 transition-transform ${
                isDropdownVisible ? "rotate-180" : ""
              }`}
            />
          </div>
          {isDropdownVisible && (
            <div
              ref={dropdownRef}
              className="absolute z-20 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg" // <-- Z-INDEX CHANGED FROM z-10 to z-20
              role="listbox"
            >
              {statusOptions.map((option) => (
                <div
                  key={option.value}
                  onClick={() => handleStatusSelect(option.value)}
                  className={`px-3 py-2 text-sm cursor-pointer hover:bg-indigo-50 ${
                    archivedStatus === option.value
                      ? "bg-indigo-100 text-indigo-700 font-semibold"
                      : "text-gray-800"
                  }`}
                  role="option"
                  aria-selected={archivedStatus === option.value}
                >
                  {option.label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RatingMetricFilters;
