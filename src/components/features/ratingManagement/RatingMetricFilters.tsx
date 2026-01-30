import React from "react";
import { ArchivedFilterStatus } from "../../../hooks/useRatingMetricManagement";
import CustomDropdown from "../../global/dropdown/CustomDropdown";
import ClearableInput from "../../global/inputs/ClearableInput";

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
        <ClearableInput
          id="filterName"
          label="Име на метрика"
          value={filterName}
          onChange={setFilterName}
          placeholder="Търси по име..."
        />
        {/* Filter by Description */}
        <ClearableInput
          id="filterDescription"
          label="Описание"
          value={filterDescription}
          onChange={setFilterDescription}
          placeholder="Търси по описание..."
        />
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
