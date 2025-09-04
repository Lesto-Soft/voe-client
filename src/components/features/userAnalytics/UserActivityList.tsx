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
import { TIERS } from "../../../utils/GLOBAL_PARAMETERS";
import { StatsActivityType } from "./UserStatisticsPanel";
import { RatingTierLabel } from "../../../pages/User";
import FilterTag from "../../global/FilterTag";

// REMOVED: Local ActivityTab type is no longer needed

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

interface UserActivityListProps {
  user: IUser | undefined | null;
  activities: CombinedActivity[];
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
  isAnyFilterActive: boolean;
  onClearAllFilters: () => void;
  activeCategoryName: string | null;
  onClearCategoryFilter: () => void;
  activeRatingTier: RatingTierLabel;
  onClearRatingTierFilter: () => void;
  cardView?: "full" | "compact";
  // MODIFIED: Added props to control the component
  activeTab: StatsActivityType;
  onTabChange: (tab: StatsActivityType) => void;
}

const getTierForScore = (score: number): RatingTierLabel => {
  if (score >= TIERS.GOLD) return "Отлични";
  if (score >= TIERS.SILVER) return "Добри";
  if (score >= TIERS.BRONZE) return "Средни";
  return "Проблемни";
};

const UserActivityList: React.FC<UserActivityListProps> = ({
  user,
  activities,
  isLoading,
  counts,
  userId,
  dateRange,
  onDateRangeChange,
  isAnyFilterActive,
  onClearAllFilters,
  activeCategoryName,
  onClearCategoryFilter,
  activeRatingTier,
  onClearRatingTierFilter,
  cardView = "full",
  activeTab,
  onTabChange,
}) => {
  const [isDateFilterVisible, setIsDateFilterVisible] = useState(false);
  const isDateFilterActive =
    dateRange.startDate !== null || dateRange.endDate !== null;
  const isDataReady = !isLoading && !!user;
  const tabsContainerRef = useRef<HTMLDivElement>(null);

  const {
    visibleCounts,
    scrollableActivityListRef,
    handleLoadMoreItems,
    resetScrollAndVisibleCount,
  } = useUserActivityScrollPersistence(userId, activeTab, isDataReady); // MODIFIED: Pass activeTab to the hook

  useEffect(() => {
    if (resetScrollAndVisibleCount) {
      resetScrollAndVisibleCount();
    }
  }, [
    dateRange,
    activeCategoryName,
    activeRatingTier,
    resetScrollAndVisibleCount,
  ]);

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

  // NEW: This effect triggers whenever the active tab changes.
  useEffect(() => {
    // Find the HTML element for the currently active tab using its ID.
    const activeTabElement = document.getElementById(
      `activity-tab-${activeTab}`
    );

    // If the element is found, scroll it into the visible area.
    if (activeTabElement) {
      activeTabElement.scrollIntoView({
        behavior: "smooth", // For a smooth scrolling animation
        inline: "nearest", // Ensures horizontal alignment
        block: "nearest", // Ensures vertical alignment
      });
    }
  }, [activeTab]); // The effect depends on the activeTab prop.

  const activitiesToDisplay = useMemo((): CombinedActivity[] => {
    let baseActivities: CombinedActivity[];
    switch (activeTab) {
      case "cases":
        baseActivities = activities.filter((a) => a.activityType === "case");
        break;
      case "answers":
        baseActivities = activities.filter((a) => a.activityType === "answer");
        break;
      case "comments":
        baseActivities = activities.filter((a) => a.activityType === "comment");
        break;
      case "ratings":
        baseActivities = activities.filter((a) => a.activityType === "rating");
        break;
      case "approvals":
        baseActivities = activities.filter(
          (a) => a.activityType === "base_approval"
        );
        break;
      case "finances":
        baseActivities = activities.filter(
          (a) => a.activityType === "finance_approval"
        );
        break;
      case "all":
      default:
        baseActivities = activities;
        break;
    }
    return baseActivities.slice(0, visibleCounts[activeTab]);
  }, [activeTab, activities, visibleCounts]);

  const tabs: { key: StatsActivityType; label: string; count: number }[] = [
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
        return activities.filter((a) => a.activityType === "case").length;
      case "answers":
        return activities.filter((a) => a.activityType === "answer").length;
      case "comments":
        return activities.filter((a) => a.activityType === "comment").length;
      case "ratings":
        return activities.filter((a) => a.activityType === "rating").length;
      case "approvals":
        return activities.filter((a) => a.activityType === "base_approval")
          .length;
      case "finances":
        return activities.filter((a) => a.activityType === "finance_approval")
          .length;
      case "all":
      default:
        return activities.length;
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
    <div className="bg-white rounded-lg shadow-lg flex flex-col overflow-hidden max-h-full  h-full">
      <div className="p-1 sm:p-2 border-b border-gray-200">
        <div className="flex items-center justify-between pb-1">
          <div
            ref={tabsContainerRef}
            className="flex py-1 space-x-1 sm:space-x-2 mr-5 overflow-x-auto custom-scrollbar-xs"
          >
            {tabs.map((tab) => (
              <button
                key={tab.key}
                // ADDED: A unique ID to make the button findable in the DOM.
                id={`activity-tab-${tab.key}`}
                onClick={() => onTabChange(tab.key)}
                disabled={tab.count === 0}
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
                ? "bg-indigo-100 text-indigo-600"
                : isDateFilterActive
                ? "bg-indigo-100 text-gray-500"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
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
      {isAnyFilterActive && (
        <div className="px-4 py-2 border-b border-gray-200 bg-gray-50 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-gray-600 mr-2">
            Активни филтри:
          </span>
          {activeCategoryName && (
            <FilterTag
              label={`Категория: ${activeCategoryName}`}
              onRemove={onClearCategoryFilter}
            />
          )}
          {activeRatingTier !== "all" && (
            <FilterTag
              label={`Оценка: ${activeRatingTier}`}
              onRemove={onClearRatingTierFilter}
            />
          )}
          {isDateFilterActive && (
            <FilterTag
              label="Период"
              onRemove={() =>
                onDateRangeChange({ startDate: null, endDate: null })
              }
            />
          )}
          <button
            onClick={onClearAllFilters}
            className="cursor-pointer ml-auto text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
          >
            Изчисти всички
          </button>
        </div>
      )}
      <div
        ref={scrollableActivityListRef}
        className="flex-1 overflow-y-auto custom-scrollbar-xs"
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
                    view={cardView}
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
                    view={cardView}
                  />
                )
              )}
            </div>

            {canLoadMore && (
              <div className="p-4 flex justify-center mt-2 mb-2">
                <button
                  onClick={handleLoadMoreItems}
                  className="cursor-pointer flex items-center px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600 transition-colors duration-150"
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
