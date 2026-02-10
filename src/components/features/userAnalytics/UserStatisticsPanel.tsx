// src/components/features/userAnalytics/UserStatisticsPanel.tsx
import React, { useState, useRef, useEffect } from "react";
import {
  ChartPieIcon,
  DocumentTextIcon,
  ChatBubbleBottomCenterTextIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  StarIcon,
  InformationCircleIcon,
  HandThumbUpIcon,
  BanknotesIcon,
  GlobeAltIcon,
  CalendarDaysIcon,
  ClipboardDocumentCheckIcon,
  // CheckCircleIcon,
  // ClockIcon,
} from "@heroicons/react/24/outline";
import { UserActivityStats } from "../../../hooks/useUserActivityStats";
import StatisticPieChart from "../../charts/StatisticPieChart";
import { PieSegmentData } from "../../charts/PieChart";
import { RatingTierLabel } from "../../../pages/User";
import * as Tooltip from "@radix-ui/react-tooltip";
import DateRangeSelector from "./DateRangeSelector";
import { CasePriority, CaseType, ICaseStatus } from "../../../db/interfaces";
import {
  translateCaseType,
  translatePriority,
  translateStatus,
} from "../../../utils/categoryDisplayUtils";
import FilterTag from "../../global/FilterTag";
import StatItem from "../../global/StatItem";

// define a type for the text-based stats
export interface UserTextStats {
  totalSignals: number;
  totalAnswers: number;
  totalComments: number;
  averageCaseRating: number | null;
}

// MODIFIED: Added 'ratings' to the activity selector type
export type StatsActivityType =
  | "all"
  | "cases"
  | "answers"
  | "comments"
  | "ratings"
  | "approvals"
  | "finances"
  | "tasks";

interface UserStatisticsPanelProps {
  textStats: UserTextStats | undefined | null;
  pieChartStats: UserActivityStats | undefined | null;
  userName?: string;
  isLoading?: boolean;
  onCategoryClick?: (segment: PieSegmentData) => void;
  onRatingTierClick?: (segment: PieSegmentData) => void;
  activeCategoryLabel?: string | null;
  activeRatingTierLabel?: string | null;
  onPriorityClick?: (segment: PieSegmentData) => void;
  onResolutionClick?: (segment: PieSegmentData) => void;
  onTypeClick?: (segment: PieSegmentData) => void;
  activePriorityFilter: CasePriority | "all";
  activeTypeFilter: CaseType | "all";
  activeResolutionFilter: string;
  activeStatusFilter: ICaseStatus | "all";
  onStatusClick?: (segment: PieSegmentData) => void;
  activeCategoryFilter: string | null;
  activeRatingTierFilter: RatingTierLabel;
  activeStatsTab: StatsActivityType;
  onStatsTabChange: (tab: StatsActivityType) => void;
  viewMode?: "side" | "center";
  // Add the new prop for receiving activity counts
  activityCounts: {
    all: number;
    cases: number;
    answers: number;
    comments: number;
    ratings: number;
    approvals: number;
    finances: number;
    tasks: number;
  };
  // Add new props to receive date range state and handler
  dateRange?: { startDate: Date | null; endDate: Date | null };
  onDateRangeChange?: (range: {
    startDate: Date | null;
    endDate: Date | null;
  }) => void;
  isAnyFilterActive?: boolean;
  onClearAllFilters?: () => void;
  activeCategoryName?: string | null;
  onClearCategoryFilter?: () => void;
  activeRatingTier?: RatingTierLabel;
  onClearRatingTierFilter?: () => void;
  onClearPriorityFilter?: () => void;
  onClearTypeFilter?: () => void;
  onClearResolutionFilter?: () => void;
  onClearStatusFilter?: () => void;
  activePieTab: PieTab;
  onPieTabChange: (tab: PieTab) => void;
}

// Define the type for our new tabs
type PieTab =
  | "categories"
  | "ratings"
  | "priority"
  | "resolution"
  | "type"
  | "status"
  | "taskStatus"
  | "taskPriority";

