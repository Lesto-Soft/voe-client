// src/components/features/categoryAnalytics/CategoryCasesList.tsx
import React, { useMemo, useState, useRef, useEffect } from "react";
import { ICase, CaseType, CasePriority } from "../../../db/interfaces";
import CategoryCaseCard from "./CategoryCaseCard";
import {
  ArrowDownCircleIcon,
  InboxIcon,
  CalendarDaysIcon,
  // XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  translateStatus,
  translateCaseType,
  RESOLUTION_CATEGORY_CONFIG,
  ResolutionCategoryKey,
  translatePriority,
} from "../../../utils/categoryDisplayUtils";
import DateRangeSelector from "../userAnalytics/DateRangeSelector";
import FilterTag from "../../global/FilterTag";

// The local CaseStatusTab type can now be imported from Category.tsx
import { CaseStatusTab } from "../../../pages/Category";
import { RatingTierLabel } from "../../../utils/ratingCalculations";

type CategoryPieTabKey =
  | "status"
  | "type"
  | "resolution"
  | "priority"
  | "user"
  | "rating";

// --- START: NEW PROPS INTERFACE ---
interface CategoryCasesListProps {
  allCases: ICase[];
  casesForTabCounts: ICase[];
  visibleCasesCount: number;
  handleLoadMoreCases: () => void;
  scrollableRef: React.RefObject<HTMLDivElement | null>;
  serverBaseUrl: string;
  isLoading?: boolean;
  categoryName?: string;
  dateRange: { startDate: Date | null; endDate: Date | null };
  onDateRangeChange: (range: {
    startDate: Date | null;
    endDate: Date | null;
  }) => void;
  isAnyFilterActive: boolean;
  onClearAllFilters: () => void; // State and setters for filters
  activeStatus: CaseStatusTab;
  setActiveStatus: (status: CaseStatusTab) => void;
  activeType: CaseType | "all";
  onClearTypeFilter: () => void;
  activeResolution: ResolutionCategoryKey | "all";
  onClearResolutionFilter: () => void;
  // --- ADD THESE NEW PROPS ---
  activePriority: CasePriority | "all";
  onClearPriorityFilter: () => void;
  activeCreatorName: string | null;
  onClearCreatorFilter: () => void;
  onPieTabChange?: (tab: CategoryPieTabKey) => void;
  activeRatingTier: RatingTierLabel; // <-- ADD
  onClearRatingTierFilter: () => void; // <-- ADD
}

