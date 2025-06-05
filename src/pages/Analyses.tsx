import React, { useState, useEffect, useMemo } from "react";
import { useGetAnalyticsDataCases } from "../graphql/hooks/case"; // Adjust path as needed
import PieChart, { PieSegmentData } from "../components/charts/PieChart"; // Adjust path as needed
import BarChart from "../components/charts/BarChart"; // Corrected import for default export

// --- Interfaces ---
import { ICase, ICategory } from "../db/interfaces"; // Assuming ICategory is also needed and exported

// --- Component Type Definitions ---
type ViewMode = "all" | "monthly" | "weekly" | "custom";

// --- Constants ---
const priorityTranslations: Record<string, string> = {
  LOW: "Нисък",
  MEDIUM: "Среден",
  HIGH: "Висок",
};
const CATEGORY_COLORS = [
  "#FF6384",
  "#36A2EB",
  "#FFCE56",
  "#4BC0C0",
  "#9966FF",
  "#FF9F40",
  "#C9CBCF",
  "#F7A35C",
  "#8085E9",
  "#F15C80",
];
const PRIORITY_COLORS: Record<string, string> = {
  HIGH: "#F87171", // Tailwind Red-400
  MEDIUM: "#FCD34D", // Tailwind Amber-300
  LOW: "#60A5FA", // Tailwind Blue-400
};
const MONTH_NAMES = [
  "Януари",
  "Февруари",
  "Март",
  "Април",
  "Май",
  "Юни",
  "Юли",
  "Август",
  "Септември",
  "Октомври",
  "Ноември",
  "Декември",
];
// MODIFIED: Using full day names for the Bar Chart X-axis
const DAY_NAMES = [
  "Понеделник",
  "Вторник",
  "Сряда",
  "Четвъртък",
  "Петък",
  "Събота",
  "Неделя",
];

// --- Date Helper Functions ---
const getWeekOfYear = (date: Date): number => {
  const target = new Date(date.valueOf());
  target.setHours(0, 0, 0, 0);
  // Sunday - Saturday : 0 - 6
  target.setDate(target.getDate() + 3 - ((target.getDay() + 6) % 7)); // Set to Thursday of the week
  const firstThursday = new Date(target.getFullYear(), 0, 4); // First Thursday of the year
  return (
    1 +
    Math.round(
      ((target.getTime() - firstThursday.getTime()) / 86400000 -
        3 +
        ((firstThursday.getDay() + 6) % 7)) /
        7
    )
  );
};

const getStartAndEndOfWeek = (
  weekNumber: number,
  year: number
): { start: Date; end: Date } => {
  const simple = new Date(Date.UTC(year, 0, 1 + (weekNumber - 1) * 7));
  const dayOfWeek = simple.getUTCDay(); // Sunday = 0, Monday = 1, ...
  const isoDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek; // Monday = 1, Sunday = 7 (ISO)

  const start = new Date(simple);
  start.setUTCDate(simple.getUTCDate() - isoDayOfWeek + 1); // Set to Monday
  start.setUTCHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 6);
  end.setUTCHours(23, 59, 59, 999);

  return { start, end };
};

// --- PieLegend Sub-Component ---
const PieLegend = ({ data }: { data: PieSegmentData[] }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  if (total === 0 && data.length === 0) {
    return (
      <div className="mt-2 text-sm text-gray-500 w-full text-center">
        Няма данни за избрания период.
      </div>
    );
  }

  return (
    <div className="w-full space-y-1 p-1 flex-grow h-30 overflow-y-auto">
      {total > 0 &&
        data.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between text-xs sm:text-sm mb-1"
          >
            <div className="flex items-center truncate">
              <span
                className="w-3 h-3 mr-2 rounded-sm flex-shrink-0"
                style={{ backgroundColor: item.color }}
              ></span>
              <span className="truncate" title={item.label}>
                {item.label}
              </span>
            </div>
            <span className="font-medium text-gray-700 whitespace-nowrap ml-2">
              {item.value}{" "}
              <span className="text-gray-500">
                ({((item.value / total) * 100).toFixed(1)}%)
              </span>
            </span>
          </div>
        ))}
    </div>
  );
};

