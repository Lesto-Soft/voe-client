// src/hooks/useUserActivityStats.ts
import { useMemo } from "react";
import { IUser, ICase, ICategory } from "../db/interfaces";
import { getCategoryColorForUserChart } from "../utils/userDisplayUtils";
import { PieSegmentData } from "../components/charts/PieChart";
import { TIERS } from "../utils/GLOBAL_PARAMETERS";
// ✅ ADDED: Import our robust date parsing utility
import { parseActivityDate } from "../utils/dateUtils";

export interface UserActivityStats {
  totalSignals: number;
  totalAnswers: number;
  totalComments: number;
  ratedCasesCount: number; // How many of the user's cases have been rated
  averageCaseRating: number | null; // The average rating of the user's cases
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

    // ✅ MODIFIED: Replaced the two old, buggy helpers with one correct function.
    // This function now handles all cases (no dates, one date, or both)
    // and uses our robust `parseActivityDate` utility.
    const isInDateRange = (itemDateStr: string | number) => {
      if (!startDate && !endDate) return true;
      const itemDate = parseActivityDate(itemDateStr);

      if (startDate && itemDate < startDate) {
        return false;
      }
      if (endDate && itemDate > endDate) {
        return false;
      }
      return true;
    };

    // ✅ MODIFIED: Apply the corrected filter to all activity types.
    const filteredCases =
      user.cases?.filter((c) => isInDateRange(c.date)) || [];
    const filteredAnswers =
      user.answers?.filter((a) => isInDateRange(a.date)) || [];
    const filteredComments =
      user.comments?.filter((c) => isInDateRange(c.date)) || [];

    const totalSignals = filteredCases.length;
    const totalAnswers = filteredAnswers.length;
    const totalComments = filteredComments.length;

    const categoryCounts: Record<
      string,
      { id: string; name: string; count: number }
    > = {};

    filteredCases.forEach((caseItem: ICase) => {
      if (caseItem.categories && caseItem.categories.length > 0) {
        caseItem.categories.forEach((category: ICategory) => {
          if (category.name) {
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
        label: catInfo.name,
        value: catInfo.count,
        color: getCategoryColorForUserChart(index),
      }))
      .filter((segment) => segment.value > 0)
      .sort((a, b) => b.value - a.value);

    let ratedCasesSum = 0;
    let ratedCasesCount = 0;
    filteredCases.forEach((c) => {
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
    filteredCases.forEach((c) => {
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
