// src/pages/User.tsx
import React, { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useGetFullUserByUsername, useUpdateUser } from "../graphql/hooks/user";
import { useGetRoles } from "../graphql/hooks/role";
import {
  IMe,
  ICase,
  IAnswer,
  IComment,
  ITask,
  ITaskActivity,
  CasePriority,
  CaseType,
  ICaseStatus,
  TaskStatus,
  TaskActivityType,
} from "../db/interfaces";
import { UpdateUserInput } from "../graphql/mutation/user";
import { parseActivityDate } from "../utils/dateUtils";
import { PieSegmentData } from "../components/charts/PieChart";

// Hooks
import useUserActivityStats from "../hooks/useUserActivityStats";
import { useCurrentUser } from "../context/UserContext";

// UI Components
import PageStatusDisplay from "../components/global/PageStatusDisplay";
import UserPageSkeleton from "../components/skeletons/UserPageSkeleton";
import UserInformationPanel from "../components/features/userAnalytics/UserInformationPanel";
import UserActivityList, { CombinedActivity } from "../components/features/userAnalytics/UserActivityList";
import UserStatisticsPanel, {
  UserTextStats,
  PieTab,
} from "../components/features/userAnalytics/UserStatisticsPanel";
import type {
  ParentTab,
  CaseSubTab,
  TaskSubTab,
} from "../components/features/userAnalytics/UserStatisticsPanel";
import UserModal from "../components/modals/UserModal";
import UserForm from "../components/forms/UserForm";
import SuccessConfirmationModal from "../components/modals/SuccessConfirmationModal";

// Constants & Utils
import { ROLES, TIERS } from "../utils/GLOBAL_PARAMETERS";
import { containsAnyCategoryById } from "../utils/arrayUtils";
import {
  getCaseResolutionCategory,
  RESOLUTION_CATEGORY_CONFIG,
} from "../utils/categoryDisplayUtils";
import { useAuthorization } from "../hooks/useAuthorization";
import ForbiddenPage from "./ErrorPages/ForbiddenPage";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { ArrowsRightLeftIcon } from "@heroicons/react/24/outline";

export type RatingTierLabel =
  | "Отлични"
  | "Добри"
  | "Средни"
  | "Проблемни"
  | "all";

type ResolutionCategoryLabel =
  (typeof RESOLUTION_CATEGORY_CONFIG)[number]["label"];

// --- Helper types for this component ---
interface RatedCaseActivity {
  case: ICase;
  averageScore: number;
}
const getTierForScore = (score: number): RatingTierLabel => {
  if (score >= TIERS.GOLD) return "Отлични";
  if (score >= TIERS.SILVER) return "Добри";
  if (score >= TIERS.BRONZE) return "Средни";
  return "Проблемни";
};

