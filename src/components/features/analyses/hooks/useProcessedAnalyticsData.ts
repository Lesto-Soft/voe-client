// components/features/analyses/hooks/useProcessedAnalyticsData.ts
import { useMemo } from "react";
import { ICase, ICategory } from "../../../../db/interfaces";
import {
  getDaysInMonth,
  getStartAndEndOfWeek,
} from "../../../../utils/dateUtils";
import { BarChartDisplayMode, ViewMode } from "../types"; // TopUserStat is no longer used
import { BarSeriesConfig } from "../../../charts/BarChart";
import {
  DAY_NAMES_FULL,
  MONTH_NAMES,
  PRIORITY_COLORS,
  PRIORITY_TRANSLATIONS,
  TYPE_COLORS,
  TypeColorKey,
  CATEGORY_COLORS,
} from "../constants";

// --- TYPE DEFINITIONS ---
interface AnalyticsFilters {
  viewMode: ViewMode;
  barChartMode: BarChartDisplayMode;
  currentYear: number;
  currentMonth: number;
  currentWeek: number;
  startDateForPies: Date | null;
  endDateForPies: Date | null;
  isAllTimePies: boolean;
}

// --- THE HOOK ---
export const useProcessedAnalyticsData = (
  allCases: ICase[] | undefined,
  filters: AnalyticsFilters
) => {
  const {
    viewMode,
    barChartMode,
    currentYear,
    currentMonth,
    currentWeek,
    startDateForPies,
    endDateForPies,
    isAllTimePies,
  } = filters;

  const filteredCasesForPieCharts = useMemo(() => {
    if (!allCases) return [];
    if (isAllTimePies) return allCases;
    if (!startDateForPies || !endDateForPies) return [];
    return allCases.filter((c: ICase) => {
      const caseDate = new Date(c.date);
      return caseDate >= startDateForPies && caseDate <= endDateForPies;
    });
  }, [allCases, startDateForPies, endDateForPies, isAllTimePies]);

  // --- The rest of the data processing remains unchanged ---
  const barChartDisplayData = useMemo(() => {
    // ... no changes here
    if (!allCases || allCases.length === 0) {
      return {
        data: [],
        dataKeyX: "periodLabel",
        title: "Няма данни",
        seriesConfig: [],
      };
    }

    let chartTitle = "";
    let dataForChart: Array<any> = [];
    let seriesConfig: BarSeriesConfig[] = [];

    const typeSeries: BarSeriesConfig[] = [
      { dataKey: "problems", label: "Проблеми", color: TYPE_COLORS.PROBLEM },
      {
        dataKey: "suggestions",
        label: "Предложения",
        color: TYPE_COLORS.SUGGESTION,
      },
    ];
    const prioritySeries: BarSeriesConfig[] = [
      {
        dataKey: "highPriority",
        label: PRIORITY_TRANSLATIONS.HIGH,
        color: PRIORITY_COLORS.HIGH,
      },
      {
        dataKey: "mediumPriority",
        label: PRIORITY_TRANSLATIONS.MEDIUM,
        color: PRIORITY_COLORS.MEDIUM,
      },
      {
        dataKey: "lowPriority",
        label: PRIORITY_TRANSLATIONS.LOW,
        color: PRIORITY_COLORS.LOW,
      },
    ];

    seriesConfig = barChartMode === "type" ? typeSeries : prioritySeries;

    const aggregateCases = (casesToAggregate: ICase[]) => {
      if (barChartMode === "type") {
        return {
          problems: casesToAggregate.filter(
            (c) => c.type.toUpperCase() === "PROBLEM"
          ).length,
          suggestions: casesToAggregate.filter(
            (c) => c.type.toUpperCase() === "SUGGESTION"
          ).length,
        };
      } else {
        // 'priority'
        return {
          highPriority: casesToAggregate.filter(
            (c) => c.priority.toUpperCase() === "HIGH"
          ).length,
          mediumPriority: casesToAggregate.filter(
            (c) => c.priority.toUpperCase() === "MEDIUM"
          ).length,
          lowPriority: casesToAggregate.filter(
            (c) => c.priority.toUpperCase() === "LOW"
          ).length,
        };
      }
    };

    if (viewMode === "all") {
      chartTitle = `Общо случаи по години (${
        barChartMode === "type" ? "по тип" : "по приоритет"
      })`;
      const yearlyDataAggregated: { [year: string]: any } = {};
      allCases.forEach((c: ICase) => {
        const year = new Date(c.date).getFullYear().toString();
        if (!yearlyDataAggregated[year]) {
          yearlyDataAggregated[year] = aggregateCases(
            allCases.filter(
              (cs: ICase) => new Date(cs.date).getFullYear().toString() === year
            )
          );
        }
      });
      dataForChart = Object.keys(yearlyDataAggregated)
        .map((year) => ({ periodLabel: year, ...yearlyDataAggregated[year] }))
        .sort((a, b) => parseInt(a.periodLabel) - parseInt(b.periodLabel));
    } else if (viewMode === "yearly") {
      chartTitle = `Сравнение по месеци (${currentYear}) (${
        barChartMode === "type" ? "по тип" : "по приоритет"
      })`;
      const yearCases = allCases.filter(
        (c: ICase) => new Date(c.date).getFullYear() === currentYear
      );
      dataForChart = MONTH_NAMES.map((monthName, index) => {
        const monthCases = yearCases.filter(
          (c: ICase) => new Date(c.date).getMonth() === index
        );
        return { periodLabel: monthName, ...aggregateCases(monthCases) };
      });
    } else if (viewMode === "monthly") {
      chartTitle = `Сравнение по дни (${
        MONTH_NAMES[currentMonth - 1]
      } ${currentYear}) (${
        barChartMode === "type" ? "по тип" : "по приоритет"
      })`;
      const monthCasesFiltered = allCases.filter((c: ICase) => {
        const caseDate = new Date(c.date);
        return (
          caseDate.getFullYear() === currentYear &&
          caseDate.getMonth() === currentMonth - 1
        );
      });
      const daysInSelectedMonth = getDaysInMonth(currentYear, currentMonth);
      dataForChart = Array.from({ length: daysInSelectedMonth }, (_, i) => {
        const dayNumber = i + 1;
        const dayCases = monthCasesFiltered.filter(
          (c: ICase) => new Date(c.date).getDate() === dayNumber
        );
        return {
          periodLabel: dayNumber.toString(),
          ...aggregateCases(dayCases),
        };
      });
    } else if (viewMode === "weekly") {
      chartTitle = `Сравнение по дни (Седмица ${currentWeek}, ${currentYear}) (${
        barChartMode === "type" ? "по тип" : "по приоритет"
      })`;
      const { start, end } = getStartAndEndOfWeek(currentWeek, currentYear);
      const weekCasesFiltered = allCases.filter((c: ICase) => {
        const d = new Date(c.date);
        return d >= start && d <= end;
      });
      dataForChart = DAY_NAMES_FULL.map((dayName, index) => {
        const dayCases = weekCasesFiltered.filter(
          (c: ICase) => (new Date(c.date).getUTCDay() + 6) % 7 === index
        );
        return { periodLabel: dayName, ...aggregateCases(dayCases) };
      });
    } else if (viewMode === "custom" && startDateForPies && endDateForPies) {
      chartTitle = `Общо по ден от седмицата (${startDateForPies.toLocaleDateString(
        "bg-BG"
      )} - ${endDateForPies.toLocaleDateString("bg-BG")}) (${
        barChartMode === "type" ? "по тип" : "по приоритет"
      })`;
      const rangeCasesFiltered = allCases.filter((c: ICase) => {
        const d = new Date(c.date);
        return d >= startDateForPies && d <= endDateForPies;
      });
      dataForChart = DAY_NAMES_FULL.map((name) => {
        const dayCases = rangeCasesFiltered.filter(
          (c: ICase) =>
            DAY_NAMES_FULL[(new Date(c.date).getUTCDay() + 6) % 7] === name
        );
        return { periodLabel: name, ...aggregateCases(dayCases) };
      });
    }

    return {
      data: dataForChart,
      dataKeyX: "periodLabel",
      title: chartTitle,
      seriesConfig,
    };
  }, [
    allCases,
    viewMode,
    barChartMode,
    currentYear,
    currentMonth,
    currentWeek,
    startDateForPies,
    endDateForPies,
  ]);

  const categoryPieData = useMemo(() => {
    // ... no changes here
    if (!filteredCasesForPieCharts || filteredCasesForPieCharts.length === 0)
      return [];
    const counts: { [key: string]: number } = {};
    filteredCasesForPieCharts.forEach((c: ICase) => {
      (c.categories || []).forEach((cat: ICategory) => {
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

  const priorityPieData = useMemo(() => {
    // ... no changes here
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
      .map((pKey) => ({
        label: PRIORITY_TRANSLATIONS[pKey] || pKey,
        value: counts[pKey],
        color: PRIORITY_COLORS[pKey] || "#CCCCCC",
      }));
  }, [filteredCasesForPieCharts]);

  const typePieData = useMemo(() => {
    // ... no changes here
    if (!filteredCasesForPieCharts || filteredCasesForPieCharts.length === 0)
      return [];
    const counts: Record<TypeColorKey, number> = { PROBLEM: 0, SUGGESTION: 0 };
    filteredCasesForPieCharts.forEach((c: ICase) => {
      const caseTypeUpper = c.type.toUpperCase();
      if (caseTypeUpper === "PROBLEM" || caseTypeUpper === "SUGGESTION") {
        counts[caseTypeUpper]++;
      }
    });
    return (Object.keys(counts) as TypeColorKey[])
      .filter((tKey) => counts[tKey] > 0)
      .map((tKey: TypeColorKey) => ({
        label: tKey === "PROBLEM" ? "Проблеми" : "Предложения",
        value: counts[tKey],
        color: TYPE_COLORS[tKey] || "#CCCCCC",
      }));
  }, [filteredCasesForPieCharts]);

  const averageRatingData = useMemo(() => {
    // ... no changes here
    if (!filteredCasesForPieCharts || filteredCasesForPieCharts.length === 0) {
      return { average: null, count: 0 };
    }
    let totalSumOfAverageRatings = 0;
    let countOfCasesWithRatings = 0;
    filteredCasesForPieCharts.forEach((caseItem: ICase) => {
      if (
        caseItem.calculatedRating !== null &&
        caseItem.calculatedRating !== undefined
      ) {
        totalSumOfAverageRatings += caseItem.calculatedRating;
        countOfCasesWithRatings++;
      }
    });
    if (countOfCasesWithRatings === 0) return { average: null, count: 0 };
    return {
      average: totalSumOfAverageRatings / countOfCasesWithRatings,
      count: countOfCasesWithRatings,
    };
  }, [filteredCasesForPieCharts]);

  const periodCaseSummary = useMemo(() => {
    // ... no changes here
    const totalCases = filteredCasesForPieCharts.length;
    if (barChartMode === "type") {
      const problemCount = filteredCasesForPieCharts.filter(
        (c) => c.type.toUpperCase() === "PROBLEM"
      ).length;
      return {
        totalCases,
        problems: problemCount,
        suggestions: totalCases - problemCount,
      };
    } else {
      const highCount = filteredCasesForPieCharts.filter(
        (c) => c.priority.toUpperCase() === "HIGH"
      ).length;
      const mediumCount = filteredCasesForPieCharts.filter(
        (c) => c.priority.toUpperCase() === "MEDIUM"
      ).length;
      const lowCount = filteredCasesForPieCharts.filter(
        (c) => c.priority.toUpperCase() === "LOW"
      ).length;
      return {
        totalCases,
        high: highCount,
        medium: mediumCount,
        low: lowCount,
      };
    }
  }, [filteredCasesForPieCharts, barChartMode]);

  return {
    barChartDisplayData,
    categoryPieData,
    priorityPieData,
    typePieData,
    averageRatingData,
    periodCaseSummary,
  };
};