// --- Main Analyses Component ---
const Analyses = () => {
  const {
    loading: analyticsDataLoading,
    error: analyticsDataError,
    cases: allCases,
  } = useGetAnalyticsDataCases();
  const [viewMode, setViewMode] = useState<ViewMode>("all");
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1); // 1-12
  const [currentWeek, setCurrentWeek] = useState(getWeekOfYear(new Date()));
  const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
  const [customEndDate, setCustomEndDate] = useState<Date | null>(null);

  const uniqueYears = useMemo(() => {
    if (!allCases) return [new Date().getFullYear()];
    const years = new Set(
      allCases.map((c: ICase) => new Date(c.date).getFullYear())
    );
    return Array.from(years).sort((a, b) => b - a);
  }, [allCases]);

  useEffect(() => {
    if (uniqueYears.length > 0 && !uniqueYears.includes(currentYear)) {
      setCurrentYear(uniqueYears[0]);
    }
  }, [uniqueYears, currentYear]);

  const { startDateForPies, endDateForPies, isAllTimePies } = useMemo(() => {
    let sDate: Date | null = null,
      eDate: Date | null = null;
    let allTime = false;
    if (viewMode === "all") {
      allTime = true;
    } else if (viewMode === "monthly") {
      sDate = new Date(currentYear, currentMonth - 1, 1, 0, 0, 0, 0);
      eDate = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);
    } else if (viewMode === "weekly") {
      ({ start: sDate, end: eDate } = getStartAndEndOfWeek(
        currentWeek,
        currentYear
      ));
    } else if (viewMode === "custom" && customStartDate && customEndDate) {
      sDate = new Date(customStartDate);
      sDate.setHours(0, 0, 0, 0);
      eDate = new Date(customEndDate);
      eDate.setHours(23, 59, 59, 999);
    } else {
      if (viewMode === "custom") {
        return {
          startDateForPies: null,
          endDateForPies: null,
          isAllTimePies: false,
        };
      }
      sDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      eDate = new Date(
        new Date().getFullYear(),
        new Date().getMonth() + 1,
        0,
        23,
        59,
        59,
        999
      );
    }
    return {
      startDateForPies: sDate,
      endDateForPies: eDate,
      isAllTimePies: allTime,
    };
  }, [
    viewMode,
    currentYear,
    currentMonth,
    currentWeek,
    customStartDate,
    customEndDate,
  ]);

  const filteredCasesForPieCharts = useMemo(() => {
    if (!allCases) return [];
    if (isAllTimePies) return allCases;
    if (!startDateForPies || !endDateForPies) return [];
    return allCases.filter((c: ICase) => {
      const caseDate = new Date(c.date);
      return caseDate >= startDateForPies && caseDate <= endDateForPies;
    });
  }, [allCases, startDateForPies, endDateForPies, isAllTimePies]);

  const barChartDisplayData = useMemo(() => {
    const problemColor = PRIORITY_COLORS.HIGH;
    const suggestionColor = "#22C55E";

    if (!allCases || allCases.length === 0) {
      return {
        data: [],
        dataKeyX: "periodLabel",
        title: "Няма данни",
        colorY1: problemColor,
        colorY2: suggestionColor,
      };
    }

    let chartTitle = "";
    let data: Array<{
      periodLabel: string;
      problems: number;
      suggestions: number;
    }> = [];

    if (viewMode === "all") {
      chartTitle = `Общо случаи по години`;
      const yearlyData: {
        [year: string]: { problems: number; suggestions: number };
      } = {};
      allCases.forEach((c: ICase) => {
        const year = new Date(c.date).getFullYear().toString();
        yearlyData[year] = yearlyData[year] || { problems: 0, suggestions: 0 };
        if (c.type.toUpperCase() === "PROBLEM") yearlyData[year].problems++;
        else if (c.type.toUpperCase() === "SUGGESTION")
          yearlyData[year].suggestions++;
      });
      data = Object.entries(yearlyData)
        .sort(([yearA], [yearB]) => parseInt(yearA) - parseInt(yearB))
        .map(([year, counts]) => ({
          periodLabel: year,
          problems: counts.problems,
          suggestions: counts.suggestions,
        }));
    } else if (viewMode === "monthly") {
      chartTitle = `Сравнение по месеци (${currentYear})`;
      const yearCases = allCases.filter(
        (c) => new Date(c.date).getFullYear() === currentYear
      );
      data = MONTH_NAMES.map((monthName, index) => {
        const monthCases = yearCases.filter(
          (c) => new Date(c.date).getMonth() === index
        );
        return {
          periodLabel: monthName, // MODIFIED: Use full month name
          problems: monthCases.filter((c) => c.type.toUpperCase() === "PROBLEM")
            .length,
          suggestions: monthCases.filter(
            (c) => c.type.toUpperCase() === "SUGGESTION"
          ).length,
        };
      });
    } else if (viewMode === "weekly") {
      chartTitle = `Сравнение по дни (Седмица ${currentWeek}, ${currentYear})`;
      const { start, end } = getStartAndEndOfWeek(currentWeek, currentYear);
      const weekCases = allCases.filter((c) => {
        const d = new Date(c.date);
        return d >= start && d <= end;
      });
      // DAY_NAMES is now the full day names array
      data = DAY_NAMES.map((dayName, index) => {
        const dayCases = weekCases.filter(
          (c) => (new Date(c.date).getUTCDay() + 6) % 7 === index
        );
        return {
          periodLabel: dayName, // Will use full day name
          problems: dayCases.filter((c) => c.type.toUpperCase() === "PROBLEM")
            .length,
          suggestions: dayCases.filter(
            (c) => c.type.toUpperCase() === "SUGGESTION"
          ).length,
        };
      });
    } else if (viewMode === "custom" && startDateForPies && endDateForPies) {
      const startD = startDateForPies;
      const endD = endDateForPies;

      chartTitle = `Общо случаи по ден от седмицата (${startD.toLocaleDateString(
        "bg-BG"
      )} - ${endD.toLocaleDateString("bg-BG")})`;

      const rangeCases = allCases.filter((c) => {
        const d = new Date(c.date);
        return d >= startD && d <= endD;
      });
      // DAY_NAMES is now the full day names array
      const weekdaySummary = DAY_NAMES.map((name) => ({
        periodLabel: name, // Will use full day name
        problems: 0,
        suggestions: 0,
      }));

      rangeCases.forEach((c) => {
        const caseDate = new Date(c.date);
        const dayIndex = (caseDate.getUTCDay() + 6) % 7;

        if (weekdaySummary[dayIndex]) {
          if (c.type.toUpperCase() === "PROBLEM") {
            weekdaySummary[dayIndex].problems++;
          } else if (c.type.toUpperCase() === "SUGGESTION") {
            weekdaySummary[dayIndex].suggestions++;
          }
        }
      });
      data = weekdaySummary;
    } else {
      chartTitle = "Моля изберете период";
      if (viewMode === "custom") {
        // DAY_NAMES is now the full day names array
        data = DAY_NAMES.map((name) => ({
          periodLabel: name, // Will use full day name
          problems: 0,
          suggestions: 0,
        }));
      }
    }
    return {
      data,
      dataKeyX: "periodLabel",
      title: chartTitle,
      colorY1: problemColor,
      colorY2: suggestionColor,
    };
  }, [
    allCases,
    viewMode,
    currentYear,
    currentMonth,
    currentWeek,
    startDateForPies,
    endDateForPies,
  ]);

  const categoryPieData: PieSegmentData[] = useMemo(() => {
    if (!filteredCasesForPieCharts || filteredCasesForPieCharts.length === 0)
      return [];
    const counts: { [key: string]: number } = {};
    filteredCasesForPieCharts.forEach((c: ICase) => {
      c.categories.forEach((cat: ICategory) => {
        counts[cat.name] = (counts[cat.name] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .sort(([, aValue], [, bValue]) => bValue - aValue)
      .map(([label, value], index) => ({
        label,
        value,
        color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
      }));
  }, [filteredCasesForPieCharts]);

  const priorityPieData: PieSegmentData[] = useMemo(() => {
    if (!filteredCasesForPieCharts || filteredCasesForPieCharts.length === 0)
      return [];
    const counts: { [key: string]: number } = { HIGH: 0, MEDIUM: 0, LOW: 0 };
    filteredCasesForPieCharts.forEach((c: ICase) => {
      const priorityKey = c.priority.toUpperCase();
      if (counts.hasOwnProperty(priorityKey)) {
        counts[priorityKey]++;
      }
    });
    return (Object.keys(counts) as Array<string>)
      .filter((pKey) => counts[pKey] > 0)
      .sort((aKey, bKey) => counts[bKey] - counts[aKey])
      .map((pKey) => ({
        label: priorityTranslations[pKey] || pKey,
        value: counts[pKey],
        color: PRIORITY_COLORS[pKey] || "#CCCCCC",
      }));
  }, [filteredCasesForPieCharts]);

  const handleDateInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "start" | "end"
  ) => {
    const dateValue = e.target.value ? new Date(e.target.value) : null;
    if (type === "start") {
      setCustomStartDate(dateValue);
      if (dateValue && customEndDate && dateValue > customEndDate) {
        setCustomEndDate(null);
      }
    } else {
      setCustomEndDate(dateValue);
    }
  };

  const renderDateControls = () => {
    let weekDateRangeStr = "";
    if (viewMode === "weekly" && currentWeek != null && currentYear != null) {
      try {
        const { start, end } = getStartAndEndOfWeek(currentWeek, currentYear);
        weekDateRangeStr = ` (${start.toLocaleDateString("bg-BG", {
          day: "2-digit",
          month: "2-digit",
        })} - ${end.toLocaleDateString("bg-BG", {
          day: "2-digit",
          month: "2-digit",
        })})`;
      } catch (error) {
        console.error("Error calculating week date range:", error);
        weekDateRangeStr = " (грешка в датите)";
      }
    }

    // This displayedPeriod in renderDateControls is for the top bar, not the chart itself.
    // The chart title and labels are handled by barChartDisplayData.
    let displayedPeriod = "Зареждане...";
    if (viewMode === "all") {
      displayedPeriod = "Всички данни";
    } else if (viewMode === "monthly" && startDateForPies) {
      displayedPeriod = `${
        MONTH_NAMES[startDateForPies.getMonth()]
      } ${startDateForPies.getFullYear()}`;
    } else if (viewMode === "weekly" && startDateForPies) {
      displayedPeriod = `Седмица ${currentWeek}, ${currentYear}${weekDateRangeStr}`;
    } else if (viewMode === "custom" && startDateForPies && endDateForPies) {
      displayedPeriod = `${startDateForPies.toLocaleDateString(
        "bg-BG"
      )} - ${endDateForPies.toLocaleDateString("bg-BG")}`;
    } else if (viewMode === "custom") {
      displayedPeriod = "Изберете период";
    }

    return (
      <div className="flex flex-wrap gap-x-3 gap-y-2 items-center p-3 bg-gray-50 border-b border-gray-200 h-16">
        {(viewMode === "monthly" || viewMode === "weekly") && (
          <select
            value={currentYear}
            onChange={(e) => setCurrentYear(parseInt(e.target.value))}
            className="p-2 border border-gray-300 rounded bg-white text-sm shadow-sm focus:ring-sky-500 focus:border-sky-500"
          >
            {uniqueYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        )}
        {viewMode === "monthly" && (
          <select
            value={currentMonth}
            onChange={(e) => setCurrentMonth(parseInt(e.target.value))}
            className="p-2 border border-gray-300 rounded bg-white text-sm shadow-sm focus:ring-sky-500 focus:border-sky-500"
          >
            {MONTH_NAMES.map((name, index) => (
              <option key={index + 1} value={index + 1}>
                {name}
              </option>
            ))}
          </select>
        )}
        {viewMode === "weekly" && (
          <div className="flex items-center gap-1">
            <span className="text-sm text-gray-600">Седмица:</span>
            <input
              type="number"
              value={currentWeek}
              onChange={(e) =>
                setCurrentWeek(
                  Math.max(1, Math.min(53, parseInt(e.target.value)))
                )
              }
              className="p-2 border border-gray-300 rounded bg-white text-sm w-16 shadow-sm focus:ring-sky-500 focus:border-sky-500"
              min="1"
              max="53"
            />
            <span className="text-xs text-gray-500 whitespace-nowrap">
              {(() => {
                if (
                  viewMode === "weekly" &&
                  currentWeek != null &&
                  currentYear != null
                ) {
                  try {
                    const { start, end } = getStartAndEndOfWeek(
                      currentWeek,
                      currentYear
                    );
                    return ` (${start.toLocaleDateString("bg-BG", {
                      day: "2-digit",
                      month: "2-digit",
                    })} - ${end.toLocaleDateString("bg-BG", {
                      day: "2-digit",
                      month: "2-digit",
                    })})`;
                  } catch {
                    return "";
                  }
                }
                return "";
              })()}
            </span>
          </div>
        )}
        {viewMode === "custom" && (
          <>
            <input
              type="date"
              value={
                customStartDate
                  ? customStartDate.toISOString().split("T")[0]
                  : ""
              }
              onChange={(e) => handleDateInputChange(e, "start")}
              className="p-2 border border-gray-300 rounded bg-white text-sm shadow-sm focus:ring-sky-500 focus:border-sky-500"
            />
            <span className="text-gray-500">-</span>
            <input
              type="date"
              value={
                customEndDate ? customEndDate.toISOString().split("T")[0] : ""
              }
              onChange={(e) => handleDateInputChange(e, "end")}
              className="p-2 border border-gray-300 rounded bg-white text-sm shadow-sm focus:ring-sky-500 focus:border-sky-500"
              min={
                customStartDate
                  ? customStartDate.toISOString().split("T")[0]
                  : undefined
              }
            />
          </>
        )}
        <div
          className="text-sm text-gray-700 ml-auto font-medium bg-sky-100 px-2 py-1 rounded whitespace-nowrap overflow-hidden text-ellipsis"
          style={{ maxWidth: "300px" }}
          title={displayedPeriod} // Use the calculated displayedPeriod for the title
        >
          {displayedPeriod}
        </div>
      </div>
    );
  };

  if (analyticsDataLoading)
    return (
      <div className="flex items-center justify-center h-full">
        <p>Зареждане на аналитични данни...</p>
      </div>
    );
  if (analyticsDataError)
    return (
      <div className="flex items-center justify-center h-full">
        <p>Грешка при зареждане на данни: {analyticsDataError.message}</p>
      </div>
    );
  if (!allCases)
    return (
      <div className="flex items-center justify-center h-full">
        <p>Няма налични данни за анализ.</p>
      </div>
    );

  return (
    <div className="p-2 md:p-5 bg-gray-100 min-h-full">
      <div className="mb-4 bg-white rounded-md shadow-md">
        <div className="flex space-x-0 border-b border-gray-200">
          {(["all", "weekly", "monthly", "custom"] as ViewMode[]).map(
            (mode) => (
              <button
                key={mode}
                className={`px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-medium focus:outline-none -mb-px border-b-2
                                  ${
                                    viewMode === mode
                                      ? "border-sky-500 text-sky-600"
                                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                  }`}
                onClick={() => setViewMode(mode)}
              >
                {mode === "all"
                  ? "Всички"
                  : mode === "weekly"
                  ? "Седмични"
                  : mode === "monthly"
                  ? "Месечни"
                  : "Период"}
              </button>
            )
          )}
        </div>
        {viewMode !== "all" && renderDateControls()}
        {viewMode === "all" && (
          <div className="flex flex-wrap gap-x-3 gap-y-2 items-center p-3 bg-gray-50 border-b border-gray-200 h-16">
            <span className="text-sm text-gray-700 font-medium">
              Показване на обобщени данни по години
            </span>
            <div className="text-sm text-gray-700 ml-auto font-medium bg-sky-100 px-2 py-1 rounded">
              Избрано: Всички данни
            </div>
          </div>
        )}
      </div>
      <div className="mb-5">
        <BarChart
          data={barChartDisplayData.data}
          dataKeyX={barChartDisplayData.dataKeyX}
          dataKeyY1="problems"
          dataKeyY2="suggestions"
          labelY1="Проблеми"
          labelY2="Предложения"
          title={barChartDisplayData.title} // This title is for the chart itself
          colorY1={barChartDisplayData.colorY1}
          colorY2={barChartDisplayData.colorY2}
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow-md">
          <h2 className="text-base sm:text-lg font-semibold text-center mb-3 text-gray-800">
            Разпределение на категории
          </h2>
          <div className="flex flex-col xl:flex-row items-center xl:items-start gap-3 sm:gap-4">
            <div className="flex-shrink-0 mx-auto">
              <PieChart
                data={categoryPieData.length > 0 ? categoryPieData : []}
                size={180}
              />
            </div>
            <PieLegend data={categoryPieData} />
          </div>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow-md">
          <h2 className="text-base sm:text-lg font-semibold text-center mb-3 text-gray-800">
            Разпределение на приоритети
          </h2>
          <div className="flex flex-col xl:flex-row items-center xl:items-start gap-3 sm:gap-4">
            <div className="flex-shrink-0 mx-auto">
              <PieChart
                data={priorityPieData.length > 0 ? priorityPieData : []}
                size={180}
              />
            </div>
            <PieLegend data={priorityPieData} />
          </div>
        </div>
      </div>
    </div>
  );
};
export default Analyses;