const User: React.FC = () => {
  const navigate = useNavigate();
  const { username: userUsernameFromParams } = useParams<{
    username: string;
  }>();

  const [layout, setLayout] = useState<"standard" | "analytics">("standard");

  const [isInfoPanelHidden, setIsInfoPanelHidden] = useState(false);
  const [isRightPanelHidden, setIsRightPanelHidden] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successModalMessage, setSuccessModalMessage] = useState("");
  const [dateRange, setDateRange] = useState<{
    startDate: Date | null;
    endDate: Date | null;
  }>({
    startDate: null,
    endDate: null,
  });
  const [activeCategoryName, setActiveCategoryName] = useState<string | null>(
    null
  );
  const [activeRatingTier, setActiveRatingTier] =
    useState<RatingTierLabel>("all");
  const [activePriority, setActivePriority] = useState<CasePriority | "all">(
    "all"
  );
  const [activeType, setActiveType] = useState<CaseType | "all">("all");
  const [activeResolution, setActiveResolution] = useState<
    ResolutionCategoryLabel | "all"
  >("all");
  const [activeStatus, setActiveStatus] = useState<ICaseStatus | "all">("all");
  const [activeTaskStatus, setActiveTaskStatus] = useState<TaskStatus | "all">(
    "all"
  );
  const [activeTaskPriority, setActiveTaskPriority] = useState<
    CasePriority | "all"
  >("all");
  const [activeTaskTimeliness, setActiveTaskTimeliness] =
    useState<string>("all");

  // LIFTED STATE: The active pie tab state now lives here
  const [activePieTab, setActivePieTab] = useState<PieTab>("categories");

  // 2-level tab state
  const [activeParentTab, setActiveParentTab] = useState<ParentTab>("cases");
  const [activeSubTab, setActiveSubTab] = useState<CaseSubTab | TaskSubTab>(
    "all"
  );

  const currentUser = useCurrentUser() as IMe | undefined;

  const {
    loading: userLoading,
    error: userError,
    user,
    refetch: refetchUser,
  } = useGetFullUserByUsername(userUsernameFromParams);

  // Load the active tab from session storage on component mount
  useEffect(() => {
    if (!userUsernameFromParams) return;
    const savedParentTab = sessionStorage.getItem(
      `userActivity_parentTab_${userUsernameFromParams}`
    ) as ParentTab | null;
    const savedSubTab = sessionStorage.getItem(
      `userActivity_subTab_${userUsernameFromParams}`
    );

    if (savedParentTab && ["cases", "tasks"].includes(savedParentTab)) {
      setActiveParentTab(savedParentTab);
      if (savedParentTab === "cases") {
        const validCaseSubTabs = [
          "all",
          "cases",
          "answers",
          "comments",
          "ratings",
          "approvals",
          "finances",
        ];
        if (savedSubTab && validCaseSubTabs.includes(savedSubTab)) {
          setActiveSubTab(savedSubTab as CaseSubTab);
        }
        setActivePieTab("categories");
      } else {
        const validTaskSubTabs = ["all", "tasks", "entries", "analyses"];
        if (savedSubTab && validTaskSubTabs.includes(savedSubTab)) {
          setActiveSubTab(savedSubTab as TaskSubTab);
        }
        setActivePieTab("taskStatus");
      }
    }
  }, [userUsernameFromParams]);

  const { isAllowed, isLoading: authLoading } = useAuthorization({
    type: "user",
    data: user,
  });

  const pieChartStats = useUserActivityStats(
    user,
    dateRange.startDate,
    dateRange.endDate,
    activeParentTab,
    activeSubTab
  );

  const {
    updateUser,
    loading: updateLoading,
    error: updateError,
  } = useUpdateUser();

  const {
    roles: rolesData,
    loading: rolesLoading,
    error: rolesError,
  } = useGetRoles();

  const serverBaseUrl = import.meta.env.VITE_API_URL || "";

  // Centralized handlers for changing the active tabs
  const handleParentTabChange = (newParentTab: ParentTab) => {
    setActiveParentTab(newParentTab);
    setActiveSubTab("all");
    // Auto-switch pie tab when switching parent
    if (newParentTab === "tasks") {
      setActivePieTab("taskStatus");
    } else {
      setActivePieTab("categories");
    }
    if (userUsernameFromParams) {
      try {
        sessionStorage.setItem(
          `userActivity_parentTab_${userUsernameFromParams}`,
          newParentTab
        );
        sessionStorage.setItem(
          `userActivity_subTab_${userUsernameFromParams}`,
          "all"
        );
      } catch (error) {
        console.warn("Failed to save active tab to sessionStorage:", error);
      }
    }
  };

  const handleSubTabChange = (newSubTab: CaseSubTab | TaskSubTab) => {
    setActiveSubTab(newSubTab);
    if (userUsernameFromParams) {
      try {
        sessionStorage.setItem(
          `userActivity_subTab_${userUsernameFromParams}`,
          newSubTab
        );
      } catch (error) {
        console.warn("Failed to save sub tab to sessionStorage:", error);
      }
    }
  };

  const filteredActivities = useMemo((): CombinedActivity[] => {
    if (!user) return [];

    const isInDateRange = (itemDateStr: string | number) => {
      const { startDate, endDate } = dateRange;
      if (!startDate && !endDate) return true;
      const itemDate = parseActivityDate(itemDateStr);
      if (startDate && itemDate < startDate) return false;
      if (endDate && itemDate > endDate) return false;
      return true;
    };

    const ratedCases: Map<
      string,
      { scores: number[]; latestDate: string; caseData: ICase }
    > = new Map();

    if (user.metricScores) {
      user.metricScores
        .filter((score) => isInDateRange(score.date))
        .forEach((score) => {
          if (!ratedCases.has(score.case._id)) {
            ratedCases.set(score.case._id, {
              scores: [],
              latestDate: score.date,
              caseData: score.case,
            });
          }
          const entry = ratedCases.get(score.case._id)!;
          entry.scores.push(score.score);
          if (new Date(score.date) > new Date(entry.latestDate)) {
            entry.latestDate = score.date;
          }
        });
    }

    let activities: CombinedActivity[] = [];

    if (user.cases) {
      user.cases
        .filter((c) => isInDateRange(c.date))
        .forEach((caseItem) =>
          activities.push({
            id: `case-${caseItem._id}`,
            date: caseItem.date,
            item: caseItem,
            activityType: "case",
          })
        );
    }
    if (user.answers) {
      user.answers
        .filter((a) => isInDateRange(a.date))
        .forEach((answerItem) =>
          activities.push({
            id: `answer-${answerItem._id}`,
            date: answerItem.date,
            item: answerItem,
            activityType: "answer",
          })
        );
    }
    if (user.approvedAnswers) {
      user.approvedAnswers
        .filter((a) => isInDateRange(a.approved_date || a.date))
        .forEach((answerItem) =>
          activities.push({
            id: `base-approval-${answerItem._id}`,
            date: answerItem.approved_date || answerItem.date,
            item: answerItem,
            activityType: "base_approval",
          })
        );
    }
    if (user.financialApprovedAnswers) {
      user.financialApprovedAnswers
        .filter((a) => isInDateRange(a.financial_approved_date || a.date))
        .forEach((answerItem) =>
          activities.push({
            id: `finance-approval-${answerItem._id}`,
            date: answerItem.financial_approved_date || answerItem.date,
            item: answerItem,
            activityType: "finance_approval",
          })
        );
    }
    if (user.comments) {
      user.comments
        .filter((c) => isInDateRange(c.date))
        .forEach((commentItem) =>
          activities.push({
            id: `comment-${commentItem._id}`,
            date: commentItem.date,
            item: commentItem,
            activityType: "comment",
          })
        );
    }
    ratedCases.forEach((value, key) => {
      const averageScore =
        value.scores.reduce((a, b) => a + b, 0) / value.scores.length;
      activities.push({
        id: `rating-${key}`,
        date: value.latestDate,
        item: { case: value.caseData, averageScore },
        activityType: "rating",
      });
    });

    // Task activities - deduplicate across created/assigned/completed
    const seenTaskIds = new Set<string>();
    if (user.createdTasks) {
      user.createdTasks
        .filter((t) => t.createdAt && isInDateRange(t.createdAt))
        .forEach((task) => {
          const key = `task-created-${task._id}`;
          if (!seenTaskIds.has(key)) {
            seenTaskIds.add(key);
            activities.push({
              id: key,
              date: task.createdAt!,
              item: task,
              activityType: "task_created",
            });
          }
        });
    }
    if (user.assignedTasks) {
      user.assignedTasks
        .filter((t) => t.createdAt && isInDateRange(t.createdAt))
        .forEach((task) => {
          const key = `task-assigned-${task._id}`;
          if (!seenTaskIds.has(key)) {
            seenTaskIds.add(key);
            activities.push({
              id: key,
              date: task.createdAt!,
              item: task,
              activityType: "task_assigned",
            });
          }
        });
    }
    // Completed tasks (from both lists)
    const allTasks = [
      ...(user.createdTasks || []),
      ...(user.assignedTasks || []),
    ];
    allTasks
      .filter(
        (t) =>
          t.status === "DONE" && t.completedAt && isInDateRange(t.completedAt)
      )
      .forEach((task) => {
        const key = `task-completed-${task._id}`;
        if (!seenTaskIds.has(key)) {
          seenTaskIds.add(key);
          activities.push({
            id: key,
            date: task.completedAt!,
            item: task,
            activityType: "task_completed",
          });
        }
      });

    // TaskActivity entries (comments, help requests, approval requests, status/priority/assignee changes, analysis submissions)
    if (user.createdTaskActivities) {
      const activityTypeMap: Record<
        TaskActivityType,
        CombinedActivity["activityType"]
      > = {
        [TaskActivityType.Comment]: "task_comment",
        [TaskActivityType.HelpRequest]: "task_help_request",
        [TaskActivityType.ApprovalRequest]: "task_approval_request",
        [TaskActivityType.StatusChange]: "task_status_change",
        [TaskActivityType.PriorityChange]: "task_priority_change",
        [TaskActivityType.AssigneeChange]: "task_assignee_change",
        [TaskActivityType.AnalysisSubmitted]: "task_analysis_submitted",
        [TaskActivityType.DescriptionChange]: "task_description_change",
      };
      user.createdTaskActivities
        .filter((ta) => ta.createdAt && isInDateRange(ta.createdAt))
        .forEach((ta) => {
          const actType = activityTypeMap[ta.type];
          if (actType) {
            activities.push({
              id: `task-activity-${ta._id}`,
              date: ta.createdAt,
              item: ta,
              activityType: actType,
            });
          }
        });
    }

    // --- Case-specific filters (skip task activities) ---
    if (activeCategoryName) {
      const activeCategoryId = pieChartStats?.signalsByCategoryChartData.find(
        (d) => d.label === activeCategoryName
      )?.id;

      if (activeCategoryId) {
        activities = activities.filter((activity) => {
          if (activity.activityType.startsWith("task_")) return true;
          let relatedCase: ICase | undefined | null;
          switch (activity.activityType) {
            case "case":
              relatedCase = activity.item as ICase;
              break;
            case "rating":
              relatedCase = (activity.item as RatedCaseActivity).case;
              break;
            case "answer":
            case "base_approval":
            case "finance_approval":
              relatedCase = (activity.item as IAnswer).case;
              break;
            case "comment":
              const comment = activity.item as IComment;
              relatedCase = comment.case || comment.answer?.case;
              break;
          }
          if (!relatedCase || !relatedCase.categories) return false;
          return relatedCase.categories.some(
            (cat) => cat._id === activeCategoryId
          );
        });
      }
    }

    if (activePriority !== "all") {
      activities = activities.filter((activity) => {
        if (activity.activityType.startsWith("task_")) return true;
        let relatedCase: ICase | undefined | null;
        switch (activity.activityType) {
          case "case":
            relatedCase = activity.item as ICase;
            break;
          case "rating":
            relatedCase = (activity.item as RatedCaseActivity).case;
            break;
          case "answer":
          case "base_approval":
          case "finance_approval":
            relatedCase = (activity.item as IAnswer).case;
            break;
          case "comment":
            const comment = activity.item as IComment;
            relatedCase = comment.case || comment.answer?.case;
            break;
        }
        if (!relatedCase) return false;
        return relatedCase.priority === activePriority;
      });
    }

    if (activeStatus !== "all") {
      activities = activities.filter((activity) => {
        if (activity.activityType.startsWith("task_")) return true;
        let relatedCase: ICase | undefined | null;
        switch (activity.activityType) {
          case "case":
            relatedCase = activity.item as ICase;
            break;
          case "rating":
            relatedCase = (activity.item as RatedCaseActivity).case;
            break;
          case "answer":
          case "base_approval":
          case "finance_approval":
            relatedCase = (activity.item as IAnswer).case;
            break;
          case "comment":
            const comment = activity.item as IComment;
            relatedCase = comment.case || comment.answer?.case;
            break;
        }
        if (!relatedCase) return false;
        return relatedCase.status === activeStatus;
      });
    }

    if (activeRatingTier !== "all") {
      activities = activities.filter((activity) => {
        if (activity.activityType.startsWith("task_")) return true;
        let relatedCase: ICase | undefined | null;
        switch (activity.activityType) {
          case "case":
            relatedCase = activity.item as ICase;
            break;
          case "rating":
            relatedCase = (activity.item as RatedCaseActivity).case;
            break;
          case "answer":
          case "base_approval":
          case "finance_approval":
            relatedCase = (activity.item as IAnswer).case;
            break;
          case "comment":
            const comment = activity.item as IComment;
            relatedCase = comment.case || comment.answer?.case;
            break;
        }

        if (
          !relatedCase ||
          relatedCase.calculatedRating === null ||
          relatedCase.calculatedRating === undefined
        ) {
          return false;
        }
        return (
          getTierForScore(relatedCase.calculatedRating) === activeRatingTier
        );
      });
    }

    if (activeType !== "all") {
      activities = activities.filter((activity) => {
        if (activity.activityType.startsWith("task_")) return true;
        let relatedCase: ICase | undefined | null;
        switch (activity.activityType) {
          case "case":
            relatedCase = activity.item as ICase;
            break;
          case "rating":
            relatedCase = (activity.item as RatedCaseActivity).case;
            break;
          case "answer":
          case "base_approval":
          case "finance_approval":
            relatedCase = (activity.item as IAnswer).case;
            break;
          case "comment":
            const comment = activity.item as IComment;
            relatedCase = comment.case || comment.answer?.case;
            break;
        }
        if (!relatedCase) return false;
        return relatedCase.type === activeType;
      });
    }

    if (activeResolution !== "all") {
      const resolutionKey = RESOLUTION_CATEGORY_CONFIG.find(
        (c) => c.label === activeResolution
      )?.key;
      if (resolutionKey) {
        activities = activities.filter((activity) => {
          if (activity.activityType.startsWith("task_")) return true;
          let relatedCase: ICase | undefined | null;
          switch (activity.activityType) {
            case "case":
              relatedCase = activity.item as ICase;
              break;
            case "rating":
              relatedCase = (activity.item as RatedCaseActivity).case;
              break;
            case "answer":
            case "base_approval":
            case "finance_approval":
              relatedCase = (activity.item as IAnswer).case;
              break;
            case "comment":
              const comment = activity.item as IComment;
              relatedCase = comment.case || comment.answer?.case;
              break;
          }
          if (!relatedCase) return false;
          const caseResolutionCategoryKey =
            getCaseResolutionCategory(relatedCase);
          return caseResolutionCategoryKey === resolutionKey;
        });
      }
    }

    // --- Task-specific filters (skip case activities) ---
    if (activeTaskStatus !== "all") {
      activities = activities.filter((activity) => {
        if (!activity.activityType.startsWith("task_")) return true;
        if ("status" in (activity.item as any)) {
          return (activity.item as ITask).status === activeTaskStatus;
        }
        if ("task" in (activity.item as any)) {
          return (
            (activity.item as ITaskActivity).task?.status === activeTaskStatus
          );
        }
        return true;
      });
    }

    if (activeTaskPriority !== "all") {
      activities = activities.filter((activity) => {
        if (!activity.activityType.startsWith("task_")) return true;
        if ("priority" in (activity.item as any)) {
          return (activity.item as ITask).priority === activeTaskPriority;
        }
        if ("task" in (activity.item as any)) {
          return (
            (activity.item as ITaskActivity).task?.priority ===
            activeTaskPriority
          );
        }
        return true;
      });
    }

    if (activeTaskTimeliness !== "all") {
      const now = new Date();
      activities = activities.filter((activity) => {
        if (!activity.activityType.startsWith("task_")) return true;

        let task: ITask | undefined;
        if (
          "status" in (activity.item as any) &&
          "title" in (activity.item as any)
        ) {
          task = activity.item as ITask;
        } else if ("task" in (activity.item as any)) {
          task = (activity.item as ITaskActivity).task;
        }
        if (!task) return true;

        // Determine timeliness category (use end-of-day for dueDate)
        let category: string;
        if (!task.dueDate) {
          category = "noDueDate";
        } else {
          const dueDate = new Date(task.dueDate);
          dueDate.setHours(23, 59, 59, 999);
          if (task.status === TaskStatus.Done) {
            if (task.completedAt) {
              category =
                new Date(task.completedAt) <= dueDate
                  ? "onTime"
                  : "lateCompletion";
            } else {
              category = "onTime";
            }
          } else {
            category = now <= dueDate ? "inProgress" : "overdue";
          }
        }
        return category === activeTaskTimeliness;
      });
    }

    return activities.sort(
      (a, b) =>
        parseActivityDate(b.date).getTime() -
        parseActivityDate(a.date).getTime()
    );
  }, [
    user,
    dateRange,
    activeCategoryName,
    activeRatingTier,
    activePriority,
    activeStatus,
    activeType,
    activeResolution,
    activeTaskStatus,
    activeTaskPriority,
    activeTaskTimeliness,
    pieChartStats,
  ]);

  const LIFECYCLE_TYPES = useMemo(
    () =>
      new Set([
        "task_created",
        "task_assigned",
        "task_completed",
        "task_status_change",
        "task_priority_change",
        "task_assignee_change",
        "task_description_change",
      ]),
    []
  );
  const ENTRY_TYPES = useMemo(
    () =>
      new Set(["task_comment", "task_help_request", "task_approval_request"]),
    []
  );

  const filteredActivityCounts = useMemo(() => {
    const counts = {
      casesTotal: 0,
      tasksTotal: 0,
      cases: 0,
      answers: 0,
      comments: 0,
      ratings: 0,
      approvals: 0,
      finances: 0,
      tasks: 0,
      entries: 0,
      analyses: 0,
    };
    filteredActivities.forEach((activity) => {
      if (activity.activityType.startsWith("task_")) {
        counts.tasksTotal++;
        if (LIFECYCLE_TYPES.has(activity.activityType)) counts.tasks++;
        else if (ENTRY_TYPES.has(activity.activityType)) counts.entries++;
        else if (activity.activityType === "task_analysis_submitted")
          counts.analyses++;
      } else {
        counts.casesTotal++;
        if (activity.activityType === "case") counts.cases++;
        else if (activity.activityType === "answer") counts.answers++;
        else if (activity.activityType === "comment") counts.comments++;
        else if (activity.activityType === "rating") counts.ratings++;
        else if (activity.activityType === "base_approval") counts.approvals++;
        else if (activity.activityType === "finance_approval")
          counts.finances++;
      }
    });
    return counts;
  }, [filteredActivities, LIFECYCLE_TYPES, ENTRY_TYPES]);

  const filteredTextStats = useMemo((): UserTextStats => {
    // Average rating based only on the user's own submitted cases
    const ownCases = filteredActivities
      .filter((a) => a.activityType === "case")
      .map((a) => a.item as ICase);

    let ratedCasesSum = 0;
    let ratedCasesCount = 0;
    ownCases.forEach((c) => {
      if (
        c.calculatedRating !== null &&
        c.calculatedRating !== undefined &&
        c.calculatedRating > 0
      ) {
        ratedCasesSum += c.calculatedRating;
        ratedCasesCount++;
      }
    });
    return {
      totalSignals: filteredActivityCounts.cases,
      totalAnswers: filteredActivityCounts.answers,
      totalComments: filteredActivityCounts.comments,
      averageCaseRating:
        ratedCasesCount > 0 ? ratedCasesSum / ratedCasesCount : null,
    };
  }, [filteredActivities, filteredActivityCounts]);

  const isMisconfiguredExpert = useMemo(() => {
    return (
      user?.role?._id === ROLES.EXPERT &&
      (!user.expert_categories || user.expert_categories.length === 0) &&
      (!user.managed_categories || user.managed_categories.length === 0)
    );
  }, [user]);

  const handleFormSubmit = async (
    formData: any,
    editingUserId: string | null,
    avatarData: File | null | undefined
  ) => {
    if (!editingUserId) return;

    const finalInput: Partial<UpdateUserInput> = {
      username: formData.username,
      name: formData.name,
      email: formData.email,
      position: formData.position,
      role: formData.role,
      financial_approver: formData.financial_approver,
      expert_categories: formData.expert_categories,
      managed_categories: formData.managed_categories,
      ...(formData.password && { password: formData.password }),
      ...(avatarData !== undefined && { avatar: avatarData }),
    };

    Object.keys(finalInput).forEach((key) => {
      if (finalInput[key as keyof typeof finalInput] === undefined)
        delete finalInput[key as keyof typeof finalInput];
    });

    try {
      await updateUser(editingUserId, finalInput as UpdateUserInput);
      if (finalInput.username) {
        navigate(`/user/${finalInput.username}`);
      }
      await refetchUser();
      closeEditModal();
      setSuccessModalMessage("Потребителят е редактиран успешно!");
      setIsSuccessModalOpen(true);
      refetchUser();
    } catch (err: any) {
      console.error("Error during user update:", err);
      const graphQLError = err.graphQLErrors?.[0]?.message;
      const networkError = err.networkError?.message;
      const message =
        graphQLError || networkError || err.message || "Неизвестна грешка";
      alert(`Грешка при редактиране: ${message}`);
    }
  };

  const openEditModal = () => setIsEditModalOpen(true);
  const closeEditModal = () => setIsEditModalOpen(false);

  const handleCategoryClick = (segment: PieSegmentData) => {
    setActiveCategoryName((current) =>
      current === segment.label ? null : segment.label
    );
  };

  const handleRatingTierClick = (segment: PieSegmentData) => {
    const tierKey = segment.label.split(" ")[0] as RatingTierLabel;
    setActiveRatingTier((current) => (current === tierKey ? "all" : tierKey));
  };

  const handlePriorityClick = (segment: PieSegmentData) => {
    const priorityKey = segment.id as CasePriority;
    setActivePriority((current) =>
      current === priorityKey ? "all" : priorityKey
    );
  };

  const handleTypeClick = (segment: PieSegmentData) => {
    const typeKey = segment.id as CaseType;
    setActiveType((current) => (current === typeKey ? "all" : typeKey));
  };

  const handleResolutionClick = (segment: PieSegmentData) => {
    const resolutionLabel = segment.label as ResolutionCategoryLabel;
    setActiveResolution((current) =>
      current === resolutionLabel ? "all" : resolutionLabel
    );
  };

  const handleStatusClick = (segment: PieSegmentData) => {
    const statusKey = segment.id as ICaseStatus;
    setActiveStatus((current) => (current === statusKey ? "all" : statusKey));
  };

  const handleTaskStatusClick = (segment: PieSegmentData) => {
    const statusKey = segment.id as TaskStatus;
    setActiveTaskStatus((current) =>
      current === statusKey ? "all" : statusKey
    );
  };

  const handleTaskPriorityClick = (segment: PieSegmentData) => {
    const priorityKey = segment.id as CasePriority;
    setActiveTaskPriority((current) =>
      current === priorityKey ? "all" : priorityKey
    );
  };

  const handleTaskTimelinessClick = (segment: PieSegmentData) => {
    const key = segment.id as string;
    setActiveTaskTimeliness((current) => (current === key ? "all" : key));
  };

  const isAnyFilterActive = useMemo(() => {
    return (
      dateRange.startDate !== null ||
      dateRange.endDate !== null ||
      activeCategoryName !== null ||
      activeRatingTier !== "all" ||
      activePriority !== "all" ||
      activeStatus !== "all" ||
      activeType !== "all" ||
      activeResolution !== "all" ||
      activeTaskStatus !== "all" ||
      activeTaskPriority !== "all" ||
      activeTaskTimeliness !== "all"
    );
  }, [
    dateRange,
    activeCategoryName,
    activeRatingTier,
    activePriority,
    activeType,
    activeResolution,
    activeStatus,
    activeTaskStatus,
    activeTaskPriority,
    activeTaskTimeliness,
  ]);

  const handleClearAllFilters = () => {
    setDateRange({ startDate: null, endDate: null });
    setActiveCategoryName(null);
    setActiveRatingTier("all");
    setActivePriority("all");
    setActiveType("all");
    setActiveResolution("all");
    setActiveStatus("all");
    setActiveTaskStatus("all");
    setActiveTaskPriority("all");
    setActiveTaskTimeliness("all");
  };

  if (userLoading || authLoading) {
    return <UserPageSkeleton />;
  }

  if (userUsernameFromParams === undefined) {
    return (
      <PageStatusDisplay
        notFound
        message="Потребителското име не беше намерено в адреса."
      />
    );
  }

  if (userError || !user) {
    return <PageStatusDisplay error={userError} />;
  }

  if (!isAllowed) {
    return <ForbiddenPage />;
  }

  const isAdmin = currentUser?.role._id === ROLES.ADMIN;
  const isManagerForCategory =
    currentUser?.role?._id === ROLES.EXPERT &&
    (containsAnyCategoryById(
      currentUser?.managed_categories || [],
      user?.expert_categories || []
    ) ||
      containsAnyCategoryById(
        currentUser?.managed_categories || [],
        user?.managed_categories || []
      ));
  const isSelf = currentUser?._id === user?._id;

  const canEdit =
    isAdmin ||
    (isManagerForCategory && user?.role?._id !== ROLES.ADMIN) ||
    isSelf;

  // Common props shared between both UserStatisticsPanel instances
  const statisticsPanelCommonProps = {
    textStats: filteredTextStats,
    pieChartStats: pieChartStats,
    userName: user.name,
    isLoading: userLoading && !!user,
    onCategoryClick: handleCategoryClick,
    onRatingTierClick: handleRatingTierClick,
    activeCategoryLabel: activeCategoryName,
    onPriorityClick: handlePriorityClick,
    onResolutionClick: handleResolutionClick,
    onTypeClick: handleTypeClick,
    activePriorityFilter: activePriority,
    activeTypeFilter: activeType,
    activeResolutionFilter: activeResolution,
    activeRatingTierLabel:
      activeRatingTier !== "all"
        ? pieChartStats?.ratingTierDistributionData.find((d) =>
            d.label.startsWith(activeRatingTier)
          )?.label ?? null
        : null,
    onStatusClick: handleStatusClick,
    activeStatusFilter: activeStatus,
    activeCategoryFilter: activeCategoryName,
    activeRatingTierFilter: activeRatingTier,
    activityCounts: filteredActivityCounts,
    parentTab: activeParentTab,
    subTab: activeSubTab,
    onParentTabChange: handleParentTabChange,
    onSubTabChange: handleSubTabChange,
    onClearResolutionFilter: () => setActiveResolution("all"),
    onClearStatusFilter: () => setActiveStatus("all"),
    activePieTab: activePieTab,
    onPieTabChange: setActivePieTab,
    onClearCategoryFilter: () => setActiveCategoryName(null),
    onClearRatingTierFilter: () => setActiveRatingTier("all"),
    onClearPriorityFilter: () => setActivePriority("all"),
    onClearTypeFilter: () => setActiveType("all"),
    onTaskStatusClick: handleTaskStatusClick,
    onTaskPriorityClick: handleTaskPriorityClick,
    activeTaskStatusFilter: activeTaskStatus,
    activeTaskPriorityFilter: activeTaskPriority,
    onClearTaskStatusFilter: () => setActiveTaskStatus("all"),
    onClearTaskPriorityFilter: () => setActiveTaskPriority("all"),
    onTaskTimelinessClick: handleTaskTimelinessClick,
    activeTaskTimelinessFilter: activeTaskTimeliness,
    onClearTaskTimelinessFilter: () => setActiveTaskTimeliness("all"),
  };

  // Common props shared between both UserActivityList instances
  const activityListCommonProps = {
    user: user,
    activities: filteredActivities,
    isLoading: userLoading && !!user,
    counts: filteredActivityCounts,
    userId: userUsernameFromParams,
    dateRange: dateRange,
    onDateRangeChange: setDateRange,
    isAnyFilterActive: isAnyFilterActive,
    onClearAllFilters: handleClearAllFilters,
    activeCategoryName: activeCategoryName,
    onClearCategoryFilter: () => setActiveCategoryName(null),
    parentTab: activeParentTab,
    subTab: activeSubTab,
    onParentTabChange: handleParentTabChange,
    onSubTabChange: handleSubTabChange,
    activePriority: activePriority,
    onClearPriorityFilter: () => setActivePriority("all"),
    activeType: activeType,
    onClearTypeFilter: () => setActiveType("all"),
    activeResolution: activeResolution,
    onClearResolutionFilter: () => setActiveResolution("all"),
    activeRatingTier: activeRatingTier,
    onClearRatingTierFilter: () => setActiveRatingTier("all"),
    activeStatus: activeStatus,
    onClearStatusFilter: () => setActiveStatus("all"),
    activeTaskStatus: activeTaskStatus,
    onClearTaskStatusFilter: () => setActiveTaskStatus("all"),
    activeTaskPriority: activeTaskPriority,
    onClearTaskPriorityFilter: () => setActiveTaskPriority("all"),
    activeTaskTimeliness: activeTaskTimeliness,
    onClearTaskTimelinessFilter: () => setActiveTaskTimeliness("all"),
    onPieTabChange: setActivePieTab,
  };

  return (
    <>
      <div className="container min-w-full mx-auto p-2 sm:p-6 bg-gray-50 flex flex-col min-h-[calc(100vh-6rem)] lg:h-[calc(100vh-6rem)]">
        <div className="absolute top-[calc(6rem)] right-2 z-10 w-auto origin-top-left rounded-md bg-white shadow-lg focus:outline-none animate-slideRightAndFadeIn">
          <button
            onClick={() =>
              setLayout((prev) =>
                prev === "standard" ? "analytics" : "standard"
              )
            }
            className="cursor-pointer flex items-center gap-x-2 rounded-b-md border-gray-50 bg-white px-3 py-1 text-xs font-medium text-gray-600 shadow-sm transition-colors hover:bg-gray-100 focus:outline-none "
            title="Промяна на изгледа"
          >
            <ArrowsRightLeftIcon className="h-4 w-4" />
            <span>
              {layout === "standard"
                ? "Аналитичен изглед"
                : "Стандартен изглед"}
            </span>
          </button>
        </div>
        <div className="relative flex flex-col lg:flex-row gap-6 flex-1 overflow-hidden">
          {/* Information Panel */}
          {!isInfoPanelHidden && (
            <div className="lg:w-3/12 lg:basis-3/12 flex flex-col min-w-0 h-full">
              <UserInformationPanel
                user={user}
                isLoading={userLoading && !!user}
                serverBaseUrl={serverBaseUrl}
                onEditUser={openEditModal}
                canEdit={canEdit}
                isMisconfigured={isMisconfiguredExpert}
              />
            </div>
          )}
          {/* --- Conditional Layout Rendering --- */}
          {layout === "standard" ? (
            <>
              {/* Main Content (Activity List) */}
              <div className="relative flex-1 flex flex-col min-w-0 h-full">
                <UserActivityList {...activityListCommonProps} />
              </div>
              {/* Statistics Panel */}
              {!isRightPanelHidden && (
                <div className="lg:w-3/12 lg:basis-3/12 flex flex-col min-w-0 h-full">
                  <UserStatisticsPanel {...statisticsPanelCommonProps} />
                </div>
              )}
            </>
          ) : (
            // analytics layout
            <>
              {/* Statistics Panel (Center) */}
              <div className="relative flex-1 flex flex-col min-w-0 h-full">
                <UserStatisticsPanel
                  {...statisticsPanelCommonProps}
                  viewMode="center"
                  dateRange={dateRange}
                  onDateRangeChange={setDateRange}
                  isAnyFilterActive={isAnyFilterActive}
                  onClearAllFilters={handleClearAllFilters}
                  activeCategoryName={activeCategoryName}
                  activeRatingTier={activeRatingTier}
                />
              </div>
              {/* Activity List (Right) */}
              {!isRightPanelHidden && (
                <div className="lg:w-3/12 lg:basis-3/12 flex flex-col min-w-0 h-full">
                  <UserActivityList
                    {...activityListCommonProps}
                    cardView="compact"
                    showDateFilter={false}
                    showFiltersBar={false}
                  />
                </div>
              )}
            </>
          )}
          {/* Left Toggle Button */}
          <div
            className="absolute top-0 bottom-0 z-20 hidden lg:flex items-center transition-all duration-300 ease-in-out"
            style={{ left: isInfoPanelHidden ? "0px" : "25%" }}
          >
            <button
              onClick={() => setIsInfoPanelHidden((p) => !p)}
              className="relative -translate-x-1/2 w-4 h-full flex items-center justify-center group bg-white/0 hover:bg-white/50 transition-colors rounded-l-lg"
              title={isInfoPanelHidden ? "Покажи панела" : "Скрий панела"}
            >
              <div
                className={`cursor-pointer p-0  flex rounded-r-md items-center  group-hover:bg-gray-50 group-hover:shadow-md shadow-xs border border-gray-50/50 group-hover:border-gray-100 transition-all ${
                  isInfoPanelHidden
                    ? "ml-5 h-10 rounded-r-md bg-gray-100"
                    : "h-full bg-white"
                }`}
              >
                <div className="text-gray-500 group-hover:text-gray-800 transition-colors">
                  {isInfoPanelHidden ? (
                    <ChevronRightIcon className="h-5 w-5" />
                  ) : (
                    <ChevronLeftIcon className="h-5 w-5" />
                  )}
                </div>
              </div>
            </button>
          </div>
          {/* Right Toggle Button */}
          <div
            className="absolute top-0 bottom-0 z-20 hidden lg:flex items-center transition-all duration-300 ease-in-out"
            style={{ right: isRightPanelHidden ? "0px" : "25%" }}
          >
            <button
              onClick={() => setIsRightPanelHidden((p) => !p)}
              className="relative translate-x-1/2 w-4 h-full flex items-center justify-center group bg-white/0 hover:bg-white/50 transition-colors rounded-r-lg"
              title={isRightPanelHidden ? "Покажи панела" : "Скрий панела"}
            >
              <div
                className={`cursor-pointer p-0 flex rounded-l-md items-center group-hover:bg-gray-50 group-hover:shadow-md shadow-xs border border-gray-50/50 group-hover:border-gray-100 transition-all ${
                  isRightPanelHidden
                    ? "mr-5 h-10 rounded-l-md bg-gray-100"
                    : "h-full bg-white"
                }`}
              >
                <div className="text-gray-500 group-hover:text-gray-800 transition-colors">
                  {isRightPanelHidden ? (
                    <ChevronLeftIcon className="h-5 w-5" />
                  ) : (
                    <ChevronRightIcon className="h-5 w-5" />
                  )}
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
      {/* --- Modals remain unchanged --- */}
      <UserModal
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        title="Редактирай потребител"
      >
        {updateLoading && (
          <div
            className="flex items-center justify-center p-4 text-center"
            style={{ minHeight: "450px" }}
          >
            Изпращане...
          </div>
        )}
        {updateError && !updateLoading && (
          <div className="p-4 mb-4 text-center text-red-600 bg-red-100 rounded-md">
            Грешка при запис: {updateError?.message || "Неизвестна грешка"}
          </div>
        )}
        {!updateLoading && (
          <UserForm
            key={user._id}
            onSubmit={handleFormSubmit}
            onClose={closeEditModal}
            initialData={user}
            submitButtonText={"Запази"}
            roles={rolesData?.getAllLeanRoles || []}
            rolesLoading={rolesLoading}
            rolesError={rolesError}
            isAdmin={isAdmin}
          />
        )}
      </UserModal>
      <SuccessConfirmationModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        message={successModalMessage}
      />
    </>
  );
};

export default User;
