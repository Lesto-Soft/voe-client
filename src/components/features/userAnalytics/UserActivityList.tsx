// src/components/features/userAnalytics/UserActivityList.tsx
import React, { useMemo } from "react";
import { IUser, ICase, IAnswer, IComment } from "../../../db/interfaces"; // Adjust path
import UserActivityItemCard from "./UserActivityItemCard"; // Adjust path
import { InboxIcon, ArrowDownCircleIcon } from "@heroicons/react/24/outline";
import useUserActivityScrollPersistence from "../../../hooks/useUserActivityScrollPersistence"; // Adjust path

interface CombinedActivity {
  id: string;
  date: string;
  item: ICase | IAnswer | IComment;
  activityType: "case" | "answer" | "comment"; // Union of literal types
}

type ActivityTab = "all" | "cases" | "answers" | "comments";

interface UserActivityListProps {
  user: IUser | undefined | null;
  isLoading?: boolean;
  counts: {
    cases: number;
    answers: number;
    comments: number;
    all: number;
  };
  userId?: string; // Add userId prop for the hook
}

const UserActivityList: React.FC<UserActivityListProps> = ({
  user,
  isLoading,
  counts,
  userId,
}) => {
  // Determine if data is ready for scroll persistence
  const isDataReady = !isLoading && !!user;

  const {
    activeTab,
    visibleCounts,
    scrollableActivityListRef,
    handleTabChange,
    handleLoadMoreItems,
  } = useUserActivityScrollPersistence(userId, isDataReady);

  const allActivities = useMemo((): CombinedActivity[] => {
    if (!user) return [];
    const activities: CombinedActivity[] = [];

    if (user.cases) {
      user.cases.forEach((caseItem) =>
        activities.push({
          id: `case-${caseItem._id}`,
          date: caseItem.date,
          item: caseItem,
          activityType: "case" as "case",
        })
      );
    }

    if (user.answers) {
      user.answers.forEach((answerItem) =>
        activities.push({
          id: `answer-${answerItem._id}`,
          date: answerItem.date,
          item: answerItem,
          activityType: "answer" as "answer",
        })
      );
    }

    if (user.comments) {
      user.comments.forEach((commentItem) =>
        activities.push({
          id: `comment-${commentItem._id}`,
          date: commentItem.date,
          item: commentItem,
          activityType: "comment" as "comment",
        })
      );
    }

    return activities.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [user]);

  const activitiesToDisplay = useMemo((): CombinedActivity[] => {
    if (!user) return [];

    let baseActivities: CombinedActivity[] = [];

    switch (activeTab) {
      case "cases":
        baseActivities =
          user.cases
            ?.map(
              (item): CombinedActivity => ({
                id: `case-${item._id}`,
                date: item.date,
                item,
                activityType: "case" as "case",
              })
            )
            .sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            ) || [];
        break;
      case "answers":
        baseActivities =
          user.answers
            ?.map(
              (item): CombinedActivity => ({
                id: `answer-${item._id}`,
                date: item.date,
                item,
                activityType: "answer" as "answer",
              })
            )
            .sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            ) || [];
        break;
      case "comments":
        baseActivities =
          user.comments
            ?.map(
              (item): CombinedActivity => ({
                id: `comment-${item._id}`,
                date: item.date,
                item,
                activityType: "comment" as "comment",
              })
            )
            .sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            ) || [];
        break;
      case "all":
      default:
        baseActivities = allActivities;
        break;
    }

    // Apply visible count limit
    return baseActivities.slice(0, visibleCounts[activeTab]);
  }, [user, activeTab, allActivities, visibleCounts]);

  const tabs: { key: ActivityTab; label: string; count: number }[] = [
    { key: "all", label: "Всички", count: counts.all },
    { key: "cases", label: "Сигнали", count: counts.cases },
    { key: "answers", label: "Отговори", count: counts.answers },
    { key: "comments", label: "Коментари", count: counts.comments },
  ];

  // Get the total count for the current tab to determine if we can load more
  const getCurrentTabTotalCount = (): number => {
    switch (activeTab) {
      case "cases":
        return user?.cases?.length || 0;
      case "answers":
        return user?.answers?.length || 0;
      case "comments":
        return user?.comments?.length || 0;
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
      <div className="p-3 sm:p-4 border-b border-gray-200">
        <div className="flex space-x-1 sm:space-x-2 overflow-x-auto pb-1 custom-scrollbar-xs">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-colors duration-150 focus:outline-none
                ${
                  activeTab === tab.key
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      <div
        ref={scrollableActivityListRef}
        className="flex-1 overflow-y-auto custom-scrollbar"
      >
        {activitiesToDisplay.length > 0 ? (
          <>
            <div>
              {activitiesToDisplay.map((activity) => (
                <UserActivityItemCard
                  key={activity.id}
                  item={activity.item}
                  activityType={activity.activityType}
                  actor={user!}
                />
              ))}
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
