// src/pages/User.tsx
import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import { useGetFullUserByUsername, useUpdateUser } from "../graphql/hooks/user";
import { useGetRoles } from "../graphql/hooks/role";
import { IMe, ICase, IAnswer, IComment } from "../db/interfaces";
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
import UserActivityList from "../components/features/userAnalytics/UserActivityList";
import UserStatisticsPanel, {
  UserTextStats,
} from "../components/features/userAnalytics/UserStatisticsPanel";
import UserModal from "../components/modals/UserModal";
import UserForm from "../components/forms/UserForm";
import SuccessConfirmationModal from "../components/modals/SuccessConfirmationModal";

// Constants & Utils
import { ROLES, TIERS } from "../utils/GLOBAL_PARAMETERS";
import { containsAnyCategoryById } from "../utils/arrayUtils";
import { useAuthorization } from "../hooks/useAuthorization";
import ForbiddenPage from "./ErrorPages/ForbiddenPage";

export type RatingTierLabel =
  | "Отлични"
  | "Добри"
  | "Средни"
  | "Проблемни"
  | "all";

// --- Helper types for this component ---
interface RatedCaseActivity {
  case: ICase;
  averageScore: number;
}
interface CombinedActivity {
  id: string;
  date: string;
  item: ICase | IAnswer | IComment | RatedCaseActivity;
  activityType:
    | "case"
    | "answer"
    | "comment"
    | "rating"
    | "base_approval"
    | "finance_approval";
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

  const currentUser = useCurrentUser() as IMe | undefined;

  const {
    loading: userLoading,
    error: userError,
    user,
    refetch: refetchUser,
  } = useGetFullUserByUsername(userUsernameFromParams);

  const { isAllowed, isLoading: authLoading } = useAuthorization({
    type: "user",
    data: user,
  });

  const pieChartStats = useUserActivityStats(
    user,
    dateRange.startDate,
    dateRange.endDate
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

  const filteredActivities = useMemo((): CombinedActivity[] => {
    if (!user) return [];

    const isInDateRange = (itemDateStr: string | number) => {
      const { startDate, endDate } = dateRange;
      if (!startDate && !endDate) return true;
      const itemDate = parseActivityDate(itemDateStr);
      if (startDate && itemDate < startDate) return false;
      if (endDate && itemDate > endDate) return false;
      return true;
    }; // --- 1. GATHER ALL ACTIVITIES ---

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
    }); // --- 2. APPLY FILTERS --- // CATEGORY FILTER

    if (activeCategoryName) {
      const activeCategoryId = pieChartStats?.signalsByCategoryChartData.find(
        (d) => d.label === activeCategoryName
      )?.id;

      if (activeCategoryId) {
        activities = activities.filter((activity) => {
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
    } // RATING TIER FILTER

    if (activeRatingTier !== "all") {
      activities = activities.filter((activity) => {
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
    } // --- 3. SORT FINAL LIST ---

    return activities.sort(
      (a, b) =>
        parseActivityDate(b.date).getTime() -
        parseActivityDate(a.date).getTime()
    );
  }, [user, dateRange, activeCategoryName, activeRatingTier, pieChartStats]);

  const filteredActivityCounts = useMemo(() => {
    const counts = {
      all: 0,
      cases: 0,
      answers: 0,
      comments: 0,
      ratings: 0,
      approvals: 0,
      finances: 0,
    };
    filteredActivities.forEach((activity) => {
      counts.all++;
      if (activity.activityType === "case") counts.cases++;
      else if (activity.activityType === "answer") counts.answers++;
      else if (activity.activityType === "comment") counts.comments++;
      else if (activity.activityType === "rating") counts.ratings++;
      else if (activity.activityType === "base_approval") counts.approvals++;
      else if (activity.activityType === "finance_approval") counts.finances++;
    });
    return counts;
  }, [filteredActivities]);

  const filteredTextStats = useMemo((): UserTextStats => {
    const filteredCases = filteredActivities
      .filter(
        (a) =>
          a.activityType === "case" ||
          a.activityType === "answer" ||
          a.activityType === "comment" ||
          a.activityType === "rating" ||
          a.activityType === "base_approval" ||
          a.activityType === "finance_approval"
      )
      .map((a) => {
        if (a.activityType === "case") return a.item as ICase;
        if (a.activityType === "answer") return (a.item as IAnswer).case;
        if (a.activityType === "comment")
          return (a.item as IComment).case || (a.item as IComment).answer?.case;
        if (a.activityType === "rating")
          return (a.item as RatedCaseActivity).case;
        if (
          a.activityType === "base_approval" ||
          a.activityType === "finance_approval"
        )
          return (a.item as IAnswer).case;
        return null;
      })
      .filter((c): c is ICase => c !== null);

    const uniqueCases = Array.from(
      new Map(filteredCases.map((c) => [c._id, c])).values()
    );

    let ratedCasesSum = 0;
    let ratedCasesCount = 0;
    uniqueCases.forEach((c) => {
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

  const isAnyFilterActive = useMemo(() => {
    return (
      dateRange.startDate !== null ||
      dateRange.endDate !== null ||
      activeCategoryName !== null ||
      activeRatingTier !== "all"
    );
  }, [dateRange, activeCategoryName, activeRatingTier]);

  const handleClearAllFilters = () => {
    setDateRange({ startDate: null, endDate: null });
    setActiveCategoryName(null);
    setActiveRatingTier("all");
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

  return (
    <>
      <div className="container min-w-full mx-auto p-2 sm:p-6 bg-gray-50 flex flex-col h-[calc(100vh-6rem)]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 overflow-hidden">
          <UserInformationPanel
            user={user}
            isLoading={userLoading && !!user}
            serverBaseUrl={serverBaseUrl}
            onEditUser={openEditModal}
            canEdit={canEdit}
          />
          <UserActivityList
            user={user}
            activities={filteredActivities}
            isLoading={userLoading && !!user}
            counts={filteredActivityCounts}
            userId={userUsernameFromParams}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            isAnyFilterActive={isAnyFilterActive}
            onClearAllFilters={handleClearAllFilters}
            activeCategoryName={activeCategoryName}
            onClearCategoryFilter={() => setActiveCategoryName(null)}
            activeRatingTier={activeRatingTier}
            onClearRatingTierFilter={() => setActiveRatingTier("all")}
          />
          <UserStatisticsPanel
            textStats={filteredTextStats}
            pieChartStats={pieChartStats}
            userName={user.name}
            isLoading={userLoading && !!user}
            onCategoryClick={handleCategoryClick}
            onRatingTierClick={handleRatingTierClick}
            activeCategoryLabel={activeCategoryName}
            activeRatingTierLabel={
              activeRatingTier !== "all"
                ? pieChartStats?.ratingTierDistributionData.find((d) =>
                    d.label.startsWith(activeRatingTier)
                  )?.label ?? null
                : null
            }
            activeCategoryFilter={activeCategoryName}
            activeRatingTierFilter={activeRatingTier}
          />
        </div>
      </div>
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
            Грешка при запис:
            {updateError?.message || "Неизвестна грешка"}
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
