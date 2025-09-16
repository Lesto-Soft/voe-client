import { useMemo } from "react";
import { ICase, CasePriority } from "../db/interfaces"; // Adjust path as needed
import {
  getStatusStyle,
  TYPE_COLORS,
  calculateResolutionStats,
  ResolutionCategoryKey,
  translateStatus, // Import the translation function for status
  translateCaseType, // Import the translation function for case type
  translatePriority,
} from "../utils/categoryDisplayUtils"; // Adjust path as needed
import { PieSegmentData } from "../components/charts/PieChart";

// --- ADD THIS HELPER FUNCTION (copied from useRatingMetricStats) ---
const getColorForChart = (index: number): string => {
  const colors = [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#6366F1",
    "#EC4899",
    "#6B7280",
  ];
  return colors[index % colors.length];
};

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
  // --- ADD THESE TWO NEW PROPERTIES ---
  priorityPieChartData: PieSegmentData[];
  creatorPieChartData: PieSegmentData[];
}

const useCategorySignalStats = (
  cases: ICase[] | undefined
): SignalStats | null => {
  const signalStats = useMemo((): SignalStats | null => {
    if (!cases) {
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
          NOT_RESOLVED: 0, // Ensure this is here from Task 1
        },
        // --- ADD DEFAULTS ---
        priorityPieChartData: [],
        creatorPieChartData: [],
      };
    }

    const totalSignals = cases.length;

    const statusCounts = cases.reduce((acc, currCase) => {
      const statusKey = String(currCase.status).toUpperCase();
      acc[statusKey] = (acc[statusKey] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const strictlyOpenSignals = statusCounts["OPEN"] || 0;
    const inProgressSignals = statusCounts["IN_PROGRESS"] || 0;
    const awaitingFinanceSignalsCount = statusCounts["AWAITING_FINANCE"] || 0;
    const closedSignalsCount = statusCounts["CLOSED"] || 0;

    const statusPieChartData = Object.entries(statusCounts)
      .map(([statusKey, value]) => ({
        id: statusKey,
        label: translateStatus(statusKey),
        value,
        color: getStatusStyle(statusKey).hexColor,
      }))
      .filter((item) => item.value > 0);

    let problemCasesCount = 0;
    let suggestionCasesCount = 0;

    // --- ADD NEW COUNT OBJECTS ---
    const priorityCounts: Record<string, number> = {};
    const creatorCounts: Record<
      string,
      { id: string; count: number; name: string }
    > = {};

    cases.forEach((c: ICase) => {
      const caseTypeKey = String(c.type).toUpperCase();
      if (caseTypeKey === "PROBLEM") problemCasesCount++;
      else if (caseTypeKey === "SUGGESTION") suggestionCasesCount++;

      // --- ADD COUNTING LOGIC ---
      const priorityKey = c.priority || "NONE";
      priorityCounts[priorityKey] = (priorityCounts[priorityKey] || 0) + 1;

      if (c.creator && c.creator._id) {
        const creatorId = c.creator._id;
        if (!creatorCounts[creatorId]) {
          creatorCounts[creatorId] = {
            id: creatorId,
            count: 0,
            name: c.creator.name || "Unknown",
          };
        }
        creatorCounts[creatorId].count++;
      }
      // --- END ADD COUNTING LOGIC ---
    });

    const typePieChartData: PieSegmentData[] = [];
    if (problemCasesCount > 0)
      typePieChartData.push({
        id: "PROBLEM",
        label: translateCaseType("PROBLEM"),
        value: problemCasesCount,
        color: TYPE_COLORS.PROBLEM,
      });
    if (suggestionCasesCount > 0)
      typePieChartData.push({
        id: "SUGGESTION",
        label: translateCaseType("SUGGESTION"),
        value: suggestionCasesCount,
        color: TYPE_COLORS.SUGGESTION,
      });

    // --- ADD PIE DATA BUILDERS ---
    const priorityPieChartData: PieSegmentData[] = [
      {
        id: CasePriority.High,
        label: translatePriority(CasePriority.High),
        value: priorityCounts.HIGH || 0,
        color: "#EF4444",
      },
      {
        id: CasePriority.Medium,
        label: translatePriority(CasePriority.Medium),
        value: priorityCounts.MEDIUM || 0,
        color: "#EAB308",
      },
      {
        id: CasePriority.Low,
        label: translatePriority(CasePriority.Low),
        value: priorityCounts.LOW || 0,
        color: "#22C55E",
      },
    ].filter((p) => p.value > 0);

    const creatorPieChartData: PieSegmentData[] = Object.values(creatorCounts)
      .map((data, index) => ({
        id: data.id,
        label: data.name,
        value: data.count,
        color: getColorForChart(index),
      }))
      .sort((a, b) => b.value - a.value);
    // --- END PIE DATA BUILDERS ---

    const resolutionData = calculateResolutionStats(cases);

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
      resolutionTimeCounts: resolutionData.resolutionTimeCounts,
      // --- ADD TO RETURN ---
      priorityPieChartData,
      creatorPieChartData,
    };
  }, [cases]);

  return signalStats;
};

export default useCategorySignalStats;
