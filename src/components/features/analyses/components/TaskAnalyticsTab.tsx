// src/components/features/analyses/components/TaskAnalyticsTab.tsx
import React, { useState } from "react";
import SummaryCard from "./SummaryCard";
import DistributionChartCard from "./DistributionChartCard";
import TopUserCard from "./TopUserCard";
import BarChart from "../../../charts/BarChart";
import { PieSegmentData } from "../../../charts/PieChart";
import { BarSeriesConfig } from "../../../charts/BarChart";
import StatCardSkeleton from "../../../skeletons/StatCardSkeleton";
import BarChartSkeleton from "../../../skeletons/BarChartSkeleton";
import {
  PRIORITY_COLORS,
  PRIORITY_TRANSLATIONS,
  STATUS_COLORS,
  STATUS_TRANSLATIONS,
} from "../constants";
import { RankedUser, BarChartDisplayMode } from "../types";

interface TaskAnalyticsTabProps {
  barChartDisplayData: {
    data: Array<any>;
    dataKeyX: string;
    title: string;
    seriesConfig: BarSeriesConfig[];
  };
  barChartStyle: "grouped" | "stacked";
  statusPieData: PieSegmentData[];
  priorityPieData: PieSegmentData[];
  periodTaskSummary: {
    totalTasks: number;
    todo: number;
    inProgress: number;
    done: number;
    high: number;
    medium: number;
    low: number;
  };
  averageCompletionData: { average: number | null; count: number };
  barChartMode: BarChartDisplayMode;
  loading: boolean;
  isAdmin: boolean;
  // Rankings
  rankedCreators: RankedUser[];
  rankedCompleters: RankedUser[];
  rankedCommenters: RankedUser[];
  rankedFastest: RankedUser[];
  // Callbacks
  onBarClick?: (dataPoint: { [key: string]: any }) => void;
  onChartAreaRightClick?: (event: React.MouseEvent) => void;
  onBarMiddleClick?: (
    dataPoint: { [key: string]: any },
    event: React.MouseEvent,
    seriesKey?: string
  ) => void;
  onStatusPieMiddleClick?: (segment: PieSegmentData) => void;
  onPriorityPieMiddleClick?: (segment: PieSegmentData) => void;
  onPodiumClick: (title: string, users: RankedUser[]) => void;
}

