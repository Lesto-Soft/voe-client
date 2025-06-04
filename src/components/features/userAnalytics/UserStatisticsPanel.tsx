// src/components/features/userAnalytics/UserStatisticsPanel.tsx
import React from "react";
import {
  ChartPieIcon,
  DocumentTextIcon, // For Signals
  ChatBubbleLeftRightIcon, // For Answers
  ChatBubbleLeftEllipsisIcon, // For Comments
  ClockIcon, // For "Response Time" section
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import PieChart, { PieSegmentData } from "../../../components/charts/PieChart"; // Adjust path
import { UserActivityStats } from "../../../hooks/useUserActivityStats"; // Adjust path

interface UserStatisticsPanelProps {
  userStats: UserActivityStats | undefined | null;
  userName?: string; // Optional: for a title like "Статистика за {userName}"
  isLoading?: boolean;
}

const UserStatisticsPanel: React.FC<UserStatisticsPanelProps> = ({
  userStats,
  userName,
  isLoading,
}) => {
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
          <div className="h-7 bg-gray-300 rounded w-3/4 mb-4"></div>{" "}
          {/* Title */}
          <div className="space-y-3">
            <div className="h-5 rounded-md"></div> {/* Stat item */}
            <div className="h-5 rounded-md"></div> {/* Stat item */}
            <div className="h-5 rounded-md"></div> {/* Stat item */}
          </div>
          <hr className="my-4 border-gray-200" />
          <div className="h-6 bg-gray-300 rounded w-1/2 mb-3"></div>{" "}
          {/* Pie chart title */}
          <div className="flex justify-center">
            <div className="h-40 w-40 bg-gray-200 rounded-full"></div>
          </div>
          <div className="space-y-1 mt-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-4 bg-gray-200 rounded w-full mb-1"
              ></div>
            ))}
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
            {/* Статистика {userName && `за ${userName}`} */}
          </h3>
          <p className="text-sm text-gray-500">
            Няма налична статистика за този потребител.
          </p>
        </div>
      </aside>
    );
  }

  const {
    totalSignals,
    totalAnswers,
    totalComments,
    signalsByCategoryChartData,
  } = userStats;

  const renderPieChartSection = () => {
    const totalValue = signalsByCategoryChartData.reduce(
      (sum, item) => sum + item.value,
      0
    );
    if (
      !signalsByCategoryChartData ||
      signalsByCategoryChartData.length === 0 ||
      totalValue === 0
    ) {
      return (
        <div>
          <h4 className="text-md font-semibold text-gray-700 mb-2">
            Разпределение сигнали по категории
          </h4>
          <p className="text-sm text-gray-500 text-center py-4">
            Няма данни за диаграмата.
          </p>
        </div>
      );
    }
    return (
      <div className="w-full">
        <h4 className="text-md font-semibold text-gray-700 mb-3">
          Разпределение сигнали по категории
        </h4>
        <div className="w-36 h-36 sm:w-40 sm:w-40 lg:w-44 lg:h-44 mx-auto mb-3">
          <PieChart data={signalsByCategoryChartData} size={200} />
        </div>
        <ul className="text-xs space-y-1 max-h-40 overflow-y-auto custom-scrollbar pr-1">
          {signalsByCategoryChartData.map((item) => (
            <li
              key={item.label}
              className="flex items-center justify-between px-1"
            >
              <span className="flex items-center" title={item.label}>
                <span
                  className="h-2.5 w-2.5 rounded-full mr-2 flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                  aria-hidden="true"
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

  return (
    <aside className="lg:col-span-3 bg-white rounded-lg shadow-lg flex flex-col overflow-hidden">
      <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1 custom-scrollbar">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <ChartPieIcon className="h-6 w-6 mr-2 text-teal-600" />
          Статистика{" "}
          {/* {userName && <span className="truncate ml-1">за {userName}</span>} */}
        </h3>

        {/* Key Counts */}
        <div className="space-y-1">
          <StatItem
            icon={DocumentTextIcon}
            label="Сигнали"
            value={totalSignals}
            iconColorClass="text-blue-500"
          />
          <StatItem
            icon={ChatBubbleLeftEllipsisIcon}
            label="Коментари"
            value={totalComments}
            iconColorClass="text-purple-500"
          />
          <StatItem
            icon={ChatBubbleLeftRightIcon}
            label="Отговори"
            value={totalAnswers}
            iconColorClass="text-green-500"
          />
        </div>

        <hr className="my-3 border-gray-200" />

        {/* Placeholder for "Response Time" details */}
        {/* <div>
          <h4 className="text-md font-semibold text-gray-700 mb-2 flex items-center">
            <ClockIcon className="h-5 w-5 mr-2 text-orange-500" />
            Време за реакция при отговори
          </h4>
          <div className="p-3 bg-gray-50 rounded-md border border-gray-200 text-center">
            <InformationCircleIcon className="h-8 w-8 text-gray-400 mx-auto mb-1" />
            <p className="text-xs text-gray-500">
              Детайлна статистика за време на реакция ще бъде налична по-късно.
            </p>
          </div>
        </div>

        <hr className="my-3 border-gray-200" /> */}

        {/* Signals by Category Pie Chart */}
        {renderPieChartSection()}
      </div>
    </aside>
  );
};

export default UserStatisticsPanel;
