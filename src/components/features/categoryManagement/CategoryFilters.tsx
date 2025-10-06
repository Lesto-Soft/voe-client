import React from "react";
import CategorySearchBar from "../../tables/CategorySearchBar";

interface CategoryFiltersProps {
  filterName: string;
  setFilterName: (value: string) => void;
  expertIds: string[];
  setExpertIds: (ids: string[]) => void;
  managerIds: string[];
  setManagerIds: (ids: string[]) => void;
  filterArchived: boolean | undefined;
  setFilterArchived: (value: boolean | undefined) => void;
  refetchKey?: number;
}

const CategoryFilters: React.FC<CategoryFiltersProps> = (props) => {
  return <CategorySearchBar {...props} />;
};

export default CategoryFilters;
