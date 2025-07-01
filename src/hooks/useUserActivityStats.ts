// src/hooks/useUserActivityStats.ts
import { useMemo } from "react";
import { IUser, ICase, ICategory } from "../db/interfaces";
import { getCategoryColorForUserChart } from "../utils/userDisplayUtils";
import { PieSegmentData } from "../components/charts/PieChart";
import { TIERS } from "../utils/GLOBAL_PARAMETERS";

export interface UserActivityStats {
  totalSignals: number;
  totalAnswers: number;
  totalComments: number;
  signalsByCategoryChartData: PieSegmentData[];
  ratingTierDistributionData: PieSegmentData[]; // <-- Add new data field
}

// 1. UPDATE THE HOOK'S SIGNATURE TO ACCEPT DATES
const useUserActivityStats = (
  user: IUser | undefined | null,
  startDate: Date | null,
  endDate: Date | null
): UserActivityStats => {
  const stats = useMemo((): UserActivityStats => {
    const defaultStats: UserActivityStats = {
      totalSignals: 0,
      totalAnswers: 0,
      totalComments: 0,
      signalsByCategoryChartData: [],
      ratingTierDistributionData: [], // <-- Default to empty array
    };

    if (!user) {
      return defaultStats;
    }

    // 2. CREATE A REUSABLE FILTERING FUNCTION
    const isInDateRange = (itemDateStr: string) => {
      // If no dates are set, every item is included
      if (!startDate || !endDate) return true;
      const itemDate = new Date(itemDateStr);
      return itemDate >= startDate && itemDate <= endDate;
    };

    // 3. APPLY THE FILTER BEFORE COUNTING
    const filteredCases =
      user.cases?.filter((c) => isInDateRange(c.date)) || [];
    const filteredAnswers =
      user.answers?.filter((a) => isInDateRange(a.date)) || [];
    const filteredComments =
      user.comments?.filter((c) => isInDateRange(c.date)) || [];

    const totalSignals = filteredCases.length;
    const totalAnswers = filteredAnswers.length;
    const totalComments = filteredComments.length;

    // 4. PERFORM CATEGORY ANALYSIS ON THE *FILTERED* CASES
    const categoryCounts: Record<
      string,
      { id: string; name: string; count: number }
    > = {};

    // This logic now correctly uses the filtered list
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

    // --- NEW: Calculate Rating Tier Distribution ---
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
      { label: "Gold", value: tierCounts.Gold, color: "#FFD700" },
      { label: "Silver", value: tierCounts.Silver, color: "#C0C0C0" },
      { label: "Bronze", value: tierCounts.Bronze, color: "#CD7F32" },
      { label: "Problematic", value: tierCounts.Problematic, color: "#EF4444" },
    ].filter((segment) => segment.value > 0);

    return {
      totalSignals,
      totalAnswers,
      totalComments,
      signalsByCategoryChartData,
      ratingTierDistributionData,
    };
  }, [user, startDate, endDate]); // 5. ADD DATES TO THE DEPENDENCY ARRAY

  return stats;
};

export default useUserActivityStats;