const CategoryCasesList: React.FC<CategoryCasesListProps> = ({
  allCases,
  casesForTabCounts,
  visibleCasesCount,
  handleLoadMoreCases,
  scrollableRef,
  serverBaseUrl,
  isLoading,
  categoryName,
  activeStatus,
  setActiveStatus,
  dateRange,
  onDateRangeChange,
  isAnyFilterActive,
  onClearAllFilters,
  activeType,
  onClearTypeFilter,
  activeResolution,
  onClearResolutionFilter,
  // --- DESTRUCTURE NEW PROPS ---
  activePriority,
  onClearPriorityFilter,
  activeCreatorName,
  onClearCreatorFilter,
  onPieTabChange,
  activeRatingTier, // <-- DESTRUCTURE
  onClearRatingTierFilter, // <-- DESTRUCTURE
}) => {
  const [isDateFilterVisible, setIsDateFilterVisible] = useState(false);
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const filtersContainerRef = useRef<HTMLDivElement>(null);

  // ✅ MODIFIED: Changed from && to || to show active state if at least one date is selected.
  const isDateFilterActive =
    dateRange.startDate !== null || dateRange.endDate !== null;

  const statusCounts = useMemo(() => {
    const counts: Record<CaseStatusTab, number> = {
      all: 0,
      OPEN: 0,
      IN_PROGRESS: 0,
      AWAITING_FINANCE: 0,
      CLOSED: 0,
    };
    // <-- UPDATE THE LOGIC TO USE THE NEW PROP -->
    counts.all = casesForTabCounts.length;
    casesForTabCounts.forEach((c) => {
      const status = c.status as CaseStatusTab;
      if (counts[status] !== undefined) {
        counts[status]++;
      }
    });
    return counts;
  }, [casesForTabCounts]); // <-- UPDATE THE DEPENDENCY -->

  const tabs: { key: CaseStatusTab; label: string }[] = [
    { key: "all", label: "Всички" },
    { key: "OPEN", label: translateStatus("OPEN") },
    { key: "IN_PROGRESS", label: translateStatus("IN_PROGRESS") },
    { key: "AWAITING_FINANCE", label: translateStatus("AWAITING_FINANCE") },
    { key: "CLOSED", label: translateStatus("CLOSED") },
  ];

  useEffect(() => {
    const scrollContainer = tabsContainerRef.current;

    if (!scrollContainer) return;

    const handleWheel = (e: WheelEvent) => {
      // If there's horizontal scroll, let the browser handle it natively
      if (e.deltaX !== 0) return;

      // If there's vertical scroll and the container is overflowing, convert it
      if (
        e.deltaY !== 0 &&
        scrollContainer.scrollWidth > scrollContainer.clientWidth
      ) {
        e.preventDefault();
        scrollContainer.scrollLeft += e.deltaY;
      }
    };

    scrollContainer.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      scrollContainer.removeEventListener("wheel", handleWheel);
    };
  }, []);

  // --- ADDED: Mouse-wheel scroll effect for filter bar ---
  useEffect(() => {
    const scrollContainer = filtersContainerRef.current;
    if (!scrollContainer) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaX !== 0) return;

      if (
        e.deltaY !== 0 &&
        scrollContainer.scrollWidth > scrollContainer.clientWidth
      ) {
        e.preventDefault();
        scrollContainer.scrollLeft += e.deltaY;
      }
    };

    scrollContainer.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      scrollContainer.removeEventListener("wheel", handleWheel);
    };
  }, [isAnyFilterActive]); // Re-attach if bar appears/disappears
  // --- END: Mouse-wheel scroll effect ---

  const casesToDisplay = allCases.slice(0, visibleCasesCount);
  const totalCasesCount = allCases.length;
  const canLoadMore =
    totalCasesCount > 0 && visibleCasesCount < totalCasesCount;

  if (isLoading) {
    return (
      <main className="lg:col-span-6 bg-white rounded-lg shadow-lg flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-200 animate-pulse">
          <div className="h-9 bg-gray-200 rounded-md w-full"></div>
        </div>
        <div
          ref={scrollableRef}
          className="overflow-y-auto flex-1 p-4 custom-scrollbar-xs"
        >
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="p-4 mb-3 bg-gray-50 rounded shadow animate-pulse"
            >
              <div className="flex items-start space-x-3">
                <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-8 bg-gray-200 rounded w-full mt-1"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="lg:col-span-6 bg-white rounded-lg shadow-lg flex flex-col overflow-hidden">
      <div className="p-1 sm:p-2 border-b border-gray-200">
        <div className="flex items-center justify-between pb-1">
          <div
            ref={tabsContainerRef}
            className="flex space-x-1 sm:space-x-2 overflow-x-auto custom-scrollbar-xs"
          >
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveStatus(tab.key)}
                disabled={
                  statusCounts[tab.key] === 0 && activeStatus !== tab.key
                }
                className={`hover:cursor-pointer px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-colors duration-150 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
                  activeStatus === tab.key
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {tab.label} ({statusCounts[tab.key]})
              </button>
            ))}
          </div>
          <button
            onClick={() => setIsDateFilterVisible((prev) => !prev)}
            title="Филтрирай по дата"
            className={`hover:cursor-pointer p-2 rounded-md transition-colors duration-150 ml-2 ${
              isDateFilterVisible
                ? "bg-indigo-100 text-indigo-600" // Style when selector is OPEN
                : isDateFilterActive
                ? "bg-indigo-100 text-gray-500 border-indigo-300" // Style when selector is CLOSED but filter is ACTIVE
                : "bg-gray-100 text-gray-500 hover:bg-gray-200" // Style when selector is CLOSED and INACTIVE
            }`}
          >
            <CalendarDaysIcon className="h-5 w-5" />
          </button>
        </div>
        {isDateFilterVisible && (
          <div className=" border-t pt-1 border-gray-200">
            <DateRangeSelector
              dateRange={dateRange}
              onDateRangeChange={onDateRangeChange}
            />
          </div>
        )}
      </div>

      {/* --- NEW: Active Filters Display --- */}
      {isAnyFilterActive && (
        <div className="px-4 py-1.5 border-b border-gray-200 bg-gray-50 flex items-center justify-between gap-x-4">
          <div
            ref={filtersContainerRef}
            className="flex items-center gap-2 overflow-x-auto custom-scrollbar-xs flex-nowrap py-1"
          >
            <span className="text-xs font-semibold text-gray-600 mr-2">
              Активни филтри:
            </span>
            {activeStatus !== "all" && (
              <FilterTag
                label={`Статус: ${translateStatus(activeStatus)}`}
                onRemove={() => setActiveStatus("all")}
                onClick={() => onPieTabChange?.("status")}
              />
            )}
            {activeType !== "all" && (
              <FilterTag
                label={`Тип: ${translateCaseType(activeType)}`}
                onRemove={onClearTypeFilter}
                onClick={() => onPieTabChange?.("type")}
              />
            )}
            {activeResolution !== "all" && (
              <FilterTag
                label={`Резолюция: ${
                  RESOLUTION_CATEGORY_CONFIG.find(
                    (c) => c.key === activeResolution
                  )?.label
                }`}
                onRemove={onClearResolutionFilter}
                onClick={() => onPieTabChange?.("resolution")}
              />
            )}
            {/* --- ADD THESE TWO NEW TAGS --- */}
            {activePriority !== "all" && (
              <FilterTag
                label={`Приоритет: ${translatePriority(activePriority)}`}
                onRemove={onClearPriorityFilter}
                onClick={() => onPieTabChange?.("priority")}
              />
            )}
            {activeCreatorName && (
              <FilterTag
                label={`Създател: ${activeCreatorName}`}
                onRemove={onClearCreatorFilter}
                onClick={() => onPieTabChange?.("user")}
              />
            )}
            {activeRatingTier !== "all" && (
              <FilterTag
                label={`Рейтинг: ${activeRatingTier}`}
                onRemove={onClearRatingTierFilter}
                onClick={() => onPieTabChange?.("rating")}
              />
            )}
            {/* -------------------------- */}
            {isDateFilterActive && (
              <FilterTag
                label="Период"
                onRemove={() =>
                  onDateRangeChange({ startDate: null, endDate: null })
                }
              />
            )}
          </div>
          <button
            onClick={onClearAllFilters}
            className="cursor-pointer text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline flex-shrink-0"
          >
            Изчисти всички
          </button>
        </div>
      )}

      <div
        ref={scrollableRef}
        className="overflow-y-auto flex-1 custom-scrollbar-xs max-h-[calc(100vh-6rem)]"
      >
        {totalCasesCount > 0 ? (
          <>
            <ul className="divide-y divide-gray-100">
              {casesToDisplay.map((caseItem) => (
                <CategoryCaseCard
                  key={caseItem._id}
                  caseItem={caseItem}
                  serverBaseUrl={serverBaseUrl}
                />
              ))}
            </ul>
            {canLoadMore && (
              <div className="p-4 flex justify-center mt-2 mb-2">
                <button
                  onClick={handleLoadMoreCases}
                  className="cursor-pointer flex items-center px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600 transition-colors duration-150"
                >
                  <ArrowDownCircleIcon className="h-5 w-5 mr-2" />
                  Зареди още... ({totalCasesCount - visibleCasesCount} остават)
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-10 text-center text-gray-500 h-full">
            <InboxIcon className="h-20 w-20 mb-4 text-gray-300" />
            <p className="text-xl font-medium">Няма намерени сигнали</p>
            <p className="text-sm">
              Няма регистрирани сигнали за категорията
              {categoryName && ` "${categoryName}"`} при избраните филтри.
            </p>
          </div>
        )}
      </div>
    </main>
  );
};

export default CategoryCasesList;
