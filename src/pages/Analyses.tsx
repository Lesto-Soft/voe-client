// pages/Analyses.tsx
import React, { useState } from "react";
import moment from "moment";

// Data Fetching
import { useGetAnalyticsDataCases } from "../graphql/hooks/case";
import { useGetRankedUsers } from "../graphql/hooks/user";
import { useCurrentUser } from "../context/UserContext";

// Custom Hooks for the Analyses Feature
import { useAnalysesFilters } from "../components/features/analyses/hooks/useAnalysesFilters";
import { useProcessedAnalyticsData } from "../components/features/analyses/hooks/useProcessedAnalyticsData";

// Reusable UI Components
import AnalysesControls from "../components/features/analyses/components/AnalysesControls";
import BarChart from "../components/charts/BarChart";
import DistributionChartCard from "../components/features/analyses/components/DistributionChartCard";
import SummaryCard from "../components/features/analyses/components/SummaryCard";
import TopUserCard from "../components/features/analyses/components/TopUserCard";
import { PodiumModal } from "../components/features/analyses/modals/PodiumModal";
import PageStatusDisplay from "../components/global/PageStatusDisplay";
import { RankingType } from "../components/features/analyses/types";
import StatCardSkeleton from "../components/skeletons/StatCardSkeleton";
import BarChartSkeleton from "../components/skeletons/BarChartSkeleton";
import ControlsSkeleton from "../components/skeletons/ControlsSkeleton";

// Constants and Types
import {
  DAY_NAMES_FULL,
  MONTH_NAMES,
  PRIORITY_COLORS,
  TYPE_COLORS,
} from "../components/features/analyses/constants";
import { RankedUser } from "../components/features/analyses/types";
import { getStartAndEndOfWeek } from "../utils/dateUtils";
import { ROLES } from "../utils/GLOBAL_PARAMETERS";
import { IMe } from "../db/interfaces";

