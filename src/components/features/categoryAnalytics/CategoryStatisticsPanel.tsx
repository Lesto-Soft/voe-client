// src/components/features/categoryAnalytics/CategoryStatisticsPanel.tsx
import React from "react";
import * as Tooltip from "@radix-ui/react-tooltip";
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
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import StatisticPieChart from "../../charts/StatisticPieChart";
import { PieSegmentData } from "../../charts/PieChart";
import { SignalStats } from "../../../hooks/useCategorySignalStats";
import {
  translateStatus,
  translateCaseType,
  ResolutionCategoryKey,
} from "../../../utils/categoryDisplayUtils";
import { CaseType } from "../../../db/interfaces";
import { CaseStatusTab } from "../../../pages/Category";

interface CategoryStatisticsPanelProps {
  activeStatsView: "status" | "type" | "resolution";
  setActiveStatsView: (view: "status" | "type" | "resolution") => void;
  isLoading?: boolean;
  onStatusClick?: (segment: PieSegmentData) => void;
  onTypeClick?: (segment: PieSegmentData) => void;
  onResolutionClick?: (segment: PieSegmentData) => void;
  activeStatusLabel?: string | null;
  activeTypeLabel?: string | null;
  activeResolutionLabel?: string | null;
  statsForStatus: SignalStats | undefined | null;
  statsForType: SignalStats | undefined | null;
  statsForResolution: SignalStats | undefined | null;
  // --- NEW PROPS FOR FILTER STATE ---
  activeStatusFilter: CaseStatusTab;
  activeTypeFilter: CaseType | "all";
  activeResolutionFilter: ResolutionCategoryKey | "all";
}

