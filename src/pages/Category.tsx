// src/pages/Category.tsx
import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router"; // Import useNavigate
import { useQuery } from "@apollo/client";

// --- NEW: Import icons, hooks, components and types ---
import { PencilSquareIcon } from "@heroicons/react/24/solid";
import { useCurrentUser } from "../context/UserContext"; // Adjust path as needed
import {
  useGetCategoryByName,
  useUpdateCategory,
} from "../graphql/hooks/category"; // Adjust path
import { GET_LEAN_USERS } from "../graphql/query/user"; // Adjust path
import { ICategory, IMe } from "../db/interfaces"; // Adjust path
import { UpdateCategoryInput } from "../graphql/mutation/category";
import CategoryModal from "../components/modals/CategoryModal"; // Adjust path
import CategoryForm, {
  CategoryFormData,
} from "../components/forms/CategoryForm"; // We will rename CreateCategoryForm to CategoryForm

import SuccessConfirmationModal from "../components/modals/SuccessConfirmationModal";

// Hooks
import useCategorySignalStats from "../hooks/useCategorySignalStats"; // Adjust path
import useCategoryScrollPersistence from "../hooks/useCategoryScrollPersistence"; // Adjust path

// UI Components
import PageStatusDisplay from "../components/global/PageStatusDisplay"; // Adjust path
import CategoryHeader from "../components/features/categoryAnalytics/CategoryHeader"; // Adjust path
import PersonnelInfoPanel from "../components/features/categoryAnalytics/PersonnelInfoPanel"; // Adjust path
import CategoryCasesList from "../components/features/categoryAnalytics/CategoryCasesList"; // Adjust path
import CategoryStatisticsPanel from "../components/features/categoryAnalytics/CategoryStatisticsPanel"; // Adjust path

// Define a lean user type that includes the role ID, matching GET_LEAN_USERS
interface ILeanUserForForm {
  _id: string;
  name: string;
  username: string;
  role: { _id: string } | null;
}

const ADMIN_ROLE_ID = "650000000000000000000003";
const EXPERT_ROLE_ID = "650000000000000000000002";

