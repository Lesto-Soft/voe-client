// src/components/features/categoryManagement/CategoryFilters.tsx
import React from "react";
import CategorySearchBar from "../../tables/CategorySearchBar"; // Adjust path

// Define the props based on what CategorySearchBar expects
interface CategoryFiltersProps {
  filterName: string;
  setFilterName: (value: string) => void;

  // For Experts multi-select
  expertIds: string[];
  setExpertIds: (ids: string[]) => void;

  // For Managers multi-select
  managerIds: string[];
  setManagerIds: (ids: string[]) => void;

  filterArchived: boolean | undefined;
  setFilterArchived: (value: boolean | undefined) => void;
}

const CategoryFilters: React.FC<CategoryFiltersProps> = (props) => {
  // Pass the props directly to the updated CategorySearchBar
  return <CategorySearchBar {...props} />;
};

export default CategoryFilters;
