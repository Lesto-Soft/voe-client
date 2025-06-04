// src/components/features/categoryAnalytics/CategoryCasesList.tsx
import React from "react";
import { ICase } from "../../../db/interfaces"; // Adjust path
import CategoryCaseCard from "./CategoryCaseCard"; // Adjust path
import {
  getStatusStyle as getStatusStyleUtil,
  getPriorityStyle as getPriorityStyleUtil,
  translatePriority as translatePriorityUtil,
  translateStatus as translateStatusUtil,
  StatusStyle,
} from "../../../utils/categoryDisplayUtils"; // Adjust path
import { ArrowDownCircleIcon, InboxIcon } from "@heroicons/react/24/outline";

interface CategoryCasesListProps {
  allCases: ICase[] | undefined; // All cases for the category
  visibleCasesCount: number;
  handleLoadMoreCases: () => void;
  scrollableRef: React.RefObject<HTMLDivElement | null>;
  serverBaseUrl: string;
  isLoading?: boolean; // For showing a loading state for the list
  categoryName?: string; // For empty state message
}

const CategoryCasesList: React.FC<CategoryCasesListProps> = ({
  allCases,
  visibleCasesCount,
  handleLoadMoreCases,
  scrollableRef,
  serverBaseUrl,
  isLoading,
  categoryName,
}) => {
  const casesToDisplay = allCases ? allCases.slice(0, visibleCasesCount) : [];
  const totalCasesCount = allCases?.length || 0;
  const canLoadMore =
    totalCasesCount > 0 && visibleCasesCount < totalCasesCount;

  if (isLoading) {
    return (
      <main className="lg:col-span-6 bg-white rounded-lg shadow-lg flex flex-col overflow-hidden">
        <div
          ref={scrollableRef}
          className="overflow-y-auto flex-1 p-4 custom-scrollbar"
        >
          {/* Basic skeleton - can be replaced with more detailed card skeletons */}
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

  if (totalCasesCount === 0) {
    return (
      <main className="lg:col-span-6 bg-white rounded-lg shadow-lg flex flex-col overflow-hidden">
        <div
          ref={scrollableRef} // Keep ref for consistency, though no scrolling here
          className="overflow-y-auto flex-1 flex flex-col items-center justify-center p-10 text-center text-gray-500 custom-scrollbar"
        >
          <InboxIcon className="h-20 w-20 mb-4 text-gray-300" />
          <p className="text-xl font-medium">Няма подадени сигнали</p>
          <p className="text-sm">
            Все още няма регистрирани сигнали за категорията
            {categoryName && ` "${categoryName}"`}.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="lg:col-span-6 bg-white rounded-lg shadow-lg flex flex-col overflow-hidden">
      <div
        ref={scrollableRef}
        className="overflow-y-auto flex-1 custom-scrollbar"
      >
        <ul className="divide-y-3 divide-gray-200">
          {" "}
          {/* Slightly thinner divider */}
          {casesToDisplay.map((caseItem) => {
            const statusStyle: StatusStyle = getStatusStyleUtil(
              caseItem.status as string
            );
            const priorityStyleClass: string = getPriorityStyleUtil(
              caseItem.priority
            );
            const translatedPriorityStr: string = translatePriorityUtil(
              caseItem.priority
            );
            const translatedStatusStr: string = translateStatusUtil(
              caseItem.status as string
            );

            return (
              <CategoryCaseCard
                key={caseItem._id}
                caseItem={caseItem}
                statusStyle={statusStyle}
                priorityStyleClass={priorityStyleClass}
                translatedPriority={translatedPriorityStr}
                translatedStatus={translatedStatusStr}
                serverBaseUrl={serverBaseUrl}
              />
            );
          })}
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
      </div>
    </main>
  );
};

export default CategoryCasesList;
