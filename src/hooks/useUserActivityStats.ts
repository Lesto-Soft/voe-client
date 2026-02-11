// src/hooks/useUserActivityStats.ts
import { useMemo } from "react";
import {
  IUser,
  ICase,
  ICategory,
  ITask,
  CasePriority,
  CaseType,
  ICaseStatus,
  TaskStatus,
} from "../db/interfaces";
import { PieSegmentData } from "../components/charts/PieChart";
import { TIERS } from "../utils/GLOBAL_PARAMETERS";
import { parseActivityDate } from "../utils/dateUtils";
import {
  calculateResolutionStats,
  translateCaseType,
  translatePriority,
  translateStatus,
  translateTaskStatus,
} from "../utils/categoryDisplayUtils";
import type { ParentTab, CaseSubTab, TaskSubTab } from "../components/features/userAnalytics/UserStatisticsPanel";

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
  statusDistributionData: PieSegmentData[];
  resolutionTimeDistributionData: PieSegmentData[];
  taskStatusDistributionData: PieSegmentData[];
  taskPriorityDistributionData: PieSegmentData[];
  taskTimelinessDistributionData: PieSegmentData[];
}

const useUserActivityStats = (
  user: IUser | undefined | null,
  startDate: Date | null,
  endDate: Date | null,
  parentTab: ParentTab,
  subTab: CaseSubTab | TaskSubTab
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
      statusDistributionData: [],
      resolutionTimeDistributionData: [],
      taskStatusDistributionData: [],
      taskPriorityDistributionData: [],
      taskTimelinessDistributionData: [],
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

    // Determine the effective activity type for case analysis based on parent+sub tab
    const casesToAnalyze = ((): ICase[] => {
      if (parentTab === "tasks") return []; // No case analysis when viewing tasks

      const relevantCasesForStats = new Map<string, ICase>();
      const addCaseToMap = (caseItem: ICase | undefined | null) => {
        if (caseItem && caseItem._id) {
          relevantCasesForStats.set(caseItem._id, caseItem);
        }
      };

      const caseSubTab = subTab as CaseSubTab;

      if (caseSubTab === "all" || caseSubTab === "cases") {
        user.cases?.filter((c) => isInDateRange(c.date)).forEach(addCaseToMap);
      }
      if (caseSubTab === "all" || caseSubTab === "answers") {
        user.answers
          ?.filter((a) => isInDateRange(a.date))
          .forEach((a) => addCaseToMap(a.case));
      }
      if (caseSubTab === "all" || caseSubTab === "comments") {
        user.comments
          ?.filter((c) => isInDateRange(c.date))
          .forEach((c) => addCaseToMap(c.case || c.answer?.case));
      }
      if (caseSubTab === "all" || caseSubTab === "ratings") {
        user.metricScores
          ?.filter((s) => isInDateRange(s.date))
          .forEach((s) => addCaseToMap(s.case));
      }
      if (caseSubTab === "all" || caseSubTab === "approvals") {
        user.approvedAnswers
          ?.filter((a) => isInDateRange(a.approved_date || a.date))
          .forEach((a) => addCaseToMap(a.case));
      }
      if (caseSubTab === "all" || caseSubTab === "finances") {
        user.financialApprovedAnswers
          ?.filter((a) => isInDateRange(a.financial_approved_date || a.date))
          .forEach((a) => addCaseToMap(a.case));
      }

      return Array.from(relevantCasesForStats.values());
    })();

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
                color: category.color || "#A9A9A9",
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
        color: catInfo.color,
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

    const { resolutionPieChartData } = calculateResolutionStats(casesToAnalyze);

    const priorityCounts: Record<string, number> = {
      [CasePriority.High]: 0,
      [CasePriority.Medium]: 0,
      [CasePriority.Low]: 0,
    };
    const typeCounts: Record<string, number> = {
      [CaseType.Problem]: 0,
      [CaseType.Suggestion]: 0,
    };
    const statusCounts: Record<string, number> = {
      [ICaseStatus.Open]: 0,
      [ICaseStatus.InProgress]: 0,
      [ICaseStatus.AwaitingFinance]: 0,
      [ICaseStatus.Closed]: 0,
    };

    casesToAnalyze.forEach((c) => {
      if (c.priority) priorityCounts[c.priority]++;
      if (c.status) statusCounts[c.status as string]++;
      if (c.type) typeCounts[c.type]++;
    });

    const priorityDistributionData: PieSegmentData[] = [
      {
        id: CasePriority.High,
        label: translatePriority(CasePriority.High),
        value: priorityCounts[CasePriority.High],
        color: "#EF4444",
      },
      {
        id: CasePriority.Medium,
        label: translatePriority(CasePriority.Medium),
        value: priorityCounts[CasePriority.Medium],
        color: "#EAB308",
      },
      {
        id: CasePriority.Low,
        label: translatePriority(CasePriority.Low),
        value: priorityCounts[CasePriority.Low],
        color: "#22C55E",
      },
    ].filter((segment) => segment.value > 0);

    const statusDistributionData: PieSegmentData[] = [
      {
        id: ICaseStatus.Open,
        label: translateStatus(ICaseStatus.Open),
        value: statusCounts[ICaseStatus.Open],
        color: "#22C55E",
      },
      {
        id: ICaseStatus.InProgress,
        label: translateStatus(ICaseStatus.InProgress),
        value: statusCounts[ICaseStatus.InProgress],
        color: "#EAB308",
      },
      {
        id: ICaseStatus.AwaitingFinance,
        label: translateStatus(ICaseStatus.AwaitingFinance),
        value: statusCounts[ICaseStatus.AwaitingFinance],
        color: "#3B82F6",
      },
      {
        id: ICaseStatus.Closed,
        label: translateStatus(ICaseStatus.Closed),
        value: statusCounts[ICaseStatus.Closed],
        color: "#9CA3AF",
      },
    ].filter((segment) => segment.value > 0);

    const typeDistributionData: PieSegmentData[] = [
      {
        id: CaseType.Problem,
        label: translateCaseType(CaseType.Problem),
        value: typeCounts[CaseType.Problem],
        color: "#F87171",
      },
      {
        id: CaseType.Suggestion,
        label: translateCaseType(CaseType.Suggestion),
        value: typeCounts[CaseType.Suggestion],
        color: "#4ADE80",
      },
    ].filter((segment) => segment.value > 0);

    // Task-specific pie chart data
    const tasksToAnalyze = ((): ITask[] => {
      if (parentTab === "cases") return []; // No task analysis when viewing cases

      const taskMap = new Map<string, ITask>();
      const addTask = (task: ITask) => {
        if (task && task._id) taskMap.set(task._id, task);
      };

      user.assignedTasks
        ?.filter((t) => t.createdAt && isInDateRange(t.createdAt))
        .forEach(addTask);
      user.createdTasks
        ?.filter((t) => t.createdAt && isInDateRange(t.createdAt))
        .forEach(addTask);

      return Array.from(taskMap.values());
    })();

    const taskStatusCounts: Record<string, number> = {
      [TaskStatus.Todo]: 0,
      [TaskStatus.InProgress]: 0,
      [TaskStatus.Done]: 0,
    };
    const taskPriorityCounts: Record<string, number> = {
      [CasePriority.High]: 0,
      [CasePriority.Medium]: 0,
      [CasePriority.Low]: 0,
    };

    tasksToAnalyze.forEach((t) => {
      if (t.status) taskStatusCounts[t.status]++;
      if (t.priority) taskPriorityCounts[t.priority]++;
    });

    const taskStatusDistributionData: PieSegmentData[] = [
      {
        id: TaskStatus.Todo,
        label: translateTaskStatus(TaskStatus.Todo),
        value: taskStatusCounts[TaskStatus.Todo],
        color: "#3B82F6",
      },
      {
        id: TaskStatus.InProgress,
        label: translateTaskStatus(TaskStatus.InProgress),
        value: taskStatusCounts[TaskStatus.InProgress],
        color: "#EAB308",
      },
      {
        id: TaskStatus.Done,
        label: translateTaskStatus(TaskStatus.Done),
        value: taskStatusCounts[TaskStatus.Done],
        color: "#22C55E",
      },
    ].filter((segment) => segment.value > 0);

    const taskPriorityDistributionData: PieSegmentData[] = [
      {
        id: CasePriority.High,
        label: translatePriority(CasePriority.High),
        value: taskPriorityCounts[CasePriority.High],
        color: "#EF4444",
      },
      {
        id: CasePriority.Medium,
        label: translatePriority(CasePriority.Medium),
        value: taskPriorityCounts[CasePriority.Medium],
        color: "#EAB308",
      },
      {
        id: CasePriority.Low,
        label: translatePriority(CasePriority.Low),
        value: taskPriorityCounts[CasePriority.Low],
        color: "#22C55E",
      },
    ].filter((segment) => segment.value > 0);

    // Task timeliness distribution
    const now = new Date();
    const timelinessCounts = {
      onTime: 0,       // DONE && completedAt <= dueDate
      inProgress: 0,   // not DONE && now <= dueDate
      overdue: 0,      // not DONE && now > dueDate
      lateCompletion: 0, // DONE && completedAt > dueDate
      noDueDate: 0,    // no dueDate
    };

    tasksToAnalyze.forEach((t) => {
      if (!t.dueDate) {
        timelinessCounts.noDueDate++;
      } else {
        // Use end-of-day for dueDate so tasks completed ON the due date count as "on time"
        const dueDate = new Date(t.dueDate);
        dueDate.setHours(23, 59, 59, 999);
        if (t.status === TaskStatus.Done) {
          if (t.completedAt) {
            const completedAt = new Date(t.completedAt);
            if (completedAt <= dueDate) {
              timelinessCounts.onTime++;
            } else {
              timelinessCounts.lateCompletion++;
            }
          } else {
            // DONE but no completedAt recorded — treat as on time
            timelinessCounts.onTime++;
          }
        } else {
          // Not done
          if (now <= dueDate) {
            timelinessCounts.inProgress++;
          } else {
            timelinessCounts.overdue++;
          }
        }
      }
    });

    const taskTimelinessDistributionData: PieSegmentData[] = [
      {
        id: "onTime",
        label: "Завършени на време",
        value: timelinessCounts.onTime,
        color: "#22C55E",
      },
      {
        id: "inProgress",
        label: "В процес",
        value: timelinessCounts.inProgress,
        color: "#3B82F6",
      },
      {
        id: "overdue",
        label: "Закъсняващи",
        value: timelinessCounts.overdue,
        color: "#F97316",
      },
      {
        id: "lateCompletion",
        label: "Завършени със закъснение",
        value: timelinessCounts.lateCompletion,
        color: "#EF4444",
      },
      {
        id: "noDueDate",
        label: "Без краен срок",
        value: timelinessCounts.noDueDate,
        color: "#9CA3AF",
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
      resolutionTimeDistributionData: resolutionPieChartData,
      priorityDistributionData,
      typeDistributionData,
      statusDistributionData,
      taskStatusDistributionData,
      taskPriorityDistributionData,
      taskTimelinessDistributionData,
    };
  }, [user, startDate, endDate, parentTab, subTab]);

  return stats;
};

export default useUserActivityStats;
