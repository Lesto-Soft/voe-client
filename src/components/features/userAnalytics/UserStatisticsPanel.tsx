// src/components/features/userAnalytics/UserStatisticsPanel.tsx
import React, { useState } from "react";
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
  ClockIcon,
} from "@heroicons/react/24/outline";
import { UserActivityStats } from "../../../hooks/useUserActivityStats";
import StatisticPieChart from "../../charts/StatisticPieChart";
import { PieSegmentData } from "../../charts/PieChart";
import { RatingTierLabel } from "../../../pages/User";
import * as Tooltip from "@radix-ui/react-tooltip";
import DateRangeSelector from "./DateRangeSelector";
import { CasePriority, CaseType } from "../../../db/interfaces";
import {
  translateCaseType,
  translatePriority,
} from "../../../utils/categoryDisplayUtils";
import FilterTag from "../../global/FilterTag";

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
  | "finances";

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
}

// Define the type for our new tabs
type PieTab = "categories" | "ratings" | "priority" | "resolution" | "type";

// MODIFIED: Added 'ratings' tab configuration
const activityTabsConfig: {
  key: StatsActivityType;
  label: string;
  icon: React.ElementType;
}[] = [
  { key: "all", label: "Всички", icon: GlobeAltIcon },
  { key: "cases", label: "Сигнали", icon: DocumentTextIcon },
  { key: "answers", label: "Решения", icon: ChatBubbleBottomCenterTextIcon },
  { key: "comments", label: "Коментари", icon: ChatBubbleOvalLeftEllipsisIcon },
  { key: "ratings", label: "Оценки", icon: StarIcon },
  { key: "approvals", label: "Одобрени", icon: HandThumbUpIcon },
  { key: "finances", label: "Финанси", icon: BanknotesIcon },
];

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
  onClearResolutionFilter,
}) => {
  const [activePieTab, setActivePieTab] = useState<PieTab>("categories");
  // State to manage the date filter's visibility
  const [isDateFilterVisible, setIsDateFilterVisible] = useState(
    viewMode === "center"
  );
  const isInteractive = onCategoryClick || onRatingTierClick;

  // Check if a date range is active to style the button accordingly
  const isDateFilterActive =
    dateRange?.startDate !== null || dateRange?.endDate !== null;

  const StatItem: React.FC<{
    icon: React.ElementType;
    label: string;
    value: string | number | undefined;
    iconColorClass?: string;
  }> = ({ icon: Icon, label, value, iconColorClass = "text-gray-500" }) => (
    <div className="flex items-center justify-between p-1 ">
      <div className="flex items-center">
        <Icon className={`h-5 w-5 mr-2 ${iconColorClass}`} />
        <span className="text-sm text-gray-700">{label}:</span>
      </div>
      <strong className="text-gray-800 text-base font-semibold">
        {value !== undefined ? value : "-"}
      </strong>
    </div>
  );

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

  const pieTabsConfig = [
    {
      key: "categories",
      label: "По Категории",
      filterActive: activeCategoryFilter !== null,
    },
    {
      key: "ratings",
      label: "По Рейтинг",
      filterActive: activeRatingTierFilter !== "all",
    },
    {
      key: "priority",
      label: "По Приоритет",
      filterActive: activePriorityFilter !== "all",
    },
    {
      key: "resolution",
      label: "По Време",
      filterActive: activeResolutionFilter !== "all",
    },
    { key: "type", label: "По Тип", filterActive: activeTypeFilter !== "all" },
  ];

  const PieChartSection = (
    <>
      <div>
        <label className="text-xs font-semibold text-gray-500">
          Вижте изолирана диаграма за:
        </label>
        {/* changed to a grid layout for consistent button widths */}
        <div
          className={`mt-1.5 grid ${
            viewMode === "center" ? "grid-cols-2" : "grid-cols-3"
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

      <div className="flex border-b border-gray-200 text-xs sm:text-sm">
        {pieTabsConfig.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActivePieTab(tab.key as PieTab)}
            className={`cursor-pointer relative flex-1 py-2 px-1 text-center font-medium focus:outline-none transition-colors duration-150 ${
              activePieTab === tab.key
                ? "border-b-2 border-indigo-500 text-indigo-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
            {tab.filterActive && (
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-indigo-500"></span>
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
              <div className="px-3 py-2 rounded-md border border-gray-200 bg-gray-50 flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-gray-600 mr-2">
                  Активни филтри:
                </span>
                {activeCategoryName && onClearCategoryFilter && (
                  <FilterTag
                    label={`Категория: ${activeCategoryName}`}
                    onRemove={onClearCategoryFilter}
                  />
                )}
                {activeRatingTier !== "all" && onClearRatingTierFilter && (
                  <FilterTag
                    label={`Оценка: ${activeRatingTier}`}
                    onRemove={onClearRatingTierFilter}
                  />
                )}
                {activePriorityFilter !== "all" && onClearPriorityFilter && (
                  <FilterTag
                    label={`Приоритет: ${translatePriority(
                      activePriorityFilter
                    )}`}
                    onRemove={onClearPriorityFilter}
                  />
                )}
                {activeTypeFilter !== "all" && onClearTypeFilter && (
                  <FilterTag
                    label={`Тип: ${translateCaseType(activeTypeFilter)}`}
                    onRemove={onClearTypeFilter}
                  />
                )}
                {activeResolutionFilter !== "all" &&
                  onClearResolutionFilter && (
                    <FilterTag
                      label={`Реакция: ${activeResolutionFilter}`}
                      onRemove={onClearResolutionFilter}
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
                <button
                  onClick={onClearAllFilters}
                  className="cursor-pointer ml-auto text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
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
