// src/pages/Analyses.tsx
import React, { useState } from "react";
import { useCurrentUser } from "../context/UserContext";
import { ROLES } from "../utils/GLOBAL_PARAMETERS";
import { useGetAnalyticsDataCases } from "../graphql/hooks/case";
import { useGetRankedUsers } from "../graphql/hooks/user";
import { useAnalysesFilters } from "../components/features/analyses/hooks/useAnalysesFilters";
import { useProcessedAnalyticsData } from "../components/features/analyses/hooks/useProcessedAnalyticsData";
import AnalysesControls from "../components/features/analyses/components/AnalysesControls";
import BarChart from "../components/charts/BarChart";
import DistributionChartCard from "../components/features/analyses/components/DistributionChartCard";
import SummaryCard from "../components/features/analyses/components/SummaryCard";
import TopUserCard from "../components/features/analyses/components/TopUserCard";
import { PodiumModal } from "../components/features/analyses/modals/PodiumModal";
import CaseViewerModal from "../components/modals/caseModals/CaseViewerModal";
import PageStatusDisplay from "../components/global/PageStatusDisplay";
import { RankingType } from "../components/features/analyses/types";
import StatCardSkeleton from "../components/skeletons/StatCardSkeleton";
import BarChartSkeleton from "../components/skeletons/BarChartSkeleton";
import ControlsSkeleton from "../components/skeletons/ControlsSkeleton";
import {
  DAY_NAMES_FULL,
  MONTH_NAMES,
  PRIORITY_COLORS,
  TYPE_COLORS,
} from "../components/features/analyses/constants";
import { RankedUser } from "../components/features/analyses/types";
import { getStartAndEndOfWeek } from "../utils/dateUtils";
import { ICase, IMe, CasePriority, CaseType } from "../db/interfaces"; // Import IMe
import { PieSegmentData } from "../components/charts/PieChart";
import { PRIORITY_TRANSLATIONS } from "../components/features/analyses/constants";

// Define the shape of the filters object for clarity
type CaseFilters = {
  priority?: ICase["priority"] | "";
  type?: ICase["type"] | "";
  startDate?: Date | null;
  endDate?: Date | null;
  categoryIds?: string[];
};

