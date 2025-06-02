// src/components/features/categoryAnalytics/CategoryStatisticsPanel.tsx
import React from "react";
import {
  ChartPieIcon,
  ListBulletIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  BanknotesIcon,
  XCircleIcon,
  LightBulbIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import PieChart, { PieSegmentData } from "../../../components/charts/PieChart"; // Adjust path
import { SignalStats } from "../../../hooks/useCategorySignalStats"; // Adjust path
import {
  translateStatus,
  translateCaseType,
  translateResolutionCategory,
  RESOLUTION_CATEGORY_CONFIG,
} from "../../../utils/categoryDisplayUtils"; // Adjust path

interface CategoryStatisticsPanelProps {
  signalStats: SignalStats | undefined | null;
  activeStatsView: "status" | "type" | "resolution";
  setActiveStatsView: (view: "status" | "type" | "resolution") => void;
  isLoading?: boolean; // For showing a loading state for the panel
}

const CategoryStatisticsPanel: React.FC<CategoryStatisticsPanelProps> = ({
  signalStats,
  activeStatsView,
  setActiveStatsView,
  isLoading,
}) => {
  const renderPieChartWithLegend = (
    title: string,
    pieData: PieSegmentData[],
    translationFn?: (label: string) => string
  ) => {
    const totalValue = pieData.reduce((sum, item) => sum + item.value, 0);

    if (isLoading) {
      // Loading state for individual pie chart area
      return (
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>{" "}
          {/* Title placeholder */}
          <div className="flex justify-center mb-3">
            <div className="h-32 w-32 sm:h-36 sm:w-36 lg:h-40 lg:w-40 bg-gray-200 rounded-full"></div>
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
      );
    }

    if (!pieData || pieData.length === 0 || totalValue === 0) {
      return (
        <div>
          <h4 className="text-md font-semibold text-gray-700 mb-3">{title}</h4>
          <p className="text-sm text-gray-500 text-center py-4">
            Няма данни за диаграмата.
          </p>
        </div>
      );
    }

    return (
      <div className="w-full">
        <h4 className="text-md font-semibold text-gray-700 mb-3">{title}</h4>
        <div className="w-32 h-32 sm:w-36 sm:w-36 lg:w-40 lg:h-40 mx-auto mb-3">
          <PieChart data={pieData} size={100} />
        </div>
        <ul className="text-xs space-y-1">
          {pieData.map((item) => (
            <li
              key={item.label}
              className="flex items-center justify-between px-1 sm:px-2"
            >
              <span className="flex items-center">
                <span
                  className="h-2.5 w-2.5 rounded-full mr-2 flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                  aria-hidden="true"
                />
                <span
                  className="truncate"
                  title={translationFn ? translationFn(item.label) : item.label}
                >
                  {translationFn ? translationFn(item.label) : item.label}:
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

  if (isLoading && !signalStats) {
    // Main loading state for the whole panel
    return (
      <aside className="lg:col-span-3 bg-white rounded-lg shadow-lg flex flex-col overflow-hidden">
        <div className="p-6 space-y-3 overflow-y-auto flex-1 animate-pulse custom-scrollbar">
          <div className="h-7 bg-gray-200 rounded w-1/2 mb-4"></div>{" "}
          {/* Stats title */}
          <div className="h-5 bg-gray-200 rounded w-full mb-3"></div>{" "}
          {/* Total signals */}
          <div className="h-9 bg-gray-200 rounded w-full mb-4"></div>{" "}
          {/* Tabs */}
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>{" "}
          {/* Pie chart title */}
          <div className="flex justify-center mb-3">
            <div className="h-40 w-40 bg-gray-200 rounded-full"></div>
          </div>
          <div className="space-y-1">
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

  if (!signalStats) {
    // This can happen if category exists but has no cases, or if signalStats is null for other reasons
    // The main page should ideally handle "category not found" or major errors before reaching here.
    return (
      <aside className="lg:col-span-3 bg-white rounded-lg shadow-lg flex flex-col overflow-hidden">
        <div className="p-6 space-y-3 overflow-y-auto flex-1 custom-scrollbar">
          <h3 className="text-xl font-semibold text-gray-700 mb-3 flex items-center">
            <ChartPieIcon className="h-6 w-6 mr-2 text-teal-600" /> Статистика
          </h3>
          <p className="text-sm text-gray-500">Няма налична статистика.</p>
        </div>
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
              <ListBulletIcon className="h-5 w-5 mr-2 text-blue-500" /> Общо
              сигнали:
            </span>
            <strong className="text-gray-800 text-base">
              {signalStats.totalSignals}
            </strong>
          </p>
        </div>

        {/* Tabs for Stats View */}
        <div className="mt-2">
          <div className="flex border-b border-gray-200 text-xs sm:text-sm">
            {(
              [
                { key: "status", label: "По Статус" },
                { key: "type", label: "По Тип" },
                { key: "resolution", label: "По Време" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveStatsView(tab.key)}
                className={`flex-1 py-2 px-1 text-center font-medium focus:outline-none transition-colors duration-150 whitespace-nowrap ${
                  activeStatsView === tab.key
                    ? "border-b-2 border-indigo-500 text-indigo-600"
                    : "text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content based on activeStatsView */}
        <div className="mt-3">
          {activeStatsView === "status" && (
            <div className="space-y-2">
              <div className="space-y-1 text-sm text-gray-600 mb-3 min-h-[calc(4*1.75rem)]">
                {" "}
                {/* Approx 4 lines */}
                <p className="flex items-center justify-between">
                  <span className="flex items-center">
                    <CheckCircleIcon className="h-5 w-5 mr-2 text-green-500 flex-shrink-0" />
                    {translateStatus("OPEN")}:
                  </span>
                  <strong className="text-gray-800 text-base">
                    {signalStats.strictlyOpenSignals}
                  </strong>
                </p>
                <p className="flex items-center justify-between">
                  <span className="flex items-center">
                    <ArrowPathIcon className="h-5 w-5 mr-2 text-yellow-500 flex-shrink-0" />
                    {translateStatus("IN_PROGRESS")}:
                  </span>
                  <strong className="text-gray-800 text-base">
                    {signalStats.inProgressSignals}
                  </strong>
                </p>
                <p className="flex items-center justify-between">
                  <span className="flex items-center">
                    <BanknotesIcon className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0" />
                    {translateStatus("AWAITING_FINANCE")}:
                  </span>
                  <strong className="text-gray-800 text-base">
                    {signalStats.awaitingFinanceSignals}
                  </strong>
                </p>
                <p className="flex items-center justify-between">
                  <span className="flex items-center">
                    <XCircleIcon className="h-5 w-5 mr-2 text-gray-500 flex-shrink-0" />
                    {translateStatus("CLOSED")}:
                  </span>
                  <strong className="text-gray-800 text-base">
                    {signalStats.closedSignals}
                  </strong>
                </p>
              </div>
              {renderPieChartWithLegend(
                "Разпределение по Статус",
                signalStats.statusPieChartData,
                translateStatus
              )}
            </div>
          )}

          {activeStatsView === "type" && (
            <div className="space-y-2">
              <div
                className={`space-y-1 text-sm text-gray-600 mb-3 min-h-[calc(2*1.75rem)] ${
                  signalStats.problemCasesCount === 0 &&
                  signalStats.suggestionCasesCount === 0
                    ? "flex items-center justify-center"
                    : ""
                }`}
              >
                {signalStats.problemCasesCount > 0 ||
                signalStats.suggestionCasesCount > 0 ? (
                  <>
                    <p className="flex items-center justify-between">
                      <span className="flex items-center">
                        <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-red-500 flex-shrink-0" />
                        {translateCaseType("PROBLEM")}:
                      </span>
                      <strong className="text-gray-800 text-base">
                        {signalStats.problemCasesCount}
                      </strong>
                    </p>
                    <p className="flex items-center justify-between">
                      <span className="flex items-center">
                        <LightBulbIcon className="h-5 w-5 mr-2 text-green-500 flex-shrink-0" />
                        {translateCaseType("SUGGESTION")}:
                      </span>
                      <strong className="text-gray-800 text-base">
                        {signalStats.suggestionCasesCount}
                      </strong>
                    </p>
                  </>
                ) : (
                  <p className="text-gray-500">
                    Няма данни за типовете сигнали.
                  </p>
                )}
              </div>
              {renderPieChartWithLegend(
                "Разпределение по Тип",
                signalStats.typePieChartData,
                translateCaseType
              )}
            </div>
          )}

          {activeStatsView === "resolution" && (
            <div className="space-y-2">
              <div className="space-y-1 text-sm text-gray-600 mb-3 min-h-[calc(3*1.75rem)]">
                <p className="flex items-center justify-between">
                  <span className="flex items-center">
                    <CheckCircleIcon className="h-5 w-5 mr-2 text-green-500 flex-shrink-0" />
                    Приключени (за графиката):
                  </span>
                  <strong className="text-gray-800 text-base">
                    {signalStats.effectivelyResolvedCasesCount}
                  </strong>
                </p>
                <p className="flex items-center justify-between">
                  <span className="flex items-center">
                    <ClockIcon className="h-5 w-5 mr-2 text-orange-500 flex-shrink-0" />
                    В изчакване/други:
                  </span>
                  <strong className="text-gray-800 text-base">
                    {signalStats.unresolvedCasesCount}
                  </strong>
                </p>
                {signalStats.effectivelyResolvedCasesCount > 0 && (
                  <p className="flex items-center justify-between mt-1">
                    <span className="flex items-center">
                      <DocumentTextIcon className="h-5 w-5 mr-2 text-purple-500 flex-shrink-0" />
                      Средно време (дни):
                    </span>
                    <strong className="text-gray-800 text-base">
                      {signalStats.averageResolutionTime.toFixed(2)}
                    </strong>
                  </p>
                )}
              </div>
              {renderPieChartWithLegend(
                "Разпределение по Време на Резолюция",
                signalStats.resolutionPieChartData,
                translateResolutionCategory
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default CategoryStatisticsPanel;
