// src/components/features/analyses/components/TaskAnalyticsTab.tsx
import React, { useState, useMemo } from "react";
import { useGetTaskAnalytics } from "../../../../graphql/hooks/task";
import SummaryCard from "./SummaryCard";
import DistributionChartCard from "./DistributionChartCard";
import BarChart from "../../../charts/BarChart";
import { PieSegmentData } from "../../../charts/PieChart";
import { BarSeriesConfig } from "../../../charts/BarChart";
import StatCardSkeleton from "../../../skeletons/StatCardSkeleton";
import BarChartSkeleton from "../../../skeletons/BarChartSkeleton";
import PageStatusDisplay from "../../../global/PageStatusDisplay";
import { PRIORITY_COLORS, MONTH_NAMES } from "../constants";

const STATUS_COLORS: Record<string, string> = {
  TODO: "#94A3B8", // slate-400
  IN_PROGRESS: "#3B82F6", // blue-500
  DONE: "#22C55E", // green-500
};

const STATUS_LABELS: Record<string, string> = {
  TODO: "Незапочнати",
  IN_PROGRESS: "В процес",
  DONE: "Завършени",
};

const PRIORITY_LABELS: Record<string, string> = {
  LOW: "Нисък",
  MEDIUM: "Среден",
  HIGH: "Висок",
};