const TaskAnalyticsTab: React.FC<TaskAnalyticsTabProps> = ({
  barChartDisplayData,
  barChartStyle,
  statusPieData,
  priorityPieData,
  periodTaskSummary,
  averageCompletionData,
  barChartMode,
  loading,
  isAdmin,
  rankedCreators,
  rankedCompleters,
  rankedCommenters,
  rankedFastest,
  onBarClick,
  onChartAreaRightClick,
  onBarMiddleClick,
  onStatusPieMiddleClick,
  onPriorityPieMiddleClick,
  onPodiumClick,
}) => {
  const [activeStatView, setActiveStatView] = useState<"task" | "user">("task");

  return (
    <>
      {/* Bar Chart */}
      <div className="bg-white rounded-lg shadow-md">
        {loading ? (
          <BarChartSkeleton />
        ) : (
          <BarChart
            data={barChartDisplayData.data}
            dataKeyX={barChartDisplayData.dataKeyX}
            series={barChartDisplayData.seriesConfig}
            title={barChartDisplayData.title}
            barStyle={barChartStyle}
            onBarClick={onBarClick}
            onChartAreaRightClick={onChartAreaRightClick}
            onBarMiddleClick={isAdmin ? onBarMiddleClick : undefined}
            middleClickLabel="задачи"
          />
        )}
      </div>

      {/* Stats / Rankings Toggle + Cards */}
      <div>
        <div className="mb-4 flex items-center justify-center sm:justify-start">
          {loading ? (
            <div className="flex">
              <div className="animate-pulse h-10 w-50 bg-gray-200 rounded-l-lg border-gray-400"></div>
              <div className="animate-pulse h-10 w-50 bg-white rounded-r-lg border-gray-400"></div>
            </div>
          ) : (
            <div className="inline-flex rounded-md shadow-sm" role="group">
              <button
                type="button"
                onClick={() => setActiveStatView("task")}
                className={`hover:cursor-pointer px-4 py-2 text-sm font-medium ${
                  activeStatView === "task"
                    ? "bg-sky-600 text-white z-10 ring-1 ring-sky-500"
                    : "bg-white text-gray-900 hover:bg-gray-100"
                } rounded-l-lg border border-gray-200 focus:z-10 focus:ring-1 focus:ring-sky-500`}
              >
                Статистики по задачи
              </button>
              <button
                type="button"
                onClick={() => setActiveStatView("user")}
                className={`hover:cursor-pointer px-4 py-2 text-sm font-medium ${
                  activeStatView === "user"
                    ? "bg-sky-600 text-white z-10 ring-1 ring-sky-500"
                    : "bg-white text-gray-900 hover:bg-gray-100"
                } rounded-r-md border border-gray-200 focus:z-10 focus:ring-1 focus:ring-sky-500`}
              >
                Потребителска класация
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {loading ? (
            <>
              <StatCardSkeleton type="text" />
              <StatCardSkeleton type="pieChart" />
              <StatCardSkeleton type="pieChart" />
              <StatCardSkeleton type="text" />
            </>
          ) : activeStatView === "task" ? (
            <>
              {/* Total Tasks Summary */}
              <SummaryCard title="Общо задачи" footerText="за избрания период">
                <p className="text-4xl font-bold text-gray-700">
                  {periodTaskSummary.totalTasks}
                </p>
                {barChartMode === "status" ? (
                  <div className="flex space-x-2 mt-2 text-center">
                    <p className="text-xs sm:text-sm">
                      <span
                        style={{ color: STATUS_COLORS.TODO }}
                        className="font-semibold block"
                      >
                        {STATUS_TRANSLATIONS.TODO}
                      </span>
                      <span
                        style={{ color: STATUS_COLORS.TODO }}
                        className="font-bold text-lg"
                      >
                        {periodTaskSummary.todo}
                      </span>
                    </p>
                    <p className="text-xs sm:text-sm">
                      <span
                        style={{ color: STATUS_COLORS.IN_PROGRESS }}
                        className="font-semibold block"
                      >
                        {STATUS_TRANSLATIONS.IN_PROGRESS}
                      </span>
                      <span
                        style={{ color: STATUS_COLORS.IN_PROGRESS }}
                        className="font-bold text-lg"
                      >
                        {periodTaskSummary.inProgress}
                      </span>
                    </p>
                    <p className="text-xs sm:text-sm">
                      <span
                        style={{ color: STATUS_COLORS.DONE }}
                        className="font-semibold block"
                      >
                        {STATUS_TRANSLATIONS.DONE}
                      </span>
                      <span
                        style={{ color: STATUS_COLORS.DONE }}
                        className="font-bold text-lg"
                      >
                        {periodTaskSummary.done}
                      </span>
                    </p>
                  </div>
                ) : (
                  <div className="flex space-x-2 mt-2 text-center">
                    <p className="text-xs sm:text-sm">
                      <span
                        style={{ color: PRIORITY_COLORS.HIGH }}
                        className="font-semibold block"
                      >
                        {PRIORITY_TRANSLATIONS.HIGH}
                      </span>
                      <span
                        style={{ color: PRIORITY_COLORS.HIGH }}
                        className="font-bold text-lg"
                      >
                        {periodTaskSummary.high}
                      </span>
                    </p>
                    <p className="text-xs sm:text-sm">
                      <span
                        style={{ color: PRIORITY_COLORS.MEDIUM }}
                        className="font-semibold block"
                      >
                        {PRIORITY_TRANSLATIONS.MEDIUM}
                      </span>
                      <span
                        style={{ color: PRIORITY_COLORS.MEDIUM }}
                        className="font-bold text-lg"
                      >
                        {periodTaskSummary.medium}
                      </span>
                    </p>
                    <p className="text-xs sm:text-sm">
                      <span
                        style={{ color: PRIORITY_COLORS.LOW }}
                        className="font-semibold block"
                      >
                        {PRIORITY_TRANSLATIONS.LOW}
                      </span>
                      <span
                        style={{ color: PRIORITY_COLORS.LOW }}
                        className="font-bold text-lg"
                      >
                        {periodTaskSummary.low}
                      </span>
                    </p>
                  </div>
                )}
              </SummaryCard>

              {/* Distribution Charts */}
              <DistributionChartCard
                title={
                  barChartMode === "status"
                    ? "Разпределение по приоритет"
                    : "Разпределение по статус"
                }
                pieData={
                  barChartMode === "status" ? priorityPieData : statusPieData
                }
                onSegmentMiddleClick={
                  isAdmin
                    ? barChartMode === "status"
                      ? onPriorityPieMiddleClick
                      : onStatusPieMiddleClick
                    : undefined
                }
                middleClickLabel="задачи"
              />

              <DistributionChartCard
                title={
                  barChartMode === "status"
                    ? "Разпределение по статус"
                    : "Разпределение по приоритет"
                }
                pieData={
                  barChartMode === "status" ? statusPieData : priorityPieData
                }
                onSegmentMiddleClick={
                  isAdmin
                    ? barChartMode === "status"
                      ? onStatusPieMiddleClick
                      : onPriorityPieMiddleClick
                    : undefined
                }
                middleClickLabel="задачи"
              />

              {/* Average Completion Time */}
              <SummaryCard
                title="Средно време за изпълнение"
                footerText="за избрания период"
              >
                {averageCompletionData.average !== null ? (
                  <>
                    <p className="text-4xl font-bold text-sky-600">
                      {averageCompletionData.average.toFixed(1)}
                      <span className="text-lg font-normal text-gray-500 ml-1">
                        дни
                      </span>
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      (от {averageCompletionData.count} завършени задачи)
                    </p>
                  </>
                ) : (
                  <p className="text-xl text-gray-500 mt-4">
                    Няма завършени задачи
                  </p>
                )}
              </SummaryCard>
            </>
          ) : (
            <>
              {/* User Rankings */}
              <TopUserCard
                title="Най-активен създател на задачи"
                stat={rankedCreators[0]}
                actionText="създадени задачи"
                onPodiumClick={() =>
                  onPodiumClick(
                    "Класация: Създали задачи",
                    rankedCreators
                  )
                }
              />
              <TopUserCard
                title="Най-активен изпълнител"
                stat={rankedCompleters[0]}
                actionText="завършени задачи"
                onPodiumClick={() =>
                  onPodiumClick(
                    "Класация: Завършили задачи",
                    rankedCompleters
                  )
                }
              />
              <TopUserCard
                title="Най-активен коментатор"
                stat={rankedCommenters[0]}
                actionText="коментара по задачи"
                onPodiumClick={() =>
                  onPodiumClick(
                    "Класация: Коментирали задачи",
                    rankedCommenters
                  )
                }
              />
              <TopUserCard
                title="Най-бърз изпълнител"
                stat={rankedFastest[0]}
                actionText="дни средно"
                onPodiumClick={() =>
                  onPodiumClick(
                    "Класация: Най-бързи изпълнители",
                    rankedFastest
                  )
                }
              />
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default TaskAnalyticsTab;
