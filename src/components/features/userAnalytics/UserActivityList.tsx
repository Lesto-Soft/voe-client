// src/components/features/userAnalytics/UserActivityList.tsx
import React, { useMemo, useEffect, useState } from "react"; // 1. Import useEffect
import { IUser, ICase, IAnswer, IComment } from "../../../db/interfaces";
import UserActivityItemCard from "./UserActivityItemCard";
import {
  InboxIcon,
  ArrowDownCircleIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";
import useUserActivityScrollPersistence from "../../../hooks/useUserActivityScrollPersistence";
import DateRangeSelector from "./DateRangeSelector"; // 2. Import the new component

interface CombinedActivity {
  id: string;
  date: string;
  item: ICase | IAnswer | IComment;
  activityType: "case" | "answer" | "comment";
}

type ActivityTab = "all" | "cases" | "answers" | "comments";

// 3. Update the props interface
interface UserActivityListProps {
  user: IUser | undefined | null;
  isLoading?: boolean;
  counts: {
    cases: number;
    answers: number;
    comments: number;
    all: number;
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
  dateRange, // Destructure new props
  onDateRangeChange, // Destructure new props
}) => {
  // 3. ADD STATE FOR THE FILTER VISIBILITY
  const [isDateFilterVisible, setIsDateFilterVisible] = useState(false);
  const isDataReady = !isLoading && !!user;

  const {
    activeTab,
    visibleCounts,
    scrollableActivityListRef,
    handleTabChange,
    handleLoadMoreItems,
    resetScrollAndVisibleCount,
  } = useUserActivityScrollPersistence(userId, isDataReady);

  // 4. ADD EFFECT TO RESET SCROLL ON DATE CHANGE
  // This improves user experience by resetting the view when the data fundamentally changes.

  useEffect(() => {
    if (resetScrollAndVisibleCount) {
      resetScrollAndVisibleCount();
    }
  }, [dateRange, resetScrollAndVisibleCount]);

  // 5. ADD FILTERING LOGIC TO MEMOIZED ACTIVITIES
  const allActivities = useMemo((): CombinedActivity[] => {
    if (!user) return [];
    const isInDateRange = (itemDateStr: string) => {
      if (!dateRange.startDate || !dateRange.endDate) return true;
      const itemDate = new Date(itemDateStr);
      return itemDate >= dateRange.startDate && itemDate <= dateRange.endDate;
    };
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
    return activities.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [user, dateRange]);

  // This will now automatically be filtered because it's derived from `allActivities`
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
    { key: "answers", label: "Отговори", count: counts.answers },
    { key: "comments", label: "Коментари", count: counts.comments },
  ];

  // Logic for `getCurrentTabTotalCount` and `canLoadMore` should now use the filtered `allActivities`
  const getCurrentTabTotalCount = (): number => {
    switch (activeTab) {
      case "cases":
        return allActivities.filter((a) => a.activityType === "case").length;
      case "answers":
        return allActivities.filter((a) => a.activityType === "answer").length;
      case "comments":
        return allActivities.filter((a) => a.activityType === "comment").length;
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
        {/* 4. UPDATE THE LAYOUT FOR TABS AND THE NEW TOGGLE BUTTON */}
        <div className="flex items-center justify-between pb-1">
          {/* Container for the tabs */}
          <div className="flex space-x-1 sm:space-x-2 overflow-x-auto custom-scrollbar-xs">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`hover:cursor-pointer px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-colors duration-150 focus:outline-none ${
                  activeTab === tab.key
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* The new button to toggle the date filter */}
          <button
            onClick={() => setIsDateFilterVisible((prev) => !prev)}
            title="Filter by date"
            className={`hover:cursor-pointer p-2 rounded-md transition-colors duration-150 ${
              isDateFilterVisible
                ? "bg-indigo-100 text-indigo-600"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            <CalendarDaysIcon className="h-5 w-5" />
          </button>
        </div>

        {/* 5. CONDITIONALLY RENDER THE DATE SELECTOR BELOW THE TABS */}
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
