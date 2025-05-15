// src/pages/CategoryManagement.tsx
import React, { useState, useEffect, useMemo } from "react";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { PlusIcon as PlusIconSolid } from "@heroicons/react/20/solid";
import {
  useGetAllLeanCategories,
  useCountCategories,
  useCreateCategory,
  useUpdateCategory,
} from "../graphql/hooks/category";
import { useCountFilteredCases } from "../graphql/hooks/case"; // Assuming this is the correct path
import {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "../graphql/mutation/category";
import {
  ICategory,
  ICaseStatus as CaseStatus,
  CASE_STATUS_DISPLAY_ORDER,
} from "../db/interfaces";
import CategoryTable from "../components/features/categoryManagement/CategoryTable";
import { useCategoryManagement } from "./hooks/useCategoryManagement";
import LoadingModal from "../components/modals/LoadingModal";
import CategoryFilters from "../components/features/categoryManagement/CategoryFilters";
import CreateCategoryModal from "../components/modals/CreateCategoryModal";
import CreateCategoryForm, {
  CategoryFormData,
} from "../components/forms/CreateCategoryForm";
import CategoryStats from "../components/features/categoryManagement/CategoryStats";

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
    // filterCaseStatus, // Not used by CategoryStats directly for filtering
    // setFilterCaseStatus, // Not used by CategoryStats directly for filtering
    handlePageChange,
    handleItemsPerPageChange,
    currentQueryInput, // This is for CATEGORY filtering
  } = useCategoryManagement();

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ICategory | null>(
    null
  );
  const [formHasUnsavedChanges, setFormHasUnsavedChanges] = useState(false);
  const [showFilters, setShowFilters] = useState(true);

  // Fetching data for the category table based on currentQueryInput
  const {
    categories: categoriesData, // This is the list of categories matching currentQueryInput
    loading: categoriesListLoading,
    error: categoriesListError,
    refetch: refetchCategories,
  } = useGetAllLeanCategories(currentQueryInput);

  // Count of categories for table pagination (respects all filters from currentQueryInput)
  const {
    count: filteredCategoryCountForTable,
    loading: categoryCountLoading,
    error: categoryCountError,
    refetch: refetchCategoryCount,
  } = useCountCategories(currentQueryInput);

  // --- Fetching data for CategoryStats based on the filtered categories ---

  // 1. Extract IDs of the currently filtered categories.
  // These IDs will be used to fetch case counts specific to these categories.
  const filteredCategoryIdsForStats = useMemo(() => {
    return (categoriesData || []).map((category) => category._id);
  }, [categoriesData]);

  // 2. Determine if case stat queries should be skipped.
  // Skip if categories are still loading OR if no categories were found (and not loading).
  const skipCaseStatsQueries = useMemo(() => {
    return (
      categoriesListLoading ||
      (!categoriesListLoading && filteredCategoryIdsForStats.length === 0)
    );
  }, [categoriesListLoading, filteredCategoryIdsForStats.length]);

  // 3. Base variables for case counting, using the IDs of filtered categories.
  const baseCaseVariablesForStats = useMemo(
    () => ({
      categories: filteredCategoryIdsForStats,
      // Add any other non-status, non-pagination filters relevant for cases if your backend supports them
      // For example, if currentQueryInput had a global text search applicable to cases:
      // query: currentQueryInput.name, // Assuming category name filter could be a general case query
    }),
    [filteredCategoryIdsForStats]
  );

  // 4. Total case count for "Общо Сигнали" card (for the filtered categories)
  const {
    count: totalCaseCountForStatsRaw,
    loading: totalCaseCountLoading,
    error: totalCaseCountError,
  } = useCountFilteredCases(baseCaseVariablesForStats, {
    skip: skipCaseStatsQueries,
  });
  const totalCaseCountForStats =
    skipCaseStatsQueries && !categoriesListLoading
      ? 0
      : totalCaseCountForStatsRaw;

  // 5. Case counts for each status (for the filtered categories)
  const {
    count: openCasesRaw,
    loading: openLoading,
    error: openError,
  } = useCountFilteredCases(
    { ...baseCaseVariablesForStats, status: CaseStatus.Open },
    { skip: skipCaseStatsQueries }
  );
  const {
    count: inProgressCasesRaw,
    loading: inProgressLoading,
    error: inProgressError,
  } = useCountFilteredCases(
    { ...baseCaseVariablesForStats, status: CaseStatus.InProgress },
    { skip: skipCaseStatsQueries }
  );
  const {
    count: awaitingFinanceCasesRaw,
    loading: awaitingFinanceLoading,
    error: awaitingFinanceError,
  } = useCountFilteredCases(
    { ...baseCaseVariablesForStats, status: CaseStatus.AwaitingFinance },
    { skip: skipCaseStatsQueries }
  );
  const {
    count: closedCasesRaw,
    loading: closedLoading,
    error: closedError,
  } = useCountFilteredCases(
    { ...baseCaseVariablesForStats, status: CaseStatus.Closed },
    { skip: skipCaseStatsQueries }
  );

  const caseCountsByStatus = useMemo(
    () => ({
      [CaseStatus.Open]:
        skipCaseStatsQueries && !categoriesListLoading ? 0 : openCasesRaw,
      [CaseStatus.InProgress]:
        skipCaseStatsQueries && !categoriesListLoading ? 0 : inProgressCasesRaw,
      [CaseStatus.AwaitingFinance]:
        skipCaseStatsQueries && !categoriesListLoading
          ? 0
          : awaitingFinanceCasesRaw,
      [CaseStatus.Closed]:
        skipCaseStatsQueries && !categoriesListLoading ? 0 : closedCasesRaw,
    }),
    [
      skipCaseStatsQueries,
      categoriesListLoading,
      openCasesRaw,
      inProgressCasesRaw,
      awaitingFinanceCasesRaw,
      closedCasesRaw,
    ]
  );

  // --- End Fetching data for CategoryStats ---

  const {
    createCategory,
    loading: createCategoryLoading,
    error: createCategoryErrorObj,
  } = useCreateCategory();
  const {
    updateCategory,
    loading: updateCategoryLoading,
    error: updateCategoryErrorObj,
  } = useUpdateCategory();

  const categories: ICategory[] = categoriesData || [];

  const isInitialPageLoading = // Combined loading for initial page display
    categoriesListLoading || // Still loading the list of categories
    categoryCountLoading || // Still loading the count of categories for the table
    (!skipCaseStatsQueries && // Only consider case stats loading if queries are not skipped
      (totalCaseCountLoading ||
        openLoading ||
        inProgressLoading ||
        awaitingFinanceLoading ||
        closedLoading));

  const isTableDataRefreshing = categoriesListLoading || categoryCountLoading;
  const isStatsDataRefreshing =
    !skipCaseStatsQueries &&
    (totalCaseCountLoading ||
      openLoading ||
      inProgressLoading ||
      awaitingFinanceLoading ||
      closedLoading);

  const pageDisplayError =
    categoriesListError ||
    categoryCountError ||
    (!skipCaseStatsQueries &&
      (totalCaseCountError ||
        openError ||
        inProgressError ||
        awaitingFinanceError ||
        closedError));

  const openCreateCategoryModal = () => {
    setEditingCategory(null);
    setFormHasUnsavedChanges(false);
    setIsCategoryModalOpen(true);
  };
  const openEditCategoryModal = (categoryToEdit: ICategory) => {
    setEditingCategory(categoryToEdit);
    setFormHasUnsavedChanges(false);
    setIsCategoryModalOpen(true);
  };
  const closeCategoryModal = () => {
    setIsCategoryModalOpen(false);
    setEditingCategory(null);
    setFormHasUnsavedChanges(false);
  };

  const handleCategoryFormSubmit = async (
    formData: CategoryFormData,
    editingCategoryId: string | null
  ) => {
    const inputForMutation = {
      name: formData.name,
      problem: formData.problem,
      suggestion: formData.suggestion,
      experts: formData.expertIds,
      managers: formData.managerIds,
      archived: formData.archived,
    };
    try {
      if (editingCategoryId) {
        await updateCategory(
          editingCategoryId,
          inputForMutation as UpdateCategoryInput
        );
      } else {
        await createCategory(inputForMutation as CreateCategoryInput);
      }
      // Refetch all relevant data
      await Promise.all([
        refetchCategories(),
        refetchCategoryCount(),
        // Consider refetching case counts if category changes affect them broadly
        // For now, they refetch based on currentQueryInput changes (which triggers categoriesData change -> filteredCategoryIdsForStats -> case queries)
      ]);
      closeCategoryModal();
    } catch (err: any) {
      console.error(
        `Error during category ${editingCategoryId ? "update" : "create"}:`,
        err
      );
      throw err;
    }
  };

  // Show loading modal if any initial data is loading and there's no error yet
  if (isInitialPageLoading && !pageDisplayError) {
    return <LoadingModal message={"Зареждане на страницата..."} />;
  }
  // Show error message if any critical data fetching failed
  if (pageDisplayError) {
    return (
      <div className="p-6 text-red-600 text-center">
        Грешка при зареждане на данни: {pageDisplayError.message}
      </div>
    );
  }

  const mutationInProgress = createCategoryLoading || updateCategoryLoading;
  const mutationError = createCategoryErrorObj || updateCategoryErrorObj;

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans">
      <div className="mb-6 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <CategoryStats
          totalCaseCount={totalCaseCountForStats}
          caseCountsByStatus={caseCountsByStatus}
        />
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
          <button
            onClick={openCreateCategoryModal}
            className="w-full sm:w-auto flex flex-shrink-0 justify-center items-center px-4 py-2 rounded-lg font-semibold transition-colors duration-150 bg-green-500 text-white hover:bg-green-600 hover:cursor-pointer active:bg-green-700 active:shadow-inner disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={
              mutationInProgress ||
              isTableDataRefreshing ||
              isStatsDataRefreshing
            }
          >
            <PlusIconSolid className="h-5 w-5 mr-1" />
            Създай Категория
          </button>
        </div>
      </div>

      <div
        className={`transition-all duration-300 ease-in-out ${
          showFilters
            ? "max-h-screen opacity-100 mb-6"
            : "max-h-0 opacity-0 overflow-hidden"
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
        categoriesError={categoriesListError || categoryCountError}
        totalCategoryCount={filteredCategoryCountForTable || 0}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
        onEditCategory={openEditCategoryModal}
        currentQueryInput={currentQueryInput}
        createLoading={createCategoryLoading}
        updateLoading={updateCategoryLoading}
      />

      <CreateCategoryModal
        isOpen={isCategoryModalOpen}
        onClose={closeCategoryModal}
        title={
          editingCategory ? "Редактирай категория" : "Създай нова категория"
        }
        hasUnsavedChanges={formHasUnsavedChanges}
      >
        {mutationInProgress && (
          <div className="p-4 text-center">Изпращане...</div>
        )}
        {mutationError && !mutationInProgress && (
          <div className="p-4 mb-4 text-center text-red-600 bg-red-100 rounded-md">
            Грешка при запис: {mutationError.message || "Неизвестна грешка"}
          </div>
        )}
        {!mutationInProgress && (
          <CreateCategoryForm
            key={editingCategory ? editingCategory._id : "create-new-category"}
            onSubmit={handleCategoryFormSubmit}
            onClose={closeCategoryModal}
            initialData={editingCategory}
            submitButtonText={
              editingCategory ? "Запази промените" : "Създай категория"
            }
            isSubmitting={mutationInProgress}
            onDirtyChange={setFormHasUnsavedChanges}
          />
        )}
      </CreateCategoryModal>
    </div>
  );
};

export default CategoryManagement;