const Category: React.FC = () => {
  const { name: categoryNameFromParams } = useParams<{ name: string }>();
  const navigate = useNavigate(); // Hook for navigation
  const currentUser = useCurrentUser() as IMe | undefined;

  const {
    loading: categoryLoading,
    error: categoryError,
    category,
    refetch: refetchCategory, // Expose refetch
  } = useGetCategoryByName(categoryNameFromParams);

  // --- NEW: State for the edit modal ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formHasUnsavedChanges, setFormHasUnsavedChanges] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successModalMessage, setSuccessModalMessage] = useState("");

  // --- NEW: GraphQL hooks for editing ---
  const {
    updateCategory,
    loading: updateCategoryLoading,
    error: updateCategoryErrorObj,
  } = useUpdateCategory();

  const {
    data: allUsersDataForForm,
    loading: allUsersForFormLoading,
    error: allUsersForFormError,
  } = useQuery<{ getLeanUsers: ILeanUserForForm[] }>(GET_LEAN_USERS, {
    variables: { input: "" },
    fetchPolicy: "cache-and-network",
    skip: !isEditModalOpen, // Skip fetching users until the modal is opened
  });

  // --- NEW: Permission Logic ---
  const canEdit = useMemo(() => {
    if (!currentUser || !category) return false;
    // Rule 1: Admin can edit
    if (currentUser.role?._id === ADMIN_ROLE_ID) {
      return true;
    }
    // Rule 2: Expert who manages this category can edit
    if (currentUser.role?._id === EXPERT_ROLE_ID) {
      return (
        //currentUser.managed_categories?.some((mc) => mc._id === category._id) ??
        category.managers?.some((manager) => manager._id === currentUser._id) ??
        false
      );
    }
    // Rule 3: Everyone else cannot
    return false;
  }, [currentUser, category]);

  // Determine if data is ready for display and scroll restoration
  const isDataReady = !categoryLoading && !categoryError && !!category;

  const { visibleCasesCount, scrollableCasesListRef, handleLoadMoreCases } =
    useCategoryScrollPersistence(categoryNameFromParams, isDataReady);

  const signalStats = useCategorySignalStats(category);

  const [activeStatsView, setActiveStatsView] = useState<
    "status" | "type" | "resolution"
  >("status");
  const [activePersonnelTab, setActivePersonnelTab] = useState<
    "experts" | "managers"
  >("managers");
  const [activeInfoTab, setActiveInfoTab] = useState<"suggestion" | "problem">(
    "suggestion"
  );

  useEffect(() => {
    setActiveStatsView("status");
    setActivePersonnelTab("managers");
    setActiveInfoTab("suggestion");
  }, [categoryNameFromParams]);

  const serverBaseUrl = import.meta.env.VITE_API_URL || "";

  // --- NEW: Modal handler functions ---
  const openEditModal = () => {
    if (!canEdit) return; // Security check
    setFormHasUnsavedChanges(false);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setFormHasUnsavedChanges(false);
  };

  const handleCategoryFormSubmit = async (
    formData: CategoryFormData,
    editingCategoryId: string | null // Will always be the current category ID
  ) => {
    if (!editingCategoryId || !category) return;

    const inputForMutation: UpdateCategoryInput = {
      name: formData.name,
      problem: formData.problem || "",
      suggestion: formData.suggestion || "",
      experts: formData.expertIds,
      managers: formData.managerIds,
      archived: formData.archived,
    };

    try {
      const originalName = category.name;
      await updateCategory(editingCategoryId, inputForMutation);
      await refetchCategory(); // Refetch the category data

      closeEditModal();
      setSuccessModalMessage("Категорията е редактирана успешно!");
      setIsSuccessModalOpen(true);

      // If the name changed, the URL is now invalid. Navigate to the new URL.
      if (formData.name !== originalName) {
        navigate(`/category/${encodeURIComponent(formData.name)}`, {
          replace: true,
        });
      }
    } catch (err: any) {
      console.error("Error during category update:", err);
      // The error will be displayed inside the modal via the `updateCategoryErrorObj`
      throw err; // Re-throw to be caught by the form's handler
    }
  };

  if (categoryLoading && !category) {
    return (
      <PageStatusDisplay
        loading
        message="Зареждане на данните за категорията..."
      />
    );
  }

  // Combine page-level errors with form-related errors for display
  const pageError = categoryError || allUsersForFormError;
  if (pageError) {
    return (
      <PageStatusDisplay
        error={{ message: pageError.message }}
        message={`Грешка при зареждане на категория '${
          categoryNameFromParams || ""
        }'.`}
      />
    );
  }

  if (!category) {
    return (
      <PageStatusDisplay
        notFound
        categoryName={categoryNameFromParams}
        message={`Категорията '${
          categoryNameFromParams || "не е посочено име"
        }' не можа да бъде намерена или нямате достъп.`}
      />
    );
  }

  return (
    <div className="container min-w-full mx-auto p-2 sm:p-6 bg-gray-50 flex flex-col h-[calc(100vh-6rem)]">
      <CategoryHeader
        isArchived={category.archived}
        categoryName={category.name}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 overflow-hidden">
        <PersonnelInfoPanel
          category={category}
          activePersonnelTab={activePersonnelTab}
          setActivePersonnelTab={setActivePersonnelTab}
          activeInfoTab={activeInfoTab}
          setActiveInfoTab={setActiveInfoTab}
          // --- NEW: Pass edit props ---
          canEdit={canEdit}
          onEditClick={openEditModal}
        />

        <CategoryCasesList
          allCases={category.cases}
          visibleCasesCount={visibleCasesCount}
          handleLoadMoreCases={handleLoadMoreCases}
          scrollableRef={scrollableCasesListRef}
          serverBaseUrl={serverBaseUrl}
          isLoading={categoryLoading && !!category}
          categoryName={category.name}
        />

        <CategoryStatisticsPanel
          signalStats={signalStats}
          activeStatsView={activeStatsView}
          setActiveStatsView={setActiveStatsView}
          isLoading={categoryLoading && !!category}
        />
      </div>

      {/* --- NEW: Edit Category Modal --- */}
      <CategoryModal
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        title="Редактирай категория"
        hasUnsavedChanges={formHasUnsavedChanges}
      >
        {updateCategoryLoading && (
          <div className="p-4 text-center">Записване на промените...</div>
        )}
        {updateCategoryErrorObj && !updateCategoryLoading && (
          <div className="p-4 mb-4 text-center text-red-600 bg-red-100 rounded-md">
            Грешка при запис:{" "}
            {updateCategoryErrorObj.message || "Неизвестна грешка"}
          </div>
        )}
        {!updateCategoryLoading && (
          <CategoryForm // Using the renamed component
            // The key ensures the form re-initializes if the category context somehow changes,
            // though it's unlikely on this page without a full reload.
            key={category._id}
            onSubmit={handleCategoryFormSubmit}
            onClose={closeEditModal}
            initialData={category} // Always pass the current category data for editing
            submitButtonText="Запази промените"
            isSubmitting={updateCategoryLoading}
            onDirtyChange={setFormHasUnsavedChanges}
            allUsersForForm={allUsersDataForForm?.getLeanUsers || []}
            allUsersForFormLoading={allUsersForFormLoading}
          />
        )}
      </CategoryModal>

      <SuccessConfirmationModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        message={successModalMessage}
      />
    </div>
  );
};

export default Category;
