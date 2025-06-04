// src/utils/categoryDisplayUtils.ts
import { ICase, IAnswer } from "../db/interfaces"; // Adjust path as needed

export const STATUS_COLORS: Record<string, string> = {
  OPEN: "#22C55E", // green-500
  CLOSED: "#9CA3AF", // gray-400
  IN_PROGRESS: "#EAB308", // yellow-500
  AWAITING_FINANCE: "#3B82F6", // blue-500
  DEFAULT: "#9CA3AF", // gray-400
};

export const TYPE_COLORS: Record<string, string> = {
  PROBLEM: "#F87171", // red-400 (Tailwind red-400 is #f87171)
  SUGGESTION: "#4ADE80", // green-400 (Tailwind green-400 is #4ade80)
};

export const RESOLUTION_CATEGORY_CONFIG = [
  { label: "До 1 ден", key: "UNDER_1_DAY", color: "#A7F3D0" }, // green-200
  { label: "До 5 дни", key: "UNDER_5_DAYS", color: "#BAE6FD" }, // blue-200
  { label: "До 10 дни", key: "UNDER_10_DAYS", color: "#FDE68A" }, // yellow-200
  { label: "Над 10 дни", key: "OVER_10_DAYS", color: "#FECACA" }, // red-200
] as const;

export type ResolutionCategoryKey =
  (typeof RESOLUTION_CATEGORY_CONFIG)[number]["key"];

export interface StatusStyle {
  dotBgColor: string;
  textColor: string;
  hexColor: string;
}

export const getStatusStyle = (
  status: string | undefined | null
): StatusStyle => {
  if (!status) {
    return {
      dotBgColor: "bg-gray-400",
      textColor: "text-gray-500",
      hexColor: STATUS_COLORS.DEFAULT,
    };
  }
  const statusUpper = String(status).toUpperCase();
  switch (statusUpper) {
    case "OPEN":
      return {
        dotBgColor: "bg-green-500",
        textColor: "text-green-700",
        hexColor: STATUS_COLORS.OPEN,
      };
    case "CLOSED":
      return {
        dotBgColor: "bg-gray-400",
        textColor: "text-gray-600",
        hexColor: STATUS_COLORS.CLOSED,
      };
    case "IN_PROGRESS":
      return {
        dotBgColor: "bg-yellow-500",
        textColor: "text-yellow-700",
        hexColor: STATUS_COLORS.IN_PROGRESS,
      };
    case "AWAITING_FINANCE":
      return {
        dotBgColor: "bg-blue-500",
        textColor: "text-blue-700",
        hexColor: STATUS_COLORS.AWAITING_FINANCE,
      };
    default:
      return {
        dotBgColor: "bg-gray-400",
        textColor: "text-gray-500",
        hexColor: STATUS_COLORS.DEFAULT,
      };
  }
};

export const getPriorityStyle = (
  priority: string | undefined | null
): string => {
  if (!priority) {
    return "text-gray-500";
  }
  switch (String(priority).toUpperCase()) {
    case "LOW":
      return "text-green-600";
    case "HIGH":
      return "text-red-600";
    case "MEDIUM":
      return "text-yellow-600";
    default:
      return "text-gray-500";
  }
};

export const translateStatus = (status: string | any): string => {
  const statusString = String(status).toUpperCase();
  const map: Record<string, string> = {
    OPEN: "Отворен",
    IN_PROGRESS: "В процес",
    AWAITING_FINANCE: "Чака финанси",
    CLOSED: "Затворен",
  };
  return map[statusString] || statusString;
};

export const translateCaseType = (type: string): string => {
  const typeUpper = String(type).toUpperCase();
  const map: Record<string, string> = {
    PROBLEM: "Проблеми",
    SUGGESTION: "Предложения",
  };
  return map[typeUpper] || typeUpper;
};

export const translatePriority = (priority: string): string => {
  const priorityUpper = String(priority).toUpperCase();
  const map: Record<string, string> = {
    LOW: "Нисък",
    MEDIUM: "Среден",
    HIGH: "Висок",
  };
  return map[priorityUpper] || priorityUpper;
};

export const translateResolutionCategory = (categoryLabel: string): string => {
  // Assuming labels are already in the desired language as per RESOLUTION_CATEGORY_CONFIG
  return categoryLabel;
};