const Analyses: React.FC = () => {
  const currentUser = useCurrentUser() as IMe;
  const isAdmin = currentUser?.role?._id === ROLES.ADMIN;

  const {
    loading: analyticsDataLoading,
    error: analyticsDataError,
    cases: allCases,
  } = useGetAnalyticsDataCases();

  const filters = useAnalysesFilters(allCases);

  const {
    barChartDisplayData,
    categoryPieData,
    priorityPieData,
    typePieData,
    averageRatingData,
    periodCaseSummary,
  } = useProcessedAnalyticsData(allCases, filters);

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

  const [barChartStyle, setBarChartStyle] = useState<"grouped" | "stacked">(
    "grouped"
  );
  const [activeStatView, setActiveStatView] = useState<"case" | "user">("case");
  const [podiumState, setPodiumState] = useState<{
    title: string;
    users: RankedUser[];
  } | null>(null);

  // <-- CHANGED: State now holds the filter object and title for the modal
  const [modalData, setModalData] = useState<{
    initialFilters: CaseFilters;
    title: string;
  } | null>(null);

  const handleBarChartClick = (dataPoint: { [key: string]: any }) => {
    if (!dataPoint) return;

    switch (filters.viewMode) {
      case "all": {
        const year = parseInt(dataPoint.periodLabel, 10);
        if (!isNaN(year)) {
          filters.setCurrentYear(year);
          filters.setViewMode("yearly");
        }
        break;
      }
      case "yearly": {
        const monthIndex = MONTH_NAMES.indexOf(dataPoint.periodLabel);
        if (monthIndex > -1) {
          filters.setCurrentMonth(monthIndex + 1);
          filters.setViewMode("monthly");
        }
        break;
      }
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
      default:
        break;
    }
  };

  const handleChartAreaRightClick = (event: React.MouseEvent) => {
    event.preventDefault();
    switch (filters.viewMode) {
      case "custom":
      case "monthly":
        filters.setViewMode("yearly");
        break;
      case "yearly":
        filters.setViewMode("all");
        break;
      default:
        break;
    }
  };

  // <-- CHANGED: The logic is updated to create a filter OBJECT
  const handleBarChartMiddleClick = (
    dataPoint: { [key: string]: any },
    event: React.MouseEvent,
    seriesKey?: string
  ) => {
    event.preventDefault();
    let startDate: Date | null = null;
    let endDate: Date | null = null;
    const year = filters.currentYear;

    // Default title
    let modalTitle = `Сигнали за ${dataPoint.periodLabel}`;

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
          endDate = new Date(year, monthIndex + 1, 0);
          modalTitle = `Сигнали за ${dataPoint.periodLabel} ${year}`;
        }
        break;
      }
      case "monthly": {
        const day = parseInt(dataPoint.periodLabel, 10);
        if (!isNaN(day)) {
          startDate = new Date(year, filters.currentMonth - 1, day);
          endDate = new Date(year, filters.currentMonth - 1, day);
          modalTitle = `Сигнали за ${startDate.toLocaleDateString("bg-BG")}`;
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
          modalTitle = `Сигнали за ${startDate.toLocaleDateString("bg-BG")}`;
        }
        break;
      }
      case "custom": {
        startDate = filters.startDateForPies;
        endDate = filters.endDateForPies;
        modalTitle = "Сигнали за избран период";
        break;
      }
    }

    if (startDate && endDate) {
      const initialFilters: CaseFilters = { startDate, endDate };

      // Refine modal title and filters if a specific series was clicked
      if (seriesKey && barChartStyle === "grouped") {
        if (filters.barChartMode === "priority") {
          let priorityLabel = "";
          if (seriesKey === "highPriority") {
            priorityLabel = PRIORITY_TRANSLATIONS.HIGH;
            initialFilters.priority = CasePriority.High;
          }
          if (seriesKey === "mediumPriority") {
            priorityLabel = PRIORITY_TRANSLATIONS.MEDIUM;
            initialFilters.priority = CasePriority.Medium;
          }
          if (seriesKey === "lowPriority") {
            priorityLabel = PRIORITY_TRANSLATIONS.LOW;
            initialFilters.priority = CasePriority.Low;
          }
          const preposition = priorityLabel.startsWith("С") ? "със" : "с";
          modalTitle = `Сигнали ${preposition} "${priorityLabel}" приоритет за ${dataPoint.periodLabel}`;
        } else if (filters.barChartMode === "type") {
          let typeLabel = "";
          if (seriesKey === "problems") {
            typeLabel = "Проблеми";
            initialFilters.type = CaseType.Problem;
          }
          if (seriesKey === "suggestions") {
            typeLabel = "Предложения";
            initialFilters.type = CaseType.Suggestion;
          }
          modalTitle = `${typeLabel} за ${dataPoint.periodLabel}`;
        }
      }

      setModalData({ initialFilters, title: modalTitle });
    }
  };

  const handlePieChartMiddleClick = (
    filter: Partial<CaseFilters>,
    title: string
  ) => {
    const initialFilters: CaseFilters = {
      startDate: filters.startDateForPies,
      endDate: filters.endDateForPies,
      ...filter,
    };
    setModalData({ initialFilters, title });
  };

  const handlePriorityPieMiddleClick = (segment: PieSegmentData) => {
    let priority: CasePriority | undefined;
    if (segment.label === PRIORITY_TRANSLATIONS.HIGH)
      priority = CasePriority.High;
    if (segment.label === PRIORITY_TRANSLATIONS.MEDIUM)
      priority = CasePriority.Medium;
    if (segment.label === PRIORITY_TRANSLATIONS.LOW)
      priority = CasePriority.Low;
    if (priority) {
      const preposition = segment.label.startsWith("С") ? "със" : "с";
      const title = `Сигнали ${preposition} "${segment.label}" приоритет`;
      handlePieChartMiddleClick({ priority }, title);
    }
  };

  const handleTypePieMiddleClick = (segment: PieSegmentData) => {
    let type: CaseType | undefined;
    if (segment.label === "Проблеми") type = CaseType.Problem;
    if (segment.label === "Предложения") type = CaseType.Suggestion;
    if (type) {
      const title = `Сигнали от тип "${segment.label}"`;
      handlePieChartMiddleClick({ type }, title);
    }
  };

  const handleCategoryPieMiddleClick = (segment: PieSegmentData) => {
    if (segment.id) {
      const title = `Сигнали от категория "${segment.label}"`;
      handlePieChartMiddleClick({ categoryIds: [segment.id] }, title);
    }
  };

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
                  onSegmentMiddleClick={
                    isAdmin
                      ? filters.barChartMode === "type"
                        ? (segment) => handlePriorityPieMiddleClick(segment)
                        : (segment) => handleTypePieMiddleClick(segment)
                      : undefined
                  }
                />
                <DistributionChartCard
                  title="Разпределение по категории"
                  pieData={categoryPieData}
                  onSegmentMiddleClick={
                    isAdmin
                      ? (segment) => handleCategoryPieMiddleClick(segment)
                      : undefined
                  }
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

      {/* <-- CHANGED: Pass the filter object to the modal --> */}
      <CaseViewerModal
        isOpen={!!modalData}
        onClose={() => setModalData(null)}
        initialFilters={modalData?.initialFilters || {}}
        title={modalData?.title || ""}
      />
    </>
  );
};

export default Analyses;
