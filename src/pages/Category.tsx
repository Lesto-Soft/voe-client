import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router"; // Import useNavigate
import { useQuery } from "@apollo/client";

import { useCurrentUser } from "../context/UserContext"; // Adjust path as needed
import {
  useGetCategoryByName,
  useUpdateCategory,
} from "../graphql/hooks/category"; // Adjust path
import { GET_LEAN_USERS } from "../graphql/query/user"; // Adjust path
import { IMe, CaseType } from "../db/interfaces";
import {
  ResolutionCategoryKey,
  RESOLUTION_CATEGORY_CONFIG,
} from "../utils/categoryDisplayUtils";
import { getCaseResolutionCategory } from "../utils/categoryDisplayUtils";
import { PieSegmentData } from "../components/charts/PieChart";
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
import CategoryPageSkeleton from "../components/skeletons/CategoryPageSkeleton";
import CategoryHeader from "../components/features/categoryAnalytics/CategoryHeader"; // Adjust path
import PersonnelInfoPanel from "../components/features/categoryAnalytics/PersonnelInfoPanel"; // Adjust path
import CategoryCasesList from "../components/features/categoryAnalytics/CategoryCasesList"; // Adjust path
import CategoryStatisticsPanel from "../components/features/categoryAnalytics/CategoryStatisticsPanel"; // Adjust path

// Constants
import { ROLES } from "../utils/GLOBAL_PARAMETERS";

import { useAuthorization } from "../hooks/useAuthorization";
import ForbiddenPage from "./ErrorPages/ForbiddenPage";
import { translateStatus } from "../utils/categoryDisplayUtils";
import { translateCaseType } from "../utils/categoryDisplayUtils";

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
  const [activeType, setActiveType] = useState<CaseType | "all">("all");
  const [activeResolution, setActiveResolution] = useState<
    ResolutionCategoryKey | "all"
  >("all");
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
    const { startDate, endDate } = dateRange;

    if (!startDate && !endDate) {
      return allCases;
    }

    return allCases.filter((c) => {
      // ✅ MODIFIED: Changed `new Date(c.date)` to `new Date(parseInt(c.date, 10))`.
      // This correctly parses the timestamp string into a valid Date object.
      const caseDate = new Date(parseInt(c.date, 10));

      if (startDate && caseDate < startDate) {
        return false;
      }
      if (endDate && caseDate > endDate) {
        return false;
      }
      return true;
    });
  }, [category?.cases, dateRange]);

  // This logic was already correct and now consumes the fixed dateFilteredCases
  const finalFilteredCases = useMemo(() => {
    let casesToFilter = dateFilteredCases;
    if (activeStatus !== "all") {
      casesToFilter = casesToFilter.filter((c) => c.status === activeStatus);
    }
    if (activeType !== "all") {
      casesToFilter = casesToFilter.filter((c) => c.type === activeType);
    }
    if (activeResolution !== "all") {
      casesToFilter = casesToFilter.filter(
        (c) => getCaseResolutionCategory(c) === activeResolution
      );
    }
    return casesToFilter;
  }, [dateFilteredCases, activeStatus, activeType, activeResolution]);

  // --- START: ADD THE FOLLOWING NEW MEMOIZED VALUES ---

  // Data for the Status Chart/Legend (respects Type and Resolution filters)
  const dataForStatusCalculations = useMemo(() => {
    let casesToFilter = dateFilteredCases;
    if (activeType !== "all") {
      casesToFilter = casesToFilter.filter((c) => c.type === activeType);
    }
    if (activeResolution !== "all") {
      casesToFilter = casesToFilter.filter(
        (c) => getCaseResolutionCategory(c) === activeResolution
      );
    }
    return casesToFilter;
  }, [dateFilteredCases, activeType, activeResolution]);

  // Data for the Type Chart/Legend (respects Status and Resolution filters)
  const dataForTypeCalculations = useMemo(() => {
    let casesToFilter = dateFilteredCases;
    if (activeStatus !== "all") {
      casesToFilter = casesToFilter.filter((c) => c.status === activeStatus);
    }
    if (activeResolution !== "all") {
      casesToFilter = casesToFilter.filter(
        (c) => getCaseResolutionCategory(c) === activeResolution
      );
    }
    return casesToFilter;
  }, [dateFilteredCases, activeStatus, activeResolution]);

  // Data for the Resolution Chart/Legend (respects Status and Type filters)
  const dataForResolutionCalculations = useMemo(() => {
    let casesToFilter = dateFilteredCases;
    if (activeStatus !== "all") {
      casesToFilter = casesToFilter.filter((c) => c.status === activeStatus);
    }
    if (activeType !== "all") {
      casesToFilter = casesToFilter.filter((c) => c.type === activeType);
    }
    return casesToFilter;
  }, [dateFilteredCases, activeStatus, activeType]);

  // Now, call the stats hook for each dataset
  const statusSignalStats = useCategorySignalStats(dataForStatusCalculations);
  const typeSignalStats = useCategorySignalStats(dataForTypeCalculations);
  const resolutionSignalStats = useCategorySignalStats(
    dataForResolutionCalculations
  );

  // --- END: ADD THE NEW MEMOIZED VALUES ---

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

  const handleStatusClick = (segment: PieSegmentData) => {
    const statusKey = segment.id as CaseStatusTab | undefined; // Use the ID
    if (statusKey) {
      // Toggle filter: if clicking the active one, reset to "all"
      setActiveStatus((currentStatus) =>
        currentStatus === statusKey ? "all" : statusKey
      );
    }
  };

  const handleTypeClick = (segment: PieSegmentData) => {
    const typeKey = segment.id as CaseType | undefined; // Use the ID
    if (typeKey) {
      setActiveType((currentType) =>
        currentType === typeKey ? "all" : typeKey
      );
    }
  };

  const handleResolutionClick = (segment: PieSegmentData) => {
    const resolutionKey = RESOLUTION_CATEGORY_CONFIG.find(
      (c) => c.label === segment.label
    )?.key;

    if (resolutionKey) {
      setActiveResolution((currentRes) =>
        currentRes === resolutionKey ? "all" : resolutionKey
      );
    }
  };

  // Determine the active labels to pass down for styling
  const activeStatusLabel =
    activeStatus !== "all" ? translateStatus(activeStatus) : null;
  const activeTypeLabel =
    activeType !== "all" ? translateCaseType(activeType as string) : null;

  const activeResolutionLabel =
    activeResolution !== "all"
      ? RESOLUTION_CATEGORY_CONFIG.find((c) => c.key === activeResolution)
          ?.label || null
      : null;

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
  if (categoryLoading || authLoading || allUsersForFormLoading) {
    return <CategoryPageSkeleton />;
  }
  if (pageError || !category) {
    return <PageStatusDisplay notFound categoryName={categoryNameFromParams} />;
  }

  if (!isAllowed) {
    return <ForbiddenPage />;
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
          dateFilteredCases={dateFilteredCases} // This prop is no longer used for counts
          casesForTabCounts={dataForStatusCalculations}
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
          statsForStatus={statusSignalStats}
          statsForType={typeSignalStats}
          statsForResolution={resolutionSignalStats}
          activeStatsView={activeStatsView}
          setActiveStatsView={setActiveStatsView}
          isLoading={categoryLoading && !!category}
          onStatusClick={handleStatusClick}
          onTypeClick={handleTypeClick}
          onResolutionClick={handleResolutionClick}
          activeStatusLabel={activeStatusLabel}
          activeTypeLabel={activeTypeLabel}
          activeResolutionLabel={activeResolutionLabel}
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
