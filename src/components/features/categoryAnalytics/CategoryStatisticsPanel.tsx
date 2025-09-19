// src/components/features/categoryAnalytics/CategoryStatisticsPanel.tsx
import React, { useRef, useEffect } from "react";
import * as Tooltip from "@radix-ui/react-tooltip";
import {
  ChartPieIcon,
  ListBulletIcon,
  // CheckCircleIcon,
  // ArrowPathIcon,
  // BanknotesIcon,
  // XCircleIcon,
  // LightBulbIcon,
  // ExclamationTriangleIcon,
  ClockIcon,
  // DocumentTextIcon,
  InformationCircleIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import StatisticPieChart from "../../charts/StatisticPieChart";
import { PieSegmentData } from "../../charts/PieChart";
import { SignalStats } from "../../../hooks/useCategorySignalStats";
import {
  // translateStatus,
  // translateCaseType,
  ResolutionCategoryKey,
  // translatePriority,
} from "../../../utils/categoryDisplayUtils";
import { CaseType, CasePriority } from "../../../db/interfaces";
import { TIERS } from "../../../utils/GLOBAL_PARAMETERS";
import { CaseStatusTab } from "../../../pages/Category";
import { RatingTierLabel } from "../../../utils/ratingCalculations";
import StatItem from "../../global/StatItem";

interface CategoryStatisticsPanelProps {
  // --- MODIFIED: Update type ---
  activeStatsView:
    | "status"
    | "type"
    | "resolution"
    | "priority"
    | "user"
    | "rating";
  setActiveStatsView: (
    view: "status" | "type" | "resolution" | "priority" | "user" | "rating"
  ) => void;
  isLoading?: boolean;
  onStatusClick?: (segment: PieSegmentData) => void;
  onTypeClick?: (segment: PieSegmentData) => void;
  onResolutionClick?: (segment: PieSegmentData) => void;
  activeStatusLabel?: string | null;
  activeTypeLabel?: string | null;
  activeResolutionLabel?: string | null;
  // --- REFACTORED: Replace multiple stats props with two ---
  pieChartStats: SignalStats | undefined | null;
  textStats: SignalStats | undefined | null;
  // --- NEW PROPS FOR FILTER STATE ---
  activeStatusFilter: CaseStatusTab;
  activeTypeFilter: CaseType | "all";
  activeResolutionFilter: ResolutionCategoryKey | "all";
  onPriorityClick?: (segment: PieSegmentData) => void;
  onUserClick?: (segment: PieSegmentData) => void;
  activePriorityFilter: CasePriority | "all";
  activeCreatorFilter: string | null;
  activePriorityLabel?: string | null;
  activeCreatorLabel?: string | null;
  onRatingTierClick?: (segment: PieSegmentData) => void; // <-- ADD
  activeRatingTierFilter: RatingTierLabel; // <-- ADD
  activeRatingTierLabel: string | null; // <-- ADD
  // --- ADD CLEAR HANDLERS FOR DOT CLICK ---
  onClearStatusFilter?: () => void;
  onClearTypeFilter?: () => void;
  onClearResolutionFilter?: () => void;
  onClearPriorityFilter?: () => void;
  onClearCreatorFilter?: () => void;
  onClearRatingTierFilter?: () => void; // <-- ADD
}

// const TEXT_STATS_AREA_HEIGHT = "h-28"; // This constant is no longer used but safe to keep

// Helper function for rating color (copied from RatingMetric panel)
const getRatingStyleClass = (score: number | undefined | null): string => {
  // Matches the default classes of the StatItem value
  if (!score || score === 0) return "text-gray-800 text-base font-semibold";
  if (score >= TIERS.GOLD) return "text-amber-500 text-base font-bold";
  if (score >= TIERS.SILVER) return "text-slate-500 text-base font-bold";
  if (score >= TIERS.BRONZE) return "text-orange-700 text-base font-bold";
  return "text-red-500 text-base font-bold";
};

const CategoryStatisticsPanel: React.FC<CategoryStatisticsPanelProps> = ({
  activeStatsView,
  setActiveStatsView,
  isLoading,
  onStatusClick,
  onTypeClick,
  onResolutionClick,
  activeStatusLabel,
  activeTypeLabel,
  activeResolutionLabel,
  // --- DESTRUCTURE NEW PROPS ---
  pieChartStats, // <-- DESTRUCTURE
  textStats, // <-- DESTRUCTURE
  activeStatusFilter,
  activeTypeFilter,
  activeResolutionFilter,
  onPriorityClick,
  onUserClick,
  activePriorityFilter,
  activeCreatorFilter,
  activePriorityLabel,
  activeCreatorLabel,
  onRatingTierClick, // <-- DESTRUCTURE
  activeRatingTierFilter, // <-- DESTRUCTURE
  activeRatingTierLabel, // <-- DESTRUCTURE
  // --- DESTRUCTURE NEW CLEAR HANDLERS ---
  onClearStatusFilter,
  onClearTypeFilter,
  onClearResolutionFilter,
  onClearPriorityFilter,
  onClearCreatorFilter,
  onClearRatingTierFilter, // <-- DESTRUCTURE
}) => {
  const pieTabsContainerRef = useRef<HTMLDivElement>(null); // <-- ADDED FOR SCROLL

  // This constant determines if any of the charts are interactive
  const isInteractive =
    onStatusClick ||
    onTypeClick ||
    onResolutionClick ||
    onPriorityClick ||
    onUserClick ||
    onRatingTierClick; // <-- ADD

  // --- REMOVED: activeSignalStats logic is no longer needed ---

  // --- ADDED: Mouse-wheel scroll effect for pie tabs ---
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
  }, []); // Empty deps, ref is stable
  // --- END: Mouse-wheel scroll effect ---

  // --- ADD THIS NEW useEffect ---
  useEffect(() => {
    // Construct the ID of the active tab button
    const activeTabElement = document.getElementById(
      `pie-tab-${activeStatsView}`
    );
    // If the element is found, scroll it into the visible area of its container
    if (activeTabElement) {
      activeTabElement.scrollIntoView({
        behavior: "smooth",
        inline: "nearest", // Crucial for horizontal scrolling
        block: "nearest",
      });
    }
  }, [activeStatsView]); // This effect runs whenever the active stats view changes.
  // --- END NEW useEffect ---

  if (isLoading && !textStats) {
    // Keep skeleton as is
    return (
      <aside className="lg:col-span-3 bg-white rounded-lg shadow-lg flex flex-col overflow-hidden">
        <div className="p-6 space-y-3 animate-pulse">
          <div className="h-7 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-5 bg-gray-200 rounded w-full mb-3"></div>
          <div className="h-9 bg-gray-200 rounded w-full mb-4"></div>
          <div className="h-28 bg-gray-200 rounded w-full mb-3"></div>
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
          <div className="flex justify-center mb-3">
            <div className="h-40 w-40 bg-gray-200 rounded-full"></div>
          </div>
          <div className="space-y-1">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between px-2">
                <div className="flex items-center w-3/5">
                  <div className="h-2.5 w-2.5 rounded-full bg-gray-200 mr-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-1/5"></div>
              </div>
            ))}
          </div>
        </div>
      </aside>
    );
  }

  if (!textStats || !pieChartStats || pieChartStats.totalSignals === 0) {
    // Keep "no stats" as is
    return (
      <aside className="lg:col-span-3 bg-white rounded-lg shadow-lg flex flex-col overflow-hidden">
        <div className="p-6 space-y-3 overflow-y-auto flex-1 custom-scrollbar-xs">
          <h3 className="text-xl font-semibold text-gray-700 mb-3 flex items-center">
            <ChartPieIcon className="h-6 w-6 mr-2 text-teal-600" /> Статистика
          </h3>

          <p className="text-sm text-gray-500">Няма налична статистика.</p>
        </div>
      </aside>
    );
  }

  // --- MODIFIED: Add new tabs to the array ---
  const tabs = [
    {
      key: "status",
      label: "По Статус",
      isActive: activeStatusFilter !== "all",
      clearFilter: onClearStatusFilter,
    },
    {
      key: "type",
      label: "По Тип",
      isActive: activeTypeFilter !== "all",
      clearFilter: onClearTypeFilter,
    },
    {
      key: "resolution",
      label: "По Време",
      isActive: activeResolutionFilter !== "all",
      clearFilter: onClearResolutionFilter,
    },
    {
      key: "priority",
      label: "По Приоритет",
      isActive: activePriorityFilter !== "all",
      clearFilter: onClearPriorityFilter,
    },
    {
      key: "user",
      label: "По Потребител",
      isActive: activeCreatorFilter !== null,
      clearFilter: onClearCreatorFilter,
    },
    {
      key: "rating",
      label: "По Рейтинг",
      isActive: activeRatingTierFilter !== "all",
      clearFilter: onClearRatingTierFilter,
    },
  ] as const;

  // --- The rest of the component is updated to use 'activeSignalStats' ---
  return (
    <Tooltip.Provider>
      <aside className="lg:col-span-3 bg-white rounded-lg shadow-lg flex flex-col overflow-hidden">
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 custom-scrollbar-xs">
          <h3 className="text-xl font-semibold text-gray-700 mb-1 flex items-center gap-x-2">
            <ChartPieIcon className="h-6 w-6 mr-2 text-teal-600" />
            <span>Статистика</span>

            {/* --- NEW: RADIX UI TOOLTIP --- */}
            {/* ... (Tooltip logic remains unchanged) ... */}
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
          <div className="space-y-1 text-sm text-gray-600">
            {/* --- REFACTORED: Use textStats prop and StatItem component --- */}
            {textStats ? (
              <div className="space-y-1">
                <StatItem
                  icon={ListBulletIcon}
                  label="Общо Сигнали"
                  value={textStats.totalSignals}
                  iconColorClass="text-blue-500"
                />
                {/* <StatItem
                  icon={CheckCircleIcon}
                  label={translateStatus("OPEN")}
                  value={textStats.strictlyOpenSignals}
                  iconColorClass="text-green-500"
                />
                <StatItem
                  icon={ArrowPathIcon}
                  label={translateStatus("IN_PROGRESS")}
                  value={textStats.inProgressSignals}
                  iconColorClass="text-yellow-500"
                />
                <StatItem
                  icon={BanknotesIcon}
                  label={translateStatus("AWAITING_FINANCE")}
                  value={textStats.awaitingFinanceSignals}
                  iconColorClass="text-blue-500"
                />
                <StatItem
                  icon={XCircleIcon}
                  label={translateStatus("CLOSED")}
                  value={textStats.closedSignals}
                  iconColorClass="text-gray-500"
                /> */}
                <StatItem
                  icon={ClockIcon}
                  label="Средно време (дни)"
                  value={
                    textStats.averageResolutionTime > 0
                      ? textStats.averageResolutionTime.toFixed(2)
                      : "-"
                  }
                  iconColorClass="text-purple-500"
                />
                {/* --- ADD NEW STAT ITEM FOR RATING --- */}
                <StatItem
                  icon={StarIcon}
                  label="Среден рейтинг"
                  value={
                    textStats.averageCaseRating !== null
                      ? textStats.averageCaseRating.toFixed(2)
                      : "-"
                  }
                  iconColorClass="text-amber-500"
                  valueClasses={
                    textStats.averageCaseRating !== null
                      ? getRatingStyleClass(textStats.averageCaseRating)
                      : "-"
                  }
                />
                {/* ---------------------------------- */}
              </div>
            ) : null}
          </div>

          <div className="mt-2">
            <div
              ref={pieTabsContainerRef} // <-- ADDED REF
              className="flex border-b border-gray-200 overflow-x-auto custom-scrollbar-xs py-1"
            >
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  id={`pie-tab-${tab.key}`} // <-- ADDED ID
                  onClick={() => setActiveStatsView(tab.key)}
                  className={`cursor-pointer relative flex-1 py-2 px-3 text-sm font-medium focus:outline-none transition-colors duration-150 whitespace-nowrap ${
                    activeStatsView === tab.key
                      ? "border-b-2 border-indigo-500 text-indigo-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab.label}
                  {/* --- NEW: VISUAL INDICATOR DOT --- */}
                  {/* --- MODIFIED: Dot is now a clickable clear button --- */}
                  {tab.isActive && (
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
          </div>

          <div className="mt-3">
            {activeStatsView === "status" && (
              <div className="space-y-2">
                <StatisticPieChart
                  title="Разпределение по Статус"
                  pieData={pieChartStats?.statusPieChartData}
                  onSegmentClick={onStatusClick}
                  activeLabel={activeStatusLabel}
                />
              </div>
            )}

            {activeStatsView === "type" && (
              <div className="space-y-2">
                <StatisticPieChart
                  title="Разпределение по Тип"
                  pieData={pieChartStats?.typePieChartData}
                  onSegmentClick={onTypeClick}
                  activeLabel={activeTypeLabel}
                />
              </div>
            )}

            {activeStatsView === "resolution" && (
              <div className="space-y-2">
                <StatisticPieChart
                  title="Разпределение по Резолюция"
                  pieData={pieChartStats?.resolutionPieChartData}
                  onSegmentClick={onResolutionClick}
                  activeLabel={activeResolutionLabel}
                />
              </div>
            )}

            {/* --- ADD THESE TWO NEW RENDER BLOCKS --- */}
            {activeStatsView === "priority" && (
              <StatisticPieChart
                title="Разпределение по Приоритет"
                pieData={pieChartStats?.priorityPieChartData}
                onSegmentClick={onPriorityClick}
                activeLabel={activePriorityLabel}
              />
            )}
            {activeStatsView === "user" && (
              <StatisticPieChart
                title="Разпределение по Създател"
                pieData={pieChartStats?.creatorPieChartData}
                onSegmentClick={onUserClick}
                activeLabel={activeCreatorLabel}
              />
            )}
            {activeStatsView === "rating" && (
              <StatisticPieChart
                title="Разпределение по Рейтинг"
                pieData={pieChartStats?.ratingTierDistributionData}
                onSegmentClick={onRatingTierClick}
                activeLabel={activeRatingTierLabel}
              />
            )}
            {/* ---------------------------------- */}
          </div>
        </div>
      </aside>
    </Tooltip.Provider>
  );
};

export default CategoryStatisticsPanel;
