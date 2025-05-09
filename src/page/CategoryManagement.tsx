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

const CategoryManagement: React.FC = () => {
  const {
    currentPage,
    itemsPerPage,
    handlePageChange,
    handleItemsPerPageChange,
    //... other state and functions
    currentQueryInput,
  } = useCategoryManagement();

  // Modal State
  const [showFilters, setShowFilters] = useState(true);

  const {
    categories: categoriesData,
    loading: categoriesLoading,
    error: categoriesError,
    refetch: refetchCategories,
  } = useGetAllLeanCategories(currentQueryInput);
  const {
    count: filteredCategoryCount,
    loading: countLoading,
    error: countError,
    refetch: refetchCategoryCount,
  } = useCountCategories(currentQueryInput);

  const categories: ICategory[] = categoriesData || [];
  const totalCategoryCountFromQuery: number = filteredCategoryCount || 0;
  console.log("Filtered Category Count:", filteredCategoryCount);

  console.log("Current Page (UI):", currentPage);
  console.log("Query Input for API:", currentQueryInput);
  console.log("Fetched Categories:", categories);
  console.log("Total Count from Query:", totalCategoryCountFromQuery);
  console.log("Loading:", categoriesLoading);
  console.log("Error:", categoriesError);

  // Combined loading/error for table data
  const isLoadingTableData = categoriesLoading;
  const tableDataError = categoriesError;

  // Determine if any text filter is active
  const hasActiveTextFilters = useMemo(() => {
    return !!(
      currentQueryInput.name ||
      currentQueryInput.experts ||
      currentQueryInput.managers ||
      currentQueryInput.archived
    );
  }, [currentQueryInput]);

  if (isLoadingTableData) {
    return <LoadingModal message={"Зареждане..."} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans">
      <div className="mb-6 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        {/* Action Buttons */}
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
          {/* <button
            onClick={openCreateModal}
            className="w-full sm:w-auto flex flex-shrink-0 justify-center items-center px-4 py-2 rounded-lg font-semibold transition-colors duration-150 bg-green-500 text-white hover:bg-green-600 hover:cursor-pointer active:bg-green-700 active:shadow-inner disabled:cursor-not-allowed"
            disabled={
              createLoading ||
              updateLoading ||
              usersLoading ||
              countLoading ||
              rolesLoadingHook ||
              absoluteTotalLoading
            }
          >
            <PlusIconSolid className="h-5 w-5 mr-1" />
            Създай Потребител
          </button> */}
        </div>
      </div>

      <CategoryTable
        categories={categories || []}
        isLoadingCategories={isLoadingTableData}
        categoriesError={tableDataError}
        totalCategoryCount={filteredCategoryCount || 0}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
        onEditCategory={() => {}}
        currentQueryInput={currentQueryInput}
        createLoading={false}
        updateLoading={false}
        // onEditCategory={openEditModal}
        // createLoading={createLoading}
        // updateLoading={updateLoading}
      />
    </div>
  );
};

export default CategoryManagement;
