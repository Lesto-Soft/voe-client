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

// Constants
import { ROLES } from "../utils/GLOBAL_PARAMETERS";

import { useAuthorization } from "../hooks/useAuthorization";
import ForbiddenPage from "./ErrorPages/ForbiddenPage";

interface ILeanUserForForm {
  _id: string;
  name: string;
  username: string;
  role: { _id: string } | null;
}

type CaseStatusTab =
  | "all"
  | "OPEN"
  | "IN_PROGRESS"
  | "AWAITING_FINANCE"
  | "CLOSED";

const Category: React.FC = () => {
  const { name: categoryNameFromParams } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const currentUser = useCurrentUser() as IMe | undefined;

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formHasUnsavedChanges, setFormHasUnsavedChanges] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successModalMessage, setSuccessModalMessage] = useState("");
  const [activeStatus, setActiveStatus] = useState<CaseStatusTab>("all");
  const [dateRange, setDateRange] = useState<{
    startDate: Date | null;
    endDate: Date | null;
  }>({ startDate: null, endDate: null });

  const {
    loading: categoryLoading,
    error: categoryError,
    category,
    refetch: refetchCategory,
  } = useGetCategoryByName(categoryNameFromParams);

  const { isAllowed, isLoading: authLoading } = useAuthorization({
    type: "category",
    data: category,
  });

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
    skip: !isEditModalOpen,
  });

  const canEdit = useMemo(() => {
    if (!currentUser || !category) return false;
    if (currentUser.role?._id === ROLES.ADMIN) {
      return true;
    }
    if (currentUser.role?._id === ROLES.EXPERT) {
      return (
        category.managers?.some((manager) => manager._id === currentUser._id) ??
        false
      );
    }
    return false;
  }, [currentUser, category]);

  const dateFilteredCases = useMemo(() => {
    const allCases = category?.cases || [];
    if (!dateRange.startDate || !dateRange.endDate) {
      return allCases;
    }
    return allCases.filter((c) => {
      const caseDate = new Date(c.date);
      return caseDate >= dateRange.startDate! && caseDate <= dateRange.endDate!;
    });
  }, [category?.cases, dateRange]);

  const finalFilteredCases = useMemo(() => {
    if (activeStatus === "all") {
      return dateFilteredCases;
    }
    return dateFilteredCases.filter((c) => c.status === activeStatus);
  }, [dateFilteredCases, activeStatus]);

  const isDataReady = !categoryLoading && !categoryError && !!category;

  const { visibleCasesCount, scrollableCasesListRef, handleLoadMoreCases } =
    useCategoryScrollPersistence(categoryNameFromParams, isDataReady);

  const signalStats = useCategorySignalStats(dateFilteredCases);

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

  const openEditModal = () => {
    if (!canEdit) return;
    setFormHasUnsavedChanges(false);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setFormHasUnsavedChanges(false);
  };

  const handleCategoryFormSubmit = async (
    formData: CategoryFormData,
    editingCategoryId: string | null
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
      await refetchCategory();
      closeEditModal();
      setSuccessModalMessage("Категорията е редактирана успешно!");
      setIsSuccessModalOpen(true);
      if (formData.name !== originalName) {
        navigate(`/category/${encodeURIComponent(formData.name)}`, {
          replace: true,
        });
      }
    } catch (err: any) {
      console.error("Error during category update:", err);
      throw err;
    }
  };

  const pageError = categoryError || allUsersForFormError;

  if (!category || pageError) {
    return <PageStatusDisplay notFound categoryName={categoryNameFromParams} />;
  }

  if (!isAllowed) {
    return <ForbiddenPage />;
  }

  if (categoryLoading || authLoading || allUsersForFormLoading) {
    return (
      <PageStatusDisplay
        loading
        message="Зареждане на данните за категорията..."
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
          canEdit={canEdit}
          onEditClick={openEditModal}
        />
        <CategoryCasesList
          allCases={finalFilteredCases}
          dateFilteredCases={dateFilteredCases}
          visibleCasesCount={visibleCasesCount}
          handleLoadMoreCases={handleLoadMoreCases}
          scrollableRef={scrollableCasesListRef}
          serverBaseUrl={serverBaseUrl}
          isLoading={categoryLoading && !!category}
          categoryName={category.name}
          activeStatus={activeStatus}
          setActiveStatus={setActiveStatus}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />
        <CategoryStatisticsPanel
          signalStats={signalStats}
          activeStatsView={activeStatsView}
          setActiveStatsView={setActiveStatsView}
          isLoading={categoryLoading && !!category}
        />
      </div>
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
          <CategoryForm
            key={category._id}
            onSubmit={handleCategoryFormSubmit}
            onClose={closeEditModal}
            initialData={category}
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
