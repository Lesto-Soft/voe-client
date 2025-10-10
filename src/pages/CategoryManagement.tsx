import React, { useState, useEffect, useMemo } from "react";
import {
  ChevronUpIcon,
  ChevronDownIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { PlusIcon as PlusIconSolid } from "@heroicons/react/20/solid";
import {
  useGetAllLeanCategories,
  useCountCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "../graphql/hooks/category"; // Adjust path as needed
import { useCountFilteredCases, useCountCases } from "../graphql/hooks/case"; // Adjust path as needed
import {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "../graphql/mutation/category"; // Adjust path as needed
import {
  ICategory,
  ICaseStatus as CaseStatus,
  IPaletteColor,
} from "../db/interfaces"; // Adjust path as needed, Added IUser
import CategoryTable from "../components/features/categoryManagement/CategoryTable"; // Adjust path as needed
import {
  useCategoryManagement,
  CategoryQueryApiParams,
} from "../hooks/useCategoryManagement"; // Adjust path as needed
import CategoryFilters from "../components/features/categoryManagement/CategoryFilters"; // Adjust path as needed
import CategoryModal from "../components/modals/CategoryModal"; // Adjust path as needed
import CategoryForm, {
  CategoryFormData,
} from "../components/forms/CategoryForm"; // Adjust path as needed
import CategoryStats from "../components/features/categoryManagement/CategoryStats"; // Adjust path as needed
import ConfirmActionDialog from "../components/modals/ConfirmActionDialog";
import SuccessConfirmationModal from "../components/modals/SuccessConfirmationModal";
// Assuming you might need to fetch users for the CreateCategoryForm
import { useQuery } from "@apollo/client";
import { GET_LEAN_USERS } from "../graphql/query/user"; // Adjust path for GET_LEAN_USERS

import { useCurrentUser } from "../context/UserContext"; // <-- NEW: Import current user hook
import { IMe } from "../db/interfaces"; // <-- NEW: Import IMe
import { ROLES } from "../utils/GLOBAL_PARAMETERS";

// import { PREDEFINED_CATEGORY_COLORS } from "../utils/colors";
import { useGetAllPaletteColors } from "../graphql/hooks/colorPalette";
import ClearFiltersButton from "../components/global/ClearFiltersButton";

// Define a lean user type that includes the role ID, matching GET_LEAN_USERS
interface ILeanUserForForm {
  _id: string;
  name: string;
  username: string;
  role: { _id: string } | null;
  // We don't need expert_categories or managed_categories for the form's assignable users list,
  // only for the filters. The form filters by role ID.
}

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
    filterCaseStatus,
    setFilterCaseStatus,
    handlePageChange,
    handleItemsPerPageChange,
    currentQueryInput,
  } = useCategoryManagement();

  const handleClearAllFilters = () => {
    setFilterName("");
    setFilterExpertIds([]);
    setFilterManagerIds([]);
    setFilterArchived(undefined);
    setFilterCaseStatus(null);
    handlePageChange(1);
  };

  const currentUser = useCurrentUser() as IMe | undefined;
  const isAdmin = currentUser?.role?._id === ROLES.ADMIN;

  const {
    paletteColors: fetchedPaletteColors,
    loading: paletteColorsLoading,
    error: paletteColorsError,
  } = useGetAllPaletteColors();

  const [paletteColors, setPaletteColors] = useState<IPaletteColor[]>([]);

  useEffect(() => {
    if (fetchedPaletteColors) {
      setPaletteColors((prevColors) => {
        if (
          JSON.stringify(prevColors) !== JSON.stringify(fetchedPaletteColors)
        ) {
          return fetchedPaletteColors;
        }
        return prevColors;
      });
    }
  }, [fetchedPaletteColors]);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ICategory | null>(
    null
  );
  const [formHasUnsavedChanges, setFormHasUnsavedChanges] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [isInitialAppLoadComplete, setIsInitialAppLoadComplete] =
    useState(false);
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<ICategory | null>(
    null
  );
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successModalMessage, setSuccessModalMessage] = useState("");
  const [isBannerVisible, setIsBannerVisible] = useState(true);

  const [userFilterRefreshKey, setUserFilterRefreshKey] = useState(0);

  const {
    data: allUsersDataForForm,
    loading: allUsersForFormLoading,
    error: allUsersForFormError,
    refetch: refetchAllUsersForForm,
  } = useQuery<{ getLeanUsers: ILeanUserForForm[] }>(GET_LEAN_USERS, {
    variables: { input: "" },
    fetchPolicy: "cache-and-network",
  });

  const categoryFiltersWithoutPagination = useMemo((): Omit<
    CategoryQueryApiParams,
    "itemsPerPage" | "currentPage"
  > => {
    const {
      itemsPerPage: _itemsPerPage,
      currentPage: _currentPage,
      ...filters
    } = currentQueryInput;
    return filters;
  }, [currentQueryInput]);

  const {
    categories: rawCategoriesDataForTable,
    loading: categoriesListLoading,
    error: categoriesListError,
    refetch: refetchCategoriesForTable,
  } = useGetAllLeanCategories(currentQueryInput);

  const {
    count: backendFilteredCategoryCountForTable,
    loading: categoryCountLoadingForTable,
    error: categoryCountErrorForTable,
    refetch: refetchCategoryCountForTable,
  } = useCountCategories(currentQueryInput);

  const {
    categories: allCategoriesMatchingBackendFilters,
    loading: allFilteredCategoriesLoading,
    error: allFilteredCategoriesError,
    refetch: refetchAllFilteredCategoriesForStats,
  } = useGetAllLeanCategories(
    categoryFiltersWithoutPagination as CategoryQueryApiParams
  );

  const clientFilteredAllCategories = useMemo(() => {
    if (allFilteredCategoriesLoading && filterCaseStatus) {
      return [];
    }
    if (!filterCaseStatus) {
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

  const effectiveTotalCategoryCountForTable = useMemo(() => {
    if (!filterCaseStatus) {
      return backendFilteredCategoryCountForTable ?? 0;
    }
    if (allFilteredCategoriesLoading) {
      return 0;
    }
    return clientFilteredAllCategories.length;
  }, [
    filterCaseStatus,
    backendFilteredCategoryCountForTable,
    clientFilteredAllCategories,
    allFilteredCategoriesLoading,
  ]);

  const displayCategoriesForTable = useMemo(() => {
    if (!filterCaseStatus) {
      return rawCategoriesDataForTable || [];
    }
    if (allFilteredCategoriesLoading) {
      return [];
    }
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return clientFilteredAllCategories.slice(startIndex, endIndex);
  }, [
    rawCategoriesDataForTable,
    filterCaseStatus,
    clientFilteredAllCategories,
    currentPage,
    itemsPerPage,
    allFilteredCategoriesLoading,
  ]);

  const allFilteredCategoriesForStatsData = allCategoriesMatchingBackendFilters;

  const allMatchingCategoryIdsForStats = useMemo(() => {
    return (allFilteredCategoriesForStatsData || []).map(
      (category) => category._id
    );
  }, [allFilteredCategoriesForStatsData]);

  const activeCategoryFiltersExistForStats = useMemo(
    () =>
      Object.values(categoryFiltersWithoutPagination).some(
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

  const misconfiguredCategoriesCount = useMemo(() => {
    if (!allCategoriesMatchingBackendFilters) {
      return 0;
    }
    return allCategoriesMatchingBackendFilters.filter(
      (category) =>
        !category.archived &&
        (!category.experts ||
          category.experts.length === 0 || // changed to OR
          !category.managers ||
          category.managers.length === 0)
    ).length;
  }, [allCategoriesMatchingBackendFilters]);

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
  const { deleteCategory, loading: deleteCategoryLoading } =
    useDeleteCategory();

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
      absoluteTotalCaseCountLoading ||
      allUsersForFormLoading,
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
      allUsersForFormLoading,
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
      absoluteTotalCaseCountError ||
      allUsersForFormError ||
      paletteColorsError,
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
      allUsersForFormError,
      paletteColorsError,
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
      return allFilteredCategoriesLoading;
    }
    return categoriesListLoading || categoryCountLoadingForTable;
  }, [
    filterCaseStatus,
    allFilteredCategoriesLoading,
    categoriesListLoading,
    categoryCountLoadingForTable,
  ]);

  // fetch all categories for the color picker
  const { categories: allCategoriesForPicker } = useGetAllLeanCategories({});

  // Computes the list of colors used by *other* categories.
  const usedColors = useMemo(() => {
    if (!allCategoriesForPicker) return [];
    return (
      allCategoriesForPicker
        // 1. Filter out the category currently being edited.
        .filter((cat) => cat._id !== editingCategory?._id)
        // 2. Filter for categories that have a color defined.
        .filter((cat) => !!cat.color)
        // 3. Map to the required structure.
        .map((cat) => ({ color: cat.color!, categoryName: cat.name }))
    );
  }, [allCategoriesForPicker, editingCategory]); // Dependency array updated

  const handleCaseStatusCardClick = (status: CaseStatus | string | null) => {
    const newStatus =
      filterCaseStatus === status ? null : (status as CaseStatus);
    setFilterCaseStatus(newStatus);
    if (handlePageChange) {
      handlePageChange(1);
    }
  };

  const isAnyFilterActive = useMemo(() => {
    return (
      filterName !== "" ||
      filterExpertIds.length > 0 ||
      filterManagerIds.length > 0 ||
      filterArchived !== undefined ||
      filterCaseStatus !== null
    );
  }, [
    filterName,
    filterExpertIds,
    filterManagerIds,
    filterArchived,
    filterCaseStatus,
  ]);

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

  const handleSuccessAndFormClose = () => {
    setIsSuccessModalOpen(false); // First, close the success modal
    closeCategoryModal(); // Then, close the form modal underneath
  };

  const handleCategoryFormSubmit = async (
    formData: CategoryFormData,
    editingCategoryId: string | null
  ) => {
    const inputForMutation = {
      name: formData.name,
      color: formData.color,
      problem: formData.problem || "",
      suggestion: formData.suggestion || "",
      experts: formData.expertIds,
      managers: formData.managerIds,
      archived: formData.archived,
    };
    try {
      let successMessage = "";
      if (editingCategoryId) {
        await updateCategory(
          editingCategoryId,
          inputForMutation as UpdateCategoryInput
        );
        successMessage = "Категорията е редактирана успешно!";
      } else {
        await createCategory(inputForMutation as CreateCategoryInput);
        successMessage = "Категорията е създадена успешно!";
      }
      await Promise.all([
        refetchCategoriesForTable(),
        refetchCategoryCountForTable(),
        refetchAllFilteredCategoriesForStats(),
        refetchAllUsersForForm ? refetchAllUsersForForm() : Promise.resolve(),
      ]);
      closeCategoryModal();
      setSuccessModalMessage(successMessage);
      setIsSuccessModalOpen(true);
      setUserFilterRefreshKey((prevKey) => prevKey + 1);
    } catch (err: any) {
      console.error(
        `Error during category ${editingCategoryId ? "update" : "create"}:`,
        err
      );
      throw err;
    }
  };

  const triggerDeleteCategory = (category: ICategory) => {
    setCategoryToDelete(category);
    setShowDeleteConfirmDialog(true);
  };

  const handleConfirmDeleteCategory = async () => {
    if (!categoryToDelete) return;
    try {
      await deleteCategory(categoryToDelete._id);
      setShowDeleteConfirmDialog(false);
      setCategoryToDelete(null);
      await Promise.all([
        refetchCategoriesForTable(),
        refetchCategoryCountForTable(),
        refetchAllFilteredCategoriesForStats(),
        refetchAllUsersForForm ? refetchAllUsersForForm() : Promise.resolve(),
      ]);
      setUserFilterRefreshKey((prevKey) => prevKey + 1);
      setSuccessModalMessage("Категорията е изтрита успешно!");
      setIsSuccessModalOpen(true);
    } catch (err: any) {
      console.error("Error deleting category:", err);
      setShowDeleteConfirmDialog(false);
      setCategoryToDelete(null);
    }
  };

  if (
    !isInitialAppLoadComplete &&
    isCurrentlyLoadingPageData &&
    !pageDisplayError
  ) {
    // Placeholder for loading state
  }

  if (pageDisplayError && !isCurrentlyLoadingPageData) {
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
      allUsersForFormError?.message,
    ]
      .filter(Boolean)
      .join("; ");
    return (
      <div className="p-6 text-red-600 text-center">
        Грешка при зареждане на данни: {errorMessages || "Неизвестна грешка."}
      </div>
    );
  }

  const mutationInProgress =
    createCategoryLoading || updateCategoryLoading || deleteCategoryLoading;
  const mutationError = createCategoryErrorObj || updateCategoryErrorObj;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
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
        <div className="flex flex-col md:flex-row gap-2 items-center md:items-start flex-shrink-0 mt-4 md:mt-0">
          <div className="flex gap-2 w-full md:w-auto">
            <button
              type="button"
              className="group w-full md:w-auto flex justify-center items-center px-4 py-2 rounded-lg font-semibold transition-colors duration-150 bg-gray-500 text-white hover:bg-gray-600 hover:cursor-pointer"
              onClick={() => setShowFilters(!showFilters)}
            >
              <div
                className="flex items-center"
                title={showFilters ? "Скрий филтри" : "Покажи филтри"}
              >
                {showFilters ? (
                  <ChevronUpIcon className="h-5 w-5 mr-1" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5 mr-1" />
                )}
                <span>Филтри</span>
              </div>
              {isAnyFilterActive && (
                <div className="hidden md:flex md:items-center">
                  <span className="border-l border-gray-400 group-hover:border-gray-500 h-4 mx-2"></span>
                  <div
                    className="p-1 rounded-sm hover:bg-gray-400"
                    title="Изчисти всички филтри"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClearAllFilters();
                    }}
                  >
                    <XMarkIcon className="h-4 w-4 text-white" />
                  </div>
                </div>
              )}
            </button>
            <div className="w-full md:w-auto md:hidden">
              <ClearFiltersButton
                isActive={isAnyFilterActive}
                onClear={handleClearAllFilters}
              />
            </div>
          </div>
          {isAdmin && (
            <button
              type="button"
              onClick={openCreateCategoryModal}
              className="md:w-54 w-full flex justify-center items-center px-4 py-2 rounded-lg font-semibold transition-colors duration-150 bg-green-500 text-white hover:bg-green-600 hover:cursor-pointer active:bg-green-700 active:shadow-inner disabled:cursor-not-allowed"
              disabled={mutationInProgress || isCurrentlyLoadingPageData}
            >
              <PlusIconSolid className="h-5 w-5 mr-1" />
              Създай Категория
            </button>
          )}
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
          refetchKey={userFilterRefreshKey}
        />
      </div>

      {misconfiguredCategoriesCount > 0 && (
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            isBannerVisible ? "max-h-40 opacity-100 mb-4" : "max-h-0 opacity-0"
          }`}
        >
          <div
            className="p-3 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 rounded-r-lg shadow flex items-center justify-between"
            role="alert"
          >
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-6 w-6 mr-3 flex-shrink-0" />
              <div>
                <p className="font-bold">Внимание</p>
                <p className="text-sm">
                  Има {misconfiguredCategoriesCount} категори
                  {misconfiguredCategoriesCount === 1 ? "я" : "и"} без назначени
                  експерти или мениджъри.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsBannerVisible(false)}
              className="p-1 rounded-md hover:bg-yellow-200 transition-colors cursor-pointer"
              aria-label="Скрий предупреждението"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

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
        onDeleteCategory={triggerDeleteCategory}
        currentQueryInput={currentQueryInput}
        createLoading={createCategoryLoading}
        updateLoading={updateCategoryLoading}
        deleteLoading={deleteCategoryLoading}
      />

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={closeCategoryModal}
        title={
          editingCategory ? "Редактирай категория" : "Създай нова категория"
        }
        hasUnsavedChanges={formHasUnsavedChanges}
      >
        {(createCategoryLoading || updateCategoryLoading) && (
          <div
            className="flex items-center justify-center p-4 text-center"
            style={{ minHeight: "450px" }}
          >
            Изпращане...
          </div>
        )}
        {mutationError && !(createCategoryLoading || updateCategoryLoading) && (
          <div className="p-4 mb-4 text-center text-red-600 bg-red-100 rounded-md">
            Грешка при запис: {mutationError.message || "Неизвестна грешка"}
          </div>
        )}
        {!updateCategoryLoading && (
          <CategoryForm
            key={editingCategory ? editingCategory._id : "create-new-category"}
            onSubmit={handleCategoryFormSubmit}
            onClose={closeCategoryModal}
            initialData={editingCategory}
            submitButtonText={
              editingCategory ? "Запази промените" : "Създай категория"
            }
            isSubmitting={createCategoryLoading || updateCategoryLoading}
            onDirtyChange={setFormHasUnsavedChanges}
            usedColors={usedColors}
            allUsersForForm={allUsersDataForForm?.getLeanUsers || []}
            allUsersForFormLoading={allUsersForFormLoading}
            allUsersForFormError={allUsersForFormError}
            paletteColors={paletteColors}
            setPaletteColors={setPaletteColors}
            allCategories={allCategoriesForPicker || []}
            paletteColorsLoading={paletteColorsLoading}
            canManageColors={isAdmin}
          />
        )}
      </CategoryModal>

      <ConfirmActionDialog
        isOpen={showDeleteConfirmDialog}
        onOpenChange={setShowDeleteConfirmDialog}
        onConfirm={handleConfirmDeleteCategory}
        title="Потвърди изтриването"
        description={
          categoryToDelete
            ? `Сигурни ли сте, че искате да изтриете категорията "${categoryToDelete.name}"? Тази операция е необратима.`
            : "Сигурни ли сте, че искате да изтриете тази категория? Тази операция е необратима."
        }
        confirmButtonText="Изтрий"
        isDestructiveAction={true}
      />

      <SuccessConfirmationModal
        isOpen={isSuccessModalOpen}
        onClose={handleSuccessAndFormClose}
        message={successModalMessage}
      />
    </div>
  );
};

export default CategoryManagement;
