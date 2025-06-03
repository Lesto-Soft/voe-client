// src/components/features/userAnalytics/UserActivityList.tsx
import React, { useMemo, useState } from "react";
import { IUser, ICase, IAnswer, IComment } from "../../../db/interfaces"; // Adjust path
import UserActivityItemCard from "./UserActivityItemCard"; // Adjust path
import { InboxIcon, ArrowDownCircleIcon } from "@heroicons/react/24/outline";

// Define a type for the combined activity item
interface CombinedActivity {
  id: string; // Unique key for React list
  date: string;
  item: ICase | IAnswer | IComment;
  activityType: "case" | "answer" | "comment";
}

interface UserActivityListProps {
  user: IUser | undefined | null;
  isLoading?: boolean;
  // For simplicity now, we'll display a fixed number of initial items
  // and a "load more" for the rest, rather than full pagination per type.
  // This component will manage its own visible count for the combined feed.
}

const INITIAL_VISIBLE_ACTIVITIES = 10; // Number of activities to show initially

const UserActivityList: React.FC<UserActivityListProps> = ({
  user,
  isLoading,
}) => {
  const [visibleActivityCount, setVisibleActivityCount] = useState<number>(
    INITIAL_VISIBLE_ACTIVITIES
  );

  const combinedActivities = useMemo((): CombinedActivity[] => {
    if (!user) return [];

    const activities: CombinedActivity[] = [];

    if (user.cases) {
      user.cases.forEach((caseItem) => {
        activities.push({
          id: `case-${caseItem._id}`,
          date: caseItem.date,
          item: caseItem,
          activityType: "case",
        });
      });
    }
    if (user.answers) {
      user.answers.forEach((answerItem) => {
        activities.push({
          id: `answer-${answerItem._id}`,
          date: answerItem.date,
          item: answerItem,
          activityType: "answer",
        });
      });
    }
    if (user.comments) {
      user.comments.forEach((commentItem) => {
        activities.push({
          id: `comment-${commentItem._id}`,
          date: commentItem.date,
          item: commentItem,
          activityType: "comment",
        });
      });
    }

    // Sort by date, newest first
    return activities.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [user]);

  const activitiesToDisplay = combinedActivities.slice(0, visibleActivityCount);
  const canLoadMore = combinedActivities.length > visibleActivityCount;

  const handleLoadMoreActivities = () => {
    setVisibleActivityCount(
      (prevCount) => prevCount + INITIAL_VISIBLE_ACTIVITIES
    );
  };

  if (isLoading) {
    return (
      <div className="lg:col-span-6 bg-white rounded-lg shadow-lg flex flex-col overflow-hidden">
        <div className="p-4 space-y-3 animate-pulse">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="p-4 bg-gray-100 rounded">
              <div className="flex items-start space-x-3">
                <div className="h-6 w-6 bg-gray-200 rounded-md"></div>
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!user || combinedActivities.length === 0) {
    return (
      <div className="lg:col-span-6 bg-white rounded-lg shadow-lg flex flex-col items-center justify-center text-center p-10 text-gray-500 min-h-[300px]">
        <InboxIcon className="h-16 w-16 mb-4 text-gray-300" />
        <p className="text-lg font-medium">Няма регистрирана активност</p>
        <p className="text-sm">
          Потребителят все още няма създадени сигнали, отговори или коментари.
        </p>
      </div>
    );
  }

  return (
    <div className="lg:col-span-6 bg-white rounded-lg shadow-lg flex flex-col overflow-hidden">
      {/* Optional: Add a title for this section if needed, e.g., "User Activity Feed" */}
      {/* <h2 className="p-4 text-lg font-semibold text-gray-700 border-b">Активност</h2> */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {" "}
        {/* Add max-height if needed or rely on parent's height constraint */}
        {activitiesToDisplay.map((activity) => (
          <UserActivityItemCard
            key={activity.id}
            item={activity.item}
            activityType={activity.activityType}
            actor={user} // The user whose profile it is
          />
        ))}
        {canLoadMore && (
          <div className="p-4 flex justify-center mt-2 mb-2">
            <button
              onClick={handleLoadMoreActivities}
              className="flex items-center px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
            >
              <ArrowDownCircleIcon className="h-5 w-5 mr-2" />
              Зареди още ({combinedActivities.length -
                visibleActivityCount}{" "}
              остават)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserActivityList;
