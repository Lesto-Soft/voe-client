// src/hooks/useUserActivityStats.ts
import { useMemo } from "react";
import {
  IUser,
  ICase,
  ICategory,
  CasePriority,
  CaseType,
} from "../db/interfaces";
import { PieSegmentData } from "../components/charts/PieChart";
import { TIERS } from "../utils/GLOBAL_PARAMETERS";
import { parseActivityDate } from "../utils/dateUtils";
import { StatsActivityType } from "../components/features/userAnalytics/UserStatisticsPanel";
import {
  calculateResolutionStats,
  translateCaseType,
  translatePriority,
} from "../utils/categoryDisplayUtils";

export interface UserActivityStats {
  totalSignals: number;
  totalAnswers: number;
  totalComments: number;
  ratedCasesCount: number;
  averageCaseRating: number | null;
  signalsByCategoryChartData: PieSegmentData[];
  ratingTierDistributionData: PieSegmentData[];
  priorityDistributionData: PieSegmentData[];
  typeDistributionData: PieSegmentData[];
  resolutionTimeDistributionData: PieSegmentData[];
}

const useUserActivityStats = (
  user: IUser | undefined | null,
  startDate: Date | null,
  endDate: Date | null,
  activityType: StatsActivityType
): UserActivityStats | null => {
  const stats = useMemo((): UserActivityStats => {
    const defaultStats: UserActivityStats = {
      totalSignals: 0,
      totalAnswers: 0,
      totalComments: 0,
      ratedCasesCount: 0,
      averageCaseRating: null,
      signalsByCategoryChartData: [],
      ratingTierDistributionData: [],
      priorityDistributionData: [],
      typeDistributionData: [],
      resolutionTimeDistributionData: [],
    };

    if (!user) {
      return defaultStats;
    }

    const isInDateRange = (itemDateStr: string | number) => {
      if (!startDate && !endDate) return true;
      const itemDate = parseActivityDate(itemDateStr);
      if (startDate && itemDate < startDate) return false;
      if (endDate && itemDate > endDate) return false;
      return true;
    };

    const totalSignals =
      user.cases?.filter((c) => isInDateRange(c.date)).length || 0;
    const totalAnswers =
      user.answers?.filter((a) => isInDateRange(a.date)).length || 0;
    const totalComments =
      user.comments?.filter((c) => isInDateRange(c.date)).length || 0;

    const casesToAnalyze = ((): ICase[] => {
      const relevantCasesForStats = new Map<string, ICase>();
      const addCaseToMap = (caseItem: ICase | undefined | null) => {
        if (caseItem && caseItem._id) {
          relevantCasesForStats.set(caseItem._id, caseItem);
        }
      };

      if (activityType === "all" || activityType === "cases") {
        user.cases?.filter((c) => isInDateRange(c.date)).forEach(addCaseToMap);
      }
      if (activityType === "all" || activityType === "answers") {
        user.answers
          ?.filter((a) => isInDateRange(a.date))
          .forEach((a) => addCaseToMap(a.case));
      }
      if (activityType === "all" || activityType === "comments") {
        user.comments
          ?.filter((c) => isInDateRange(c.date))
          .forEach((c) => addCaseToMap(c.case || c.answer?.case));
      }
      if (activityType === "all" || activityType === "ratings") {
        user.metricScores
          ?.filter((s) => isInDateRange(s.date))
          .forEach((s) => addCaseToMap(s.case));
      }
      if (activityType === "all" || activityType === "approvals") {
        user.approvedAnswers
          ?.filter((a) => isInDateRange(a.approved_date || a.date))
          .forEach((a) => addCaseToMap(a.case));
      }
      if (activityType === "all" || activityType === "finances") {
        user.financialApprovedAnswers
          ?.filter((a) => isInDateRange(a.financial_approved_date || a.date))
          .forEach((a) => addCaseToMap(a.case));
      }

      return Array.from(relevantCasesForStats.values());
    })(); // --- LOGIC RESTORED START ---

    const categoryCounts: Record<
      string,
      { id: string; name: string; count: number; color: string }
    > = {};

    casesToAnalyze.forEach((caseItem: ICase) => {
      if (caseItem.categories && caseItem.categories.length > 0) {
        caseItem.categories.forEach((category: ICategory) => {
          if (category?.name) {
            if (!categoryCounts[category.name]) {
              categoryCounts[category.name] = {
                id: category._id,
                name: category.name,
                count: 0,
                color: category.color || "#A9A9A9", // Use the category's color with a fallback
              };
            }
            categoryCounts[category.name].count++;
          }
        });
      } else {
        const unknownCategoryName = "Без категория";
        if (!categoryCounts[unknownCategoryName]) {
          categoryCounts[unknownCategoryName] = {
            id: "unknown",
            name: unknownCategoryName,
            count: 0,
            color: "#888888",
          };
        }
        categoryCounts[unknownCategoryName].count++;
      }
    });

    const signalsByCategoryChartData: PieSegmentData[] = Object.values(
      categoryCounts
    )
      .map((catInfo) => ({
        id: catInfo.id,
        label: catInfo.name,
        value: catInfo.count,
        color: catInfo.color, // Use the stored color
      }))
      .filter((segment) => segment.value > 0)
      .sort((a, b) => b.value - a.value);
    let ratedCasesSum = 0;
    let ratedCasesCount = 0;
    casesToAnalyze.forEach((c) => {
      if (
        c.calculatedRating !== null &&
        c.calculatedRating !== undefined &&
        c.calculatedRating > 0
      ) {
        ratedCasesSum += c.calculatedRating;
        ratedCasesCount++;
      }
    });

    const averageCaseRating =
      ratedCasesCount > 0 ? ratedCasesSum / ratedCasesCount : null;

    const tierCounts = { Gold: 0, Silver: 0, Bronze: 0, Problematic: 0 };
    casesToAnalyze.forEach((c) => {
      if (c.calculatedRating !== null && c.calculatedRating !== undefined) {
        if (c.calculatedRating >= TIERS.GOLD) tierCounts.Gold++;
        else if (c.calculatedRating >= TIERS.SILVER) tierCounts.Silver++;
        else if (c.calculatedRating >= TIERS.BRONZE) tierCounts.Bronze++;
        else if (c.calculatedRating > 0) tierCounts.Problematic++;
      }
    });

    const ratingTierDistributionData: PieSegmentData[] = [
      {
        label: `Отлични (>${TIERS.GOLD})`,
        value: tierCounts.Gold,
        color: "#FFD700",
      },
      {
        label: `Добри (${TIERS.SILVER}-${TIERS.GOLD})`,
        value: tierCounts.Silver,
        color: "#C0C0C0",
      },
      {
        label: `Средни (${TIERS.BRONZE}-${TIERS.SILVER})`,
        value: tierCounts.Bronze,
        color: "#CD7F32",
      },
      {
        label: `Проблемни (<${TIERS.BRONZE})`,
        value: tierCounts.Problematic,
        color: "#EF4444",
      },
    ].filter((segment) => segment.value > 0);

    // --- NEW LOGIC ---
    // 1. Resolution Time Stats
    const { resolutionPieChartData } = calculateResolutionStats(casesToAnalyze);

    // 2. Priority & Type Stats
    const priorityCounts: Record<string, number> = {
      [CasePriority.High]: 0,
      [CasePriority.Medium]: 0,
      [CasePriority.Low]: 0,
    };
    const typeCounts: Record<string, number> = {
      [CaseType.Problem]: 0,
      [CaseType.Suggestion]: 0,
    };

    casesToAnalyze.forEach((c) => {
      if (c.priority) {
        priorityCounts[c.priority]++;
      }
      if (c.type) {
        typeCounts[c.type]++;
      }
    });

    const priorityDistributionData: PieSegmentData[] = [
      {
        id: CasePriority.High,
        label: translatePriority(CasePriority.High),
        value: priorityCounts[CasePriority.High],
        color: "#EF4444",
      }, // red-500
      {
        id: CasePriority.Medium,
        label: translatePriority(CasePriority.Medium),
        value: priorityCounts[CasePriority.Medium],
        color: "#EAB308",
      }, // yellow-500
      {
        id: CasePriority.Low,
        label: translatePriority(CasePriority.Low),
        value: priorityCounts[CasePriority.Low],
        color: "#22C55E",
      }, // green-500
    ].filter((segment) => segment.value > 0);

    const typeDistributionData: PieSegmentData[] = [
      {
        id: CaseType.Problem,
        label: translateCaseType(CaseType.Problem),
        value: typeCounts[CaseType.Problem],
        color: "#F87171",
      }, // red-400
      {
        id: CaseType.Suggestion,
        label: translateCaseType(CaseType.Suggestion),
        value: typeCounts[CaseType.Suggestion],
        color: "#4ADE80",
      }, // green-400
    ].filter((segment) => segment.value > 0);

    return {
      totalSignals,
      totalAnswers,
      totalComments,
      ratedCasesCount,
      averageCaseRating,
      signalsByCategoryChartData,
      ratingTierDistributionData,
      resolutionTimeDistributionData: resolutionPieChartData,
      priorityDistributionData,
      typeDistributionData,
    };
  }, [user, startDate, endDate, activityType]);

  return stats;
};

export default useUserActivityStats;
