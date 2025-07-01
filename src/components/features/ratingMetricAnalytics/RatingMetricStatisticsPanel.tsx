import React, { useState, useMemo } from "react";
import { IMetricScore } from "../../../db/interfaces";
import useRatingMetricStats from "../../../hooks/useRatingMetricStats";
import {
  ChartPieIcon,
  InformationCircleIcon,
  StarIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import PieChart, { PieSegmentData } from "../../charts/PieChart";
import { TIERS } from "../../../utils/GLOBAL_PARAMETERS"; // <-- Import TIERS

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
}

const RatingMetricStatisticsPanel: React.FC<
  RatingMetricStatisticsPanelProps
> = ({ scores, isLoading, dateRange }) => {
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

  const renderPieChartWithLegend = (
    title: string,
    pieData: PieSegmentData[]
  ) => {
    const totalValue = pieData.reduce((sum, item) => sum + item.value, 0);

    if (totalValue === 0) {
      return (
        <div className="text-center py-10">
          <p className="text-sm text-gray-500">Няма данни за диаграмата.</p>
        </div>
      );
    }

    return (
      <div className="w-full">
        <h4 className="text-md font-semibold text-gray-700 mb-3">{title}</h4>
        <div className="w-32 h-32 sm:w-36 sm:w-36 lg:w-40 lg:h-40 mx-auto mb-3">
          <PieChart data={pieData} size={200} />
        </div>
        <ul className="text-xs space-y-1 max-h-40 overflow-y-auto custom-scrollbar pr-1">
          {pieData.map((item) => (
            <li
              key={item.label}
              className="flex items-center justify-between px-1"
            >
              <span className="flex items-center" title={item.label}>
                <span
                  className="h-2.5 w-2.5 rounded-full mr-2 flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="truncate max-w-[120px] sm:max-w-[150px]">
                  {item.label}:
                </span>
              </span>
              <span className="font-medium whitespace-nowrap">
                {item.value} ({((item.value / totalValue) * 100).toFixed(1)}%)
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

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
    <aside className="lg:col-span-3 bg-white rounded-lg shadow-lg flex flex-col overflow-hidden">
      <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
        <h3 className="text-xl font-semibold text-gray-700 mb-1 flex items-center">
          <ChartPieIcon className="h-6 w-6 mr-2 text-teal-600" /> Статистика
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
              className={`flex-1 py-2 px-1 text-center font-medium focus:outline-none transition-colors duration-150 ${
                activeTab === "tier"
                  ? "border-b-2 border-indigo-500 text-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              По Оценка
            </button>
            <button
              onClick={() => setActiveTab("user")}
              className={`flex-1 py-2 px-1 text-center font-medium focus:outline-none transition-colors duration-150 ${
                activeTab === "user"
                  ? "border-b-2 border-indigo-500 text-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              По Потребител
            </button>
          </div>
        </div>

        <div className="mt-3">
          {activeTab === "tier" &&
            renderPieChartWithLegend(
              "Разпределение по Оценки",
              stats.tierDistributionData
            )}
          {activeTab === "user" &&
            renderPieChartWithLegend(
              "Разпределение по Потребители",
              stats.userContributionData
            )}
        </div>
      </div>
    </aside>
  );
};

export default RatingMetricStatisticsPanel;