const TaskAnalyticsTab: React.FC = () => {
  const { analytics, loading, error } = useGetTaskAnalytics();
  const [barChartStyle, setBarChartStyle] = useState<"grouped" | "stacked">(
    "grouped"
  );

  const statusPieData: PieSegmentData[] = useMemo(() => {
    if (!analytics) return [];
    const { statusDistribution } = analytics;
    return [
      {
        label: STATUS_LABELS.TODO,
        value: statusDistribution.TODO,
        color: STATUS_COLORS.TODO,
      },
      {
        label: STATUS_LABELS.IN_PROGRESS,
        value: statusDistribution.IN_PROGRESS,
        color: STATUS_COLORS.IN_PROGRESS,
      },
      {
        label: STATUS_LABELS.DONE,
        value: statusDistribution.DONE,
        color: STATUS_COLORS.DONE,
      },
    ].filter((s) => s.value > 0);
  }, [analytics]);

  const priorityPieData: PieSegmentData[] = useMemo(() => {
    if (!analytics) return [];
    const { priorityDistribution } = analytics;
    return [
      {
        label: PRIORITY_LABELS.HIGH,
        value: priorityDistribution.HIGH,
        color: PRIORITY_COLORS.HIGH,
      },
      {
        label: PRIORITY_LABELS.MEDIUM,
        value: priorityDistribution.MEDIUM,
        color: PRIORITY_COLORS.MEDIUM,
      },
      {
        label: PRIORITY_LABELS.LOW,
        value: priorityDistribution.LOW,
        color: PRIORITY_COLORS.LOW,
      },
    ].filter((s) => s.value > 0);
  }, [analytics]);

  const barChartData = useMemo(() => {
    if (!analytics || analytics.tasksByPeriod.length === 0) return [];
    return analytics.tasksByPeriod.map((p) => {
      const [year, month] = p.period.split("-");
      const monthIndex = parseInt(month, 10) - 1;
      const label =
        monthIndex >= 0 && monthIndex < 12
          ? `${MONTH_NAMES[monthIndex].slice(0, 3)} ${year}`
          : p.period;
      return {
        periodLabel: label,
        created: p.created,
        completed: p.completed,
      };
    });
  }, [analytics]);

  const barChartSeries: BarSeriesConfig[] = [
    { dataKey: "created", label: "Създадени", color: "#3B82F6" },
    { dataKey: "completed", label: "Завършени", color: "#22C55E" },
  ];

  if (error) {
    return (
      <PageStatusDisplay
        error={error}
        height="h-[calc(100vh-12rem)]"
      />
    );
  }

  if (!loading && !analytics) {
    return (
      <PageStatusDisplay
        notFound
        message="Няма налични данни за анализ на задачи."
        height="h-[calc(100vh-12rem)]"
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {loading ? (
          <>
            <StatCardSkeleton type="text" />
            <StatCardSkeleton type="pieChart" />
            <StatCardSkeleton type="pieChart" />
            <StatCardSkeleton type="text" />
          </>
        ) : (
          <>
            <SummaryCard title="Общо задачи" footerText="всички задачи">
              <p className="text-4xl font-bold text-gray-700">
                {analytics!.totalTasks}
              </p>
              <div className="flex space-x-2 mt-2 text-center">
                <p className="text-xs sm:text-sm">
                  <span
                    style={{ color: STATUS_COLORS.TODO }}
                    className="font-semibold block"
                  >
                    {STATUS_LABELS.TODO}
                  </span>
                  <span
                    style={{ color: STATUS_COLORS.TODO }}
                    className="font-bold text-lg"
                  >
                    {analytics!.statusDistribution.TODO}
                  </span>
                </p>
                <p className="text-xs sm:text-sm">
                  <span
                    style={{ color: STATUS_COLORS.IN_PROGRESS }}
                    className="font-semibold block"
                  >
                    {STATUS_LABELS.IN_PROGRESS}
                  </span>
                  <span
                    style={{ color: STATUS_COLORS.IN_PROGRESS }}
                    className="font-bold text-lg"
                  >
                    {analytics!.statusDistribution.IN_PROGRESS}
                  </span>
                </p>
                <p className="text-xs sm:text-sm">
                  <span
                    style={{ color: STATUS_COLORS.DONE }}
                    className="font-semibold block"
                  >
                    {STATUS_LABELS.DONE}
                  </span>
                  <span
                    style={{ color: STATUS_COLORS.DONE }}
                    className="font-bold text-lg"
                  >
                    {analytics!.statusDistribution.DONE}
                  </span>
                </p>
              </div>
            </SummaryCard>

            <DistributionChartCard
              title="Разпределение по статус"
              pieData={statusPieData}
            />

            <DistributionChartCard
              title="Разпределение по приоритет"
              pieData={priorityPieData}
            />

            <SummaryCard
              title="Средно време за изпълнение"
              footerText="за завършени задачи"
            >
              {analytics!.averageCompletionDays !== null ? (
                <>
                  <p className="text-4xl font-bold text-sky-600">
                    {analytics!.averageCompletionDays.toFixed(1)}
                    <span className="text-lg font-normal text-gray-500 ml-1">
                      дни
                    </span>
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    (от {analytics!.statusDistribution.DONE} завършени задачи)
                  </p>
                </>
              ) : (
                <p className="text-xl text-gray-500 mt-4">
                  Няма завършени задачи
                </p>
              )}
            </SummaryCard>
          </>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md">
        {loading ? (
          <BarChartSkeleton />
        ) : barChartData.length > 0 ? (
          <>
            <div className="flex justify-end px-4 pt-3">
              <div className="inline-flex rounded-md shadow-sm" role="group">
                <button
                  type="button"
                  onClick={() => setBarChartStyle("grouped")}
                  className={`hover:cursor-pointer px-3 py-1 text-xs font-medium ${
                    barChartStyle === "grouped"
                      ? "bg-sky-600 text-white z-10 ring-1 ring-sky-500"
                      : "bg-white text-gray-900 hover:bg-gray-100"
                  } rounded-l-lg border border-gray-200 focus:z-10 focus:ring-1 focus:ring-sky-500`}
                >
                  Групирани
                </button>
                <button
                  type="button"
                  onClick={() => setBarChartStyle("stacked")}
                  className={`hover:cursor-pointer px-3 py-1 text-xs font-medium ${
                    barChartStyle === "stacked"
                      ? "bg-sky-600 text-white z-10 ring-1 ring-sky-500"
                      : "bg-white text-gray-900 hover:bg-gray-100"
                  } rounded-r-md border border-gray-200 focus:z-10 focus:ring-1 focus:ring-sky-500`}
                >
                  Натрупани
                </button>
              </div>
            </div>
            <BarChart
              data={barChartData}
              dataKeyX="periodLabel"
              series={barChartSeries}
              title="Задачи по месеци"
              barStyle={barChartStyle}
            />
          </>
        ) : (
          <div className="flex items-center justify-center h-[280px] text-gray-500">
            Няма данни за периоди
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskAnalyticsTab;
