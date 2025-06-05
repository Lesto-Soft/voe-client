import React, { useState, useEffect, useMemo } from "react";
import { useGetAnalyticsDataCases } from "../graphql/hooks/case"; // Adjust path as needed
import PieChart, { PieSegmentData } from "../components/charts/PieChart"; // Adjust path as needed
import BarChart from "../components/charts/BarChart"; // Corrected import for default export

// --- Interfaces ---
import { ICase, ICategory } from "../db/interfaces"; // Assuming ICase includes calculatedRating?: number | null;

// --- Component Type Definitions ---
type ViewMode = "all" | "yearly" | "monthly" | "weekly" | "custom"; // Added "yearly"

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
  HIGH: "#F87171",
  MEDIUM: "#FCD34D",
  LOW: "#60A5FA",
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
const DAY_NAMES_FULL = [
  // Used for weekly and custom (weekday summary) bar charts
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
  target.setDate(target.getDate() + 3 - ((target.getDay() + 6) % 7));
  const firstThursday = new Date(target.getFullYear(), 0, 4);
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
  const dayOfWeek = simple.getUTCDay();
  const isoDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek;

  const start = new Date(simple);
  start.setUTCDate(simple.getUTCDate() - isoDayOfWeek + 1);
  start.setUTCHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 6);
  end.setUTCHours(23, 59, 59, 999);

  return { start, end };
};

