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
  ClipboardDocumentCheckIcon,
  ClipboardDocumentListIcon,
  PencilSquareIcon,
  BeakerIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";
import { UserActivityStats } from "../../../hooks/useUserActivityStats";
import StatisticPieChart from "../../charts/StatisticPieChart";
import { PieSegmentData } from "../../charts/PieChart";
import { RatingTierLabel } from "../../../pages/User";
import * as Tooltip from "@radix-ui/react-tooltip";
import DateRangeSelector from "./DateRangeSelector";
import { CasePriority, CaseType, ICaseStatus, TaskStatus } from "../../../db/interfaces";
import {
  translateCaseType,
  translatePriority,
  translateStatus,
  translateTaskStatus,
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

// New 2-level tab types
export type ParentTab = "cases" | "tasks";
export type CaseSubTab = "all" | "cases" | "answers" | "comments" | "ratings" | "approvals" | "finances";
export type TaskSubTab = "all" | "tasks" | "entries" | "analyses";

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
  // New 2-level tab props
  parentTab: ParentTab;
  subTab: CaseSubTab | TaskSubTab;
  onParentTabChange: (tab: ParentTab) => void;
  onSubTabChange: (tab: CaseSubTab | TaskSubTab) => void;
  viewMode?: "side" | "center";
  activityCounts: {
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
  onTaskStatusClick?: (segment: PieSegmentData) => void;
  onTaskPriorityClick?: (segment: PieSegmentData) => void;
  activeTaskStatusFilter: TaskStatus | "all";
  activeTaskPriorityFilter: CasePriority | "all";
  onClearTaskStatusFilter?: () => void;
  onClearTaskPriorityFilter?: () => void;
  onTaskTimelinessClick?: (segment: PieSegmentData) => void;
  activeTaskTimelinessFilter: string;
  onClearTaskTimelinessFilter?: () => void;
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
  | "taskPriority"
  | "taskTimeliness";

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
  parentTab,
  subTab,
  onParentTabChange,
  onSubTabChange,
  viewMode = "side",
  activityCounts,
  dateRange,
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
  onTaskStatusClick,
  onTaskPriorityClick,
  activeTaskStatusFilter,
  activeTaskPriorityFilter,
  onClearTaskStatusFilter,
  onClearTaskPriorityFilter,
  onTaskTimelinessClick,
  activeTaskTimelinessFilter,
  onClearTaskTimelinessFilter,
  activePieTab,
  onPieTabChange,
}) => {
  const pieTabsContainerRef = useRef<HTMLDivElement>(null);
  const filtersContainerRef = useRef<HTMLDivElement>(null);
  const subTabsContainerRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    const activeTabElement = document.getElementById(`pie-tab-${activePieTab}`);
    if (activeTabElement) {
      activeTabElement.scrollIntoView({
        behavior: "smooth",
        inline: "nearest",
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
    return () => {
      scrollContainer.removeEventListener("wheel", handleWheel);
    };
  }, [parentTab]);

  const isDateFilterActive =
    dateRange?.startDate !== null || dateRange?.endDate !== null;

  const isTasksParent = parentTab === "tasks";

  // Sub-tab configs for each parent
  const caseSubTabsConfig: { key: CaseSubTab; label: string; icon: React.ElementType; countKey: keyof typeof activityCounts }[] = [
    { key: "all", label: "Всички", icon: DocumentTextIcon, countKey: "casesTotal" },
    { key: "cases", label: "Сигнали", icon: DocumentTextIcon, countKey: "cases" },
    { key: "answers", label: "Решения", icon: ChatBubbleBottomCenterTextIcon, countKey: "answers" },
    { key: "comments", label: "Коментари", icon: ChatBubbleOvalLeftEllipsisIcon, countKey: "comments" },
    { key: "ratings", label: "Оценки", icon: StarIcon, countKey: "ratings" },
    { key: "approvals", label: "Одобрени", icon: HandThumbUpIcon, countKey: "approvals" },
    { key: "finances", label: "Финанси", icon: BanknotesIcon, countKey: "finances" },
  ];

  const taskSubTabsConfig: { key: TaskSubTab; label: string; icon: React.ElementType; countKey: keyof typeof activityCounts }[] = [
    { key: "all", label: "Всички", icon: ClipboardDocumentCheckIcon, countKey: "tasksTotal" },
    { key: "tasks", label: "Задачи", icon: ClipboardDocumentListIcon, countKey: "tasks" },
    { key: "entries", label: "Записи", icon: PencilSquareIcon, countKey: "entries" },
    { key: "analyses", label: "Анализи", icon: BeakerIcon, countKey: "analyses" },
  ];

  const activeSubTabsConfig = isTasksParent ? taskSubTabsConfig : caseSubTabsConfig;

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

  const TextStatsSection = isTasksParent ? (
    <div
      className={
        viewMode === "center"
          ? "flex items-center justify-around text-center"
          : "space-y-1"
      }
    >
      <StatItem
        icon={ClipboardDocumentCheckIcon}
        label="Общо задачи"
        value={activityCounts.tasksTotal}
        iconColorClass="text-blue-500"
      />
      <StatItem
        icon={ClipboardDocumentListIcon}
        label="Жизнен цикъл"
        value={activityCounts.tasks}
        iconColorClass="text-green-500"
      />
      <StatItem
        icon={PencilSquareIcon}
        label="Записи"
        value={activityCounts.entries}
        iconColorClass="text-purple-500"
      />
      <StatItem
        icon={BeakerIcon}
        label="Анализи"
        value={activityCounts.analyses}
        iconColorClass="text-teal-500"
      />
    </div>
  ) : (
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
      filterActive: activeTaskStatusFilter !== "all",
      clearFilter: onClearTaskStatusFilter,
    },
    {
      key: "taskPriority",
      label: "По Приоритет",
      filterActive: activeTaskPriorityFilter !== "all",
      clearFilter: onClearTaskPriorityFilter,
    },
    {
      key: "taskTimeliness",
      label: "По Срок",
      filterActive: activeTaskTimelinessFilter !== "all",
      clearFilter: onClearTaskTimelinessFilter,
    },
  ];

  const pieTabsConfig = isTasksParent ? taskPieTabsConfig : casePieTabsConfig;

  const PieChartSection = (
    <>
      {/* Parent tabs row */}
      <div>
        <label className="text-xs font-semibold text-gray-500">
          Вижте изолирана диаграма за:
        </label>
        <div className="mt-1.5 grid grid-cols-2 gap-1.5">
          <button
            onClick={() => onParentTabChange("cases")}
            className={`cursor-pointer flex items-center justify-center gap-x-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 ${
              parentTab === "cases"
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <DocumentTextIcon className="h-4 w-4" />
            <span>Сигнали ({activityCounts.casesTotal})</span>
          </button>
          <button
            onClick={() => onParentTabChange("tasks")}
            className={`cursor-pointer flex items-center justify-center gap-x-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 ${
              parentTab === "tasks"
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <ClipboardDocumentCheckIcon className="h-4 w-4" />
            <span>Задачи ({activityCounts.tasksTotal})</span>
          </button>
        </div>
      </div>

      {/* Sub-tabs row */}
      <div
        ref={subTabsContainerRef}
        className={`grid ${
          viewMode === "center"
            ? isTasksParent ? "grid-cols-4" : "grid-cols-4"
            : isTasksParent ? "grid-cols-2" : "grid-cols-3"
        } gap-1.5`}
      >
        {activeSubTabsConfig.map((tab) => {
          const count = activityCounts[tab.countKey] ?? 0;
          return (
            <button
              key={tab.key}
              onClick={() => onSubTabChange(tab.key)}
              disabled={count === 0}
              className={`cursor-pointer flex-grow basis-auto flex items-center justify-center gap-x-1 rounded-md px-2 py-1 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                subTab === tab.key
                  ? "bg-indigo-100 text-indigo-700 ring-1 ring-indigo-300"
                  : "bg-gray-50 text-gray-500 hover:bg-gray-100"
              }`}
            >
              <tab.icon className="h-3.5 w-3.5" />
              <span>
                {tab.label} ({count})
              </span>
            </button>
          );
        })}
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
            onSegmentClick={onTaskStatusClick}
            activeLabel={
              pieChartStats.taskStatusDistributionData.find(
                (d) => d.id === activeTaskStatusFilter
              )?.label
            }
            layout={viewMode === "center" ? "horizontal" : "vertical"}
          />
        )}
        {activePieTab === "taskPriority" && (
          <StatisticPieChart
            title="Задачи по Приоритет"
            pieData={pieChartStats.taskPriorityDistributionData}
            onSegmentClick={onTaskPriorityClick}
            activeLabel={
              pieChartStats.taskPriorityDistributionData.find(
                (d) => d.id === activeTaskPriorityFilter
              )?.label
            }
            layout={viewMode === "center" ? "horizontal" : "vertical"}
          />
        )}
        {activePieTab === "taskTimeliness" && (
          <StatisticPieChart
            title="Задачи по Срок"
            pieData={pieChartStats.taskTimelinessDistributionData}
            onSegmentClick={onTaskTimelinessClick}
            activeLabel={
              pieChartStats.taskTimelinessDistributionData.find(
                (d) => d.id === activeTaskTimelinessFilter
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

          {viewMode === "center" &&
            isAnyFilterActive &&
            onClearAllFilters && (
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
                  {activeTaskStatusFilter !== "all" && onClearTaskStatusFilter && (
                    <FilterTag
                      label={`Задача статус: ${translateTaskStatus(activeTaskStatusFilter)}`}
                      onRemove={onClearTaskStatusFilter}
                      onClick={() => onPieTabChange("taskStatus")}
                    />
                  )}
                  {activeTaskPriorityFilter !== "all" && onClearTaskPriorityFilter && (
                    <FilterTag
                      label={`Задача приоритет: ${translatePriority(activeTaskPriorityFilter)}`}
                      onRemove={onClearTaskPriorityFilter}
                      onClick={() => onPieTabChange("taskPriority")}
                    />
                  )}
                  {activeTaskTimelinessFilter !== "all" && onClearTaskTimelinessFilter && (
                    <FilterTag
                      label={`Срок: ${activeTaskTimelinessFilter}`}
                      onRemove={onClearTaskTimelinessFilter}
                      onClick={() => onPieTabChange("taskTimeliness")}
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
