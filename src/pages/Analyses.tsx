// pages/Analyses.tsx
import React, { useState } from "react"; // <-- Import useState

// Data Fetching
import { useGetAnalyticsDataCases } from "../graphql/hooks/case";

// Custom Hooks for the Analyses Feature
import { useAnalysesFilters } from "../components/features/analyses/hooks/useAnalysesFilters";
import { useProcessedAnalyticsData } from "../components/features/analyses/hooks/useProcessedAnalyticsData";

// Reusable UI Components
import AnalysesControls from "../components/features/analyses/components/AnalysesControls";
import BarChart from "../components/charts/BarChart";
import DistributionChartCard from "../components/features/analyses/components/DistributionChartCard";
import SummaryCard from "../components/features/analyses/components/SummaryCard";
import TopUserCard from "../components/features/analyses/components/TopUserCard";

// Constants
import {
  PRIORITY_COLORS,
  TYPE_COLORS,
} from "../components/features/analyses/constants";

const Analyses: React.FC = () => {
  // 1. Fetch raw data
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
    topSignalGiver,
    topSolutionGiver,
    topApprover,
    topRater,
  } = useProcessedAnalyticsData(allCases, filters);

  // --- NEW: State for toggling between Case and User stats ---
  const [activeStatView, setActiveStatView] = useState<"case" | "user">("case");

  // --- Render Loading/Error/Empty States ---
  if (analyticsDataLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[calc(100vh-200px)]">
        <p>Зареждане на аналитични данни...</p>
      </div>
    );
  }
  if (analyticsDataError) {
    return (
      <div className="flex items-center justify-center h-full min-h-[calc(100vh-200px)]">
        <p>Грешка при зареждане на данни: {analyticsDataError.message}</p>
      </div>
    );
  }
  if (!allCases || allCases.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[calc(100vh-200px)]">
        <p>Няма налични данни за анализ.</p>
      </div>
    );
  }

  // --- Main Render ---
  return (
    <div className="p-2 md:p-5 bg-gray-100 min-h-full space-y-5">
      <div className="bg-white rounded-md shadow-md">
        <AnalysesControls {...filters} />
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <BarChart
          data={barChartDisplayData.data}
          dataKeyX={barChartDisplayData.dataKeyX}
          series={barChartDisplayData.seriesConfig}
          title={barChartDisplayData.title}
        />
      </div>

      {/* --- NEW: Toggle Buttons and Conditional Rendering for Stat Cards --- */}
      <div>
        <div className="mb-4 flex items-center justify-center sm:justify-start">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              onClick={() => setActiveStatView("case")}
              className={`px-4 py-2 text-sm font-medium ${
                activeStatView === "case"
                  ? "bg-sky-600 text-white z-10 ring-2 ring-sky-500"
                  : "bg-white text-gray-900 hover:bg-gray-100"
              } rounded-l-lg border border-gray-200 focus:z-10 focus:ring-2 focus:ring-sky-500`}
            >
              Статистики по сигнали
            </button>
            <button
              type="button"
              onClick={() => setActiveStatView("user")}
              className={`px-4 py-2 text-sm font-medium ${
                activeStatView === "user"
                  ? "bg-sky-600 text-white z-10 ring-2 ring-sky-500"
                  : "bg-white text-gray-900 hover:bg-gray-100"
              } rounded-r-md border border-gray-200 focus:z-10 focus:ring-2 focus:ring-sky-500`}
            >
              Потребителска класация
            </button>
          </div>
        </div>

        {activeStatView === "case" ? (
          // Case Statistics View
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <SummaryCard title="Общо сигнали" footerText="за избрания период">
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
                filters.barChartMode === "type" ? priorityPieData : typePieData
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
                    {averageRatingData.count === 1 ? "оценка" : "оценки"})
                  </p>
                </>
              ) : (
                <p className="text-xl text-gray-500 mt-4">Няма оценки</p>
              )}
            </SummaryCard>
          </div>
        ) : (
          // User Leaderboard View
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <TopUserCard
              title="Най-активен подал сигнал"
              stat={topSignalGiver}
              actionText="сигнала"
            />
            <TopUserCard
              title="Най-активен дал решение"
              stat={topSolutionGiver}
              actionText="решения"
            />
            <TopUserCard
              title="Най-активен одобрил"
              stat={topApprover}
              actionText="одобрения"
            />
            <TopUserCard
              title="Най-активен оценил"
              stat={topRater}
              actionText="оценки"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Analyses;
