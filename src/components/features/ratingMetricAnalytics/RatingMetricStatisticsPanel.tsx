// src/components/features/ratingMetricAnalytics/RatingMetricStatisticsPanel.tsx
import React, { useMemo, useRef, useEffect } from "react";
import HoverTooltip from "../../global/HoverTooltip";
import { IMetricScore } from "../../../db/interfaces";
import useRatingMetricStats from "../../../hooks/useRatingMetricStats";
import {
  ChartPieIcon,
  InformationCircleIcon,
  StarIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import StatisticPieChart from "../../charts/StatisticPieChart";
import { PieSegmentData } from "../../charts/PieChart";
import { TIERS } from "../../../utils/GLOBAL_PARAMETERS";
import { TierTab } from "./MetricScoreList"; // <-- ADD
import StatItem from "../../global/StatItem";

// Define the type locally
type StatsTab = "tier" | "user" | "category";

const getRatingStyleClass = (score: number | undefined | null): string => {
  // Matches the default classes of the StatItem value
  if (!score || score === 0) return "text-gray-800 text-base font-semibold";
  if (score >= TIERS.GOLD) return "text-amber-500 text-base font-bold";
  if (score >= TIERS.SILVER) return "text-slate-500 text-base font-bold";
  if (score >= TIERS.BRONZE) return "text-orange-700 text-base font-bold";
  return "text-red-500 text-base font-bold";
};

interface RatingMetricStatisticsPanelProps {
  pieScores: IMetricScore[]; // <-- RENAMED: For pie charts (date-filtered only)
  textScores: IMetricScore[]; // <-- ADDED: For text stats (fully-filtered)
  isLoading: boolean;
  onTierClick?: (segment: PieSegmentData) => void;
  onUserClick?: (segment: PieSegmentData) => void;
  activeTierLabel?: string | null;
  activeUserLabel?: string | null;
  activeTierFilter: TierTab; // <-- ADD
  activeUserFilter: string | null; // <-- ADD
  onCategoryClick?: (segment: PieSegmentData) => void;
  activeCategoryLabel?: string | null;
  activeCategoryFilter: string | null;
  // --- PROPS FOR STATE LIFTING ---
  activePieTab: StatsTab;
  onPieTabChange: (tab: StatsTab) => void;
  // --- PROPS FOR CLICKABLE DOTS ---
  onClearTierFilter: () => void;
  onClearUserFilter: () => void;
  onClearCategoryFilter: () => void;
}

const RatingMetricStatisticsPanel: React.FC<
  RatingMetricStatisticsPanelProps
> = ({
  pieScores, // <-- DESTRUCTURE
  textScores, // <-- DESTRUCTURE
  isLoading,
  onTierClick,
  onUserClick,
  activeTierLabel,
  activeUserLabel,
  activeTierFilter, // <-- DESTRUCTURE
  activeUserFilter,
  // --- DESTRUCTURE NEW PROPS ---
  onCategoryClick,
  activeCategoryLabel,
  activeCategoryFilter,
  // --- DESTRUCTURE NEW PROPS ---
  activePieTab,
  onPieTabChange,
  onClearTierFilter,
  onClearUserFilter,
  onClearCategoryFilter,
}) => {
  // --- REMOVED internal state, now controlled by activePieTab prop ---
  // const [activeTab, setActiveTab] = useState<StatsTab>("tier");
  const pieTabsContainerRef = useRef<HTMLDivElement>(null); // <-- ADDED FOR SCROLL

  // 1. Stats for the PIE CHARTS (use the consistent date-filtered list)
  const pieChartStats = useRatingMetricStats(pieScores);

  // 2. Stats for the TEXT VALUES (use the fully-filtered dynamic list)
  const textStats = useMemo(() => {
    const totalScores = textScores.length;
    const sumOfScores = textScores.reduce((sum, s) => sum + s.score, 0);
    const averageScore = totalScores > 0 ? sumOfScores / totalScores : 0;
    return { totalScores, averageScore };
  }, [textScores]);

  const isInteractive = onTierClick || onUserClick || onCategoryClick;

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

  useEffect(() => {
    const activeTabElement = document.getElementById(`pie-tab-${activePieTab}`);
    if (activeTabElement) {
      activeTabElement.scrollIntoView({
        behavior: "smooth",
        inline: "nearest",
        block: "nearest",
      });
    }
  }, [activePieTab]); // This effect runs whenever the active pie tab prop changes.

  if (isLoading) {
    return (
      <aside className="lg:col-span-3 bg-white rounded-lg shadow-lg flex flex-col overflow-hidden">
        <div className="p-6 space-y-4 animate-pulse">
          <div className="h-7 bg-gray-300 rounded w-3/4 mb-4"></div>
          <div className="h-5 bg-gray-300 rounded-md w-full"></div>
          <div className="h-5 bg-gray-300 rounded-md w-4/5"></div>
          <hr className="my-4 border-gray-200" />
          <div className="h-9 bg-gray-300 rounded-md w-full"></div>
          <div className="flex justify-center mt-4">
            <div className="h-40 w-40 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      </aside>
    );
  }

  // Use pieChartStats for the "no data" check (if no scores in date range, show nothing)
  if (!pieChartStats || pieChartStats.totalScores === 0) {
    return (
      <aside className="lg:col-span-3 bg-white rounded-lg shadow-lg p-6 text-center flex flex-col justify-center">
        <InformationCircleIcon className="h-10 w-10 text-gray-400 mx-auto mb-2" />
        <h4 className="font-semibold text-gray-700">
          Няма данни за статистика
        </h4>
        <p className="text-sm text-gray-500">
          Променете избрания период или изчакайте да бъдат добавени оценки.
        </p>
      </aside>
    );
  }

  return (
    <aside className="lg:col-span-3 bg-white rounded-lg shadow-lg flex flex-col overflow-hidden">
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 custom-scrollbar-xs">
          <h3 className="text-xl font-semibold text-gray-700 mb-1 flex items-center gap-x-2">
            <ChartPieIcon className="h-6 w-6 mr-2 text-teal-600" />
            <span>Статистика</span>
            {isInteractive && (
              <HoverTooltip
                content="Кликнете върху диаграмите, за да филтрирате."
                delayDuration={150}
                contentClassName="select-none rounded-md bg-gray-800 px-3 py-2 text-sm leading-tight text-white shadow-lg z-50"
              >
                <button className="cursor-help text-gray-400 hover:text-sky-600">
                  <InformationCircleIcon className="h-5 w-5" />
                </button>
              </HoverTooltip>
            )}
          </h3>

          {/* --- REFACTORED: Use StatItem component --- */}
          <div className="space-y-1">
            <StatItem
              icon={UsersIcon}
              label="Общо оценки"
              value={textStats.totalScores}
            />
            <StatItem
              icon={StarIcon}
              label="Средна оценка"
              value={
                textStats.averageScore > 0
                  ? textStats.averageScore.toFixed(2)
                  : "-"
              }
              valueClasses={getRatingStyleClass(textStats.averageScore)}
            />
          </div>

          <div className="mt-2">
            <div
              ref={pieTabsContainerRef} // <-- ADDED REF
              className="flex border-b border-gray-200 overflow-x-auto custom-scrollbar-xs py-1"
            >
              <button
                id="pie-tab-tier" // <-- ADDED ID
                onClick={() => onPieTabChange("tier")} // <-- Use prop setter
                className={`cursor-pointer relative flex-1 py-2 px-3 text-sm font-medium focus:outline-none transition-colors duration-150 whitespace-nowrap ${
                  activePieTab === "tier" // <-- Use prop state
                    ? "border-b-2 border-indigo-500 text-indigo-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                По Оценка
                {activeTierFilter !== "all" && (
                  <span
                    title="Изчисти филтъра"
                    onClick={(e) => {
                      e.stopPropagation();
                      onClearTierFilter?.();
                    }}
                    className="absolute top-1 right-1 h-2 w-2 rounded-full bg-indigo-500 hover:ring-2 hover:ring-indigo-300"
                  ></span>
                )}
              </button>
              {/* --- ADD NEW BUTTON --- */}
              <button
                id="pie-tab-category" // <-- ADDED ID
                onClick={() => onPieTabChange("category")} // <-- Use prop setter
                className={`cursor-pointer relative flex-1 py-2 px-3 text-sm font-medium focus:outline-none transition-colors duration-150 whitespace-nowrap ${
                  activePieTab === "category" // <-- Use prop state
                    ? "border-b-2 border-indigo-500 text-indigo-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                По Категория
                {activeCategoryFilter !== null && (
                  <span
                    title="Изчисти филтъра"
                    onClick={(e) => {
                      e.stopPropagation();
                      onClearCategoryFilter?.();
                    }}
                    className="absolute top-1 right-1 h-2 w-2 rounded-full bg-indigo-500 hover:ring-2 hover:ring-indigo-300"
                  ></span>
                )}
              </button>
              {/* -------------------- */}
              <button
                id="pie-tab-user" // <-- ADDED ID
                onClick={() => onPieTabChange("user")} // <-- Use prop setter
                className={`cursor-pointer relative flex-1 py-2 px-3 text-sm font-medium focus:outline-none transition-colors duration-150 whitespace-nowrap ${
                  activePieTab === "user" // <-- Use prop state
                    ? "border-b-2 border-indigo-500 text-indigo-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                По Потребител
                {activeUserFilter !== null && (
                  <span
                    title="Изчисти филтъра"
                    onClick={(e) => {
                      e.stopPropagation();
                      onClearUserFilter?.();
                    }}
                    className="absolute top-1 right-1 h-2 w-2 rounded-full bg-indigo-500 hover:ring-2 hover:ring-indigo-300"
                  ></span>
                )}
              </button>
            </div>
          </div>

          <div className="mt-3">
            {activePieTab === "tier" && (
              <StatisticPieChart
                title="Разпределение по Оценки"
                pieData={pieChartStats.tierDistributionData}
                onSegmentClick={onTierClick}
                activeLabel={activeTierLabel}
              />
            )}
            {activePieTab === "user" && (
              <StatisticPieChart
                title="Разпределение по Потребители"
                pieData={pieChartStats.userContributionData}
                onSegmentClick={onUserClick}
                activeLabel={activeUserLabel}
              />
            )}
            {/* --- ADD NEW RENDER BLOCK --- */}
            {activePieTab === "category" && (
              <StatisticPieChart
                title="Разпределение по Категории"
                pieData={pieChartStats.categoryContributionData}
                onSegmentClick={onCategoryClick}
                activeLabel={activeCategoryLabel}
              />
            )}
          </div>
        </div>
    </aside>
  );
};

export default RatingMetricStatisticsPanel;
