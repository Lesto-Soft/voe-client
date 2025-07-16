import { useMemo } from "react";
import { IMetricScore } from "../db/interfaces";
import { PieSegmentData } from "../components/charts/PieChart";
import { TIERS } from "../utils/GLOBAL_PARAMETERS";

// This is a placeholder utility. We'll use a simple color array if the original util is unavailable.
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

export interface RatingMetricStats {
  totalScores: number;
  averageScore: number;
  tierDistributionData: PieSegmentData[];
  userContributionData: PieSegmentData[];
}

const useRatingMetricStats = (
  scores: IMetricScore[]
): RatingMetricStats | null => {
  const stats = useMemo((): RatingMetricStats | null => {
    if (!scores) {
      return null;
    }

    if (scores.length === 0) {
      return {
        totalScores: 0,
        averageScore: 0,
        tierDistributionData: [],
        userContributionData: [],
      };
    }

    // 1. Calculate basic stats
    const totalScores = scores.length;
    const sumOfScores = scores.reduce((sum, s) => sum + s.score, 0);
    const averageScore = totalScores > 0 ? sumOfScores / totalScores : 0;

    // 2. Calculate Tier Distribution
    const tierCounts = { Gold: 0, Silver: 0, Bronze: 0, Problematic: 0 };

    scores.forEach((s) => {
      if (s.score >= TIERS.GOLD) tierCounts.Gold++;
      else if (s.score >= TIERS.SILVER) tierCounts.Silver++;
      else if (s.score >= TIERS.BRONZE) tierCounts.Bronze++;
      else tierCounts.Problematic++;
    });

    const tierDistributionData: PieSegmentData[] = [
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
      }, // red-500
    ].filter((segment) => segment.value > 0);

    // 3. Calculate User Contribution
    const userCounts: { [username: string]: number } = {};
    scores.forEach((s) => {
      if (s.user && s.user.name) {
        userCounts[s.user.name] = (userCounts[s.user.name] || 0) + 1;
      }
    });

    const userContributionData: PieSegmentData[] = Object.entries(userCounts)
      .map(([userName, count], index) => ({
        label: userName,
        value: count,
        color: getColorForChart(index),
      }))
      .sort((a, b) => b.value - a.value);

    return {
      totalScores,
      averageScore,
      tierDistributionData,
      userContributionData,
    };
  }, [scores]);

  return stats;
};

export default useRatingMetricStats;
