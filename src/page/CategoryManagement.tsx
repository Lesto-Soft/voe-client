// src/pages/CategoryManagement.tsx
import React, { useState, useMemo } from "react";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import {
  useCountCategories,
  useGetAllLeanCategories,
} from "../graphql/hooks/category";
import { ICategory } from "../db/interfaces";
import CategoryTable from "../components/features/categoryManagement/CategoryTable";
import { useCategoryManagement } from "./hooks/useCategoryManagement";
import LoadingModal from "../components/modals/LoadingModal";
import CategoryFilters from "../components/features/categoryManagement/CategoryFilters";

const CategoryManagement: React.FC = () => {
  const {
    currentPage,
    itemsPerPage,
    filterName,
    setFilterName,
    filterExpertIds,
    setFilterExpertIds,
    filterManagerIds,
    setFilterManagerIds,
    filterArchived,
    setFilterArchived,
    handlePageChange,
    handleItemsPerPageChange,
    currentQueryInput,
  } = useCategoryManagement();

  const [showFilters, setShowFilters] = useState(true);

  const {
    categories: categoriesData,
    loading: categoriesListLoading,
    error: categoriesListError,
  } = useGetAllLeanCategories(currentQueryInput);

  const {
    count: filteredCategoryCount,
    loading: categoryCountLoading,
    error: categoryCountError,
  } = useCountCategories(currentQueryInput);

  const categories: ICategory[] = categoriesData || [];

  const isInitialPageLoad =
    categoriesListLoading &&
    !categoriesData &&
    categoryCountLoading &&
    (filteredCategoryCount === undefined || filteredCategoryCount === 0);

  const isTableDataRefreshing = categoriesListLoading || categoryCountLoading;
  const tableDisplayError = categoriesListError || categoryCountError;

  if (isInitialPageLoad) {
    return <LoadingModal message={"Зареждане на страницата..."} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans">
      <div className="mb-6 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div></div> {/* Placeholder for left content */}
        <div className="flex flex-col sm:flex-row gap-2 items-center md:items-start flex-shrink-0 mt-4 md:mt-0">
          <button
            className="w-full sm:w-auto flex justify-center items-center px-4 py-2 rounded-lg font-semibold transition-colors duration-150 bg-gray-500 text-white hover:bg-gray-600 hover:cursor-pointer"
            title={showFilters ? "Скрий филтри" : "Покажи филтри"}
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? (
              <ChevronUpIcon className="h-5 w-5 mr-1" />
            ) : (
              <ChevronDownIcon className="h-5 w-5 mr-1" />
            )}
            Филтри
          </button>
        </div>
      </div>

      {/* Filter Section - Conditionally Rendered */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          showFilters
            ? "max-h-screen opacity-100 mb-6" // When shown, overflow is not hidden by default
            : "max-h-0 opacity-0 overflow-hidden" // When hidden, apply overflow-hidden
        }`}
      >
        <CategoryFilters
          filterName={filterName}
          setFilterName={setFilterName}
          expertIds={filterExpertIds}
          setExpertIds={setFilterExpertIds}
          managerIds={filterManagerIds}
          setManagerIds={setFilterManagerIds}
          filterArchived={filterArchived}
          setFilterArchived={setFilterArchived}
        />
      </div>

      <CategoryTable
        categories={categories}
        isLoadingCategories={isTableDataRefreshing}
        categoriesError={tableDisplayError}
        totalCategoryCount={filteredCategoryCount || 0}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
        onEditCategory={() => {
          /* Placeholder */
        }}
        currentQueryInput={currentQueryInput}
        createLoading={false}
        updateLoading={false}
      />
    </div>
  );
};

export default CategoryManagement;
