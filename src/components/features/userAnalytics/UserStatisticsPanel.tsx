import React, { useState } from "react";
import {
  ChartPieIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  ChatBubbleLeftEllipsisIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import PieChart, { PieSegmentData } from "../../../components/charts/PieChart";
import { UserActivityStats } from "../../../hooks/useUserActivityStats";

interface UserStatisticsPanelProps {
  userStats: UserActivityStats | undefined | null;
  userName?: string;
  isLoading?: boolean;
}

// Define the type for our new tabs
type StatsTab = "categories" | "ratings";

const UserStatisticsPanel: React.FC<UserStatisticsPanelProps> = ({
  userStats,
  userName,
  isLoading,
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

  const renderPieChartSection = (
    title: string,
    pieData: PieSegmentData[] | undefined
  ) => {
    if (
      !pieData ||
      pieData.length === 0 ||
      pieData.reduce((sum, item) => sum + item.value, 0) === 0
    ) {
      return (
        <div className="text-center py-10">
          <InformationCircleIcon className="h-8 w-8 mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-500">Няма данни за диаграмата.</p>
        </div>
      );
    }
    const totalValue = pieData.reduce((sum, item) => sum + item.value, 0);

    return (
      <div className="w-full">
        <h4 className="text-md font-semibold text-gray-700 mb-3">{title}</h4>
        <div className="w-36 h-36 sm:w-40 sm:h-40 lg:w-44 lg:h-44 mx-auto mb-3">
          <PieChart data={pieData} size={200} />
        </div>
        <ul className="text-xs space-y-1 max-h-28 overflow-y-auto custom-scrollbar pr-1">
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

  if (!userStats) {
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
            value={userStats.totalSignals}
            iconColorClass="text-blue-500"
          />
          <StatItem
            icon={ChatBubbleLeftRightIcon}
            label="Отговори"
            value={userStats.totalAnswers}
            iconColorClass="text-green-500"
          />
          <StatItem
            icon={ChatBubbleLeftEllipsisIcon}
            label="Коментари"
            value={userStats.totalComments}
            iconColorClass="text-purple-500"
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
          {activeTab === "categories" &&
            renderPieChartSection(
              "Разпределение по Категории",
              userStats.signalsByCategoryChartData
            )}
          {activeTab === "ratings" &&
            renderPieChartSection(
              "Разпределение по Рейтинг",
              userStats.ratingTierDistributionData
            )}
        </div>
      </div>
    </aside>
  );
};

export default UserStatisticsPanel;
