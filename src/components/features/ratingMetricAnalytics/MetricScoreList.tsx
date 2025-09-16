// src/components/features/ratingMetricAnalytics/MetricScoreList.tsx
import React, { useMemo, useState } from "react";
import { IMetricScore, ICategory } from "../../../db/interfaces";
import MetricScoreItemCard from "./MetricScoreItemCard";
import DateRangeSelector from "../userAnalytics/DateRangeSelector";
import {
  InboxIcon,
  CalendarDaysIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import FilterTag from "../../global/FilterTag";
import { TIERS } from "../../../utils/GLOBAL_PARAMETERS";

export type TierTab = "all" | "gold" | "silver" | "bronze" | "problematic";

const getTierForScore = (score: number): TierTab => {
  if (score >= TIERS.GOLD) return "gold";
  if (score >= TIERS.SILVER) return "silver";
  if (score >= TIERS.BRONZE) return "bronze";
  return "problematic";
};

// Update props to control the active tab from the parent
interface MetricScoreListProps {
  scores: IMetricScore[];
  isLoading: boolean;
  dateRange: { startDate: Date | null; endDate: Date | null };
  onDateRangeChange: (range: {
    startDate: Date | null;
    endDate: Date | null;
  }) => void;
  activeTierTab: TierTab;
  onTabChange: (tab: TierTab) => void;
  selectedUserId?: string | null;
  // --- ADD THESE NEW PROPS FOR FILTER TAGS ---
  isAnyFilterActive: boolean;
  onClearAllFilters: () => void;
  selectedUserName: string | null;
  onClearUserFilter: () => void;
  selectedCategoryId?: string | null;
  selectedCategoryName: string | null;
  onClearCategoryFilter: () => void;
}

const MetricScoreList: React.FC<MetricScoreListProps> = ({
  scores,
  isLoading,
  dateRange,
  onDateRangeChange,
  activeTierTab,
  onTabChange,
  selectedUserId,
  // --- DESTRUCTURE NEW PROPS ---
  isAnyFilterActive,
  onClearAllFilters,
  selectedUserName,
  onClearUserFilter,
  selectedCategoryId,
  selectedCategoryName,
  onClearCategoryFilter,
}) => {
  // --- REMOVED: The internal state for the active tab is gone ---
  // const [activeTab, setActiveTab] = useState<TierTab>("all");
  const [isDateFilterVisible, setIsDateFilterVisible] = useState(false);
  const isDateFilterActive =
    dateRange.startDate !== null || dateRange.endDate !== null;

  const dateFilteredScores = useMemo(() => {
    const { startDate, endDate } = dateRange;
    if (!startDate && !endDate) {
      return scores;
    }
    return scores.filter((score) => {
      const scoreDate = new Date(score.date);
      if (startDate && scoreDate < startDate) {
        return false;
      }
      if (endDate && scoreDate > endDate) {
        return false;
      }
      return true;
    });
  }, [scores, dateRange]);

  // this second memo filters by the selected user ID
  // --- RENAME this memo ---
  const userAndDateFilteredScores = useMemo(() => {
    if (!selectedUserId) {
      return dateFilteredScores;
    }
    return dateFilteredScores.filter(
      (score) => score.user._id === selectedUserId
    );
  }, [dateFilteredScores, selectedUserId]);

  // --- ADD NEW MEMO for category filtering ---
  const filteredScores = useMemo(() => {
    if (!selectedCategoryId) {
      return userAndDateFilteredScores;
    }
    return userAndDateFilteredScores.filter((score) => {
      const categories = score.case?.categories;
      if (!categories || categories.length === 0) {
        return selectedCategoryId === "unknown";
      }
      return categories.some(
        (cat: ICategory) => cat._id === selectedCategoryId
      );
    });
  }, [userAndDateFilteredScores, selectedCategoryId]);

  const tierCounts = useMemo(() => {
    const counts: Record<TierTab, number> = {
      all: 0,
      gold: 0,
      silver: 0,
      bronze: 0,
      problematic: 0,
    };
    counts.all = filteredScores.length;
    filteredScores.forEach((score) => {
      const tier = getTierForScore(score.score);
      counts[tier]++;
    });
    return counts;
  }, [filteredScores]);

  const finalScoresToDisplay = useMemo(() => {
    if (activeTierTab === "all") {
      return filteredScores;
    }
    return filteredScores.filter((score) => {
      const tier = getTierForScore(score.score);
      return tier === activeTierTab;
    });
  }, [filteredScores, activeTierTab]);

  const tabs: { key: TierTab; label: string; count: number }[] = [
    { key: "all", label: "Всички", count: tierCounts.all },
    { key: "gold", label: "Отлични", count: tierCounts.gold },
    { key: "silver", label: "Добри", count: tierCounts.silver },
    { key: "bronze", label: "Средни", count: tierCounts.bronze },
    { key: "problematic", label: "Проблемни", count: tierCounts.problematic },
  ];

  if (isLoading) {
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
          <div className="flex space-x-1 sm:space-x-2 overflow-x-auto custom-scrollbar-xs">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => onTabChange(tab.key)}
                disabled={tab.count === 0 && activeTierTab !== tab.key}
                className={`hover:cursor-pointer px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-colors duration-150 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
                  activeTierTab === tab.key
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
            title="Филтрирай по дата"
            className={`p-2 rounded-md transition-colors duration-150 ml-2 ${
              isDateFilterActive
                ? "bg-indigo-100 text-indigo-600 hover:bg-indigo-200"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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

        {/* --- NEW: Active Filters Display --- */}
        {isAnyFilterActive && (
          <div className="px-4 py-2 border-t mt-2 border-gray-200 bg-gray-50 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-gray-600 mr-2">
              Активни филтри:
            </span>
            {activeTierTab !== "all" && (
              <FilterTag
                label={`Оценка: ${
                  tabs.find((t) => t.key === activeTierTab)?.label
                }`}
                onRemove={() => onTabChange("all")}
              />
            )}
            {selectedUserId && selectedUserName && (
              <FilterTag
                label={`Потребител: ${selectedUserName}`}
                onRemove={onClearUserFilter}
              />
            )}
            {selectedCategoryId && selectedCategoryName && (
              <FilterTag
                label={`Категория: ${selectedCategoryName}`}
                onRemove={onClearCategoryFilter}
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
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar-xs">
        {finalScoresToDisplay.length > 0 ? (
          <div>
            {finalScoresToDisplay.map((score) => (
              <MetricScoreItemCard key={score._id} score={score} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-10 text-gray-500 h-full">
            <InboxIcon className="h-16 w-16 mb-4" />
            <p className="text-lg font-semibold">Няма намерени оценки</p>
            <p className="text-sm">
              Няма оценки, които да съвпадат с текущите филтри.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricScoreList;
