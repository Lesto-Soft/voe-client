// src/pages/CategoryManagement.tsx
import React, { useState, useEffect, useMemo } from "react";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { PlusIcon as PlusIconSolid } from "@heroicons/react/20/solid";
import {
  useGetAllLeanCategories,
  useCountCategories,
  useCreateCategory,
  useUpdateCategory,
} from "../graphql/hooks/category"; // Adjust path as needed
import { useCountFilteredCases, useCountCases } from "../graphql/hooks/case"; // Adjust path as needed
import {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "../graphql/mutation/category"; // Adjust path as needed
import { ICategory, ICaseStatus as CaseStatus } from "../db/interfaces"; // Adjust path as needed, ensure ICaseItem is defined
import CategoryTable from "../components/features/categoryManagement/CategoryTable"; // Adjust path as needed
import {
  useCategoryManagement,
  CategoryQueryApiParams,
} from "./hooks/useCategoryManagement"; // Adjust path as needed
import LoadingModal from "../components/modals/LoadingModal"; // Adjust path as needed
import CategoryFilters from "../components/features/categoryManagement/CategoryFilters"; // Adjust path as needed
import CreateCategoryModal from "../components/modals/CreateCategoryModal"; // Adjust path as needed
import CreateCategoryForm, {
  CategoryFormData,
} from "../components/forms/CreateCategoryForm"; // Adjust path as needed
import CategoryStats from "../components/features/categoryManagement/CategoryStats"; // Adjust path as needed

const CategoryManagement: React.FC = () => {
  const {
    currentPage, // UI current page (1-indexed)
    itemsPerPage,
    filterName,
    setFilterName,
    filterExpertIds,
    setFilterExpertIds,
    filterManagerIds,
    setFilterManagerIds,
    filterArchived,
    setFilterArchived,
    filterCaseStatus, // This is your client-side case status filter state
    setFilterCaseStatus,
    handlePageChange, // This function should set the currentPage state
    handleItemsPerPageChange,
    currentQueryInput, // Contains backend filters (name, expert, etc.) + pagination
  } = useCategoryManagement();

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ICategory | null>(
    null
  );
  const [formHasUnsavedChanges, setFormHasUnsavedChanges] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [isInitialAppLoadComplete, setIsInitialAppLoadComplete] =
    useState(false);

  // Query input that EXCLUDES pagination parameters - used for fetching ALL categories matching backend filters
  const categoryFiltersWithoutPagination = useMemo((): Omit<
    CategoryQueryApiParams,
    "itemsPerPage" | "currentPage"
  > => {
    const {
      itemsPerPage: _itemsPerPage,
      currentPage: _currentPage,
      ...filters
    } = currentQueryInput;
    return filters; // These are the backend filters (name, expert, etc.)
  }, [currentQueryInput]);

  // 1. Fetching categories for the TABLE (paginated, based on backend filters)
  // This data is primarily used when filterCaseStatus is NOT active.
  const {
    categories: rawCategoriesDataForTable,
    loading: categoriesListLoading,
    error: categoriesListError,
    refetch: refetchCategoriesForTable,
  } = useGetAllLeanCategories(currentQueryInput);

  // 2. Count of categories matching backend filters for TABLE pagination total (BEFORE client-side caseStatus filter)
  // This count is used when filterCaseStatus is NOT active.
  const {
    count: backendFilteredCategoryCountForTable,
    loading: categoryCountLoadingForTable,
    error: categoryCountErrorForTable,
    refetch: refetchCategoryCountForTable,
  } = useCountCategories(currentQueryInput);

  // 3. Fetch ALL categories that match the current backend filters (NOT paginated)
  // This is the master list for client-side filtering by caseStatus and for stats.
  const {
    categories: allCategoriesMatchingBackendFilters, // Contains all categories matching backend filters (name, expert, etc.)
    loading: allFilteredCategoriesLoading, // Loading state for this complete list
    error: allFilteredCategoriesError,
    refetch: refetchAllFilteredCategoriesForStats, // Also used for stats
  } = useGetAllLeanCategories(
    categoryFiltersWithoutPagination as CategoryQueryApiParams // Uses filters without pagination
  );

  // Derived list: ALL categories after applying client-side caseStatus filter
  const clientFilteredAllCategories = useMemo(() => {
    // If case status filter is not active, this list isn't used for table pagination (backend pagination takes over).
    // However, it's cleaner to define it based on whether the filter is active.
    // If the base list is loading, return empty to avoid errors during filtering.
    if (allFilteredCategoriesLoading && filterCaseStatus) {
      return [];
    }
    if (!filterCaseStatus) {
      // If no client filter, this list conceptually contains all items matching backend filters.
      // For pagination purposes, this isn't directly used if filterCaseStatus is off.
      return allCategoriesMatchingBackendFilters || [];
    }
    return (allCategoriesMatchingBackendFilters || []).filter((category) =>
      category.cases?.some((caseItem) => caseItem.status === filterCaseStatus)
    );
  }, [
    allCategoriesMatchingBackendFilters,
    filterCaseStatus,
    allFilteredCategoriesLoading,
  ]);

  // Calculate the effective total category count for table pagination
  const effectiveTotalCategoryCountForTable = useMemo(() => {
    if (!filterCaseStatus) {
      // No client-side filter, use the count directly from the backend.
      return backendFilteredCategoryCountForTable ?? 0;
    }
    // Client-side filter is active. The total count is the length of the `clientFilteredAllCategories`.
    // Must check if the base list for this filtering is still loading.
    if (allFilteredCategoriesLoading) {
      return 0; // Or another indicator that the count is not yet accurate
    }
    return clientFilteredAllCategories.length;
  }, [
    filterCaseStatus,
    backendFilteredCategoryCountForTable,
    clientFilteredAllCategories,
    allFilteredCategoriesLoading,
  ]);

  // Determine categories to display on the current page
  const displayCategoriesForTable = useMemo(() => {
    if (!filterCaseStatus) {
      // No client-side case status filter, use backend-paginated data as is.
      return rawCategoriesDataForTable || [];
    }

    // Client-side case status filter is active. Paginate the `clientFilteredAllCategories` list.
    // Ensure the base list for this client-side pagination is not loading.
    if (allFilteredCategoriesLoading) {
      return [];
    }
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return clientFilteredAllCategories.slice(startIndex, endIndex);
  }, [
    rawCategoriesDataForTable, // Used when no filterCaseStatus
    filterCaseStatus,
    clientFilteredAllCategories, // Used when filterCaseStatus is active
    currentPage,
    itemsPerPage,
    allFilteredCategoriesLoading, // Important dependency for client-side pagination logic
  ]);

  // For CategoryStats - uses the same unpaginated list matching backend filters
  const allFilteredCategoriesForStatsData = allCategoriesMatchingBackendFilters;

  const allMatchingCategoryIdsForStats = useMemo(() => {
    return (allFilteredCategoriesForStatsData || []).map(
      (category) => category._id
    );
  }, [allFilteredCategoriesForStatsData]);

  const activeCategoryFiltersExistForStats = useMemo(
    () =>
      Object.values(categoryFiltersWithoutPagination).some(
        // categoryFiltersWithoutPagination has name, expert, manager, archived from currentQueryInput
        (val) =>
          val !== undefined &&
          (Array.isArray(val) ? val.length > 0 : String(val).trim().length > 0)
      ),
    [categoryFiltersWithoutPagination]
  );

  const skipCaseStatsQueries = useMemo(() => {
    if (allFilteredCategoriesLoading) return true;
    if (
      activeCategoryFiltersExistForStats &&
      allMatchingCategoryIdsForStats.length === 0
    ) {
      return true;
    }
    return false;
  }, [
    allFilteredCategoriesLoading,
    allMatchingCategoryIdsForStats.length,
    activeCategoryFiltersExistForStats,
  ]);

  const baseCaseVariablesForStats = useMemo(() => {
    const baseVars: {
      categories?: string[];
      experts?: string[];
      managers?: string[];
      archived?: boolean;
      name?: string;
    } = {};
    if (allMatchingCategoryIdsForStats.length > 0) {
      baseVars.categories = allMatchingCategoryIdsForStats;
    } else if (activeCategoryFiltersExistForStats) {
      baseVars.categories = [];
    }

    // These filters (name, experts, etc.) defined `allMatchingCategoryIdsForStats`
    // If `useCountFilteredCases` can use these to refine its own query on cases related to these category IDs:
    if (categoryFiltersWithoutPagination.name) {
      baseVars.name = categoryFiltersWithoutPagination.name;
    }
    if (
      categoryFiltersWithoutPagination.expertIds &&
      categoryFiltersWithoutPagination.expertIds.length > 0
    ) {
      baseVars.experts = categoryFiltersWithoutPagination.expertIds;
    }
    if (
      categoryFiltersWithoutPagination.managerIds &&
      categoryFiltersWithoutPagination.managerIds.length > 0
    ) {
      baseVars.managers = categoryFiltersWithoutPagination.managerIds;
    }
    if (categoryFiltersWithoutPagination.archived !== undefined) {
      baseVars.archived = categoryFiltersWithoutPagination.archived;
    }
    return baseVars;
  }, [
    allMatchingCategoryIdsForStats,
    categoryFiltersWithoutPagination,
    activeCategoryFiltersExistForStats,
  ]);

  const {
    count: totalCaseCountForStats,
    loading: totalCaseCountLoading,
    error: totalCaseCountError,
  } = useCountFilteredCases(baseCaseVariablesForStats, {
    skip: skipCaseStatsQueries,
  });

  const {
    count: absoluteTotalCaseCountAllTime,
    loading: absoluteTotalCaseCountLoading,
    error: absoluteTotalCaseCountError,
  } = useCountCases();

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
        skipCaseStatsQueries || allFilteredCategoriesLoading || openLoading
          ? 0
          : openCasesRaw,
      [CaseStatus.InProgress]:
        skipCaseStatsQueries ||
        allFilteredCategoriesLoading ||
        inProgressLoading
          ? 0
          : inProgressCasesRaw,
      [CaseStatus.AwaitingFinance]:
        skipCaseStatsQueries ||
        allFilteredCategoriesLoading ||
        awaitingFinanceLoading
          ? 0
          : awaitingFinanceCasesRaw,
      [CaseStatus.Closed]:
        skipCaseStatsQueries || allFilteredCategoriesLoading || closedLoading
          ? 0
          : closedCasesRaw,
    }),
    [
      skipCaseStatsQueries,
      allFilteredCategoriesLoading,
      openLoading,
      inProgressLoading,
      awaitingFinanceLoading,
      closedLoading,
      openCasesRaw,
      inProgressCasesRaw,
      awaitingFinanceCasesRaw,
      closedCasesRaw,
    ]
  );

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

  const isLoadingOverallCaseCounts =
    totalCaseCountLoading ||
    absoluteTotalCaseCountLoading ||
    allFilteredCategoriesLoading;
  const isLoadingStatusSpecificCaseCounts =
    openLoading ||
    inProgressLoading ||
    awaitingFinanceLoading ||
    closedLoading ||
    allFilteredCategoriesLoading;

  const isCurrentlyLoadingPageData = useMemo(
    () =>
      categoriesListLoading ||
      categoryCountLoadingForTable ||
      allFilteredCategoriesLoading ||
      totalCaseCountLoading ||
      openLoading ||
      inProgressLoading ||
      awaitingFinanceLoading ||
      closedLoading ||
      absoluteTotalCaseCountLoading,
    [
      categoriesListLoading,
      categoryCountLoadingForTable,
      allFilteredCategoriesLoading,
      totalCaseCountLoading,
      openLoading,
      inProgressLoading,
      awaitingFinanceLoading,
      closedLoading,
      absoluteTotalCaseCountLoading,
    ]
  );

  const pageDisplayError = useMemo(
    () =>
      categoriesListError ||
      categoryCountErrorForTable ||
      allFilteredCategoriesError ||
      totalCaseCountError ||
      openError ||
      inProgressError ||
      awaitingFinanceError ||
      closedError ||
      absoluteTotalCaseCountError,
    [
      categoriesListError,
      categoryCountErrorForTable,
      allFilteredCategoriesError,
      totalCaseCountError,
      openError,
      inProgressError,
      awaitingFinanceError,
      closedError,
      absoluteTotalCaseCountError,
    ]
  );

  useEffect(() => {
    if (
      !isInitialAppLoadComplete &&
      !isCurrentlyLoadingPageData &&
      !pageDisplayError
    ) {
      setIsInitialAppLoadComplete(true);
    }
  }, [isInitialAppLoadComplete, isCurrentlyLoadingPageData, pageDisplayError]);

  const isTableDataRefreshing = useMemo(() => {
    if (filterCaseStatus) {
      // When client-side filtering by case status is active, table refreshes if the full list for client pagination is loading
      return allFilteredCategoriesLoading;
    }
    // Otherwise, depends on the backend paginated fetch for the current page
    return categoriesListLoading || categoryCountLoadingForTable;
  }, [
    filterCaseStatus,
    allFilteredCategoriesLoading,
    categoriesListLoading,
    categoryCountLoadingForTable,
  ]);

  const handleCaseStatusCardClick = (status: CaseStatus | string) => {
    const newStatus =
      filterCaseStatus === status ? null : (status as CaseStatus);
    setFilterCaseStatus(newStatus);
    // Reset to page 1 whenever the case status filter changes,
    // as the total number of items and pages will change.
    if (handlePageChange) {
      // Ensure handlePageChange is available from the hook
      handlePageChange(1);
    }
  };

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
      problem: formData.problem || "", // Ensure problem/suggestion are at least empty strings if not optional in backend
      suggestion: formData.suggestion || "",
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
      await Promise.all([
        refetchCategoriesForTable(),
        refetchCategoryCountForTable(),
        refetchAllFilteredCategoriesForStats(),
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

  if (
    !isInitialAppLoadComplete &&
    isCurrentlyLoadingPageData &&
    !pageDisplayError
  ) {
    return <LoadingModal message={"Зареждане на страницата..."} />;
  }

  if (pageDisplayError) {
    const errorMessages = [
      categoriesListError?.message,
      categoryCountErrorForTable?.message,
      allFilteredCategoriesError?.message,
      totalCaseCountError?.message,
      openError?.message,
      inProgressError?.message,
      awaitingFinanceError?.message,
      closedError?.message,
      absoluteTotalCaseCountError?.message,
    ]
      .filter(Boolean)
      .join("; ");
    return (
      <div className="p-6 text-red-600 text-center">
        Грешка при зареждане на данни: {errorMessages || "Неизвестна грешка."}
      </div>
    );
  }

  const mutationInProgress = createCategoryLoading || updateCategoryLoading;
  const mutationError = createCategoryErrorObj || updateCategoryErrorObj;

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans">
      <div className="mb-6 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <CategoryStats
          totalCaseCount={totalCaseCountForStats ?? 0}
          absoluteTotalCaseCountAllTime={absoluteTotalCaseCountAllTime ?? 0}
          caseCountsByStatus={caseCountsByStatus}
          activeCaseStatusFilter={filterCaseStatus}
          onCaseStatusCardClick={handleCaseStatusCardClick}
          isLoadingOverallCounts={isLoadingOverallCaseCounts}
          isLoadingStatusSpecificCounts={isLoadingStatusSpecificCaseCounts}
        />
        <div className="flex flex-col sm:flex-row gap-2 items-center md:items-start flex-shrink-0 mt-4 md:mt-0">
          <button
            type="button"
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
            type="button"
            onClick={openCreateCategoryModal}
            className="w-full sm:w-auto flex flex-shrink-0 justify-center items-center px-4 py-2 rounded-lg font-semibold transition-colors duration-150 bg-green-500 text-white hover:bg-green-600 hover:cursor-pointer active:bg-green-700 active:shadow-inner disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={mutationInProgress || isCurrentlyLoadingPageData}
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
        categories={displayCategoriesForTable}
        isLoadingCategories={isTableDataRefreshing}
        categoriesError={
          categoriesListError ||
          categoryCountErrorForTable ||
          allFilteredCategoriesError
        }
        totalCategoryCount={effectiveTotalCategoryCountForTable}
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
