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
  // CASE_STATUS_DISPLAY_ORDER, // Not used in this file snippet
} from "../db/interfaces";
import CategoryTable from "../components/features/categoryManagement/CategoryTable";
import { useCategoryManagement } from "./hooks/useCategoryManagement"; // Ensure this path is correct
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

  // State to track if the initial full page load has completed
  const [isInitialAppLoadComplete, setIsInitialAppLoadComplete] =
    useState(false);

  // Fetching data for the category table based on currentQueryInput
  const {
    categories: categoriesData,
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
  const filteredCategoryIdsForStats = useMemo(() => {
    return (categoriesData || []).map((category) => category._id);
  }, [categoriesData]);

  const skipCaseStatsQueries = useMemo(() => {
    return (
      categoriesListLoading || // if category list is loading, case stats depend on it
      (!categoriesListLoading && filteredCategoryIdsForStats.length === 0)
    );
  }, [categoriesListLoading, filteredCategoryIdsForStats.length]);

  const baseCaseVariablesForStats = useMemo(
    () => ({
      categories: filteredCategoryIdsForStats,
      ...(currentQueryInput.expertIds &&
        currentQueryInput.expertIds.length > 0 && {
          experts: currentQueryInput.expertIds,
        }),
      ...(currentQueryInput.managerIds &&
        currentQueryInput.managerIds.length > 0 && {
          managers: currentQueryInput.managerIds,
        }),
    }),
    [
      filteredCategoryIdsForStats,
      currentQueryInput.expertIds,
      currentQueryInput.managerIds,
    ]
  );

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

  // Determine if any critical data is currently being loaded
  const isCurrentlyLoadingPageData = useMemo(
    () =>
      categoriesListLoading ||
      categoryCountLoading ||
      (!skipCaseStatsQueries && // Only consider case stats loading if queries are not skipped
        (totalCaseCountLoading ||
          openLoading ||
          inProgressLoading ||
          awaitingFinanceLoading ||
          closedLoading)),
    [
      categoriesListLoading,
      categoryCountLoading,
      skipCaseStatsQueries,
      totalCaseCountLoading,
      openLoading,
      inProgressLoading,
      awaitingFinanceLoading,
      closedLoading,
    ]
  );

  // Consolidate all potential page-blocking errors
  const pageDisplayError = useMemo(
    () =>
      categoriesListError ||
      categoryCountError ||
      (!skipCaseStatsQueries &&
        (totalCaseCountError || // Including stats errors in pageDisplayError
          openError ||
          inProgressError ||
          awaitingFinanceError ||
          closedError)),
    [
      categoriesListError,
      categoryCountError,
      skipCaseStatsQueries,
      totalCaseCountError,
      openError,
      inProgressError,
      awaitingFinanceError,
      closedError,
    ]
  );

  // Effect to mark initial app load as complete
  useEffect(() => {
    if (
      !isInitialAppLoadComplete &&
      !isCurrentlyLoadingPageData &&
      !pageDisplayError
    ) {
      setIsInitialAppLoadComplete(true);
    }
  }, [isInitialAppLoadComplete, isCurrentlyLoadingPageData, pageDisplayError]);

  const isTableDataRefreshing = categoriesListLoading || categoryCountLoading;
  const isStatsDataRefreshing =
    !skipCaseStatsQueries &&
    (totalCaseCountLoading ||
      openLoading ||
      inProgressLoading ||
      awaitingFinanceLoading ||
      closedLoading);

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
      await Promise.all([refetchCategories(), refetchCategoryCount()]);
      closeCategoryModal();
    } catch (err: any) {
      console.error(
        `Error during category ${editingCategoryId ? "update" : "create"}:`,
        err
      );
      throw err; // Re-throw to be caught by form's error handling if needed
    }
  };

  // Updated condition for the main LoadingModal
  if (
    !isInitialAppLoadComplete &&
    isCurrentlyLoadingPageData &&
    !pageDisplayError
  ) {
    return <LoadingModal message={"Зареждане на страницата..."} />;
  }

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
          isLoading={isStatsDataRefreshing || isTableDataRefreshing}
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
            className="w-full sm:w-auto flex flex-shrink-0 justify-center items-center px-4 py-2 rounded-lg font-semibold transition-colors duration-150 bg-green-500 text-white hover:bg-green-600 hover:cursor-pointer active:bg-green-700 active:shadow-inner disabled:cursor-not-allowed"
            disabled={
              mutationInProgress
              //|| isTableDataRefreshing || // Disable if table data is refreshing
              // isStatsDataRefreshing // Disable if stats data is refreshing
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
        isLoadingCategories={isTableDataRefreshing} // This will show CategoryTableSkeleton
        categoriesError={categoriesListError || categoryCountError} // Pass relevant error
        totalCategoryCount={filteredCategoryCountForTable || 0}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
        onEditCategory={openEditCategoryModal}
        currentQueryInput={currentQueryInput} // Pass the current filters/pagination for context if needed
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
