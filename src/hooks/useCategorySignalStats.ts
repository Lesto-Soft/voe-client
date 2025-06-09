import { useMemo } from "react";
import { ICategory, ICase } from "../db/interfaces"; // Adjust path as needed
import {
  getStatusStyle,
  TYPE_COLORS,
  calculateResolutionStats,
  ResolutionCategoryKey,
  RESOLUTION_CATEGORY_CONFIG,
  translateStatus, // Import the translation function for status
  translateCaseType, // Import the translation function for case type
} from "../utils/categoryDisplayUtils"; // Adjust path as needed

export interface SignalStats {
  totalSignals: number;
  strictlyOpenSignals: number;
  inProgressSignals: number;
  awaitingFinanceSignals: number;
  closedSignals: number;
  statusPieChartData: Array<{ label: string; value: number; color: string }>;
  problemCasesCount: number;
  suggestionCasesCount: number;
  typePieChartData: Array<{ label: string; value: number; color: string }>;
  effectivelyResolvedCasesCount: number;
  unresolvedCasesCount: number;
  resolutionPieChartData: Array<{
    label: string;
    value: number;
    color: string;
  }>;
  averageResolutionTime: number;
  resolutionTimeCounts: Record<ResolutionCategoryKey, number>;
}

// Removed local labelTranslations object as we'll use functions from categoryDisplayUtils

const useCategorySignalStats = (
  category: ICategory | undefined | null
): SignalStats => {
  const signalStats = useMemo((): SignalStats => {
    if (!category || !category.cases) {
      return {
        totalSignals: 0,
        strictlyOpenSignals: 0,
        inProgressSignals: 0,
        awaitingFinanceSignals: 0,
        closedSignals: 0,
        statusPieChartData: [],
        problemCasesCount: 0,
        suggestionCasesCount: 0,
        typePieChartData: [],
        effectivelyResolvedCasesCount: 0,
        unresolvedCasesCount: 0,
        resolutionPieChartData: [],
        averageResolutionTime: 0,
        resolutionTimeCounts: {
          UNDER_1_DAY: 0,
          UNDER_5_DAYS: 0,
          UNDER_10_DAYS: 0,
          OVER_10_DAYS: 0,
        },
      };
    }

    const totalSignals = category.cases.length;

    // Status counts are based on English keys for logic
    const statusCounts = category.cases.reduce((acc, currCase) => {
      const statusKey = String(currCase.status).toUpperCase(); // Keep as English for keys
      acc[statusKey] = (acc[statusKey] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const strictlyOpenSignals = statusCounts["OPEN"] || 0;
    const inProgressSignals = statusCounts["IN_PROGRESS"] || 0;
    const awaitingFinanceSignalsCount = statusCounts["AWAITING_FINANCE"] || 0;
    const closedSignalsCount = statusCounts["CLOSED"] || 0;

    const statusPieChartData = Object.entries(statusCounts)
      .map(([statusKey, value]) => ({
        label: translateStatus(statusKey), // Use translateStatus for display label
        value,
        color: getStatusStyle(statusKey).hexColor, // getStatusStyle likely expects English key
      }))
      .filter((item) => item.value > 0);

    let problemCasesCount = 0;
    let suggestionCasesCount = 0;
    category.cases.forEach((c: ICase) => {
      const caseTypeKey = String(c.type).toUpperCase(); // Keep as English for keys
      if (caseTypeKey === "PROBLEM") problemCasesCount++;
      else if (caseTypeKey === "SUGGESTION") suggestionCasesCount++;
    });

    const typePieChartData = [];
    if (problemCasesCount > 0)
      typePieChartData.push({
        label: translateCaseType("PROBLEM"), // Use translateCaseType
        value: problemCasesCount,
        color: TYPE_COLORS.PROBLEM,
      });
    if (suggestionCasesCount > 0)
      typePieChartData.push({
        label: translateCaseType("SUGGESTION"), // Use translateCaseType
        value: suggestionCasesCount,
        color: TYPE_COLORS.SUGGESTION,
      });

    const resolutionData = calculateResolutionStats(category.cases);

    // resolutionPieChartData directly uses labels from RESOLUTION_CATEGORY_CONFIG,
    // which are already in Bulgarian as per your categoryDisplayUtils.ts
    const resolutionPieChartData = resolutionData.resolutionPieChartData.filter(
      (item) => item.value > 0
    );

    return {
      totalSignals,
      strictlyOpenSignals,
      inProgressSignals,
      awaitingFinanceSignals: awaitingFinanceSignalsCount,
      closedSignals: closedSignalsCount,
      statusPieChartData,
      problemCasesCount,
      suggestionCasesCount,
      typePieChartData,
      effectivelyResolvedCasesCount:
        resolutionData.effectivelyResolvedCasesCount,
      unresolvedCasesCount: resolutionData.unresolvedCasesCount,
      resolutionPieChartData,
      averageResolutionTime: resolutionData.averageResolutionTime,
      resolutionTimeCounts: resolutionData.resolutionTimeCounts, // Keys remain English
    };
  }, [category]);

  return signalStats;
};

export default useCategorySignalStats;