const TEXT_STATS_AREA_HEIGHT = "h-28";

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
  statsForStatus,
  statsForType,
  statsForResolution,
  // --- DESTRUCTURE NEW PROPS ---
  activeStatusFilter,
  activeTypeFilter,
  activeResolutionFilter,
}) => {
  // This constant determines if any of the charts are interactive
  const isInteractive = onStatusClick || onTypeClick || onResolutionClick;

  // Determine which stats object to use based on the active tab
  const activeSignalStats =
    activeStatsView === "status"
      ? statsForStatus
      : activeStatsView === "type"
      ? statsForType
      : statsForResolution;

  if (isLoading && !activeSignalStats) {
    // Keep skeleton as is
    return (
      <aside className="lg:col-span-3 bg-white rounded-lg shadow-lg flex flex-col overflow-hidden">
        <div className="p-6 space-y-3 overflow-y-auto flex-1 animate-pulse custom-scrollbar-xs">
          <div className="h-7 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className={`h-5 bg-gray-200 rounded w-full mb-3`}></div>
          <div className="h-9 bg-gray-200 rounded w-full mb-4"></div>
          <div
            className={`${TEXT_STATS_AREA_HEIGHT} bg-gray-200 rounded w-full mb-3`}
          ></div>
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
          <div className="flex justify-center mb-3">
            <div className="h-40 w-40 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      </aside>
    );
  }

  if (!activeSignalStats) {
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

  const tabs = [
    {
      key: "status",
      label: "По Статус",
      isActive: activeStatusFilter !== "all",
    },
    { key: "type", label: "По Тип", isActive: activeTypeFilter !== "all" },
    {
      key: "resolution",
      label: "По Време",
      isActive: activeResolutionFilter !== "all",
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
                <ListBulletIcon className="h-5 w-5 mr-2 text-blue-500" /> Общо
                сигнали:
              </span>
              <strong className="text-gray-800 text-base">
                {activeSignalStats.totalSignals}
              </strong>
            </p>
          </div>

          <div className="mt-2">
            <div className="flex border-b border-gray-200 text-xs sm:text-sm">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveStatsView(tab.key)}
                  className={`relative hover:cursor-pointer flex-1 py-2 px-1 text-center font-medium focus:outline-none transition-colors duration-150 whitespace-nowrap ${
                    activeStatsView === tab.key
                      ? "border-b-2 border-indigo-500 text-indigo-600"
                      : "text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent"
                  }`}
                >
                  {tab.label}
                  {/* --- NEW: VISUAL INDICATOR DOT --- */}
                  {tab.isActive && (
                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-indigo-500"></span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-3">
            {activeStatsView === "status" && (
              <div className="space-y-2">
                <div
                  className={`space-y-1 text-sm text-gray-600 mb-3 ${TEXT_STATS_AREA_HEIGHT}`}
                >
                  <p className="flex items-center justify-between">
                    <span className="flex items-center">
                      <CheckCircleIcon className="h-5 w-5 mr-2 text-green-500 flex-shrink-0" />
                      {translateStatus("OPEN")}:
                    </span>
                    <strong className="text-gray-800 text-base">
                      {activeSignalStats.strictlyOpenSignals}
                    </strong>
                  </p>
                  <p className="flex items-center justify-between">
                    <span className="flex items-center">
                      <ArrowPathIcon className="h-5 w-5 mr-2 text-yellow-500 flex-shrink-0" />
                      {translateStatus("IN_PROGRESS")}:
                    </span>
                    <strong className="text-gray-800 text-base">
                      {activeSignalStats.inProgressSignals}
                    </strong>
                  </p>
                  <p className="flex items-center justify-between">
                    <span className="flex items-center">
                      <BanknotesIcon className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0" />
                      {translateStatus("AWAITING_FINANCE")}:
                    </span>
                    <strong className="text-gray-800 text-base">
                      {activeSignalStats.awaitingFinanceSignals}
                    </strong>
                  </p>
                  <p className="flex items-center justify-between">
                    <span className="flex items-center">
                      <XCircleIcon className="h-5 w-5 mr-2 text-gray-500 flex-shrink-0" />
                      {translateStatus("CLOSED")}:
                    </span>
                    <strong className="text-gray-800 text-base">
                      {activeSignalStats.closedSignals}
                    </strong>
                  </p>
                </div>
                <StatisticPieChart
                  title="Разпределение по Статус"
                  pieData={activeSignalStats.statusPieChartData}
                  onSegmentClick={onStatusClick}
                  activeLabel={activeStatusLabel}
                />
              </div>
            )}

            {activeStatsView === "type" && (
              <div className="space-y-2">
                <div
                  className={`space-y-1 text-sm text-gray-600 mb-3 ${TEXT_STATS_AREA_HEIGHT} ${
                    activeSignalStats.problemCasesCount === 0 &&
                    activeSignalStats.suggestionCasesCount === 0
                      ? "pt-4 text-center"
                      : ""
                  }`}
                >
                  {activeSignalStats.problemCasesCount > 0 ||
                  activeSignalStats.suggestionCasesCount > 0 ? (
                    <>
                      <p className="flex items-center justify-between w-full">
                        <span className="flex items-center">
                          <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-red-500 flex-shrink-0" />
                          {translateCaseType("PROBLEM")}:
                        </span>
                        <strong className="text-gray-800 text-base">
                          {activeSignalStats.problemCasesCount}
                        </strong>
                      </p>
                      <p className="flex items-center justify-between w-full">
                        <span className="flex items-center">
                          <LightBulbIcon className="h-5 w-5 mr-2 text-green-500 flex-shrink-0" />
                          {translateCaseType("SUGGESTION")}:
                        </span>
                        <strong className="text-gray-800 text-base">
                          {activeSignalStats.suggestionCasesCount}
                        </strong>
                      </p>
                    </>
                  ) : (
                    // If no data, center this specific paragraph horizontally. Added pt-4 for some spacing.
                    <p className="text-gray-500">
                      Няма данни за типовете сигнали.
                    </p>
                  )}
                </div>
                <StatisticPieChart
                  title="Разпределение по Тип"
                  pieData={activeSignalStats.typePieChartData}
                  onSegmentClick={onTypeClick}
                  activeLabel={activeTypeLabel}
                />
              </div>
            )}

            {activeStatsView === "resolution" && (
              <div className="space-y-2">
                <div
                  className={`space-y-1 text-sm text-gray-600 mb-3 ${TEXT_STATS_AREA_HEIGHT}`}
                >
                  <p className="flex items-center justify-between">
                    <span className="flex items-center">
                      <CheckCircleIcon className="h-5 w-5 mr-2 text-green-500 flex-shrink-0" />
                      Приключени (за графиката):
                    </span>
                    <strong className="text-gray-800 text-base">
                      {activeSignalStats.effectivelyResolvedCasesCount}
                    </strong>
                  </p>
                  <p className="flex items-center justify-between">
                    <span className="flex items-center">
                      <ClockIcon className="h-5 w-5 mr-2 text-orange-500 flex-shrink-0" />
                      В изчакване/други:
                    </span>
                    <strong className="text-gray-800 text-base">
                      {activeSignalStats.unresolvedCasesCount}
                    </strong>
                  </p>
                  {activeSignalStats.effectivelyResolvedCasesCount > 0 && (
                    <p className="flex items-center justify-between mt-1">
                      <span className="flex items-center">
                        <DocumentTextIcon className="h-5 w-5 mr-2 text-purple-500 flex-shrink-0" />
                        Средно време (дни):
                      </span>
                      <strong className="text-gray-800 text-base">
                        {activeSignalStats.averageResolutionTime.toFixed(2)}
                      </strong>
                    </p>
                  )}
                </div>
                <StatisticPieChart
                  title="Разпределение по Резолюция"
                  pieData={activeSignalStats.resolutionPieChartData}
                  onSegmentClick={onResolutionClick}
                  activeLabel={activeResolutionLabel}
                />
              </div>
            )}
          </div>
        </div>
      </aside>
    </Tooltip.Provider>
  );
};

export default CategoryStatisticsPanel;
