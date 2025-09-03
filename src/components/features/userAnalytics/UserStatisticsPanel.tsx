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
} from "@heroicons/react/24/outline";
import { UserActivityStats } from "../../../hooks/useUserActivityStats";
import StatisticPieChart from "../../charts/StatisticPieChart";
import { PieSegmentData } from "../../charts/PieChart";
import { RatingTierLabel } from "../../../pages/User";
import * as Tooltip from "@radix-ui/react-tooltip";

// define a type for the text-based stats
export interface UserTextStats {
  totalSignals: number;
  totalAnswers: number;
  totalComments: number;
  averageCaseRating: number | null;
}

// MODIFIED: Added type for the new activity selector tabs
export type StatsActivityType =
  | "all"
  | "cases"
  | "answers"
  | "comments"
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
  activeCategoryFilter: string | null;
  activeRatingTierFilter: RatingTierLabel;
  // MODIFIED: Added props for the new activity selector
  activeStatsTab: StatsActivityType;
  onStatsTabChange: (tab: StatsActivityType) => void;
}

// Define the type for our new tabs
type StatsTab = "categories" | "ratings";

// MODIFIED: Create a config for the new buttons for easier mapping
const activityTabsConfig: {
  key: StatsActivityType;
  label: string;
  icon: React.ElementType;
}[] = [
  { key: "all", label: "Всички", icon: GlobeAltIcon },
  { key: "cases", label: "Сигнали", icon: DocumentTextIcon },
  { key: "answers", label: "Решения", icon: ChatBubbleBottomCenterTextIcon },
  { key: "comments", label: "Коментари", icon: ChatBubbleOvalLeftEllipsisIcon },
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
  activeCategoryFilter,
  activeRatingTierFilter,
  activeStatsTab,
  onStatsTabChange,
}) => {
  // State to manage the active tab
  const [activePieTab, setActivePieTab] = useState<StatsTab>("categories");
  const isInteractive = onCategoryClick || onRatingTierClick;

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
    <Tooltip.Provider>
      <aside className="lg:col-span-3 bg-white rounded-lg shadow-lg flex flex-col overflow-hidden">
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1 custom-scrollbar">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-x-2">
            <ChartPieIcon className="h-6 w-6 mr-2 text-teal-600" />
            <span>Статистика</span>
            {/* add Radix UI Tooltip */}
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

          {/* Added Activity Type Selector */}
          <div>
            <label className="text-xs font-semibold text-gray-500">
              Статистика за:
            </label>
            <div className="mt-1.5 grid grid-cols-3 gap-1.5">
              {activityTabsConfig.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => onStatsTabChange(tab.key)}
                  className={`cursor-pointer flex items-center justify-center gap-x-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 ${
                    activeStatsTab === tab.key
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex border-b border-gray-200 text-xs sm:text-sm">
            <button
              onClick={() => setActivePieTab("categories")}
              className={`cursor-pointer relative flex-1 py-2 px-1 text-center font-medium focus:outline-none transition-colors duration-150 ${
                activePieTab === "categories"
                  ? "border-b-2 border-indigo-500 text-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              По Категории
              {activeCategoryFilter !== null && (
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-indigo-500"></span>
              )}
            </button>
            <button
              onClick={() => setActivePieTab("ratings")}
              className={`cursor-pointer relative flex-1 py-2 px-1 text-center font-medium focus:outline-none transition-colors duration-150 ${
                activePieTab === "ratings"
                  ? "border-b-2 border-indigo-500 text-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              По Рейтинг
              {activeRatingTierFilter !== "all" && (
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-indigo-500"></span>
              )}
            </button>
          </div>
          <div className="mt-3">
            {activePieTab === "categories" && (
              <StatisticPieChart
                title="Разпределение по Категории"
                pieData={pieChartStats.signalsByCategoryChartData}
                onSegmentClick={onCategoryClick}
                activeLabel={activeCategoryLabel}
              />
            )}
            {activePieTab === "ratings" && (
              <StatisticPieChart
                title="Разпределение по Оценка"
                pieData={pieChartStats.ratingTierDistributionData}
                onSegmentClick={onRatingTierClick}
                activeLabel={activeRatingTierLabel}
              />
            )}
          </div>
        </div>
      </aside>
    </Tooltip.Provider>
  );
};

export default UserStatisticsPanel;
