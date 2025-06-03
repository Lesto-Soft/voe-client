// src/utils/userDisplayUtils.ts

// Example: Colors for distributing user's cases by category in a pie chart.
// You can expand this list or use a more dynamic color generation strategy.
export const USER_CATEGORY_DISTRIBUTION_COLORS: string[] = [
  "#3B82F6", // blue-500
  "#10B981", // emerald-500
  "#F59E0B", // amber-500
  "#EC4899", // pink-500
  "#8B5CF6", // violet-500
  "#6366F1", // indigo-500
  "#06B6D4", // cyan-500
  "#F97316", // orange-500
];

// If you have specific user roles or statuses that need translation or styling,
// similar helper functions to those in categoryDisplayUtils.ts could go here.
// For example:
/*
export const translateUserRole = (roleName: string | undefined): string => {
  if (!roleName) return "N/A";
  const map: Record<string, string> = {
    "admin": "Администратор",
    "expert": "Експерт",
    "manager": "Мениджър",
    "user": "Потребител",
  };
  return map[roleName.toLowerCase()] || roleName;
};
*/

// Function to assign a color to a category for the user's case distribution chart
// This will cycle through the predefined colors.
export const getCategoryColorForUserChart = (
  categoryIndex: number,
  existingColors?: string[]
): string => {
  const colorsToUse = existingColors || USER_CATEGORY_DISTRIBUTION_COLORS;
  return colorsToUse[categoryIndex % colorsToUse.length];
};
