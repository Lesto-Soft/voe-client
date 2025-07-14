// src/components/features/categoryAnalytics/CategoryCasesList.tsx
import React, { useMemo, useState } from "react";
import { ICase } from "../../../db/interfaces"; // Adjust path
import CategoryCaseCard from "./CategoryCaseCard"; // Adjust path
import {
  ArrowDownCircleIcon,
  InboxIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";
import { translateStatus } from "../../../utils/categoryDisplayUtils";
import DateRangeSelector from "../userAnalytics/DateRangeSelector";

type CaseStatusTab =
  | "all"
  | "OPEN"
  | "IN_PROGRESS"
  | "AWAITING_FINANCE"
  | "CLOSED";

interface CategoryCasesListProps {
  allCases: ICase[];
  dateFilteredCases: ICase[];
  visibleCasesCount: number;
  handleLoadMoreCases: () => void;
  scrollableRef: React.RefObject<HTMLDivElement | null>;
  serverBaseUrl: string;
  isLoading?: boolean;
  categoryName?: string;
  activeStatus: CaseStatusTab;
  setActiveStatus: (status: CaseStatusTab) => void;
  dateRange: { startDate: Date | null; endDate: Date | null };
  onDateRangeChange: (range: {
    startDate: Date | null;
    endDate: Date | null;
  }) => void;
}

const CategoryCasesList: React.FC<CategoryCasesListProps> = ({
  allCases,
  dateFilteredCases,
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
}) => {
  const [isDateFilterVisible, setIsDateFilterVisible] = useState(false);
  // Check if a date filter is currently applied.
  const isDateFilterActive = dateRange.startDate !== null;

  const statusCounts = useMemo(() => {
    const counts: Record<CaseStatusTab, number> = {
      all: 0,
      OPEN: 0,
      IN_PROGRESS: 0,
      AWAITING_FINANCE: 0,
      CLOSED: 0,
    };
    counts.all = dateFilteredCases.length;
    dateFilteredCases.forEach((c) => {
      const status = c.status as CaseStatusTab;
      if (counts[status] !== undefined) {
        counts[status]++;
      }
    });
    return counts;
  }, [dateFilteredCases]);

  const tabs: { key: CaseStatusTab; label: string }[] = [
    { key: "all", label: "Всички" },
    { key: "OPEN", label: translateStatus("OPEN") },
    { key: "IN_PROGRESS", label: translateStatus("IN_PROGRESS") },
    { key: "AWAITING_FINANCE", label: translateStatus("AWAITING_FINANCE") },
    { key: "CLOSED", label: translateStatus("CLOSED") },
  ];

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
          className="overflow-y-auto flex-1 p-4 custom-scrollbar"
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
          <div className="flex space-x-1 sm:space-x-2 overflow-x-auto custom-scrollbar-xs">
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
            // UPDATED: className logic to show active state when closed
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

      <div
        ref={scrollableRef}
        className="overflow-y-auto flex-1 custom-scrollbar"
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
                  className="flex items-center px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600 transition-colors duration-150"
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