// This 't' function is specific to how CaseLink constructs its text.
// It might be better if CaseLink handles this internally or if a more robust i18n solution is used.
// For now, keeping it similar to the original for direct replacement.
export const tForCaseLink = (
  key: string,
  options?: { caseId?: string | number }
): string => {
  if (key === "details_for" && options?.caseId) {
    return `Детайли за ${options.caseId}`;
  }
  return key;
};

// Helper function to calculate resolution statistics (extracted from the original signalStats logic)
export const calculateResolutionStats = (cases: ICase[]) => {
  const resolutionTimeCounts: Record<ResolutionCategoryKey, number> = {
    UNDER_1_DAY: 0,
    UNDER_5_DAYS: 0,
    UNDER_10_DAYS: 0,
    OVER_10_DAYS: 0,
  };
  let effectivelyResolvedCasesCount = 0;
  let totalResolutionTimeInDays = 0;

  cases.forEach((caseItem: ICase) => {
    if (
      String(caseItem.status) === "CLOSED" || // Explicitly stringify if status can be enum
      String(caseItem.status) === "AWAITING_FINANCE"
    ) {
      effectivelyResolvedCasesCount++;
      let resolvingAnswerVariable: IAnswer | null = null; // Use a different variable name temporarily
      let latestApprovedDateTime: number | null = null;

      if (caseItem.answers && caseItem.answers.length > 0) {
        caseItem.answers.forEach((answer: IAnswer) => {
          // answer is IAnswer
          if (answer.approved) {
            // This means answer.approved (IUser) exists
            try {
              // Using answer.date (creation date of the answer) to determine "latest" approved answer
              // This was the logic in the version you pasted as "working".
              // If you intended to use answer.approved_date, that would be a different logic path.
              const currentApprovedDate = new Date(answer.date);
              if (!isNaN(currentApprovedDate.getTime())) {
                if (
                  latestApprovedDateTime === null ||
                  currentApprovedDate.getTime() > latestApprovedDateTime
                ) {
                  latestApprovedDateTime = currentApprovedDate.getTime();
                  resolvingAnswerVariable = answer; // assigning IAnswer to IAnswer | null
                }
              }
            } catch (e) {
              console.error(
                "Error parsing answer date for 'latestApprovedDateTime' check:",
                e,
                answer
              );
            }
          }
        });
      }

      // Explicit check and access
      if (resolvingAnswerVariable !== null) {
        const finalResolvingAnswer: IAnswer = resolvingAnswerVariable; // Explicitly typed after null check

        // If the error still occurs on the next line, it's deeply puzzling.
        const answerDate: string = finalResolvingAnswer.date; // Accessing .date from an explicitly typed IAnswer

        if (answerDate && caseItem.date) {
          try {
            const caseStartDate = new Date(caseItem.date);
            const resolutionActualEndDate = new Date(answerDate);
            if (
              !isNaN(caseStartDate.getTime()) &&
              !isNaN(resolutionActualEndDate.getTime())
            ) {
              const diffTimeMs =
                resolutionActualEndDate.getTime() - caseStartDate.getTime();
              if (diffTimeMs >= 0) {
                const diffDays = diffTimeMs / (1000 * 60 * 60 * 24);
                totalResolutionTimeInDays += diffDays;
                if (diffDays <= 1) resolutionTimeCounts.UNDER_1_DAY++;
                else if (diffDays <= 5) resolutionTimeCounts.UNDER_5_DAYS++;
                else if (diffDays <= 10) resolutionTimeCounts.UNDER_10_DAYS++;
                else resolutionTimeCounts.OVER_10_DAYS++;
              }
            }
          } catch (e) {
            console.error(
              "Error calculating date difference for resolution:",
              e
            );
          }
        }
      }
    }
  });

  const averageResolutionTime =
    effectivelyResolvedCasesCount > 0
      ? totalResolutionTimeInDays / effectivelyResolvedCasesCount
      : 0;

  const resolutionPieChartData = RESOLUTION_CATEGORY_CONFIG.map(
    (catConfig) => ({
      label: catConfig.label,
      value: resolutionTimeCounts[catConfig.key],
      color: catConfig.color,
    })
  );

  return {
    resolutionTimeCounts,
    effectivelyResolvedCasesCount,
    averageResolutionTime,
    resolutionPieChartData,
    unresolvedCasesCount: cases.length - effectivelyResolvedCasesCount,
  };
};
