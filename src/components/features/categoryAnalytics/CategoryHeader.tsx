// src/components/features/categoryAnalytics/CategoryHeader.tsx
import React from "react";

interface CategoryHeaderProps {
  isArchived?: boolean;
  categoryName?: string; // Potentially for displaying the category name in the future
}

const CategoryHeader: React.FC<CategoryHeaderProps> = ({ isArchived }) => {
  if (!isArchived) {
    return null; // Don't render anything if the category is not archived
  }

  return (
    <header className="bg-white shadow-md rounded-lg p-4 sm:p-6 mb-6">
      {/* You can add category name display here if needed in the future */}
      {/* {categoryName && <h1 className="text-2xl font-bold text-gray-800 mb-2">{categoryName}</h1>} */}
      <span className="ml-2 text-xl font-medium text-red-600 bg-red-100 px-3 py-1.5 rounded-md">
        Архивирана Категория
      </span>
    </header>
  );
};

export default CategoryHeader;