export type { PieTab };

const UserStatisticsPanel: React.FC<UserStatisticsPanelProps> = ({
  textStats,
  pieChartStats,
  isLoading,
  onCategoryClick,
  onRatingTierClick,
  activeCategoryLabel,
  activeRatingTierLabel,
  onPriorityClick,
  onResolutionClick,
  onTypeClick,
  activePriorityFilter,
  onStatusClick,
  activeStatusFilter,
  activeTypeFilter,
  activeResolutionFilter,
  activeCategoryFilter,
  activeRatingTierFilter,
  activeStatsTab,
  onStatsTabChange,
  viewMode = "side",
  activityCounts,
  dateRange, // Destructure new props
  onDateRangeChange,
  isAnyFilterActive,
  onClearAllFilters,
  activeCategoryName,
  onClearCategoryFilter,
  activeRatingTier,
  onClearRatingTierFilter,
  onClearPriorityFilter,
  onClearTypeFilter,
  onClearStatusFilter,
  onClearResolutionFilter,
  activePieTab,
  onPieTabChange,
}) => {
  const pieTabsContainerRef = useRef<HTMLDivElement>(null);
  const filtersContainerRef = useRef<HTMLDivElement>(null);
  // State to manage the date filter's visibility
  const [isDateFilterVisible, setIsDateFilterVisible] = useState(
    viewMode === "center"
  );
  const isInteractive = onCategoryClick || onRatingTierClick;

  useEffect(() => {
    const scrollContainer = pieTabsContainerRef.current;
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
  }, [isAnyFilterActive]);

  // This effect runs whenever the active pie tab changes
  useEffect(() => {
    // Construct the ID of the active tab button
    const activeTabElement = document.getElementById(`pie-tab-${activePieTab}`);
    // If the element is found, scroll it into the visible area of its container
    if (activeTabElement) {
      activeTabElement.scrollIntoView({
        behavior: "smooth",
        inline: "nearest", // Crucial for horizontal scrolling
        block: "nearest",
      });
    }
  }, [activePieTab]);

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
  }, [isAnyFilterActive]);

  // Check if a date range is active to style the button accordingly
  const isDateFilterActive =
    dateRange?.startDate !== null || dateRange?.endDate !== null;

  const activityTabsConfig: {
    key: StatsActivityType;
    label: string;
    icon: React.ElementType;
  }[] = [
    { key: "all", label: "Всички", icon: GlobeAltIcon },
    { key: "cases", label: "Сигнали", icon: DocumentTextIcon },
    { key: "answers", label: "Решения", icon: ChatBubbleBottomCenterTextIcon },
    {
      key: "comments",
      label: "Коментари",
      icon: ChatBubbleOvalLeftEllipsisIcon,
    },
    { key: "ratings", label: "Оценки", icon: StarIcon },
    { key: "approvals", label: "Одобрени", icon: HandThumbUpIcon },
    { key: "finances", label: "Финанси", icon: BanknotesIcon },
    { key: "tasks", label: "Задачи", icon: ClipboardDocumentCheckIcon },
  ];

  if (isLoading) {
    return (
      <aside className="lg:col-span-3 bg-white rounded-lg shadow-lg flex flex-col overflow-hidden">
        <div className="p-6 space-y-4 animate-pulse">
          <div className="h-7 bg-gray-300 rounded w-3/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-5 bg-gray-200 rounded-md"></div>
            <div className="h-5 bg-gray-200 rounded-md"></div>
            <div className="h-5 bg-gray-200 rounded-md"></div>
          </div>
          <div className="h-9 bg-gray-300 rounded-md w-full"></div>
          <div className="flex justify-center mt-4">
            <div className="h-40 w-40 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      </aside>
    );
  }

  if (!textStats || !pieChartStats) {
    return (
      <aside className="lg:col-span-3 bg-white rounded-lg shadow-lg flex flex-col overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
            <ChartPieIcon className="h-6 w-6 mr-2 text-teal-600" />
            Статистика
          </h3>
          <p className="text-sm text-gray-500">
            Няма налична статистика за този потребител.
          </p>
        </div>
      </aside>
    );
  }

  // 👇 Simplified TextStatsSection as requested
  const TextStatsSection = (
    <div
      className={
        viewMode === "center"
          ? "flex items-center justify-around text-center"
          : "space-y-1"
      }
    >
      <StatItem
        icon={DocumentTextIcon}
        label="Сигнали"
        value={textStats.totalSignals}
        iconColorClass="text-blue-500"
      />
      <StatItem
        icon={ChatBubbleBottomCenterTextIcon}
        label="Решения"
        value={textStats.totalAnswers}
        iconColorClass="text-green-500"
      />
      <StatItem
        icon={ChatBubbleOvalLeftEllipsisIcon}
        label="Коментари"
        value={textStats.totalComments}
        iconColorClass="text-purple-500"
      />
      <StatItem
        icon={StarIcon}
        label="Средна оценка"
        value={
          textStats.averageCaseRating
            ? textStats.averageCaseRating.toFixed(2)
            : "-"
        }
        iconColorClass="text-amber-500"
      />
    </div>
  );

  const isTasksTab = activeStatsTab === "tasks";

  const casePieTabsConfig = [
    {
      key: "categories",
      label: "По Категории",
      filterActive: activeCategoryFilter !== null,
      clearFilter: onClearCategoryFilter,
    },
    {
      key: "ratings",
      label: "По Рейтинг",
      filterActive: activeRatingTierFilter !== "all",
      clearFilter: onClearRatingTierFilter,
    },
    {
      key: "priority",
      label: "По Приоритет",
      filterActive: activePriorityFilter !== "all",
      clearFilter: onClearPriorityFilter,
    },
    {
      key: "resolution",
      label: "По Време",
      filterActive: activeResolutionFilter !== "all",
      clearFilter: onClearResolutionFilter,
    },
    {
      key: "status",
      label: "По Статус",
      filterActive: activeStatusFilter !== "all",
      clearFilter: onClearStatusFilter,
    },
    {
      key: "type",
      label: "По Тип",
      filterActive: activeTypeFilter !== "all",
      clearFilter: onClearTypeFilter,
    },
  ];

  const taskPieTabsConfig = [
    {
      key: "taskStatus",
      label: "По Статус",
      filterActive: false,
      clearFilter: undefined,
    },
    {
      key: "taskPriority",
      label: "По Приоритет",
      filterActive: false,
      clearFilter: undefined,
    },
  ];

  const pieTabsConfig = isTasksTab ? taskPieTabsConfig : casePieTabsConfig;

  const PieChartSection = (
    <>
      <div>
        <label className="text-xs font-semibold text-gray-500">
          Вижте изолирана диаграма за:
        </label>
        {/* changed to a grid layout for consistent button widths */}
        <div
          className={`mt-1.5 grid ${
            viewMode === "center" ? "grid-cols-4" : "grid-cols-3"
          } gap-1.5`}
        >
          {activityTabsConfig.map((tab) => {
            // Get the specific count for the current tab
            const count =
              activityCounts[tab.key as keyof typeof activityCounts] ?? 0;
            return (
              <button
                key={tab.key}
                onClick={() => onStatsTabChange(tab.key)}
                // Disable the button if its count is 0
                disabled={count === 0}
                className={`cursor-pointer flex-grow basis-auto flex items-center justify-center gap-x-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                  activeStatsTab === tab.key
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {/* Display the count in the tab label */}
                <span>
                  {tab.label} ({count})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div
        ref={pieTabsContainerRef}
        className="flex border-b border-gray-200 overflow-x-auto custom-scrollbar-xs py-1"
      >
        {pieTabsConfig.map((tab) => (
          <button
            key={tab.key}
            id={`pie-tab-${tab.key}`}
            onClick={() => onPieTabChange(tab.key as PieTab)}
            className={`cursor-pointer relative flex-1 py-2 px-3 text-sm font-medium focus:outline-none transition-colors duration-150 whitespace-nowrap ${
              activePieTab === tab.key
                ? "border-b-2 border-indigo-500 text-indigo-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
            {tab.filterActive && (
              <span
                title="Изчисти филтъра"
                onClick={(e) => {
                  e.stopPropagation();
                  tab.clearFilter?.();
                }}
                className="absolute top-1 right-1 h-2 w-2 rounded-full bg-indigo-500 hover:ring-2 hover:ring-indigo-300"
              ></span>
            )}
          </button>
        ))}
      </div>
      <div className="mt-3">
        {activePieTab === "categories" && (
          <StatisticPieChart
            title="Разпределение по Категория"
            pieData={pieChartStats.signalsByCategoryChartData}
            onSegmentClick={onCategoryClick}
            activeLabel={activeCategoryLabel}
            layout={viewMode === "center" ? "horizontal" : "vertical"}
          />
        )}
        {activePieTab === "ratings" && (
          <StatisticPieChart
            title="Разпределение по Оценка"
            pieData={pieChartStats.ratingTierDistributionData}
            onSegmentClick={onRatingTierClick}
            activeLabel={activeRatingTierLabel}
            layout={viewMode === "center" ? "horizontal" : "vertical"}
          />
        )}
        {activePieTab === "priority" && (
          <StatisticPieChart
            title="Разпределение по Приоритет"
            pieData={pieChartStats.priorityDistributionData}
            onSegmentClick={onPriorityClick}
            activeLabel={
              pieChartStats.priorityDistributionData.find(
                (d) => d.id === activePriorityFilter
              )?.label
            }
            layout={viewMode === "center" ? "horizontal" : "vertical"}
          />
        )}
        {activePieTab === "resolution" && (
          <StatisticPieChart
            title="Разпределение по Време за реакция"
            pieData={pieChartStats.resolutionTimeDistributionData}
            onSegmentClick={onResolutionClick}
            activeLabel={activeResolutionFilter}
            layout={viewMode === "center" ? "horizontal" : "vertical"}
          />
        )}
        {activePieTab === "type" && (
          <StatisticPieChart
            title="Разпределение по Тип"
            pieData={pieChartStats.typeDistributionData}
            onSegmentClick={onTypeClick}
            activeLabel={
              pieChartStats.typeDistributionData.find(
                (d) => d.id === activeTypeFilter
              )?.label
            }
            layout={viewMode === "center" ? "horizontal" : "vertical"}
          />
        )}
        {activePieTab === "status" && (
          <StatisticPieChart
            title="Разпределение по Статус"
            pieData={pieChartStats.statusDistributionData}
            onSegmentClick={onStatusClick}
            activeLabel={
              pieChartStats.statusDistributionData.find(
                (d) => d.id === activeStatusFilter
              )?.label
            }
            layout={viewMode === "center" ? "horizontal" : "vertical"}
          />
        )}
        {activePieTab === "taskStatus" && (
          <StatisticPieChart
            title="Задачи по Статус"
            pieData={pieChartStats.taskStatusDistributionData}
            layout={viewMode === "center" ? "horizontal" : "vertical"}
          />
        )}
        {activePieTab === "taskPriority" && (
          <StatisticPieChart
            title="Задачи по Приоритет"
            pieData={pieChartStats.taskPriorityDistributionData}
            layout={viewMode === "center" ? "horizontal" : "vertical"}
          />
        )}
      </div>
    </>
  );

  return (
    <Tooltip.Provider>
      <aside className="bg-white rounded-lg shadow-lg flex flex-col overflow-hidden h-full">
        <div className="p-4 sm:p-4 space-y-3 overflow-y-auto flex-1 custom-scrollbar-xs">
          {/* 👇 Wrap heading in a flex container to align with the button */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-x-2">
              <ChartPieIcon className="h-6 w-6 mr-2 text-teal-600" />
              Статистика
              {isInteractive && (
                <Tooltip.Root delayDuration={150}>
                  <Tooltip.Trigger asChild>
                    <button className="cursor-help text-gray-400 hover:text-sky-600">
                      <InformationCircleIcon className="h-5 w-5" />
                    </button>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content
                      className="select-none rounded-md bg-gray-800 px-3 py-2 text-sm leading-tight text-white shadow-lg z-50"
                      sideOffset={5}
                    >
                      Кликнете върху диаграмите, за да филтрирате.
                      <Tooltip.Arrow className="fill-gray-800" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              )}
            </h3>
            {/* 👇 Render the toggle button only in the center view mode */}
            {viewMode === "center" && (
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

          {/* 👇 Update the conditional render to use the new state */}
          {viewMode === "center" &&
            isDateFilterVisible &&
            dateRange &&
            onDateRangeChange && (
              <div className="border-t border-b pt-1 pb-1 border-gray-200 bg-gray-50">
                <DateRangeSelector
                  dateRange={dateRange}
                  onDateRangeChange={onDateRangeChange}
                />
              </div>
            )}

          {/* 👇 Conditionally render the Active Filters section */}
          {viewMode === "center" &&
            isAnyFilterActive &&
            onClearAllFilters && ( // Ensure handlers are present
              <div className="px-3 py-1.5 rounded-md border border-gray-200 bg-gray-50 flex items-center justify-between gap-x-4">
                <div
                  ref={filtersContainerRef}
                  className="flex items-center gap-2 overflow-x-auto custom-scrollbar-xs flex-nowrap py-1"
                >
                  <span className="text-xs font-semibold text-gray-600 mr-2 flex-shrink-0">
                    Активни филтри:
                  </span>
                  {activeCategoryName && onClearCategoryFilter && (
                    <FilterTag
                      label={`Категория: ${activeCategoryName}`}
                      onRemove={onClearCategoryFilter}
                      onClick={() => onPieTabChange("categories")}
                    />
                  )}
                  {activeRatingTier !== "all" && onClearRatingTierFilter && (
                    <FilterTag
                      label={`Оценка: ${activeRatingTier}`}
                      onRemove={onClearRatingTierFilter}
                      onClick={() => onPieTabChange("ratings")}
                    />
                  )}
                  {activePriorityFilter !== "all" && onClearPriorityFilter && (
                    <FilterTag
                      label={`Приоритет: ${translatePriority(
                        activePriorityFilter
                      )}`}
                      onRemove={onClearPriorityFilter}
                      onClick={() => onPieTabChange("priority")}
                    />
                  )}
                  {activeTypeFilter !== "all" && onClearTypeFilter && (
                    <FilterTag
                      label={`Тип: ${translateCaseType(activeTypeFilter)}`}
                      onRemove={onClearTypeFilter}
                      onClick={() => onPieTabChange("type")}
                    />
                  )}
                  {activeResolutionFilter !== "all" &&
                    onClearResolutionFilter && (
                      <FilterTag
                        label={`Реакция: ${activeResolutionFilter}`}
                        onRemove={onClearResolutionFilter}
                        onClick={() => onPieTabChange("resolution")}
                      />
                    )}
                  {activeStatusFilter !== "all" && onClearStatusFilter && (
                    <FilterTag
                      label={`Статус: ${translateStatus(activeStatusFilter)}`}
                      onRemove={onClearStatusFilter}
                      onClick={() => onPieTabChange("status")}
                    />
                  )}
                  {isDateFilterActive && onDateRangeChange && (
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
          {viewMode === "center" ? (
            <>
              {PieChartSection}
              {/* {TextStatsSection} */}
            </>
          ) : (
            <>
              {TextStatsSection}
              {PieChartSection}
            </>
          )}
        </div>
      </aside>
    </Tooltip.Provider>
  );
};

export default UserStatisticsPanel;
