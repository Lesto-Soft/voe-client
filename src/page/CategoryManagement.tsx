// src/pages/CategoryManagement.tsx
import React, { useState, useEffect } from "react";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { PlusIcon as PlusIconSolid } from "@heroicons/react/20/solid";
import {
  useGetAllLeanCategories,
  useCountCategories,
  useCountCategoriesByName,
  useCreateCategory,
  useUpdateCategory,
} from "../graphql/hooks/category";
import {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "../graphql/mutation/category";
import { ICategory } from "../db/interfaces";
import CategoryTable from "../components/features/categoryManagement/CategoryTable";
import { useCategoryManagement } from "./hooks/useCategoryManagement";
import LoadingModal from "../components/modals/LoadingModal";
import CategoryFilters from "../components/features/categoryManagement/CategoryFilters";
import CreateCategoryModal from "../components/modals/CreateCategoryModal";
import CreateCategoryForm, {
  CategoryFormData, // This is from the form component
} from "../components/forms/CreateCategoryForm";

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

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ICategory | null>(
    null
  );
  const [formHasUnsavedChanges, setFormHasUnsavedChanges] = useState(false);
  const [showFilters, setShowFilters] = useState(true);

  const {
    categories: categoriesData,
    loading: categoriesListLoading,
    error: categoriesListError,
    refetch: refetchCategories,
  } = useGetAllLeanCategories(currentQueryInput);

  const {
    count: filteredCategoryCount,
    loading: categoryCountLoading,
    error: categoryCountError,
    refetch: refetchCategoryCount,
  } = useCountCategories(currentQueryInput);

  // Use actual GraphQL mutation hooks
  const {
    createCategory,
    category: createdCategory, // Optional: use if needed for immediate feedback
    loading: createCategoryLoading,
    error: createCategoryErrorObj, // Rename to avoid conflict with component error state
  } = useCreateCategory();
  const {
    updateCategory,
    category: updatedCategory, // Optional
    loading: updateCategoryLoading,
    error: updateCategoryErrorObj, // Rename to avoid conflict
  } = useUpdateCategory();

  const categories: ICategory[] = categoriesData || [];

  const isInitialPageLoad =
    categoriesListLoading &&
    !categoriesData &&
    categoryCountLoading &&
    (filteredCategoryCount === undefined || filteredCategoryCount === 0);
  const isTableDataRefreshing = categoriesListLoading || categoryCountLoading;
  const tableDisplayError = categoriesListError || categoryCountError;

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
    // Confirmation for unsaved changes is handled by CreateCategoryModal's attemptClose
    setIsCategoryModalOpen(false);
    setEditingCategory(null);
    setFormHasUnsavedChanges(false); // Always reset when definitively closing
  };

  const handleCategoryFormSubmit = async (
    formData: CategoryFormData, // Data from CreateCategoryForm
    editingCategoryId: string | null
  ) => {
    // Map CategoryFormData to CreateCategoryGQLInput or UpdateCategoryGQLInput
    const inputForMutation = {
      name: formData.name,
      problem: formData.problem,
      suggestion: formData.suggestion,
      experts: formData.expertIds, // Map expertIds to experts
      managers: formData.managerIds, // Map managerIds to managers
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
      closeCategoryModal(); // Close modal on success
    } catch (err: any) {
      console.error(
        `Error during category ${editingCategoryId ? "update" : "create"}:`,
        err
      );
      // Error will be displayed by the form or the modal's error section
      // Re-throw so the form's catch block can also handle it if needed (e.g. to display in form)
      throw err;
    }
  };

  // The useEffect for formHasUnsavedChanges is removed from here,
  // as it's now handled by CreateCategoryForm calling onDirtyChange -> setFormHasUnsavedChanges

  if (isInitialPageLoad) {
    return <LoadingModal message={"Зареждане на страницата..."} />;
  }

  const mutationInProgress = createCategoryLoading || updateCategoryLoading;
  const mutationError = createCategoryErrorObj || updateCategoryErrorObj;

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans">
      <div className="mb-6 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div> {/* Left side placeholder */} </div>
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
            disabled={mutationInProgress}
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
        categoriesError={tableDisplayError}
        totalCategoryCount={filteredCategoryCount || 0}
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
        onClose={closeCategoryModal} // Radix will handle confirmation via attemptClose
        title={
          editingCategory ? "Редактирай категория" : "Създай нова категория"
        }
        hasUnsavedChanges={formHasUnsavedChanges}
      >
        {/* Display general loading/error state for mutations if not handled by form */}
        {mutationInProgress && (
          <div className="p-4 text-center">Изпращане...</div>
        )}
        {mutationError && !mutationInProgress && (
          <div className="p-4 mb-4 text-center text-red-600 bg-red-100 rounded-md">
            Грешка при запис: {mutationError.message || "Неизвестна грешка"}
          </div>
        )}
        {/* Render form only when not in top-level loading state (form has its own submit state) */}
        {!mutationInProgress && (
          <CreateCategoryForm
            key={editingCategory ? editingCategory._id : "create-new-category"}
            onSubmit={handleCategoryFormSubmit}
            onClose={closeCategoryModal} // For cancel buttons inside form, though modal X handles main close
            initialData={editingCategory}
            submitButtonText={
              editingCategory ? "Запази промените" : "Създай категория"
            }
            isSubmitting={mutationInProgress} // Pass submitting state to form
            onDirtyChange={setFormHasUnsavedChanges} // Connect form's dirty state
          />
        )}
      </CreateCategoryModal>
    </div>
  );
};

export default CategoryManagement;
