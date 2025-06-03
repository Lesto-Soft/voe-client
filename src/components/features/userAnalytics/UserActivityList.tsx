// src/components/features/userAnalytics/UserActivityList.tsx
import React, { useMemo, useState } from "react";
import { IUser, ICase, IAnswer, IComment } from "../../../db/interfaces"; // Adjust path
import UserActivityItemCard from "./UserActivityItemCard"; // Adjust path
import { InboxIcon, ArrowDownCircleIcon } from "@heroicons/react/24/outline";

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
}

const UserActivityList: React.FC<UserActivityListProps> = ({
  user,
  isLoading,
  counts,
}) => {
  const [activeTab, setActiveTab] = useState<ActivityTab>("all");

  const allActivities = useMemo((): CombinedActivity[] => {
    if (!user) return [];
    const activities: CombinedActivity[] = [];
    if (user.cases) {
      user.cases.forEach((caseItem) =>
        activities.push({
          id: `case-${caseItem._id}`,
          date: caseItem.date,
          item: caseItem,
          activityType: "case" as "case", // Explicit type assertion
        })
      );
    }
    if (user.answers) {
      user.answers.forEach((answerItem) =>
        activities.push({
          id: `answer-${answerItem._id}`,
          date: answerItem.date,
          item: answerItem,
          activityType: "answer" as "answer", // Explicit type assertion
        })
      );
    }
    if (user.comments) {
      user.comments.forEach((commentItem) =>
        activities.push({
          id: `comment-${commentItem._id}`,
          date: commentItem.date,
          item: commentItem,
          activityType: "comment" as "comment", // Explicit type assertion
        })
      );
    }
    return activities.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [user]);

  const activitiesToDisplay = useMemo((): CombinedActivity[] => {
    if (!user) return [];
    switch (activeTab) {
      case "cases":
        return (
          user.cases
            ?.map(
              (item): CombinedActivity => ({
                // Ensure item maps to CombinedActivity
                id: `case-${item._id}`,
                date: item.date,
                item,
                activityType: "case" as "case", // Explicit type assertion
              })
            )
            .sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            ) || []
        );
      case "answers":
        return (
          user.answers
            ?.map(
              (item): CombinedActivity => ({
                // Ensure item maps to CombinedActivity
                id: `answer-${item._id}`,
                date: item.date,
                item,
                activityType: "answer" as "answer", // Explicit type assertion
              })
            )
            .sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            ) || []
        );
      case "comments":
        return (
          user.comments
            ?.map(
              (item): CombinedActivity => ({
                // Ensure item maps to CombinedActivity
                id: `comment-${item._id}`,
                date: item.date,
                item,
                activityType: "comment" as "comment", // Explicit type assertion
              })
            )
            .sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            ) || []
        );
      case "all":
      default:
        return allActivities;
    }
  }, [user, activeTab, allActivities]);

  const tabs: { key: ActivityTab; label: string; count: number }[] = [
    { key: "all", label: "Всички", count: counts.all },
    { key: "cases", label: "Сигнали", count: counts.cases },
    { key: "answers", label: "Отговори", count: counts.answers },
    { key: "comments", label: "Коментари", count: counts.comments },
  ];

  if (isLoading) {
    // ... (skeleton remains the same)
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
              onClick={() => setActiveTab(tab.key)}
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

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {activitiesToDisplay.length > 0 ? (
          activitiesToDisplay.map((activity) => (
            <UserActivityItemCard
              key={activity.id}
              item={activity.item}
              activityType={activity.activityType}
              actor={user!}
            />
          ))
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
