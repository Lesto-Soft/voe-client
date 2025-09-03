// src/hooks/useUserActivityStats.ts
import { useMemo } from "react";
import { IUser, ICase, ICategory } from "../db/interfaces";
import { getCategoryColorForUserChart } from "../utils/userDisplayUtils";
import { PieSegmentData } from "../components/charts/PieChart";
import { TIERS } from "../utils/GLOBAL_PARAMETERS";
import { parseActivityDate } from "../utils/dateUtils";

export interface UserActivityStats {
  totalSignals: number;
  totalAnswers: number;
  totalComments: number;
  ratedCasesCount: number;
  averageCaseRating: number | null;
  signalsByCategoryChartData: PieSegmentData[];
  ratingTierDistributionData: PieSegmentData[];
}

const useUserActivityStats = (
  user: IUser | undefined | null,
  startDate: Date | null,
  endDate: Date | null
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
    }; // --- MODIFICATION START --- // First, get simple counts of activities within the date range (this part is for the text stats).

    const filteredCreatedCases =
      user.cases?.filter((c) => isInDateRange(c.date)) || [];
    const totalSignals = filteredCreatedCases.length;
    const totalAnswers =
      user.answers?.filter((a) => isInDateRange(a.date)).length || 0;
    const totalComments =
      user.comments?.filter((c) => isInDateRange(c.date)).length || 0; // Now, build a comprehensive list of all UNIQUE cases the user has interacted with // within the date range. This will be the source for our pie charts.

    const relevantCasesForStats = new Map<string, ICase>();

    const addCaseToMap = (caseItem: ICase | undefined | null) => {
      if (caseItem && caseItem._id) {
        relevantCasesForStats.set(caseItem._id, caseItem);
      }
    }; // 1. From cases created by the user

    filteredCreatedCases.forEach(addCaseToMap); // 2. From answers created by the user

    user.answers
      ?.filter((a) => isInDateRange(a.date))
      .forEach((a) => addCaseToMap(a.case)); // 3. From comments created by the user

    user.comments
      ?.filter((c) => isInDateRange(c.date))
      .forEach((c) => addCaseToMap(c.case || c.answer?.case)); // 4. From cases the user has rated

    user.metricScores
      ?.filter((s) => isInDateRange(s.date))
      .forEach((s) => addCaseToMap(s.case)); // 5. From answers the user has approved

    user.approvedAnswers
      ?.filter((a) => isInDateRange(a.approved_date || a.date))
      .forEach((a) => addCaseToMap(a.case)); // 6. From answers the user has financially approved

    user.financialApprovedAnswers
      ?.filter((a) => isInDateRange(a.financial_approved_date || a.date))
      .forEach((a) => addCaseToMap(a.case)); // This is now our master list of cases for building stats

    const casesToAnalyze = Array.from(relevantCasesForStats.values()); // --- MODIFICATION END ---
    const categoryCounts: Record<
      string,
      { id: string; name: string; count: number }
    > = {}; // This logic now iterates over the CORRECT list of cases

    casesToAnalyze.forEach((caseItem: ICase) => {
      if (caseItem.categories && caseItem.categories.length > 0) {
        caseItem.categories.forEach((category: ICategory) => {
          if (category?.name) {
            if (!categoryCounts[category.name]) {
              categoryCounts[category.name] = {
                id: category._id,
                name: category.name,
                count: 0,
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
          };
        }
        categoryCounts[unknownCategoryName].count++;
      }
    });

    const signalsByCategoryChartData: PieSegmentData[] = Object.values(
      categoryCounts
    )
      .map((catInfo, index) => ({
        id: catInfo.id,
        label: catInfo.name,
        value: catInfo.count,
        color: getCategoryColorForUserChart(index),
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

    return {
      totalSignals,
      totalAnswers,
      totalComments,
      ratedCasesCount,
      averageCaseRating,
      signalsByCategoryChartData,
      ratingTierDistributionData,
    };
  }, [user, startDate, endDate]);

  return stats;
};

export default useUserActivityStats;
