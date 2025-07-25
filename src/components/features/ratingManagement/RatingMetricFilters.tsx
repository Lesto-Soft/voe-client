// src/components/features/ratingManagement/RatingMetricFilters.tsx
import React from "react";
import { ArchivedFilterStatus } from "../../../hooks/useRatingMetricManagement";
import CustomDropdown from "../../global/CustomDropdown"; // 1. Import the new component

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
            className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
            className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Търси по описание..."
          />
        </div>

        {/* 2. Replace the entire old dropdown with the new component */}
        <CustomDropdown
          label="Статус"
          options={statusOptions}
          value={archivedStatus}
          onChange={setArchivedStatus}
          widthClass="w-full"
        />
      </div>
    </div>
  );
};

export default RatingMetricFilters;
