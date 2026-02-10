// src/pages/Analyses.tsx
import React, { useState, useMemo } from "react";
import { useCurrentUser } from "../context/UserContext";
import { ROLES } from "../utils/GLOBAL_PARAMETERS";
import { useGetAnalyticsDataCases } from "../graphql/hooks/case";
import { useGetRankedUsers } from "../graphql/hooks/user";
import {
  useGetAnalyticsDataTasks,
  useGetRankedTaskUsers,
  TaskRankingType,
} from "../graphql/hooks/task";
import { useAnalysesFilters } from "../components/features/analyses/hooks/useAnalysesFilters";
import { useProcessedAnalyticsData } from "../components/features/analyses/hooks/useProcessedAnalyticsData";
import { useProcessedTaskAnalyticsData } from "../components/features/analyses/hooks/useProcessedTaskAnalyticsData";
import AnalysesControls from "../components/features/analyses/components/AnalysesControls";
import BarChart from "../components/charts/BarChart";
import DistributionChartCard from "../components/features/analyses/components/DistributionChartCard";
import SummaryCard from "../components/features/analyses/components/SummaryCard";
import TopUserCard from "../components/features/analyses/components/TopUserCard";
import TaskAnalyticsTab from "../components/features/analyses/components/TaskAnalyticsTab";
import { PodiumModal } from "../components/features/analyses/modals/PodiumModal";
import CaseViewerModal from "../components/modals/caseModals/CaseViewerModal";
import TaskViewerModal, {
  TaskModalFilters,
} from "../components/modals/taskModals/TaskViewerModal";
import PageStatusDisplay from "../components/global/PageStatusDisplay";
import { RankingType, RankedUser } from "../components/features/analyses/types";
import StatCardSkeleton from "../components/skeletons/StatCardSkeleton";
import BarChartSkeleton from "../components/skeletons/BarChartSkeleton";
import ControlsSkeleton from "../components/skeletons/ControlsSkeleton";
import {
  DAY_NAMES_FULL,
  MONTH_NAMES,
  PRIORITY_COLORS,
  PRIORITY_TRANSLATIONS,
  STATUS_TRANSLATIONS,
  TYPE_COLORS,
} from "../components/features/analyses/constants";
import { getStartAndEndOfWeek } from "../utils/dateUtils";
import { ICase, IMe, ITask, CasePriority, CaseType, TaskStatus } from "../db/interfaces";
import { PieSegmentData } from "../components/charts/PieChart";

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

  const [activeTopTab, setActiveTopTab] = useState<"cases" | "tasks">("cases");
  const [barChartStyle, setBarChartStyle] = useState<"grouped" | "stacked">(
    "grouped"
  );

  // --- Data Fetching ---
  const {
    loading: casesLoading,
    error: casesError,
    cases: allCases,
  } = useGetAnalyticsDataCases();

  const {
    loading: tasksLoading,
    error: tasksError,
    tasks: allTasks,
  } = useGetAnalyticsDataTasks();

  // --- Compute dates for the shared filter hook ---
  const caseDates = useMemo(
    () =>
      allCases
        ?.map((c: ICase) => new Date(parseInt(c.date)))
        .filter((d: Date) => !isNaN(d.getTime())) || [],
    [allCases]
  );

  const taskDates = useMemo(
    () =>
      allTasks
        ?.map((t: ITask) => new Date(t.createdAt || ""))
        .filter((d: Date) => !isNaN(d.getTime())) || [],
    [allTasks]
  );

  const activeDates = activeTopTab === "cases" ? caseDates : taskDates;
  const initialBarChartMode = activeTopTab === "cases" ? "type" as const : "status" as const;

  const filters = useAnalysesFilters(activeDates, initialBarChartMode);

  // --- Processed Analytics Data ---
  const caseAnalytics = useProcessedAnalyticsData(allCases, filters);
  const taskAnalytics = useProcessedTaskAnalyticsData(allTasks, filters);

  // --- Rankings (Cases) ---
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

  // --- Rankings (Tasks) ---
  const { rankedUsers: rankedTaskCreators } = useGetRankedTaskUsers(
    filters.startDateForPies,
    filters.endDateForPies,
    TaskRankingType.TASK_CREATORS,
    filters.isAllTimePies
  );
  const { rankedUsers: rankedTaskCompleters } = useGetRankedTaskUsers(
    filters.startDateForPies,
    filters.endDateForPies,
    TaskRankingType.TASK_COMPLETERS,
    filters.isAllTimePies
  );
  const { rankedUsers: rankedTaskCommenters } = useGetRankedTaskUsers(
    filters.startDateForPies,
    filters.endDateForPies,
    TaskRankingType.TASK_COMMENTERS,
    filters.isAllTimePies
  );
  const { rankedUsers: rankedTaskFastest } = useGetRankedTaskUsers(
    filters.startDateForPies,
    filters.endDateForPies,
    TaskRankingType.TASK_FASTEST_COMPLETERS,
    filters.isAllTimePies
  );

  // --- UI State ---
  const [activeStatView, setActiveStatView] = useState<"case" | "user">("case");
  const [podiumState, setPodiumState] = useState<{
    title: string;
    users: RankedUser[];
  } | null>(null);

  const [caseModalData, setCaseModalData] = useState<{
    initialFilters: CaseFilters;
    title: string;
  } | null>(null);

  const [taskModalData, setTaskModalData] = useState<{
    initialFilters: TaskModalFilters;
    title: string;
  } | null>(null);

  // --- Determine active loading/error states ---
  const activeLoading = activeTopTab === "cases" ? casesLoading : tasksLoading;
  const activeError = activeTopTab === "cases" ? casesError : tasksError;
  const activeData = activeTopTab === "cases" ? allCases : allTasks;

  // --- Shared Click Handlers (drill-down/drill-up work the same for both tabs) ---
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

  // --- Helper to compute date range from a bar chart data point ---
  const getDateRangeFromDataPoint = (
    dataPoint: { [key: string]: any }
  ): { startDate: Date | null; endDate: Date | null; periodLabel: string } => {
    let startDate: Date | null = null;
    let endDate: Date | null = null;
    const year = filters.currentYear;
    let periodLabel = dataPoint.periodLabel;

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
          periodLabel = `${dataPoint.periodLabel} ${year}`;
        }
        break;
      }
      case "monthly": {
        const day = parseInt(dataPoint.periodLabel, 10);
        if (!isNaN(day)) {
          startDate = new Date(year, filters.currentMonth - 1, day);
          endDate = new Date(year, filters.currentMonth - 1, day);
          periodLabel = startDate.toLocaleDateString("bg-BG");
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
          periodLabel = startDate.toLocaleDateString("bg-BG");
        }
        break;
      }
      case "custom": {
        startDate = filters.startDateForPies;
        endDate = filters.endDateForPies;
        periodLabel = "избран период";
        break;
      }
    }

    return { startDate, endDate, periodLabel };
  };

  // --- Case Middle-Click Handlers ---
  const handleCaseBarMiddleClick = (
    dataPoint: { [key: string]: any },
    event: React.MouseEvent,
    seriesKey?: string
  ) => {
    event.preventDefault();
    const { startDate, endDate, periodLabel } =
      getDateRangeFromDataPoint(dataPoint);

    if (startDate && endDate) {
      const initialFilters: CaseFilters = { startDate, endDate };
      let modalTitle = `Сигнали за ${periodLabel}`;

      if (seriesKey && barChartStyle === "grouped") {
        if (filters.barChartMode === "priority") {
          if (seriesKey === "highPriority") {
            initialFilters.priority = CasePriority.High;
            modalTitle = `Сигнали с "${PRIORITY_TRANSLATIONS.HIGH}" приоритет за ${periodLabel}`;
          }
          if (seriesKey === "mediumPriority") {
            initialFilters.priority = CasePriority.Medium;
            const preposition = PRIORITY_TRANSLATIONS.MEDIUM.startsWith("С") ? "със" : "с";
            modalTitle = `Сигнали ${preposition} "${PRIORITY_TRANSLATIONS.MEDIUM}" приоритет за ${periodLabel}`;
          }
          if (seriesKey === "lowPriority") {
            initialFilters.priority = CasePriority.Low;
            modalTitle = `Сигнали с "${PRIORITY_TRANSLATIONS.LOW}" приоритет за ${periodLabel}`;
          }
        } else if (filters.barChartMode === "type") {
          if (seriesKey === "problems") {
            initialFilters.type = CaseType.Problem;
            modalTitle = `Проблеми за ${periodLabel}`;
          }
          if (seriesKey === "suggestions") {
            initialFilters.type = CaseType.Suggestion;
            modalTitle = `Предложения за ${periodLabel}`;
          }
        }
      }

      setCaseModalData({ initialFilters, title: modalTitle });
    }
  };

  const handleCasePieChartMiddleClick = (
    filter: Partial<CaseFilters>,
    title: string
  ) => {
    const initialFilters: CaseFilters = {
      startDate: filters.startDateForPies,
      endDate: filters.endDateForPies,
      ...filter,
    };
    setCaseModalData({ initialFilters, title });
  };

  const handlePriorityPieMiddleClick = (segment: PieSegmentData) => {
    let priority: CasePriority | undefined;
    if (segment.label === PRIORITY_TRANSLATIONS.HIGH) priority = CasePriority.High;
    if (segment.label === PRIORITY_TRANSLATIONS.MEDIUM) priority = CasePriority.Medium;
    if (segment.label === PRIORITY_TRANSLATIONS.LOW) priority = CasePriority.Low;
    if (priority) {
      const preposition = segment.label.startsWith("С") ? "със" : "с";
      const title = `Сигнали ${preposition} "${segment.label}" приоритет`;
      handleCasePieChartMiddleClick({ priority }, title);
    }
  };

  const handleTypePieMiddleClick = (segment: PieSegmentData) => {
    let type: CaseType | undefined;
    if (segment.label === "Проблеми") type = CaseType.Problem;
    if (segment.label === "Предложения") type = CaseType.Suggestion;
    if (type) {
      const title = `Сигнали от тип "${segment.label}"`;
      handleCasePieChartMiddleClick({ type }, title);
    }
  };

  const handleCategoryPieMiddleClick = (segment: PieSegmentData) => {
    if (segment.id) {
      const title = `Сигнали от категория "${segment.label}"`;
      handleCasePieChartMiddleClick({ categoryIds: [segment.id] }, title);
    }
  };

  // --- Task Middle-Click Handlers ---
  const handleTaskBarMiddleClick = (
    dataPoint: { [key: string]: any },
    event: React.MouseEvent,
    seriesKey?: string
  ) => {
    event.preventDefault();
    const { startDate, endDate, periodLabel } =
      getDateRangeFromDataPoint(dataPoint);

    if (startDate && endDate) {
      const initialFilters: TaskModalFilters = { startDate, endDate };
      let modalTitle = `Задачи за ${periodLabel}`;

      if (seriesKey && barChartStyle === "grouped") {
        if (filters.barChartMode === "status") {
          if (seriesKey === "todo") {
            initialFilters.status = TaskStatus.Todo;
            modalTitle = `"${STATUS_TRANSLATIONS.TODO}" задачи за ${periodLabel}`;
          }
          if (seriesKey === "inProgress") {
            initialFilters.status = TaskStatus.InProgress;
            modalTitle = `"${STATUS_TRANSLATIONS.IN_PROGRESS}" задачи за ${periodLabel}`;
          }
          if (seriesKey === "done") {
            initialFilters.status = TaskStatus.Done;
            modalTitle = `"${STATUS_TRANSLATIONS.DONE}" задачи за ${periodLabel}`;
          }
        } else if (filters.barChartMode === "priority") {
          if (seriesKey === "highPriority") {
            initialFilters.priority = CasePriority.High;
            modalTitle = `Задачи с "${PRIORITY_TRANSLATIONS.HIGH}" приоритет за ${periodLabel}`;
          }
          if (seriesKey === "mediumPriority") {
            initialFilters.priority = CasePriority.Medium;
            const preposition = PRIORITY_TRANSLATIONS.MEDIUM.startsWith("С") ? "със" : "с";
            modalTitle = `Задачи ${preposition} "${PRIORITY_TRANSLATIONS.MEDIUM}" приоритет за ${periodLabel}`;
          }
          if (seriesKey === "lowPriority") {
            initialFilters.priority = CasePriority.Low;
            modalTitle = `Задачи с "${PRIORITY_TRANSLATIONS.LOW}" приоритет за ${periodLabel}`;
          }
        }
      }

      setTaskModalData({ initialFilters, title: modalTitle });
    }
  };

  const handleTaskStatusPieMiddleClick = (segment: PieSegmentData) => {
    let status: TaskStatus | undefined;
    if (segment.label === STATUS_TRANSLATIONS.TODO) status = TaskStatus.Todo;
    if (segment.label === STATUS_TRANSLATIONS.IN_PROGRESS) status = TaskStatus.InProgress;
    if (segment.label === STATUS_TRANSLATIONS.DONE) status = TaskStatus.Done;
    if (status) {
      const title = `Задачи със статус "${segment.label}"`;
      setTaskModalData({
        initialFilters: {
          status,
          startDate: filters.startDateForPies,
          endDate: filters.endDateForPies,
        },
        title,
      });
    }
  };

  const handleTaskPriorityPieMiddleClick = (segment: PieSegmentData) => {
    let priority: CasePriority | undefined;
    if (segment.label === PRIORITY_TRANSLATIONS.HIGH) priority = CasePriority.High;
    if (segment.label === PRIORITY_TRANSLATIONS.MEDIUM) priority = CasePriority.Medium;
    if (segment.label === PRIORITY_TRANSLATIONS.LOW) priority = CasePriority.Low;
    if (priority) {
      const preposition = segment.label.startsWith("С") ? "със" : "с";
      const title = `Задачи ${preposition} "${segment.label}" приоритет`;
      setTaskModalData({
        initialFilters: {
          priority,
          startDate: filters.startDateForPies,
          endDate: filters.endDateForPies,
        },
        title,
      });
    }
  };

  return (
    <>
      <div className="p-2 md:p-5 bg-gray-100 min-h-full space-y-5">
        {/* Shared Controls */}
        <div className="bg-white rounded-md shadow-md">
          {activeLoading ? (
            <ControlsSkeleton />
          ) : (
            <AnalysesControls
              {...filters}
              barChartStyle={barChartStyle}
              setBarChartStyle={setBarChartStyle}
              activeTopTab={activeTopTab}
              setActiveTopTab={setActiveTopTab}
            />
          )}
        </div>

        {activeError ? (
          <PageStatusDisplay
            error={activeError}
            height="h-[calc(100vh-12rem)]"
          />
        ) : !activeLoading &&
          (!activeData || (Array.isArray(activeData) && activeData.length === 0)) ? (
          <PageStatusDisplay
            notFound
            message={
              activeTopTab === "cases"
                ? "Няма налични данни за анализ."
                : "Няма налични данни за анализ на задачи."
            }
            height="h-[calc(100vh-12rem)]"
          />
        ) : activeTopTab === "tasks" ? (
          /* ==================== TASKS TAB ==================== */
          <TaskAnalyticsTab
            barChartDisplayData={taskAnalytics.barChartDisplayData}
            barChartStyle={barChartStyle}
            statusPieData={taskAnalytics.statusPieData}
            priorityPieData={taskAnalytics.priorityPieData}
            periodTaskSummary={taskAnalytics.periodTaskSummary}
            averageCompletionData={taskAnalytics.averageCompletionData}
            barChartMode={filters.barChartMode}
            loading={tasksLoading}
            isAdmin={isAdmin}
            rankedCreators={rankedTaskCreators as RankedUser[]}
            rankedCompleters={rankedTaskCompleters as RankedUser[]}
            rankedCommenters={rankedTaskCommenters as RankedUser[]}
            rankedFastest={rankedTaskFastest as RankedUser[]}
            onBarClick={handleBarChartClick}
            onChartAreaRightClick={handleChartAreaRightClick}
            onBarMiddleClick={handleTaskBarMiddleClick}
            onStatusPieMiddleClick={handleTaskStatusPieMiddleClick}
            onPriorityPieMiddleClick={handleTaskPriorityPieMiddleClick}
            onPodiumClick={(title, users) =>
              setPodiumState({ title, users })
            }
          />
        ) : (
          /* ==================== CASES TAB ==================== */
          <>
            <div className="bg-white rounded-lg shadow-md">
              {casesLoading ? (
                <BarChartSkeleton />
              ) : (
                <BarChart
                  data={caseAnalytics.barChartDisplayData.data}
                  dataKeyX={caseAnalytics.barChartDisplayData.dataKeyX}
                  series={caseAnalytics.barChartDisplayData.seriesConfig}
                  title={caseAnalytics.barChartDisplayData.title}
                  barStyle={barChartStyle}
                  onBarClick={handleBarChartClick}
                  onChartAreaRightClick={handleChartAreaRightClick}
                  onBarMiddleClick={
                    isAdmin ? handleCaseBarMiddleClick : undefined
                  }
                />
              )}
            </div>

            <div>
              <div className="mb-4 flex items-center justify-center sm:justify-start">
                {casesLoading ? (
                  <div className="flex">
                    <div className="animate-pulse h-10 w-50 bg-gray-200 rounded-l-lg border-gray-400"></div>
                    <div className="animate-pulse h-10 w-50 bg-white rounded-r-lg border-gray-400"></div>
                  </div>
                ) : (
                  <div
                    className="inline-flex rounded-md shadow-sm"
                    role="group"
                  >
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
                {casesLoading ? (
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
                        {caseAnalytics.periodCaseSummary.totalCases}
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
                              {(caseAnalytics.periodCaseSummary as any).problems}
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
                              {
                                (caseAnalytics.periodCaseSummary as any)
                                  .suggestions
                              }
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
                              {(caseAnalytics.periodCaseSummary as any).high}
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
                              {(caseAnalytics.periodCaseSummary as any).medium}
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
                              {(caseAnalytics.periodCaseSummary as any).low}
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
                          ? caseAnalytics.priorityPieData
                          : caseAnalytics.typePieData
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
                      pieData={caseAnalytics.categoryPieData}
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
                      {caseAnalytics.averageRatingData.average !== null ? (
                        <>
                          <p className="text-4xl font-bold text-sky-600">
                            {caseAnalytics.averageRatingData.average.toFixed(2)}
                            <span className="text-lg font-normal text-gray-500 ml-1">
                              / 5
                            </span>
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            (от {caseAnalytics.averageRatingData.count}{" "}
                            {caseAnalytics.averageRatingData.count === 1
                              ? "оценен сигнал"
                              : "оценени сигнали"}
                            )
                          </p>
                        </>
                      ) : (
                        <p className="text-xl text-gray-500 mt-4">
                          Няма оценки
                        </p>
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
          </>
        )}
      </div>

      <PodiumModal
        isOpen={!!podiumState}
        onClose={() => setPodiumState(null)}
        title={podiumState?.title || ""}
        users={podiumState?.users || []}
      />

      <CaseViewerModal
        isOpen={!!caseModalData}
        onClose={() => setCaseModalData(null)}
        initialFilters={caseModalData?.initialFilters || {}}
        title={caseModalData?.title || ""}
      />

      <TaskViewerModal
        isOpen={!!taskModalData}
        onClose={() => setTaskModalData(null)}
        initialFilters={taskModalData?.initialFilters || {}}
        title={taskModalData?.title || ""}
      />
    </>
  );
};

export default Analyses;
