// src/components/features/userAnalytics/UserActivityList.tsx
import React, { useMemo, useEffect, useState, useRef } from "react";
import {
  IUser,
  ICase,
  IAnswer,
  IComment,
  ITask,
  ITaskActivity,
  CasePriority,
  CaseType,
  ICaseStatus,
  TaskStatus,
} from "../../../db/interfaces";
import UserActivityItemCard from "./UserActivityItemCard";
import UserRatingActivityCard from "./UserRatingActivityCard";
import UserTaskActivityCard from "./UserTaskActivityCard";
import UserTaskActivityActivityCard from "./UserTaskActivityActivityCard";
import {
  InboxIcon,
  ArrowDownCircleIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";
import useUserActivityScrollPersistence from "../../../hooks/useUserActivityScrollPersistence";
import DateRangeSelector from "./DateRangeSelector";
import type {
  ParentTab,
  CaseSubTab,
  TaskSubTab,
  PieTab,
} from "./UserStatisticsPanel";
import { RatingTierLabel } from "../../../pages/User";
import FilterTag from "../../global/FilterTag";
import {
  translateCaseType,
  translatePriority,
  translateStatus,
  translateTaskStatus,
} from "../../../utils/categoryDisplayUtils";

interface RatedCaseActivity {
  case: ICase;
  averageScore: number;
}

export interface CombinedActivity {
  id: string;
  date: string;
  item: ICase | IAnswer | IComment | RatedCaseActivity | ITask | ITaskActivity;
  activityType:
    | "case"
    | "answer"
    | "comment"
    | "rating"
    | "base_approval"
    | "finance_approval"
    | "task_created"
    | "task_assigned"
    | "task_completed"
    | "task_comment"
    | "task_help_request"
    | "task_approval_request"
    | "task_status_change"
    | "task_priority_change"
    | "task_assignee_change"
    | "task_analysis_submitted";
}

interface UserActivityListProps {
  user: IUser | undefined | null;
  activities: CombinedActivity[];
  isLoading?: boolean;
  counts: {
    casesTotal: number;
    tasksTotal: number;
    cases: number;
    answers: number;
    comments: number;
    ratings: number;
    approvals: number;
    finances: number;
    tasks: number;
    entries: number;
    analyses: number;
  };
  userId?: string;
  dateRange: { startDate: Date | null; endDate: Date | null };
  onDateRangeChange: (range: {
    startDate: Date | null;
    endDate: Date | null;
  }) => void;
  isAnyFilterActive: boolean;
  onClearAllFilters: () => void;
  // Case filter props
  activeCategoryName: string | null;
  onClearCategoryFilter: () => void;
  activeRatingTier: RatingTierLabel;
  onClearRatingTierFilter: () => void;
  activePriority: CasePriority | "all";
  onClearPriorityFilter: () => void;
  activeType: CaseType | "all";
  onClearTypeFilter: () => void;
  activeResolution: string;
  onClearResolutionFilter: () => void;
  activeStatus: ICaseStatus | "all";
  onClearStatusFilter: () => void;
  // Task filter props
  activeTaskStatus: TaskStatus | "all";
  onClearTaskStatusFilter: () => void;
  activeTaskPriority: CasePriority | "all";
  onClearTaskPriorityFilter: () => void;
  activeTaskTimeliness: string;
  onClearTaskTimelinessFilter: () => void;
  onPieTabChange?: (tab: PieTab) => void;
  cardView?: "full" | "compact";
  // 2-level tab props
  parentTab: ParentTab;
  subTab: CaseSubTab | TaskSubTab;
  onParentTabChange: (tab: ParentTab) => void;
  onSubTabChange: (tab: CaseSubTab | TaskSubTab) => void;
  showDateFilter?: boolean;
  showFiltersBar?: boolean;
}

const TASK_ACTIVITY_CARD_TYPES = new Set([
  "task_comment",
  "task_help_request",
  "task_approval_request",
  "task_status_change",
  "task_priority_change",
  "task_assignee_change",
  "task_analysis_submitted",
]);

const TASK_LIFECYCLE_TYPES = new Set([
  "task_created",
  "task_assigned",
  "task_completed",
]);

const LIFECYCLE_ACTIVITY_TYPES = new Set([
  "task_created",
  "task_assigned",
  "task_completed",
  "task_status_change",
  "task_priority_change",
  "task_assignee_change",
]);

const ENTRY_ACTIVITY_TYPES = new Set([
  "task_comment",
  "task_help_request",
  "task_approval_request",
]);

const TIMELINESS_LABELS: Record<string, string> = {
  onTime: "Завършени на време",
  inProgress: "В процес",
  overdue: "Закъсняващи",
  lateCompletion: "Закъснели",
  noDueDate: "Без краен срок",
};

const caseSubTabsConfig: {
  key: CaseSubTab;
  label: string;
  countKey: string;
}[] = [
  { key: "all", label: "Всички", countKey: "casesTotal" },
  { key: "cases", label: "Сигнали", countKey: "cases" },
  { key: "answers", label: "Решения", countKey: "answers" },
  { key: "comments", label: "Коментари", countKey: "comments" },
  { key: "ratings", label: "Оценки", countKey: "ratings" },
  { key: "approvals", label: "Одобрени", countKey: "approvals" },
  { key: "finances", label: "Финансирани", countKey: "finances" },
];

const taskSubTabsConfig: {
  key: TaskSubTab;
  label: string;
  countKey: string;
}[] = [
  { key: "all", label: "Всички", countKey: "tasksTotal" },
  { key: "tasks", label: "Задачи", countKey: "tasks" },
  { key: "entries", label: "Записи", countKey: "entries" },
  { key: "analyses", label: "Анализи", countKey: "analyses" },
];

const UserActivityList: React.FC<UserActivityListProps> = ({
  user,
  activities,
  isLoading,
  counts,
  userId,
  dateRange,
  onDateRangeChange,
  isAnyFilterActive,
  onClearAllFilters,
  activeCategoryName,
  onClearCategoryFilter,
  activeRatingTier,
  onClearRatingTierFilter,
  activePriority,
  onClearPriorityFilter,
  activeType,
  onClearTypeFilter,
  activeResolution,
  onClearResolutionFilter,
  activeStatus,
  onClearStatusFilter,
  activeTaskStatus,
  onClearTaskStatusFilter,
  activeTaskPriority,
  onClearTaskPriorityFilter,
  activeTaskTimeliness,
  onClearTaskTimelinessFilter,
  onPieTabChange,
  cardView = "full",
  parentTab,
  subTab,
  onParentTabChange,
  onSubTabChange,
  showDateFilter = true,
  showFiltersBar = true,
}) => {
  const [isDateFilterVisible, setIsDateFilterVisible] = useState(false);
  const isDateFilterActive =
    dateRange.startDate !== null || dateRange.endDate !== null;
  const isDataReady = !isLoading && !!user;
  const subTabsContainerRef = useRef<HTMLDivElement>(null);
  const filtersContainerRef = useRef<HTMLDivElement>(null);

  // Combine parentTab + subTab for scroll persistence key
  const scrollTabKey = `${parentTab}_${subTab}`;

  const {
    visibleCount,
    scrollableActivityListRef,
    handleLoadMoreItems,
    resetScrollAndVisibleCount,
  } = useUserActivityScrollPersistence(userId, scrollTabKey, isDataReady);

  useEffect(() => {
    if (resetScrollAndVisibleCount) {
      resetScrollAndVisibleCount();
    }
  }, [
    dateRange,
    activeCategoryName,
    activeRatingTier,
    resetScrollAndVisibleCount,
  ]);

  // Horizontal scroll on sub-tabs
  useEffect(() => {
    const scrollContainer = subTabsContainerRef.current;
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
    return () => scrollContainer.removeEventListener("wheel", handleWheel);
  }, [parentTab]);

  // Horizontal scroll on filters bar
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
    return () => scrollContainer.removeEventListener("wheel", handleWheel);
  }, [isAnyFilterActive]);

  // Scroll active sub-tab into view
  useEffect(() => {
    const activeTabElement = document.getElementById(
      `activity-subtab-${subTab}`,
    );
    if (activeTabElement) {
      activeTabElement.scrollIntoView({
        behavior: "smooth",
        inline: "nearest",
        block: "nearest",
      });
    }
  }, [subTab]);

  const activitiesToDisplay = useMemo((): CombinedActivity[] => {
    let baseActivities: CombinedActivity[];

    if (parentTab === "cases") {
      const caseActivities = activities.filter(
        (a) => !a.activityType.startsWith("task_"),
      );
      switch (subTab as CaseSubTab) {
        case "cases":
          baseActivities = caseActivities.filter(
            (a) => a.activityType === "case",
          );
          break;
        case "answers":
          baseActivities = caseActivities.filter(
            (a) => a.activityType === "answer",
          );
          break;
        case "comments":
          baseActivities = caseActivities.filter(
            (a) => a.activityType === "comment",
          );
          break;
        case "ratings":
          baseActivities = caseActivities.filter(
            (a) => a.activityType === "rating",
          );
          break;
        case "approvals":
          baseActivities = caseActivities.filter(
            (a) => a.activityType === "base_approval",
          );
          break;
        case "finances":
          baseActivities = caseActivities.filter(
            (a) => a.activityType === "finance_approval",
          );
          break;
        case "all":
        default:
          baseActivities = caseActivities;
          break;
      }
    } else {
      const taskActivities = activities.filter((a) =>
        a.activityType.startsWith("task_"),
      );
      switch (subTab as TaskSubTab) {
        case "tasks":
          baseActivities = taskActivities.filter((a) =>
            LIFECYCLE_ACTIVITY_TYPES.has(a.activityType),
          );
          break;
        case "entries":
          baseActivities = taskActivities.filter((a) =>
            ENTRY_ACTIVITY_TYPES.has(a.activityType),
          );
          break;
        case "analyses":
          baseActivities = taskActivities.filter(
            (a) => a.activityType === "task_analysis_submitted",
          );
          break;
        case "all":
        default:
          baseActivities = taskActivities;
          break;
      }
    }

    return baseActivities.slice(0, visibleCount);
  }, [parentTab, subTab, activities, visibleCount]);

  const activeSubTabsConfig =
    parentTab === "tasks" ? taskSubTabsConfig : caseSubTabsConfig;

  const getCurrentTabTotalCount = (): number => {
    if (parentTab === "cases") {
      const caseActivities = activities.filter(
        (a) => !a.activityType.startsWith("task_"),
      );
      switch (subTab as CaseSubTab) {
        case "cases":
          return caseActivities.filter((a) => a.activityType === "case").length;
        case "answers":
          return caseActivities.filter((a) => a.activityType === "answer")
            .length;
        case "comments":
          return caseActivities.filter((a) => a.activityType === "comment")
            .length;
        case "ratings":
          return caseActivities.filter((a) => a.activityType === "rating")
            .length;
        case "approvals":
          return caseActivities.filter(
            (a) => a.activityType === "base_approval",
          ).length;
        case "finances":
          return caseActivities.filter(
            (a) => a.activityType === "finance_approval",
          ).length;
        case "all":
        default:
          return caseActivities.length;
      }
    } else {
      const taskActivities = activities.filter((a) =>
        a.activityType.startsWith("task_"),
      );
      switch (subTab as TaskSubTab) {
        case "tasks":
          return taskActivities.filter((a) =>
            LIFECYCLE_ACTIVITY_TYPES.has(a.activityType),
          ).length;
        case "entries":
          return taskActivities.filter((a) =>
            ENTRY_ACTIVITY_TYPES.has(a.activityType),
          ).length;
        case "analyses":
          return taskActivities.filter(
            (a) => a.activityType === "task_analysis_submitted",
          ).length;
        case "all":
        default:
          return taskActivities.length;
      }
    }
  };

  const totalItemsForCurrentTab = getCurrentTabTotalCount();
  const canLoadMore = totalItemsForCurrentTab > visibleCount;

  // Determine which filter tags are relevant for the current parent tab
  const hasCaseFilters =
    activeCategoryName !== null ||
    activeRatingTier !== "all" ||
    activePriority !== "all" ||
    activeType !== "all" ||
    activeResolution !== "all" ||
    activeStatus !== "all";
  const hasTaskFilters =
    activeTaskStatus !== "all" ||
    activeTaskPriority !== "all" ||
    activeTaskTimeliness !== "all";
  const hasRelevantFilters =
    parentTab === "cases"
      ? hasCaseFilters || isDateFilterActive
      : hasTaskFilters || isDateFilterActive;

  if (isLoading) {
    return (
      <div className="lg:col-span-6 bg-white rounded-lg shadow-lg flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-200 animate-pulse">
          <div className="flex space-x-2 sm:space-x-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-8 bg-gray-200 rounded-md w-24"></div>
            ))}
          </div>
        </div>
        <div className="p-4 space-y-3 animate-pulse">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="p-4 bg-gray-100 rounded">
              <div className="flex items-start space-x-3">
                <div className="h-6 w-6 bg-gray-200 rounded-md"></div>
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg flex flex-col overflow-hidden max-h-full h-full">
      <div className="p-1 sm:p-2 border-b border-gray-200">
        {/* Row 1: Parent tabs + calendar */}
        <div className="flex items-center justify-between pb-1">
          <div className="flex py-1 space-x-1 sm:space-x-2 mr-5">
            <button
              onClick={() => onParentTabChange("cases")}
              className={`hover:cursor-pointer px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-colors duration-150 focus:outline-none flex items-center gap-x-1.5 ${
                parentTab === "cases"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <DocumentTextIcon className="h-4 w-4" />
              Сигнали ({counts.casesTotal})
            </button>
            <button
              onClick={() => onParentTabChange("tasks")}
              className={`hover:cursor-pointer px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-colors duration-150 focus:outline-none flex items-center gap-x-1.5 ${
                parentTab === "tasks"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <ClipboardDocumentCheckIcon className="h-4 w-4" />
              Задачи ({counts.tasksTotal})
            </button>
          </div>

          {showDateFilter && (
            <button
              onClick={() => setIsDateFilterVisible((prev) => !prev)}
              title="Filter by date"
              className={`hover:cursor-pointer p-2 rounded-md transition-colors duration-150 ${
                isDateFilterVisible
                  ? "bg-indigo-100 text-indigo-600"
                  : isDateFilterActive
                    ? "bg-indigo-100 text-gray-500"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              <CalendarDaysIcon className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Row 2: Sub-tabs */}
        <div
          ref={subTabsContainerRef}
          className="flex py-1 space-x-1 sm:space-x-2 overflow-x-auto pl-1 custom-scrollbar-xs"
        >
          {activeSubTabsConfig.map((tab) => {
            const count = counts[tab.countKey as keyof typeof counts] ?? 0;
            return (
              <button
                key={tab.key}
                id={`activity-subtab-${tab.key}`}
                onClick={() => onSubTabChange(tab.key)}
                disabled={count === 0}
                className={`hover:cursor-pointer px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-colors duration-150 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
                  subTab === tab.key
                    ? "bg-indigo-100 text-indigo-700 ring-1 ring-indigo-300"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
              >
                {tab.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Date filter */}
        {showDateFilter && isDateFilterVisible && (
          <div className="border-t pt-1 border-gray-200">
            <DateRangeSelector
              dateRange={dateRange}
              onDateRangeChange={onDateRangeChange}
            />
          </div>
        )}
      </div>

      {/* Filter tags bar */}
      {showFiltersBar && hasRelevantFilters && (
        <div className="px-4 py-1.5 border-b border-gray-200 bg-gray-50 flex items-center justify-between gap-x-4">
          <div
            ref={filtersContainerRef}
            className="flex items-center gap-2 overflow-x-auto custom-scrollbar-xs flex-nowrap py-1"
          >
            <span className="text-xs font-semibold text-gray-600 mr-2 flex-shrink-0">
              Активни филтри:
            </span>
            {/* Case filter tags */}
            {parentTab === "cases" && (
              <>
                {activeCategoryName && (
                  <FilterTag
                    label={`Категория: ${activeCategoryName}`}
                    onRemove={onClearCategoryFilter}
                    onClick={() => onPieTabChange?.("categories")}
                  />
                )}
                {activeRatingTier !== "all" && (
                  <FilterTag
                    label={`Оценка: ${activeRatingTier}`}
                    onRemove={onClearRatingTierFilter}
                    onClick={() => onPieTabChange?.("ratings")}
                  />
                )}
                {activePriority !== "all" && (
                  <FilterTag
                    label={`Приоритет: ${translatePriority(activePriority)}`}
                    onRemove={onClearPriorityFilter}
                    onClick={() => onPieTabChange?.("priority")}
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
                    label={`Реакция: ${activeResolution}`}
                    onRemove={onClearResolutionFilter}
                    onClick={() => onPieTabChange?.("resolution")}
                  />
                )}
                {activeStatus !== "all" && (
                  <FilterTag
                    label={`Статус: ${translateStatus(activeStatus)}`}
                    onRemove={onClearStatusFilter}
                    onClick={() => onPieTabChange?.("status")}
                  />
                )}
              </>
            )}
            {/* Task filter tags */}
            {parentTab === "tasks" && (
              <>
                {activeTaskStatus !== "all" && (
                  <FilterTag
                    label={`Статус: ${translateTaskStatus(activeTaskStatus)}`}
                    onRemove={onClearTaskStatusFilter}
                    onClick={() => onPieTabChange?.("taskStatus")}
                  />
                )}
                {activeTaskPriority !== "all" && (
                  <FilterTag
                    label={`Приоритет: ${translatePriority(activeTaskPriority)}`}
                    onRemove={onClearTaskPriorityFilter}
                    onClick={() => onPieTabChange?.("taskPriority")}
                  />
                )}
                {activeTaskTimeliness !== "all" && (
                  <FilterTag
                    label={`Срок: ${TIMELINESS_LABELS[activeTaskTimeliness] || activeTaskTimeliness}`}
                    onRemove={onClearTaskTimelinessFilter}
                    onClick={() => onPieTabChange?.("taskTimeliness")}
                  />
                )}
              </>
            )}
            {/* Date filter tag (always relevant) */}
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

      {/* Activity list */}
      <div
        ref={scrollableActivityListRef}
        className="flex-1 overflow-y-auto custom-scrollbar-xs max-h-[calc(100vh-6rem)]"
      >
        {activitiesToDisplay.length > 0 ? (
          <>
            <div>
              {activitiesToDisplay.map((activity) =>
                activity.activityType === "rating" ? (
                  <UserRatingActivityCard
                    key={activity.id}
                    ratedCase={(activity.item as RatedCaseActivity).case}
                    averageScore={
                      (activity.item as RatedCaseActivity).averageScore
                    }
                    date={activity.date}
                    actor={user!}
                    view={cardView}
                  />
                ) : TASK_ACTIVITY_CARD_TYPES.has(activity.activityType) ? (
                  <UserTaskActivityActivityCard
                    key={activity.id}
                    taskActivity={activity.item as ITaskActivity}
                    activityType={activity.activityType as any}
                    date={activity.date}
                    view={cardView}
                  />
                ) : TASK_LIFECYCLE_TYPES.has(activity.activityType) ? (
                  <UserTaskActivityCard
                    key={activity.id}
                    task={activity.item as ITask}
                    activityType={
                      activity.activityType as
                        | "task_created"
                        | "task_assigned"
                        | "task_completed"
                    }
                    date={activity.date}
                    view={cardView}
                  />
                ) : (
                  <UserActivityItemCard
                    key={activity.id}
                    item={activity.item as ICase | IAnswer | IComment}
                    activityType={
                      activity.activityType as
                        | "case"
                        | "answer"
                        | "comment"
                        | "base_approval"
                        | "finance_approval"
                    }
                    actor={user!}
                    date={activity.date}
                    view={cardView}
                  />
                ),
              )}
            </div>

            {canLoadMore && (
              <div className="p-4 flex justify-center mt-2 mb-2">
                <button
                  onClick={handleLoadMoreItems}
                  className="cursor-pointer flex items-center px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600 transition-colors duration-150"
                >
                  <ArrowDownCircleIcon className="h-5 w-5 mr-2" />
                  Зареди още... ({totalItemsForCurrentTab - visibleCount}{" "}
                  остават)
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-10 text-gray-500 min-h-[200px]">
            <InboxIcon className="h-12 w-12 mb-3 text-gray-300" />
            <p className="text-md font-medium">
              Няма активности в тази категория
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserActivityList;
