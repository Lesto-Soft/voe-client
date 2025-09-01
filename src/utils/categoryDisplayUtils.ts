// src/utils/categoryDisplayUtils.ts
import moment from "moment";
import { ICase, IAnswer } from "../db/interfaces"; // Adjust path as needed
import { parseActivityDate } from "./dateUtils";

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
    AWAITING_FINANCE: "Финансов",
    CLOSED: "Затворен",
  };
  return map[statusString] || statusString;
};

export const translateCaseType = (type: string): string => {
  const typeUpper = String(type).toUpperCase();
  const map: Record<string, string> = {
    PROBLEM: "Проблем",
    SUGGESTION: "Подобрение",
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

export const getCaseResolutionCategory = (
  caseItem: ICase
): ResolutionCategoryKey | null => {
  // --- START OF DEBUGGING LOGIC ---
  console.log(`[DEBUG] Processing Case #${caseItem.case_number}...`);
  // --- END OF DEBUGGING LOGIC ---

  if (
    String(caseItem.status) !== "CLOSED" &&
    String(caseItem.status) !== "AWAITING_FINANCE"
  ) {
    return null;
  }

  let latestResolutionDate: Date | null = null;

  if (caseItem.answers && caseItem.answers.length > 0) {
    caseItem.answers.forEach((answer: IAnswer) => {
      if (answer.approved) {
        const resolutionDateStr = answer.date;
        if (resolutionDateStr) {
          const currentResolutionDate = parseActivityDate(resolutionDateStr);
          if (!isNaN(currentResolutionDate.getTime())) {
            if (
              !latestResolutionDate ||
              currentResolutionDate > latestResolutionDate
            ) {
              latestResolutionDate = currentResolutionDate;
            }
          }
        }
      }
    });
  }

  // --- START OF DEBUGGING LOGIC ---
  if (!latestResolutionDate) {
    console.log(
      `%c[DEBUG] Case #${caseItem.case_number}: FAILED. No valid approved answer date was found.`,
      "color: red; font-weight: bold;"
    );
    return null;
  }
  if (!caseItem.date) {
    console.log(
      `%c[DEBUG] Case #${caseItem.case_number}: FAILED. Case has no creation date.`,
      "color: red; font-weight: bold;"
    );
    return null;
  }
  // --- END OF DEBUGGING LOGIC ---

  try {
    const endDate = moment.utc(latestResolutionDate);
    const startDate = moment.utc(parseInt(caseItem.date, 10));
    const diffTimeMs = endDate.diff(startDate);

    // --- START OF DEBUGGING LOGIC ---
    if (diffTimeMs < 0) {
      console.log(
        `%c[DEBUG] Case #${
          caseItem.case_number
        }: FAILED. Resolution date (${endDate.toISOString()}) is BEFORE creation date (${startDate.toISOString()}).`,
        "color: red; font-weight: bold;"
      );
      return null;
    }
    // --- END OF DEBUGGING LOGIC ---

    if (diffTimeMs >= 0) {
      const diffDays = diffTimeMs / (1000 * 60 * 60 * 24);
      if (diffDays <= 1) return "UNDER_1_DAY";
      if (diffDays <= 5) return "UNDER_5_DAYS";
      if (diffDays <= 10) return "UNDER_10_DAYS";
      return "OVER_10_DAYS";
    }
  } catch (e) {
    console.error("Error during final calculation:", e);
    return null;
  }

  return null;
};

export const calculateResolutionStats = (cases: ICase[]) => {
  const resolutionTimeCounts: Record<ResolutionCategoryKey, number> = {
    UNDER_1_DAY: 0,
    UNDER_5_DAYS: 0,
    UNDER_10_DAYS: 0,
    OVER_10_DAYS: 0,
  };
  let effectivelyResolvedCasesCount = 0;
  let totalResolutionTimeInDays = 0;
  let casesWithCalculableTime = 0;

  cases.forEach((caseItem: ICase) => {
    const isCompleted =
      String(caseItem.status) === "CLOSED" ||
      String(caseItem.status) === "AWAITING_FINANCE";

    if (isCompleted) {
      effectivelyResolvedCasesCount++;
    }

    // This now uses the same simplified logic as the filter function
    const resolutionCategory = getCaseResolutionCategory(caseItem);
    if (resolutionCategory) {
      resolutionTimeCounts[resolutionCategory]++;

      let latestResolutionDate: Date | null = null;
      if (caseItem.answers && caseItem.answers.length > 0) {
        caseItem.answers.forEach((answer: IAnswer) => {
          if (answer.approved) {
            const resolutionDateStr = answer.date; // <-- SIMPLIFIED LOGIC
            if (resolutionDateStr) {
              const currentResolutionDate =
                parseActivityDate(resolutionDateStr);
              if (
                !latestResolutionDate ||
                currentResolutionDate > latestResolutionDate
              ) {
                latestResolutionDate = currentResolutionDate;
              }
            }
          }
        });
      }

      if (latestResolutionDate) {
        casesWithCalculableTime++;
        const endDate = moment.utc(latestResolutionDate);
        const startDate = moment.utc(parseInt(caseItem.date, 10));
        const diffTimeMs = endDate.diff(startDate);
        if (diffTimeMs >= 0) {
          totalResolutionTimeInDays += diffTimeMs / (1000 * 60 * 60 * 24);
        }
      }
    }
  });

  const averageResolutionTime =
    casesWithCalculableTime > 0
      ? totalResolutionTimeInDays / casesWithCalculableTime
      : 0;

  const resolutionPieChartData = RESOLUTION_CATEGORY_CONFIG.map(
    (catConfig) => ({
      id: catConfig.key,
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