const getDaysInMonth = (year: number, month: number): number => {
  // month is 1-indexed
  return new Date(year, month, 0).getDate();
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
    if (!allCases || allCases.length === 0) return [new Date().getFullYear()];
    const yearsSet = new Set(
      allCases.map((c: ICase) => new Date(c.date).getFullYear())
    );
    const yearsArray = Array.from<number>(yearsSet);
    return yearsArray.sort((a, b) => b - a);
  }, [allCases]);

  useEffect(() => {
    if (uniqueYears.length > 0 && !uniqueYears.includes(currentYear)) {
      setCurrentYear(uniqueYears[0]);
    }
    // Reset month/week if year changes and the current month/week might be invalid for new year (e.g. Feb 29)
    // For simplicity, just ensuring currentMonth is valid. More complex logic could reset week.
    if (viewMode === "monthly" || viewMode === "weekly") {
      // No specific reset needed for month here unless Feb 29th-like issues are critical for week display
    }
  }, [uniqueYears, currentYear, viewMode]);

  const { startDateForPies, endDateForPies, isAllTimePies } = useMemo(() => {
    let sDate: Date | null = null,
      eDate: Date | null = null;
    let allTime = false;

    switch (viewMode) {
      case "all":
        allTime = true;
        break;
      case "yearly":
        sDate = new Date(currentYear, 0, 1, 0, 0, 0, 0); // Jan 1st
        eDate = new Date(currentYear, 11, 31, 23, 59, 59, 999); // Dec 31st
        break;
      case "monthly":
        sDate = new Date(currentYear, currentMonth - 1, 1, 0, 0, 0, 0);
        eDate = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999); // Last day of month
        break;
      case "weekly":
        ({ start: sDate, end: eDate } = getStartAndEndOfWeek(
          currentWeek,
          currentYear
        ));
        break;
      case "custom":
        if (customStartDate && customEndDate) {
          sDate = new Date(customStartDate);
          sDate.setHours(0, 0, 0, 0);
          eDate = new Date(customEndDate);
          eDate.setHours(23, 59, 59, 999);
        } else {
          return {
            startDateForPies: null,
            endDateForPies: null,
            isAllTimePies: false,
          };
        }
        break;
      default: // Should not happen
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
    } else if (viewMode === "yearly") {
      // NEW "Yearly" Tab Logic for Bar Chart
      chartTitle = `Сравнение по месеци (${currentYear})`;
      const yearCases = allCases.filter(
        (c) => new Date(c.date).getFullYear() === currentYear
      );
      data = MONTH_NAMES.map((monthName, index) => {
        const monthCases = yearCases.filter(
          (c) => new Date(c.date).getMonth() === index
        );
        return {
          periodLabel: monthName, // Full month name
          problems: monthCases.filter((c) => c.type.toUpperCase() === "PROBLEM")
            .length,
          suggestions: monthCases.filter(
            (c) => c.type.toUpperCase() === "SUGGESTION"
          ).length,
        };
      });
    } else if (viewMode === "monthly") {
      // MODIFIED "Monthly" Tab Logic for Bar Chart
      chartTitle = `Сравнение по дни (${
        MONTH_NAMES[currentMonth - 1]
      } ${currentYear})`;
      const monthCases = allCases.filter((c) => {
        const caseDate = new Date(c.date);
        return (
          caseDate.getFullYear() === currentYear &&
          caseDate.getMonth() === currentMonth - 1
        );
      });
      const daysInSelectedMonth = getDaysInMonth(currentYear, currentMonth);
      const dailyData = Array.from({ length: daysInSelectedMonth }, (_, i) => ({
        periodLabel: (i + 1).toString(), // Day number as label
        problems: 0,
        suggestions: 0,
      }));
      monthCases.forEach((c) => {
        const dayOfMonth = new Date(c.date).getDate(); // 1-31
        if (dailyData[dayOfMonth - 1]) {
          // dayOfMonth is 1-indexed, array is 0-indexed
          if (c.type.toUpperCase() === "PROBLEM")
            dailyData[dayOfMonth - 1].problems++;
          else if (c.type.toUpperCase() === "SUGGESTION")
            dailyData[dayOfMonth - 1].suggestions++;
        }
      });
      data = dailyData;
    } else if (viewMode === "weekly") {
      chartTitle = `Сравнение по дни (Седмица ${currentWeek}, ${currentYear})`;
      const { start, end } = getStartAndEndOfWeek(currentWeek, currentYear);
      const weekCases = allCases.filter((c) => {
        const d = new Date(c.date);
        return d >= start && d <= end;
      });
      data = DAY_NAMES_FULL.map((dayName, index) => {
        const dayCases = weekCases.filter(
          (c) => (new Date(c.date).getUTCDay() + 6) % 7 === index
        );
        return {
          periodLabel: dayName,
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
      const weekdaySummary = DAY_NAMES_FULL.map((name) => ({
        periodLabel: name,
        problems: 0,
        suggestions: 0,
      }));
      rangeCases.forEach((c) => {
        const caseDate = new Date(c.date);
        const dayIndex = (caseDate.getUTCDay() + 6) % 7;
        if (weekdaySummary[dayIndex]) {
          if (c.type.toUpperCase() === "PROBLEM")
            weekdaySummary[dayIndex].problems++;
          else if (c.type.toUpperCase() === "SUGGESTION")
            weekdaySummary[dayIndex].suggestions++;
        }
      });
      data = weekdaySummary;
    } else {
      chartTitle = "Моля изберете период";
      if (
        viewMode === "custom" ||
        viewMode === "monthly" ||
        viewMode === "weekly" ||
        viewMode === "yearly"
      ) {
        // Provide empty structure for these views if dates/selections are incomplete
        data = []; // Or some default empty structure like DAY_NAMES_FULL.map(...) for consistency
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
    /* ... (remains the same) ... */
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
    /* ... (remains the same) ... */
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

  const averageRatingData = useMemo(() => {
    /* ... (remains the same) ... */
    if (!filteredCasesForPieCharts || filteredCasesForPieCharts.length === 0) {
      return { average: null, count: 0 };
    }
    let totalSumOfAverageRatings = 0;
    let countOfCasesWithRatings = 0;
    filteredCasesForPieCharts.forEach((caseItem: ICase) => {
      if (
        caseItem.calculatedRating !== null &&
        caseItem.calculatedRating !== undefined &&
        typeof caseItem.calculatedRating === "number" &&
        !isNaN(caseItem.calculatedRating)
      ) {
        totalSumOfAverageRatings += caseItem.calculatedRating;
        countOfCasesWithRatings++;
      }
    });
    if (countOfCasesWithRatings === 0) {
      return { average: null, count: 0 };
    }
    return {
      average: totalSumOfAverageRatings / countOfCasesWithRatings,
      count: countOfCasesWithRatings,
    };
  }, [filteredCasesForPieCharts]);

  const periodCaseSummary = useMemo(() => {
    /* ... (remains the same) ... */
    if (!filteredCasesForPieCharts) {
      return { totalCases: 0, problems: 0, suggestions: 0 };
    }
    const totalCases = filteredCasesForPieCharts.length;
    let problemCount = 0;
    let suggestionCount = 0;
    filteredCasesForPieCharts.forEach((caseItem: ICase) => {
      if (caseItem.type.toUpperCase() === "PROBLEM") {
        problemCount++;
      } else if (caseItem.type.toUpperCase() === "SUGGESTION") {
        suggestionCount++;
      }
    });
    return { totalCases, problems: problemCount, suggestions: suggestionCount };
  }, [filteredCasesForPieCharts]);

  const handleDateInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "start" | "end"
  ) => {
    /* ... (remains the same) ... */
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

    let displayedPeriod = "Зареждане...";
    if (viewMode === "all") {
      displayedPeriod = "Всички данни";
    } else if (viewMode === "yearly" && currentYear) {
      displayedPeriod = `Година ${currentYear}`;
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
        {/* Year selector: Shown for 'yearly', 'monthly', and 'weekly' */}
        {(viewMode === "yearly" ||
          viewMode === "monthly" ||
          viewMode === "weekly") && (
          <select
            value={currentYear}
            onChange={(e) => setCurrentYear(parseInt(e.target.value))}
            className="p-2 border border-gray-300 rounded bg-white text-sm shadow-sm focus:ring-sky-500 focus:border-sky-500"
          >
            {uniqueYears.map((year) => (
              <option key={year} value={year}>
                {" "}
                {year}{" "}
              </option>
            ))}
          </select>
        )}
        {/* Month selector: Shown only for 'monthly' */}
        {viewMode === "monthly" && (
          <select
            value={currentMonth}
            onChange={(e) => setCurrentMonth(parseInt(e.target.value))}
            className="p-2 border border-gray-300 rounded bg-white text-sm shadow-sm focus:ring-sky-500 focus:border-sky-500"
          >
            {MONTH_NAMES.map((name, index) => (
              <option key={index + 1} value={index + 1}>
                {" "}
                {name}{" "}
              </option>
            ))}
          </select>
        )}
        {viewMode === "weekly" /* ... (remains the same) ... */ && (
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
                    return " (грешка)";
                  }
                }
                return "";
              })()}
            </span>
          </div>
        )}
        {viewMode === "custom" /* ... (remains the same) ... */ && (
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
          title={displayedPeriod}
        >
          {displayedPeriod}
        </div>
      </div>
    );
  };

  if (analyticsDataLoading)
    return (
      <div className="flex items-center justify-center h-full min-h-[calc(100vh-200px)]">
        {" "}
        <p>Зареждане на аналитични данни...</p>{" "}
      </div>
    );
  if (analyticsDataError)
    return (
      <div className="flex items-center justify-center h-full min-h-[calc(100vh-200px)]">
        {" "}
        <p>Грешка при зареждане на данни: {analyticsDataError.message}</p>{" "}
      </div>
    );
  if (!allCases || allCases.length === 0)
    return (
      <div className="flex items-center justify-center h-full min-h-[calc(100vh-200px)]">
        {" "}
        <p>Няма налични данни за анализ.</p>{" "}
      </div>
    );

  return (
    <div className="p-2 md:p-5 bg-gray-100 min-h-full">
      <div className="mb-4 bg-white rounded-md shadow-md">
        <div className="flex space-x-0 border-b border-gray-200">
          {(["all", "yearly", "monthly", "weekly", "custom"] as ViewMode[]).map(
            (mode) => (
              <button
                key={mode}
                className={`px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-medium focus:outline-none -mb-px border-b-2 ${
                  viewMode === mode
                    ? "border-sky-500 text-sky-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
                onClick={() => setViewMode(mode)}
              >
                {mode === "all"
                  ? "Всички"
                  : mode === "yearly"
                  ? "Годишни"
                  : mode === "monthly"
                  ? "Месечни"
                  : mode === "weekly"
                  ? "Седмични"
                  : "Период"}
              </button>
            )
          )}
        </div>
        {viewMode !== "all" && renderDateControls()}
        {viewMode === "all" && (
          <div className="flex flex-wrap gap-x-3 gap-y-2 items-center p-3 bg-gray-50 border-b border-gray-200 h-16">
            <span className="text-sm text-gray-700 font-medium">
              {" "}
              Показване на обобщени данни по години{" "}
            </span>
            <div className="text-sm text-gray-700 ml-auto font-medium bg-sky-100 px-2 py-1 rounded">
              {" "}
              Избрано: Всички данни{" "}
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
          title={barChartDisplayData.title}
          colorY1={barChartDisplayData.colorY1}
          colorY2={barChartDisplayData.colorY2}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow-md flex flex-col justify-center items-center min-h-[150px]">
          <h2 className="text-base sm:text-lg font-semibold text-center mb-2 text-gray-800">
            {" "}
            Общо сигнали{" "}
          </h2>
          <p className="text-4xl font-bold text-gray-700">
            {" "}
            {periodCaseSummary.totalCases}{" "}
          </p>
          <div className="flex space-x-3 mt-2 text-center">
            <p className="text-xs sm:text-sm">
              {" "}
              <span
                style={{ color: PRIORITY_COLORS.HIGH }}
                className="font-semibold block"
              >
                Проблеми
              </span>{" "}
              <span
                style={{ color: PRIORITY_COLORS.HIGH }}
                className="font-bold text-lg"
              >
                {periodCaseSummary.problems}
              </span>{" "}
            </p>
            <p className="text-xs sm:text-sm">
              {" "}
              <span
                style={{ color: "#22C55E" }}
                className="font-semibold block"
              >
                Предложения
              </span>{" "}
              <span style={{ color: "#22C55E" }} className="font-bold text-lg">
                {periodCaseSummary.suggestions}
              </span>{" "}
            </p>
          </div>
          <p className="text-xs text-gray-400 mt-1.5">за избрания период</p>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-lg shadow-md">
          <h2 className="text-base sm:text-lg font-semibold text-center mb-3 text-gray-800">
            {" "}
            Разпределение на категории{" "}
          </h2>
          <div className="flex flex-col xl:flex-row items-center xl:items-start gap-3 sm:gap-4">
            <div className="flex-shrink-0 mx-auto">
              {" "}
              <PieChart
                data={categoryPieData.length > 0 ? categoryPieData : []}
                size={180}
              />{" "}
            </div>
            <PieLegend data={categoryPieData} />
          </div>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow-md">
          <h2 className="text-base sm:text-lg font-semibold text-center mb-3 text-gray-800">
            {" "}
            Разпределение на приоритети{" "}
          </h2>
          <div className="flex flex-col xl:flex-row items-center xl:items-start gap-3 sm:gap-4">
            <div className="flex-shrink-0 mx-auto">
              {" "}
              <PieChart
                data={priorityPieData.length > 0 ? priorityPieData : []}
                size={180}
              />{" "}
            </div>
            <PieLegend data={priorityPieData} />
          </div>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow-md flex flex-col justify-center items-center min-h-[150px]">
          <h2 className="text-base sm:text-lg font-semibold text-center mb-2 text-gray-800">
            {" "}
            Среден рейтинг{" "}
          </h2>
          {averageRatingData.average !== null ? (
            <>
              {" "}
              <p className="text-4xl font-bold text-sky-600">
                {" "}
                {averageRatingData.average.toFixed(2)}{" "}
                <span className="text-lg font-normal text-gray-500 ml-1">
                  / 5
                </span>{" "}
              </p>{" "}
              <p className="text-sm text-gray-600 mt-1">
                {" "}
                (от {averageRatingData.count}{" "}
                {averageRatingData.count === 1 ? "оценка" : "оценки"}){" "}
              </p>{" "}
            </>
          ) : (
            <p className="text-xl text-gray-500">Няма оценки</p>
          )}
          <p className="text-xs text-gray-400 mt-1">за избрания период</p>
        </div>
      </div>
    </div>
  );
};
export default Analyses;
