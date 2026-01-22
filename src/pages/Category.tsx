// src/pages/Category.tsx
import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router"; // Import useNavigate
import { useQuery } from "@apollo/client";

import { useCurrentUser } from "../context/UserContext"; // Adjust path as needed
import {
  useGetCategoryByName,
  useUpdateCategory,
  useGetAllLeanCategories,
} from "../graphql/hooks/category"; // Adjust path
import { useGetAllPaletteColors } from "../graphql/hooks/colorPalette";
import { GET_LEAN_USERS } from "../graphql/query/user"; // Adjust path
// --- MODIFIED: Import CasePriority ---
import { IMe, CaseType, IPaletteColor, CasePriority } from "../db/interfaces";
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
// --- MODIFIED: Import translatePriority ---
import {
  translateStatus,
  translateCaseType,
  translatePriority,
} from "../utils/categoryDisplayUtils";
import { RatingTierLabel, getTierForScore } from "../utils/ratingCalculations";

interface ILeanUserForForm {
  _id: string;
  name: string;
  username: string;
  role: { _id: string } | null;
}

export type CaseStatusTab =
  | "all"
  | "OPEN"
  | "IN_PROGRESS"
  | "AWAITING_FINANCE"
  | "CLOSED";

const Category: React.FC = () => {
  const { name: categoryNameFromParams } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const currentUser = useCurrentUser() as IMe | undefined;
  const isAdmin = currentUser?.role?._id === ROLES.ADMIN;

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formHasUnsavedChanges, setFormHasUnsavedChanges] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successModalMessage, setSuccessModalMessage] = useState("");
  const [activeStatus, setActiveStatus] = useState<CaseStatusTab>("all");
  const [activeType, setActiveType] = useState<CaseType | "all">("all");
  const [activeResolution, setActiveResolution] = useState<
    ResolutionCategoryKey | "all"
  >("all");
  // --- ADD NEW STATE FOR NEW FILTERS ---
  const [activePriority, setActivePriority] = useState<CasePriority | "all">(
    "all"
  );
  const [activeCreator, setActiveCreator] = useState<{
    id: string | null;
    name: string | null;
  }>({ id: null, name: null });
  const [activeRatingTier, setActiveRatingTier] =
    useState<RatingTierLabel>("all");
  // -------------------------------------

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

  const { categories: allCategoriesForPicker } = useGetAllLeanCategories({});

  const {
    paletteColors: fetchedPaletteColors,
    loading: paletteColorsLoading,
    error: paletteColorsError,
  } = useGetAllPaletteColors();

  // --- NEW: Local state for palette colors to support optimistic DnD updates ---
  const [paletteColors, setPaletteColors] = useState<IPaletteColor[]>([]);

  useEffect(() => {
    if (fetchedPaletteColors) {
      // Use a functional update to access the previous state
      setPaletteColors((prevColors) => {
        // Only update state if the content has actually changed
        if (
          JSON.stringify(prevColors) !== JSON.stringify(fetchedPaletteColors)
        ) {
          return fetchedPaletteColors;
        }
        // Otherwise, return the old state to prevent a re-render
        return prevColors;
      });
    }
  }, [fetchedPaletteColors]); // Corrected: Only depend on fetchedPaletteColorss

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

  // determine if the category is misconfigured
  const isMisconfiguredCategory = useMemo(() => {
    if (!category) return false;
    return (
      !category.archived &&
      (!category.experts ||
        category.experts.length === 0 || // changed to OR
        !category.managers ||
        category.managers.length === 0)
    );
  }, [category]);

  // ADD THIS MEMO to process the categories and find used colors
  const usedColors = useMemo(() => {
    if (!allCategoriesForPicker) return [];
    return allCategoriesForPicker
      .filter((cat) => cat._id !== category?._id)
      .filter((cat) => !!cat.color) // Only include categories that have a color assigned
      .map((cat) => ({ color: cat.color!, categoryName: cat.name }));
  }, [allCategoriesForPicker, category]);

  const canEdit = useMemo(() => {
    if (!currentUser || !category) return false;
    //if (currentUser.role?._id === ROLES.ADMIN) {
    if (isAdmin) {
      return true;
    }
    if (currentUser.role?._id === ROLES.EXPERT) {
      return (
        category.managers?.some((manager) => manager._id === currentUser._id) ??
        false
      );
    }
    return false;
  }, [currentUser, category, isAdmin]);

  const dateFilteredCases = useMemo(() => {
    // Sort cases by case_number descending to ensure consistent ordering
    // (The backend should already sort, but this guards against any inconsistencies)
    const allCases = [...(category?.cases || [])].sort(
      (a, b) => b.case_number - a.case_number
    );
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
    // --- ADD NEW FILTER LOGIC ---
    if (activePriority !== "all") {
      casesToFilter = casesToFilter.filter(
        (c) => c.priority === activePriority
      );
    }
    if (activeCreator.id !== null) {
      casesToFilter = casesToFilter.filter(
        (c) => c.creator._id === activeCreator.id
      );
    }
    if (activeRatingTier !== "all") {
      casesToFilter = casesToFilter.filter((c) => {
        if (c.calculatedRating === null || c.calculatedRating === undefined)
          return false;
        return getTierForScore(c.calculatedRating) === activeRatingTier;
      });
    }
    if (activeRatingTier !== "all") {
      casesToFilter = casesToFilter.filter((c) => {
        if (c.calculatedRating === null || c.calculatedRating === undefined)
          return false;
        return getTierForScore(c.calculatedRating) === activeRatingTier;
      });
    }
    // --- END NEW FILTER LOGIC ---
    return casesToFilter;
  }, [
    dateFilteredCases,
    activeStatus,
    activeType,
    activeResolution,
    activePriority, // ADDED
    activeCreator.id, // ADDED
    activeRatingTier, // ADDED
  ]);

  // --- REFACTORED LOGIC ---

  // Data for the Status Tabs in CategoryCasesList. This MUST remain cross-filtered
  // to show the user "how many OPEN cases match the 'Problem' filter" etc.
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
    if (activePriority !== "all") {
      casesToFilter = casesToFilter.filter(
        (c) => c.priority === activePriority
      );
    }
    if (activeCreator.id !== null) {
      casesToFilter = casesToFilter.filter(
        (c) => c.creator._id === activeCreator.id
      );
    }
    return casesToFilter;
  }, [
    dateFilteredCases,
    activeType,
    activeResolution,
    activePriority,
    activeCreator.id,
  ]);

  // 1. Stats for the PIE CHARTS (based only on the date-filtered list)
  const pieChartStats = useCategorySignalStats(dateFilteredCases);

  // 2. Stats for the dynamic TEXT BLOCK (based on the *fully* filtered list)
  const textSignalStats = useCategorySignalStats(finalFilteredCases);
  // --- END REFACTORED LOGIC ---

  const isDataReady = !categoryLoading && !categoryError && !!category;

  const { visibleCasesCount, scrollableCasesListRef, handleLoadMoreCases } =
    useCategoryScrollPersistence(categoryNameFromParams, isDataReady);

  useEffect(() => {
    const closedCasesWithNoCalculableResolution = dateFilteredCases.filter(
      (caseItem) => {
        const isConsideredComplete =
          String(caseItem.status) === "CLOSED" ||
          String(caseItem.status) === "AWAITING_FINANCE";

        // Check if a resolution category can be determined (which requires an approved answer)
        const hasResolutionCategory =
          getCaseResolutionCategory(caseItem) !== null &&
          getCaseResolutionCategory(caseItem) !== "NOT_RESOLVED"; // Ensure it's a time bucket

        // We are looking for cases that ARE complete but DO NOT have a resolution category
        return isConsideredComplete && !hasResolutionCategory;
      }
    );

    if (closedCasesWithNoCalculableResolution.length > 0) {
      console.log(
        "DEBUG: Closed/Awaiting Finance cases WITHOUT a calculable resolution time (likely no approved answer):",
        closedCasesWithNoCalculableResolution
      );
    }
  }, [dateFilteredCases]); // This runs whenever the list of cases changes

  // --- LIFTED STATE (was previously inside CategoryStatisticsPanel) ---
  const [activeStatsView, setActiveStatsView] = useState<
    "status" | "type" | "resolution" | "priority" | "user" | "rating"
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

  // --- MODIFY isAnyFilterActive and handleClearAllFilters ---
  const isAnyFilterActive = useMemo(() => {
    return (
      dateRange.startDate !== null ||
      dateRange.endDate !== null ||
      activeStatus !== "all" ||
      activeType !== "all" ||
      activeResolution !== "all" ||
      activePriority !== "all" || // ADDED
      activeCreator.id !== null || // ADDED
      activeRatingTier !== "all" // ADDED
    );
  }, [
    dateRange,
    activeStatus,
    activeType,
    activeResolution,
    activePriority, // ADDED
    activeCreator.id, // ADDED
    activeRatingTier, // ADDED
  ]);

  const handleClearAllFilters = () => {
    setDateRange({ startDate: null, endDate: null });
    setActiveStatus("all");
    setActiveType("all");
    setActiveResolution("all");
    setActivePriority("all"); // ADDED
    setActiveCreator({ id: null, name: null }); // ADDED
    setActiveRatingTier("all"); // ADDED
  };
  // --------------------------------------------------------

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

  // --- ADD NEW CLICK HANDLERS ---
  const handlePriorityClick = (segment: PieSegmentData) => {
    const priorityKey = segment.id as CasePriority | "all";
    setActivePriority((current) =>
      current === priorityKey ? "all" : priorityKey
    );
  };

  const handleCreatorClick = (segment: PieSegmentData) => {
    const creatorId = segment.id || null; // Convert undefined to null
    setActiveCreator(
      (current) =>
        current.id === creatorId
          ? { id: null, name: null }
          : { id: creatorId, name: segment.label } // Use the null-coalesced value
    );
  };

  const handleRatingTierClick = (segment: PieSegmentData) => {
    const tierKey = segment.id as RatingTierLabel; // The ID is the label name
    setActiveRatingTier((current) => (current === tierKey ? "all" : tierKey));
  };
  // ------------------------------

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

  // --- ADD NEW ACTIVE LABELS ---
  const activePriorityLabel =
    activePriority !== "all" ? translatePriority(activePriority) : null;

  const activeCreatorLabel = activeCreator.name;

  const activeRatingTierLabel =
    activeRatingTier !== "all"
      ? pieChartStats?.ratingTierDistributionData.find(
          (d) => d.id === activeRatingTier
        )?.label || null
      : null;
  // ---------------------------

  const handleCategoryFormSubmit = async (
    formData: CategoryFormData,
    editingCategoryId: string | null
  ) => {
    if (!editingCategoryId || !category) return;

    const inputForMutation: UpdateCategoryInput = {
      name: formData.name,
      color: formData.color,
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

  const pageError = categoryError || allUsersForFormError || paletteColorsError;
  if (
    categoryLoading ||
    authLoading ||
    allUsersForFormLoading ||
    paletteColorsLoading
  ) {
    return <CategoryPageSkeleton />;
  }
  if (pageError || !category) {
    return <PageStatusDisplay notFound categoryName={categoryNameFromParams} />;
  }

  if (!isAllowed) {
    return <ForbiddenPage />;
  }

  return (
    <div className="container min-w-full mx-auto p-2 sm:p-6 bg-gray-50 flex flex-col min-h-[calc(100vh-6rem)] lg:h-[calc(100vh-6rem)]">
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
          isMisconfigured={isMisconfiguredCategory}
        />
        <CategoryCasesList
          allCases={finalFilteredCases}
          casesForTabCounts={dataForStatusCalculations} // <-- This prop is now valid again
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
          isAnyFilterActive={isAnyFilterActive}
          onClearAllFilters={handleClearAllFilters}
          activeType={activeType}
          activeResolution={activeResolution}
          onClearTypeFilter={() => setActiveType("all")}
          onClearResolutionFilter={() => setActiveResolution("all")}
          // --- ADD NEW PROPS ---
          onPieTabChange={setActiveStatsView} // <-- ADDED FOR TAG-TO-TAB LINK
          activePriority={activePriority}
          onClearPriorityFilter={() => setActivePriority("all")}
          activeCreatorName={activeCreator.name}
          onClearCreatorFilter={() =>
            setActiveCreator({ id: null, name: null })
          }
          activeRatingTier={activeRatingTier}
          onClearRatingTierFilter={() => setActiveRatingTier("all")}
        />
        <CategoryStatisticsPanel
          // --- REFACTORED: Pass the two new stats objects ---
          pieChartStats={pieChartStats} // <-- Pass pie chart data
          textStats={textSignalStats} // <-- Pass dynamic text stat data
          // -----------------------------------------------
          onPriorityClick={handlePriorityClick}
          onUserClick={handleCreatorClick}
          activePriorityFilter={activePriority}
          activeCreatorFilter={activeCreator.id}
          activePriorityLabel={activePriorityLabel} // Pass label for highlighting
          activeCreatorLabel={activeCreatorLabel} // Pass label for highlighting
          onRatingTierClick={handleRatingTierClick}
          activeRatingTierFilter={activeRatingTier}
          activeRatingTierLabel={activeRatingTierLabel}
          // --- PASS CLEAR HANDLERS FOR DOT CLICK ---
          onClearStatusFilter={() => setActiveStatus("all")}
          onClearTypeFilter={() => setActiveType("all")}
          onClearResolutionFilter={() => setActiveResolution("all")}
          onClearPriorityFilter={() => setActivePriority("all")}
          onClearCreatorFilter={() =>
            setActiveCreator({ id: null, name: null })
          }
          onClearRatingTierFilter={() => setActiveRatingTier("all")}
          // --------------------
          activeStatsView={activeStatsView}
          setActiveStatsView={setActiveStatsView}
          isLoading={categoryLoading && !!category}
          onStatusClick={handleStatusClick}
          onTypeClick={handleTypeClick}
          onResolutionClick={handleResolutionClick}
          activeStatusLabel={activeStatusLabel}
          activeTypeLabel={activeTypeLabel}
          activeResolutionLabel={activeResolutionLabel}
          activeStatusFilter={activeStatus}
          activeTypeFilter={activeType}
          activeResolutionFilter={activeResolution}
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
            usedColors={usedColors}
            allUsersForForm={allUsersDataForForm?.getLeanUsers || []}
            allUsersForFormLoading={allUsersForFormLoading}
            paletteColors={paletteColors}
            setPaletteColors={setPaletteColors}
            allCategories={allCategoriesForPicker || []}
            paletteColorsLoading={paletteColorsLoading}
            canManageColors={isAdmin}
            allUsersForFormError={allUsersForFormError}
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