const Analyses: React.FC = () => {
  // 1. Fetch raw data
  const currentUser = useCurrentUser() as IMe; // <-- ADD THIS
  const isAdmin = currentUser?.role?._id === ROLES.ADMIN; // <-- AND THIS

  const {
    loading: analyticsDataLoading,
    error: analyticsDataError,
    cases: allCases,
  } = useGetAnalyticsDataCases();

  // 2. Manage all filter states
  const filters = useAnalysesFilters(allCases);

  // 3. Get all processed data
  const {
    barChartDisplayData,
    categoryPieData,
    priorityPieData,
    typePieData,
    averageRatingData,
    periodCaseSummary,
  } = useProcessedAnalyticsData(allCases, filters);

  // ADD calls to the new, efficient hook for each ranking type
  const { rankedUsers: rankedCreators } = useGetRankedUsers(
    filters.startDateForPies,
    filters.endDateForPies,
    RankingType.CREATORS,
    filters.isAllTimePies
  );
  const { rankedUsers: rankedSolvers } = useGetRankedUsers(
    filters.startDateForPies,
    filters.endDateForPies,
    RankingType.SOLVERS,
    filters.isAllTimePies
  );
  const { rankedUsers: rankedApprovers } = useGetRankedUsers(
    filters.startDateForPies,
    filters.endDateForPies,
    RankingType.APPROVERS,
    filters.isAllTimePies
  );
  const { rankedUsers: rankedRaters } = useGetRankedUsers(
    filters.startDateForPies,
    filters.endDateForPies,
    RankingType.RATERS,
    filters.isAllTimePies
  );

  // --- NEW: State for toggling the bar chart style ---
  const [barChartStyle, setBarChartStyle] = useState<"grouped" | "stacked">(
    "grouped"
  );
  // --------------------------------------------------

  const [activeStatView, setActiveStatView] = useState<"case" | "user">("case");
  const [podiumState, setPodiumState] = useState<{
    title: string;
    users: RankedUser[];
  } | null>(null);

  const handleBarChartClick = (dataPoint: { [key: string]: any }) => {
    if (!dataPoint) return;

    switch (filters.viewMode) {
      // If viewing ALL years, click drills down to a specific YEAR
      case "all": {
        const year = parseInt(dataPoint.periodLabel, 10);
        if (!isNaN(year)) {
          filters.setCurrentYear(year);
          filters.setViewMode("yearly");
        }
        break;
      }
      // If viewing a YEAR (by months), click drills down to a specific MONTH
      case "yearly": {
        const monthIndex = MONTH_NAMES.indexOf(dataPoint.periodLabel);
        if (monthIndex > -1) {
          filters.setCurrentMonth(monthIndex + 1);
          filters.setViewMode("monthly");
        }
        break;
      }
      // If viewing a MONTH (by days), click drills down to a specific DAY
      case "monthly": {
        const day = parseInt(dataPoint.periodLabel, 10);
        if (!isNaN(day)) {
          const clickedDate = new Date(
            filters.currentYear,
            filters.currentMonth - 1,
            day
          );
          filters.handleCustomDateRangeChange({
            startDate: clickedDate,
            endDate: clickedDate,
          });
          filters.setViewMode("custom");
        }
        break;
      }
      // No drill-down action for weekly or custom views
      default:
        break;
    }
  };

  const handleChartAreaRightClick = (event: React.MouseEvent) => {
    event.preventDefault(); // Prevents the browser's context menu

    switch (filters.viewMode) {
      // If viewing a MONTH or a custom DAY, zoom out to the YEARLY view
      case "custom":
      case "monthly":
        filters.setViewMode("yearly");
        break;

      // If viewing a YEAR, zoom out to the ALL years view
      case "yearly":
        filters.setViewMode("all");
        break;

      // No zoom-out action for 'all' or 'weekly' views
      default:
        break;
    }
  };

  const handleBarChartMiddleClick = (
    dataPoint: { [key: string]: any },
    event: React.MouseEvent,
    seriesKey?: string
  ) => {
    event.preventDefault();
    let startDate: Date | null = null;
    let endDate: Date | null = null;
    const year = filters.currentYear;

    switch (filters.viewMode) {
      case "all": {
        const clickedYear = parseInt(dataPoint.periodLabel, 10);
        if (!isNaN(clickedYear)) {
          startDate = new Date(clickedYear, 0, 1);
          endDate = new Date(clickedYear, 11, 31);
        }
        break;
      }
      case "yearly": {
        const monthIndex = MONTH_NAMES.indexOf(dataPoint.periodLabel);
        if (monthIndex > -1) {
          startDate = new Date(year, monthIndex, 1);
          endDate = new Date(year, monthIndex + 1, 0); // Day 0 of next month is last day of current
        }
        break;
      }
      case "monthly": {
        const day = parseInt(dataPoint.periodLabel, 10);
        if (!isNaN(day)) {
          startDate = new Date(year, filters.currentMonth - 1, day);
          endDate = new Date(year, filters.currentMonth - 1, day);
        }
        break;
      }
      case "weekly": {
        const dayName = dataPoint.periodLabel;
        const dayIndex = DAY_NAMES_FULL.indexOf(dayName);
        if (dayIndex !== -1) {
          const weekInfo = getStartAndEndOfWeek(filters.currentWeek, year);
          const clickedDate = new Date(weekInfo.start);
          clickedDate.setDate(clickedDate.getDate() + dayIndex);
          startDate = clickedDate;
          endDate = clickedDate;
        }
        break;
      }
      case "custom": {
        // For custom view, use the entire selected range
        startDate = filters.startDateForPies;
        endDate = filters.endDateForPies;
        break;
      }
    }

    if (startDate && endDate) {
      const format = "DD-MM-YYYY";
      const formattedStart = moment(startDate).format(format);
      const formattedEnd = moment(endDate).format(format);

      let extraParams = "";
      if (seriesKey && barChartStyle === "grouped") {
        // Only apply for grouped charts
        if (filters.barChartMode === "priority") {
          if (seriesKey === "highPriority") extraParams = "&priority=HIGH";
          if (seriesKey === "mediumPriority") extraParams = "&priority=MEDIUM";
          if (seriesKey === "lowPriority") extraParams = "&priority=LOW";
        } else if (filters.barChartMode === "type") {
          if (seriesKey === "problems") extraParams = "&type=PROBLEM";
          if (seriesKey === "suggestions") extraParams = "&type=SUGGESTION";
        }
      }

      const url = `/dashboard?startDate=${formattedStart}&endDate=${formattedEnd}${extraParams}`;
      window.open(url, "_blank");
    }
  };

  // First, handle terminal states: error or no data after loading is complete.
  if (analyticsDataError) {
    return (
      <div className="p-2 md:p-5 bg-gray-100 min-h-full">
        <PageStatusDisplay
          error={analyticsDataError}
          height="h-[calc(100vh-12rem)]"
        />
      </div>
    );
  }

  // --- Render Loading/Error/Empty States ---
  if (!analyticsDataLoading && (!allCases || allCases.length === 0)) {
    return (
      <div className="p-2 md:p-5 bg-gray-100 min-h-full">
        <PageStatusDisplay
          notFound
          message="Няма налични данни за анализ."
          height="h-[calc(100vh-12rem)]"
        />
      </div>
    );
  }

  // --- Main Render ---
  return (
    <>
      <div className="p-2 md:p-5 bg-gray-100 min-h-full space-y-5">
        <div className="bg-white rounded-md shadow-md">
          {analyticsDataLoading ? (
            <ControlsSkeleton />
          ) : (
            <AnalysesControls
              {...filters}
              barChartStyle={barChartStyle}
              setBarChartStyle={setBarChartStyle}
            />
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md">
          {analyticsDataLoading ? (
            // Use the new, detailed BarChartSkeleton here
            <BarChartSkeleton />
          ) : (
            <BarChart
              data={barChartDisplayData.data}
              dataKeyX={barChartDisplayData.dataKeyX}
              series={barChartDisplayData.seriesConfig}
              title={barChartDisplayData.title}
              barStyle={barChartStyle}
              onBarClick={handleBarChartClick}
              onChartAreaRightClick={handleChartAreaRightClick}
              onBarMiddleClick={isAdmin ? handleBarChartMiddleClick : undefined}
            />
          )}
        </div>

        <div>
          <div className="mb-4 flex items-center justify-center sm:justify-start">
            {analyticsDataLoading ? (
              <div className="flex ">
                <div className="animate-pulse h-10 w-50 bg-gray-200 rounded-l-lg border-gray-400"></div>
                <div className="animate-pulse h-10 w-50 bg-white rounded-r-lg border-gray-400"></div>
              </div>
            ) : (
              <div className="inline-flex rounded-md shadow-sm" role="group">
                <button
                  type="button"
                  onClick={() => setActiveStatView("case")}
                  className={`hover:cursor-pointer px-4 py-2 text-sm font-medium ${
                    activeStatView === "case"
                      ? "bg-sky-600 text-white z-10 ring-1 ring-sky-500"
                      : "bg-white text-gray-900 hover:bg-gray-100"
                  } rounded-l-lg border border-gray-200 focus:z-10 focus:ring-1 focus:ring-sky-500`}
                >
                  Статистики по сигнали
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
            {analyticsDataLoading ? (
              <>
                <StatCardSkeleton type="text" />
                <StatCardSkeleton type="pieChart" />
                <StatCardSkeleton type="pieChart" />
                <StatCardSkeleton type="text" />
              </>
            ) : activeStatView === "case" ? (
              <>
                <SummaryCard
                  title="Общо сигнали"
                  footerText="за избрания период"
                >
                  <p className="text-4xl font-bold text-gray-700">
                    {periodCaseSummary.totalCases}
                  </p>
                  {filters.barChartMode === "type" ? (
                    <div className="flex space-x-3 mt-2 text-center">
                      <p className="text-xs sm:text-sm">
                        <span
                          style={{ color: TYPE_COLORS.PROBLEM }}
                          className="font-semibold block"
                        >
                          Проблеми
                        </span>
                        <span
                          style={{ color: TYPE_COLORS.PROBLEM }}
                          className="font-bold text-lg"
                        >
                          {(periodCaseSummary as any).problems}
                        </span>
                      </p>
                      <p className="text-xs sm:text-sm">
                        <span
                          style={{ color: TYPE_COLORS.SUGGESTION }}
                          className="font-semibold block"
                        >
                          Предложения
                        </span>
                        <span
                          style={{ color: TYPE_COLORS.SUGGESTION }}
                          className="font-bold text-lg"
                        >
                          {(periodCaseSummary as any).suggestions}
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
                          Висок
                        </span>
                        <span
                          style={{ color: PRIORITY_COLORS.HIGH }}
                          className="font-bold text-lg"
                        >
                          {(periodCaseSummary as any).high}
                        </span>
                      </p>
                      <p className="text-xs sm:text-sm">
                        <span
                          style={{ color: PRIORITY_COLORS.MEDIUM }}
                          className="font-semibold block"
                        >
                          Среден
                        </span>
                        <span
                          style={{ color: PRIORITY_COLORS.MEDIUM }}
                          className="font-bold text-lg"
                        >
                          {(periodCaseSummary as any).medium}
                        </span>
                      </p>
                      <p className="text-xs sm:text-sm">
                        <span
                          style={{ color: PRIORITY_COLORS.LOW }}
                          className="font-semibold block"
                        >
                          Нисък
                        </span>
                        <span
                          style={{ color: PRIORITY_COLORS.LOW }}
                          className="font-bold text-lg"
                        >
                          {(periodCaseSummary as any).low}
                        </span>
                      </p>
                    </div>
                  )}
                </SummaryCard>
                <DistributionChartCard
                  title={
                    filters.barChartMode === "type"
                      ? "Разпределение по приоритет"
                      : "Разпределение по тип"
                  }
                  pieData={
                    filters.barChartMode === "type"
                      ? priorityPieData
                      : typePieData
                  }
                />
                <DistributionChartCard
                  title="Разпределение по категории"
                  pieData={categoryPieData}
                />
                <SummaryCard
                  title="Среден рейтинг на сигнал"
                  footerText="за избрания период"
                >
                  {averageRatingData.average !== null ? (
                    <>
                      <p className="text-4xl font-bold text-sky-600">
                        {averageRatingData.average.toFixed(2)}
                        <span className="text-lg font-normal text-gray-500 ml-1">
                          / 5
                        </span>
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        (от {averageRatingData.count}{" "}
                        {averageRatingData.count === 1
                          ? "оценен сигнал"
                          : "оценени сигнали"}
                        )
                      </p>
                    </>
                  ) : (
                    <p className="text-xl text-gray-500 mt-4">Няма оценки</p>
                  )}
                </SummaryCard>
              </>
            ) : (
              <>
                <TopUserCard
                  title="Най-активен подател на сигнали"
                  stat={rankedCreators[0]}
                  actionText="сигнала"
                  onPodiumClick={() =>
                    setPodiumState({
                      title: "Класация: Подали сигнали",
                      users: rankedCreators,
                    })
                  }
                />
                <TopUserCard
                  title="Най-активен даващ решения"
                  stat={rankedSolvers[0]}
                  actionText="подадени и одобрени решения"
                  onPodiumClick={() =>
                    setPodiumState({
                      title: "Класация: Дали решения",
                      users: rankedSolvers,
                    })
                  }
                />
                <TopUserCard
                  title="Най-активен одобрител"
                  stat={rankedApprovers[0]}
                  actionText="одобрения на решения"
                  onPodiumClick={() =>
                    setPodiumState({
                      title: "Класация: Одобрили решения",
                      users: rankedApprovers,
                    })
                  }
                />
                <TopUserCard
                  title="Най-активен оценител"
                  stat={rankedRaters[0]}
                  actionText="оценени сигнала"
                  onPodiumClick={() =>
                    setPodiumState({
                      title: "Класация: Оценили сигнали",
                      users: rankedRaters,
                    })
                  }
                />
              </>
            )}
          </div>
        </div>
      </div>

      <PodiumModal
        isOpen={!!podiumState}
        onClose={() => setPodiumState(null)}
        title={podiumState?.title || ""}
        users={podiumState?.users || []}
      />
    </>
  );
};

export default Analyses;
