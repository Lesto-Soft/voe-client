// src/hooks/useRatingMetricStats.ts
import { useMemo } from "react";
import { IMetricScore, ICategory } from "../db/interfaces";
import { PieSegmentData } from "../components/charts/PieChart";
import { TIERS } from "../utils/GLOBAL_PARAMETERS";
import { getColorForChart } from "../utils/colors";

export interface RatingMetricStats {
  totalScores: number;
  averageScore: number;
  tierDistributionData: PieSegmentData[];
  userContributionData: PieSegmentData[];
  // --- ADD NEW PROPERTY ---
  categoryContributionData: PieSegmentData[];
}

const useRatingMetricStats = (
  scores: IMetricScore[]
): RatingMetricStats | null => {
  const stats = useMemo((): RatingMetricStats | null => {
    if (!scores || scores.length === 0) {
      return {
        totalScores: 0,
        averageScore: 0,
        tierDistributionData: [],
        userContributionData: [],
        categoryContributionData: [], // <-- Add default
      };
    }

    const totalScores = scores.length;
    const sumOfScores = scores.reduce((sum, s) => sum + s.score, 0);
    const averageScore = totalScores > 0 ? sumOfScores / totalScores : 0;

    const tierCounts = { Gold: 0, Silver: 0, Bronze: 0, Problematic: 0 };
    scores.forEach((s) => {
      if (s.score >= TIERS.GOLD) tierCounts.Gold++;
      else if (s.score >= TIERS.SILVER) tierCounts.Silver++;
      else if (s.score >= TIERS.BRONZE) tierCounts.Bronze++;
      else tierCounts.Problematic++;
    });

    const tierDistributionData: PieSegmentData[] = [
      {
        id: "gold",
        label: `Отлични (>${TIERS.GOLD})`,
        value: tierCounts.Gold,
        color: "#FFD700",
      },
      {
        id: "silver",
        label: `Добри (${TIERS.SILVER}-${TIERS.GOLD})`,
        value: tierCounts.Silver,
        color: "#C0C0C0",
      },
      {
        id: "bronze",
        label: `Средни (${TIERS.BRONZE}-${TIERS.SILVER})`,
        value: tierCounts.Bronze,
        color: "#CD7F32",
      },
      {
        id: "problematic",
        label: `Проблемни (<${TIERS.BRONZE})`,
        value: tierCounts.Problematic,
        color: "#EF4444",
      },
    ].filter((segment) => segment.value > 0);

    // store the count and the user ID
    const userCounts: { [userId: string]: { value: number; name: string } } =
      {};
    scores.forEach((s) => {
      if (s.user && s.user._id && s.user.name) {
        if (!userCounts[s.user._id]) {
          userCounts[s.user._id] = { value: 0, name: s.user.name };
        }
        userCounts[s.user._id].value++;
      }
    });

    const userContributionData: PieSegmentData[] = Object.entries(userCounts)
      .map(([userId, data], index) => ({
        id: userId, // Include the user's ID
        label: data.name,
        value: data.value,
        color: getColorForChart(index),
      }))
      .sort((a, b) => b.value - a.value);

    // --- ADD NEW CALCULATION FOR CATEGORIES ---
    const categoryCounts: {
      [catId: string]: { value: number; name: string; color: string };
    } = {};

    scores.forEach((s) => {
      const categories = s.case?.categories;
      if (categories && Array.isArray(categories) && categories.length > 0) {
        // A single score/case can belong to multiple categories, so count for each
        categories.forEach((cat: ICategory) => {
          if (cat && cat._id && cat.name) {
            if (!categoryCounts[cat._id]) {
              categoryCounts[cat._id] = {
                value: 0,
                name: cat.name,
                color: cat.color || "#A9A9A9",
              };
            }
            categoryCounts[cat._id].value++;
          }
        });
      } else {
        // Handle scores on cases with no category
        const unknownId = "unknown"; // Special ID for "uncategorized"
        if (!categoryCounts[unknownId]) {
          categoryCounts[unknownId] = {
            value: 0,
            name: "Без категория",
            color: "#888888",
          };
        }
        categoryCounts[unknownId].value++;
      }
    });

    const categoryContributionData: PieSegmentData[] = Object.entries(
      categoryCounts
    )
      .map(([catId, data]) => ({
        id: catId, // Use the category ID (or "unknown")
        label: data.name,
        value: data.value,
        color: data.color,
      }))
      .sort((a, b) => b.value - a.value);
    // --- END NEW CALCULATION ---

    return {
      totalScores,
      averageScore,
      tierDistributionData,
      userContributionData,
      categoryContributionData,
    };
  }, [scores]);

  return stats;
};

export default useRatingMetricStats;
