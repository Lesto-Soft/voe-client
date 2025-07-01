import React, { useMemo, useState } from "react";
import { IMetricScore } from "../../../db/interfaces";
import MetricScoreItemCard from "./MetricScoreItemCard";
import DateRangeSelector from "../userAnalytics/DateRangeSelector";
import { InboxIcon, CalendarDaysIcon } from "@heroicons/react/24/outline"; // <-- Add CalendarDaysIcon
import { TIERS } from "../../../utils/GLOBAL_PARAMETERS";

// Define the types for our filter tabs
type TierTab = "all" | "gold" | "silver" | "bronze" | "problematic";

// Helper function to classify a score into a tier
const getTierForScore = (score: number): TierTab => {
  if (score >= TIERS.GOLD) return "gold";
  if (score >= TIERS.SILVER) return "silver";
  if (score >= TIERS.BRONZE) return "bronze";
  return "problematic";
};

interface MetricScoreListProps {
  scores: IMetricScore[];
  isLoading: boolean;
  dateRange: { startDate: Date | null; endDate: Date | null };
  onDateRangeChange: (range: {
    startDate: Date | null;
    endDate: Date | null;
  }) => void;
}

const MetricScoreList: React.FC<MetricScoreListProps> = ({
  scores,
  isLoading,
  dateRange,
  onDateRangeChange,
}) => {
  const [activeTab, setActiveTab] = useState<TierTab>("all");
  // NEW: State for the date filter visibility
  const [isDateFilterVisible, setIsDateFilterVisible] = useState(false);

  const dateFilteredScores = useMemo(() => {
    if (!dateRange.startDate || !dateRange.endDate) {
      return scores;
    }
    return scores.filter((score) => {
      const scoreDate = new Date(score.date);
      return (
        scoreDate >= dateRange.startDate! && scoreDate <= dateRange.endDate!
      );
    });
  }, [scores, dateRange]);

  const tierCounts = useMemo(() => {
    const counts: Record<TierTab, number> = {
      all: 0,
      gold: 0,
      silver: 0,
      bronze: 0,
      problematic: 0,
    };
    counts.all = dateFilteredScores.length;
    dateFilteredScores.forEach((score) => {
      const tier = getTierForScore(score.score);
      counts[tier]++;
    });
    return counts;
  }, [dateFilteredScores]);

  const finalFilteredScores = useMemo(() => {
    if (activeTab === "all") {
      return dateFilteredScores;
    }
    return dateFilteredScores.filter((score) => {
      const tier = getTierForScore(score.score);
      return tier === activeTab;
    });
  }, [dateFilteredScores, activeTab]);

  const tabs: { key: TierTab; label: string; count: number }[] = [
    { key: "all", label: "Всички", count: tierCounts.all },
    { key: "gold", label: "Отлични", count: tierCounts.gold },
    { key: "silver", label: "Добри", count: tierCounts.silver },
    { key: "bronze", label: "Средни", count: tierCounts.bronze },
    {
      key: "problematic",
      label: "Проблемни",
      count: tierCounts.problematic,
    },
  ];

  if (isLoading) {
    // ... skeleton loader remains the same
    return (
      <div className="lg:col-span-6 bg-white rounded-lg shadow-lg flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-200 animate-pulse">
          <div className="h-9 bg-gray-200 rounded-md w-full mb-3"></div>
          <div className="h-9 bg-gray-200 rounded-md w-full"></div>
        </div>
        <div className="p-4 space-y-3 animate-pulse">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="h-12 bg-gray-100 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="lg:col-span-6 bg-white rounded-lg shadow-lg flex flex-col overflow-hidden max-h-full">
      <div className="p-1 sm:p-2 border-b border-gray-200">
        <div className="flex items-center justify-between pb-1">
          {/* Tier Filter Tabs */}
          <div className="flex space-x-1 sm:space-x-2 overflow-x-auto custom-scrollbar-xs">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
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

          {/* The new button to toggle the date filter */}
          <button
            onClick={() => setIsDateFilterVisible((prev) => !prev)}
            title="Filter by date"
            className={`hover:cursor-pointer p-2 rounded-md transition-colors duration-150 ml-2 ${
              isDateFilterVisible
                ? "bg-indigo-100 text-indigo-600"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            <CalendarDaysIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Conditionally render the DateRangeSelector */}
        {isDateFilterVisible && (
          <div className=" border-t pt-1 border-gray-200">
            <DateRangeSelector
              dateRange={dateRange}
              onDateRangeChange={onDateRangeChange}
            />
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {finalFilteredScores.length > 0 ? (
          <div>
            {finalFilteredScores.map((score) => (
              <MetricScoreItemCard key={score._id} score={score} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-10 text-gray-500 h-full">
            <InboxIcon className="h-12 w-12 mb-3 text-gray-300" />
            <p className="text-md font-medium">Няма намерени оценки</p>
            <p className="text-sm">
              Няма оценки за избрания период или за тази метрика.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricScoreList;
