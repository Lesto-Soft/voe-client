import React, { useState } from "react";
import {
  ChartPieIcon,
  DocumentTextIcon,
  ChatBubbleBottomCenterTextIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import { UserActivityStats } from "../../../hooks/useUserActivityStats";
import StatisticPieChart from "../../charts/StatisticPieChart";
import { PieSegmentData } from "../../charts/PieChart";

// define a type for the text-based stats
export interface UserTextStats {
  totalSignals: number;
  totalAnswers: number;
  totalComments: number;
  averageCaseRating: number | null;
}

interface UserStatisticsPanelProps {
  // --- MODIFIED: Use the new type for text stats ---
  textStats: UserTextStats | undefined | null;
  // --- MODIFIED: This prop is now specifically for the pie charts ---
  pieChartStats: UserActivityStats | undefined | null;
  userName?: string;
  isLoading?: boolean;
  onCategoryClick?: (segment: PieSegmentData) => void;
  onRatingTierClick?: (segment: PieSegmentData) => void;
  activeCategoryLabel?: string | null;
  activeRatingTierLabel?: string | null;
}

// Define the type for our new tabs
type StatsTab = "categories" | "ratings";

const UserStatisticsPanel: React.FC<UserStatisticsPanelProps> = ({
  textStats,
  pieChartStats,
  isLoading,
  onCategoryClick,
  onRatingTierClick,
  activeCategoryLabel,
  activeRatingTierLabel,
}) => {
  // State to manage the active tab
  const [activeTab, setActiveTab] = useState<StatsTab>("categories");

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

  return (
    <aside className="lg:col-span-3 bg-white rounded-lg shadow-lg flex flex-col overflow-hidden">
      <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1 custom-scrollbar">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <ChartPieIcon className="h-6 w-6 mr-2 text-teal-600" />
          Статистика
        </h3>

        <div className="space-y-1">
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
            label="Средна оценка на сигнал"
            value={
              textStats.averageCaseRating
                ? textStats.averageCaseRating.toFixed(2)
                : "-"
            }
            iconColorClass="text-amber-500"
          />
        </div>

        <div className="flex border-b border-gray-200 text-xs sm:text-sm">
          <button
            onClick={() => setActiveTab("categories")}
            className={`flex-1 py-2 px-1 text-center font-medium focus:outline-none transition-colors duration-150 ${
              activeTab === "categories"
                ? "border-b-2 border-indigo-500 text-indigo-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            По Категории
          </button>
          <button
            onClick={() => setActiveTab("ratings")}
            className={`flex-1 py-2 px-1 text-center font-medium focus:outline-none transition-colors duration-150 ${
              activeTab === "ratings"
                ? "border-b-2 border-indigo-500 text-indigo-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            По Рейтинг
          </button>
        </div>

        <div className="mt-3">
          {activeTab === "categories" && (
            <StatisticPieChart
              title="Разпределение по Категории"
              pieData={pieChartStats.signalsByCategoryChartData}
              onSegmentClick={onCategoryClick}
              activeLabel={activeCategoryLabel}
            />
          )}
          {activeTab === "ratings" && (
            <StatisticPieChart
              title="Разпределение по Оценка на Сигнал"
              pieData={pieChartStats.ratingTierDistributionData}
              onSegmentClick={onRatingTierClick}
              activeLabel={activeRatingTierLabel}
            />
          )}
        </div>
      </div>
    </aside>
  );
};

export default UserStatisticsPanel;
