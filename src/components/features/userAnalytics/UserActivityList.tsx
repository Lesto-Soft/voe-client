// src/components/features/userAnalytics/UserActivityList.tsx
import React, { useMemo, useEffect, useState, useRef } from "react";
import { IUser, ICase, IAnswer, IComment } from "../../../db/interfaces";
import UserActivityItemCard from "./UserActivityItemCard";
import UserRatingActivityCard from "./UserRatingActivityCard";
import {
  InboxIcon,
  ArrowDownCircleIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";
import useUserActivityScrollPersistence from "../../../hooks/useUserActivityScrollPersistence";
import DateRangeSelector from "./DateRangeSelector";
import { parseActivityDate } from "../../../utils/dateUtils";

// Represents a case that the user has rated, with their average score
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

type ActivityTab =
  | "all"
  | "cases"
  | "answers"
  | "comments"
  | "ratings"
  | "approvals"
  | "finances";

interface UserActivityListProps {
  user: IUser | undefined | null;
  isLoading?: boolean;
  counts: {
    all: number;
    cases: number;
    answers: number;
    comments: number;
    ratings: number;
    approvals: number;
    finances: number;
  };
  userId?: string;
  dateRange: { startDate: Date | null; endDate: Date | null };
  onDateRangeChange: (range: {
    startDate: Date | null;
    endDate: Date | null;
  }) => void;
}

const UserActivityList: React.FC<UserActivityListProps> = ({
  user,
  isLoading,
  counts,
  userId,
  dateRange,
  onDateRangeChange,
}) => {
  const [isDateFilterVisible, setIsDateFilterVisible] = useState(false);

  // ✅ MODIFIED: Changed from && to || to show active state if at least one date is selected.
  const isDateFilterActive =
    dateRange.startDate !== null || dateRange.endDate !== null;

  const isDataReady = !isLoading && !!user;

  // Add ref for the tabs container
  const tabsContainerRef = useRef<HTMLDivElement>(null);

  const {
    activeTab,
    visibleCounts,
    scrollableActivityListRef,
    handleTabChange,
    handleLoadMoreItems,
    resetScrollAndVisibleCount,
  } = useUserActivityScrollPersistence(userId, isDataReady);

  useEffect(() => {
    if (resetScrollAndVisibleCount) {
      resetScrollAndVisibleCount();
    }
  }, [dateRange, resetScrollAndVisibleCount]);

  // Add effect for horizontal scrolling with mouse wheel
  useEffect(() => {
    const scrollContainer = tabsContainerRef.current;

    if (!scrollContainer) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        const scrollAmount = e.deltaY * 1.5;
        scrollContainer.scrollBy({
          left: scrollAmount,
          behavior: "smooth",
        });
      }
    };

    scrollContainer.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      scrollContainer.removeEventListener("wheel", handleWheel);
    };
  }, []);

  const allActivities = useMemo((): CombinedActivity[] => {
    if (!user) return [];

    const isInDateRange = (itemDateStr: string | number) => {
      const { startDate, endDate } = dateRange;
      if (!startDate && !endDate) return true;

      const itemDate = parseActivityDate(itemDateStr);

      if (startDate && itemDate < startDate) {
        return false;
      }
      if (endDate && itemDate > endDate) {
        return false;
      }
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

    const activities: CombinedActivity[] = [];

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
        .filter((a) => {
          const dateToFilterBy = a.approved_date || a.date;
          return isInDateRange(dateToFilterBy);
        })
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
        .filter((a) => {
          const dateToFilterBy = a.financial_approved_date || a.date;
          return isInDateRange(dateToFilterBy);
        })
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
        item: {
          case: value.caseData,
          averageScore,
        },
        activityType: "rating",
      });
    });

    return activities.sort((a, b) => {
      return (
        parseActivityDate(b.date).getTime() -
        parseActivityDate(a.date).getTime()
      );
    });
  }, [user, dateRange]);

  const activitiesToDisplay = useMemo((): CombinedActivity[] => {
    let baseActivities: CombinedActivity[];
    switch (activeTab) {
      case "cases":
        baseActivities = allActivities.filter((a) => a.activityType === "case");
        break;
      case "answers":
        baseActivities = allActivities.filter(
          (a) => a.activityType === "answer"
        );
        break;
      case "comments":
        baseActivities = allActivities.filter(
          (a) => a.activityType === "comment"
        );
        break;
      case "ratings":
        baseActivities = allActivities.filter(
          (a) => a.activityType === "rating"
        );
        break;
      case "approvals":
        baseActivities = allActivities.filter(
          (a) => a.activityType === "base_approval"
        );
        break;
      case "finances":
        baseActivities = allActivities.filter(
          (a) => a.activityType === "finance_approval"
        );
        break;
      case "all":
      default:
        baseActivities = allActivities;
        break;
    }
    return baseActivities.slice(0, visibleCounts[activeTab]);
  }, [activeTab, allActivities, visibleCounts]);

  const tabs: { key: ActivityTab; label: string; count: number }[] = [
    { key: "all", label: "Всички", count: counts.all },
    { key: "cases", label: "Сигнали", count: counts.cases },
    { key: "answers", label: "Решения", count: counts.answers },
    { key: "comments", label: "Коментари", count: counts.comments },
    { key: "ratings", label: "Оценки", count: counts.ratings },
    { key: "approvals", label: "Одобрени", count: counts.approvals },
    { key: "finances", label: "Финансирани", count: counts.finances },
  ];

  const getCurrentTabTotalCount = (): number => {
    switch (activeTab) {
      case "cases":
        return allActivities.filter((a) => a.activityType === "case").length;
      case "answers":
        return allActivities.filter((a) => a.activityType === "answer").length;
      case "comments":
        return allActivities.filter((a) => a.activityType === "comment").length;
      case "ratings":
        return allActivities.filter((a) => a.activityType === "rating").length;
      case "approvals":
        return allActivities.filter((a) => a.activityType === "base_approval")
          .length;
      case "finances":
        return allActivities.filter(
          (a) => a.activityType === "finance_approval"
        ).length;
      case "all":
      default:
        return allActivities.length;
    }
  };

  const totalItemsForCurrentTab = getCurrentTabTotalCount();
  const canLoadMore = totalItemsForCurrentTab > visibleCounts[activeTab];

  if (isLoading) {
    return (
      <div className="lg:col-span-6 bg-white rounded-lg shadow-lg flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-200 animate-pulse">
          <div className="flex space-x-2 sm:space-x-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-8 bg-gray-200 rounded-md w-24"></div>
            ))}
          </div>
        </div>
        <div className="p-4 space-y-3 animate-pulse">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="p-4 bg-gray-100 rounded">
              <div className="flex items-start space-x-3">
                <div className="h-6 w-6 bg-gray-200 rounded-md"></div>
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="lg:col-span-6 bg-white rounded-lg shadow-lg flex flex-col overflow-hidden max-h-full">
      <div className="p-1 sm:p-2 border-b border-gray-200">
        <div className="flex items-center justify-between pb-1">
          <div
            ref={tabsContainerRef}
            className="flex py-1 space-x-1 sm:space-x-2 mr-5 overflow-x-auto custom-scrollbar-xs"
          >
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                disabled={tab.count === 0 && activeTab !== tab.key}
                className={`hover:cursor-pointer px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-colors duration-150 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
                  activeTab === tab.key
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsDateFilterVisible((prev) => !prev)}
            title="Filter by date"
            className={`hover:cursor-pointer p-2 rounded-md transition-colors duration-150 ${
              isDateFilterVisible
                ? "bg-indigo-100 text-indigo-600" // Style when selector is OPEN
                : isDateFilterActive
                ? "bg-indigo-100 text-gray-500" // Style when selector is CLOSED but filter is ACTIVE
                : "bg-gray-100 text-gray-500 hover:bg-gray-200" // Style when selector is CLOSED and INACTIVE
            }`}
          >
            <CalendarDaysIcon className="h-5 w-5" />
          </button>
        </div>

        {isDateFilterVisible && (
          <div className=" border-t pt-1 border-gray-200">
            <DateRangeSelector
              dateRange={dateRange}
              onDateRangeChange={onDateRangeChange}
            />
          </div>
        )}
      </div>

      <div
        ref={scrollableActivityListRef}
        className="flex-1 overflow-y-auto custom-scrollbar"
      >
        {activitiesToDisplay.length > 0 ? (
          <>
            <div>
              {activitiesToDisplay.map((activity) =>
                activity.activityType === "rating" ? (
                  <UserRatingActivityCard
                    key={activity.id}
                    ratedCase={(activity.item as RatedCaseActivity).case}
                    averageScore={
                      (activity.item as RatedCaseActivity).averageScore
                    }
                    date={activity.date}
                    actor={user!}
                  />
                ) : (
                  <UserActivityItemCard
                    key={activity.id}
                    item={activity.item as ICase | IAnswer | IComment}
                    activityType={
                      activity.activityType as
                        | "case"
                        | "answer"
                        | "comment"
                        | "base_approval"
                        | "finance_approval"
                    }
                    actor={user!}
                    date={activity.date}
                  />
                )
              )}
            </div>

            {canLoadMore && (
              <div className="p-4 flex justify-center mt-2 mb-2">
                <button
                  onClick={handleLoadMoreItems}
                  className="flex items-center px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600 transition-colors duration-150"
                >
                  <ArrowDownCircleIcon className="h-5 w-5 mr-2" />
                  Зареди още... (
                  {totalItemsForCurrentTab - visibleCounts[activeTab]} остават)
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-10 text-gray-500 min-h-[200px]">
            <InboxIcon className="h-12 w-12 mb-3 text-gray-300" />
            <p className="text-md font-medium">
              Няма активности в тази категория
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserActivityList;
