// src/hooks/useUserActivityStats.ts
import { useMemo } from "react";
import { IUser, ICase, ICategory } from "../db/interfaces"; // Adjust path as needed
import { getCategoryColorForUserChart } from "../utils/userDisplayUtils"; // Adjust path
import { PieSegmentData } from "../components/charts/PieChart"; // Adjust path

export interface UserActivityStats {
  totalSignals: number;
  totalAnswers: number;
  totalComments: number;
  // For "Време за реакция при отговори" - we'll use these counts for now,
  // and skip the detailed time/priority breakdown as discussed.
  // responseTimeDetails: {
  //   lowPriority: string | number;
  //   mediumPriority: string | number;
  //   highPriority: string | number;
  // };
  signalsByCategoryChartData: PieSegmentData[];
}

const useUserActivityStats = (
  user: IUser | undefined | null
): UserActivityStats => {
  const stats = useMemo((): UserActivityStats => {
    const defaultStats: UserActivityStats = {
      totalSignals: 0,
      totalAnswers: 0,
      totalComments: 0,
      // responseTimeDetails: {
      //   lowPriority: "N/A",
      //   mediumPriority: "N/A",
      //   highPriority: "N/A",
      // },
      signalsByCategoryChartData: [],
    };

    if (!user) {
      return defaultStats;
    }

    const totalSignals = user.cases?.length || 0;
    const totalAnswers = user.answers?.length || 0;
    const totalComments = user.comments?.length || 0;

    // Calculate distribution of user's signals (cases) by category
    const categoryCounts: Record<
      string,
      { id: string; name: string; count: number }
    > = {};
    if (user.cases) {
      user.cases.forEach((caseItem: ICase) => {
        if (caseItem.categories && caseItem.categories.length > 0) {
          caseItem.categories.forEach((category: ICategory) => {
            if (category.name) {
              // Ensure category name exists
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
          // Handle cases with no categories or if category information is structured differently
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
    }

    const signalsByCategoryChartData: PieSegmentData[] = Object.values(
      categoryCounts
    )
      .map((catInfo, index) => ({
        label: catInfo.name,
        value: catInfo.count,
        color: getCategoryColorForUserChart(index), // Get color from userDisplayUtils
      }))
      .filter((segment) => segment.value > 0) // Only include categories with actual cases
      .sort((a, b) => b.value - a.value); // Optional: sort by count descending

    return {
      totalSignals,
      totalAnswers,
      totalComments,
      // responseTimeDetails: { // Placeholder as discussed
      //   lowPriority: "N/A",
      //   mediumPriority: "N/A",
      //   highPriority: "N/A",
      // },
      signalsByCategoryChartData,
    };
  }, [user]);

  return stats;
};

export default useUserActivityStats;
