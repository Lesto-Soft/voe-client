// src/components/features/ratingMetricAnalytics/RatingMetricStatisticsPanel.tsx
import React, { useState, useMemo } from "react";
import * as Tooltip from "@radix-ui/react-tooltip"; // <-- ADD
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

type StatsTab = "tier" | "user";

// Helper to determine color for the average score
const getScoreCellStyle = (score: number | undefined | null): string => {
  if (!score || score === 0) return "text-gray-800 text-base";
  if (score >= TIERS.GOLD) return "text-amber-500 text-base font-bold";
  if (score >= TIERS.SILVER) return "text-slate-500 text-base font-bold";
  if (score >= TIERS.BRONZE) return "text-orange-700 text-base font-bold";
  return "text-red-500 text-base font-bold";
};

interface RatingMetricStatisticsPanelProps {
  scores: IMetricScore[];
  isLoading: boolean;
  dateRange: { startDate: Date | null; endDate: Date | null };
  onTierClick?: (segment: PieSegmentData) => void;
  onUserClick?: (segment: PieSegmentData) => void;
  activeTierLabel?: string | null;
  activeUserLabel?: string | null;
  activeTierFilter: TierTab; // <-- ADD
  activeUserFilter: string | null; // <-- ADD
}

const RatingMetricStatisticsPanel: React.FC<
  RatingMetricStatisticsPanelProps
> = ({
  scores,
  isLoading,
  dateRange,
  onTierClick,
  onUserClick,
  activeTierLabel,
  activeUserLabel,
  activeTierFilter, // <-- DESTRUCTURE
  activeUserFilter,
}) => {
  const [activeTab, setActiveTab] = useState<StatsTab>("tier");

  const filteredScores = useMemo(() => {
    if (!dateRange.startDate || !dateRange.endDate) return scores;
    return scores.filter((score) => {
      const scoreDate = new Date(score.date);
      return (
        scoreDate >= dateRange.startDate! && scoreDate <= dateRange.endDate!
      );
    });
  }, [scores, dateRange]);

  const stats = useRatingMetricStats(filteredScores);
  const isInteractive = onTierClick || onUserClick;

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

  if (!stats || stats.totalScores === 0) {
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
    <Tooltip.Provider>
      <aside className="lg:col-span-3 bg-white rounded-lg shadow-lg flex flex-col overflow-hidden">
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
          <h3 className="text-xl font-semibold text-gray-700 mb-1 flex items-center gap-x-2">
            <ChartPieIcon className="h-6 w-6 mr-2 text-teal-600" />
            <span>Статистика</span>
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
            <p className="flex items-center justify-between">
              <span className="flex items-center">
                <UsersIcon className="h-5 w-5 mr-2" />
                Общо оценки:
              </span>
              <strong className="text-gray-800 text-base">
                {stats.totalScores}
              </strong>
            </p>
            {/* Apply the style to the average score */}
            <p className="flex items-center justify-between">
              <span className="flex items-center">
                <StarIcon className="h-5 w-5 mr-2" />
                Средна оценка:
              </span>
              <strong className={getScoreCellStyle(stats.averageScore)}>
                {stats.averageScore.toFixed(2)}
              </strong>
            </p>
          </div>

          <div className="mt-2">
            <div className="flex border-b border-gray-200 text-xs sm:text-sm">
              <button
                onClick={() => setActiveTab("tier")}
                className={`cursor-pointer relative flex-1 py-2 px-1 text-center font-medium focus:outline-none transition-colors duration-150 ${
                  activeTab === "tier"
                    ? "border-b-2 border-indigo-500 text-indigo-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                По Оценка
                {activeTierFilter !== "all" && (
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-indigo-500"></span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("user")}
                className={`cursor-pointer relative flex-1 py-2 px-1 text-center font-medium focus:outline-none transition-colors duration-150 ${
                  activeTab === "user"
                    ? "border-b-2 border-indigo-500 text-indigo-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                По Потребител
                {activeUserFilter !== null && (
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-indigo-500"></span>
                )}
              </button>
            </div>
          </div>

          <div className="mt-3">
            {activeTab === "tier" && (
              <StatisticPieChart
                title="Разпределение по Оценки"
                pieData={stats.tierDistributionData}
                onSegmentClick={onTierClick}
                activeLabel={activeTierLabel}
              />
            )}
            {activeTab === "user" && (
              <StatisticPieChart
                title="Разпределение по Потребители"
                pieData={stats.userContributionData}
                onSegmentClick={onUserClick}
                activeLabel={activeUserLabel}
              />
            )}
          </div>
        </div>
      </aside>
    </Tooltip.Provider>
  );
};

export default RatingMetricStatisticsPanel;
