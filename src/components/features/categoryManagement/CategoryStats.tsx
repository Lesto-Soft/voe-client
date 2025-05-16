// src/components/features/categoryManagement/CategoryStats.tsx
import React from "react";
import StatCard from "../../cards/StatCard";
import {
  ICaseStatus as CaseStatus,
  CASE_STATUS_DISPLAY_ORDER,
} from "../../../db/interfaces";
import {
  ClipboardDocumentListIcon,
  FolderOpenIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ArchiveBoxXMarkIcon,
  CubeTransparentIcon,
} from "@heroicons/react/24/solid";

interface CategoryStatsProps {
  totalCaseCount: number; // Filtered total cases for current categories
  absoluteTotalCaseCountAllTime?: number | null; // Absolute total of all cases
  caseCountsByStatus: Record<CaseStatus | string, number>;
  activeCaseStatusFilter?: CaseStatus | string | null;
  onCaseStatusCardClick?: (status: CaseStatus | string) => void;
  isLoadingOverallCounts?: boolean; // For "Total Cases" card's numbers
  isLoadingStatusSpecificCounts?: boolean; // For individual status card numbers
}

const STATUS_APPEARANCE: Record<
  CaseStatus,
  { icon: React.ElementType; color: string; label: string }
> = {
  [CaseStatus.Open]: {
    icon: FolderOpenIcon,
    color: "text-green-500",
    label: "Open",
  },
  [CaseStatus.InProgress]: {
    icon: ClockIcon,
    color: "text-yellow-500",
    label: "In Progress",
  },
  [CaseStatus.AwaitingFinance]: {
    icon: CurrencyDollarIcon,
    color: "text-blue-500",
    label: "Awaiting Finance",
  },
  [CaseStatus.Closed]: {
    icon: ArchiveBoxXMarkIcon,
    color: "text-gray-500",
    label: "Closed",
  },
};

const CategoryStats: React.FC<CategoryStatsProps> = ({
  totalCaseCount,
  absoluteTotalCaseCountAllTime,
  caseCountsByStatus,
  activeCaseStatusFilter,
  onCaseStatusCardClick,
  isLoadingOverallCounts = false,
  isLoadingStatusSpecificCounts = false,
}) => {
  const totalCasesTitle = "Общо Сигнали";

  // Format the main total display string
  const totalDisplayAmount =
    absoluteTotalCaseCountAllTime !== undefined &&
    absoluteTotalCaseCountAllTime !== null
      ? `${totalCaseCount} (от ${absoluteTotalCaseCountAllTime})`
      : `${totalCaseCount}`; // Fallback if absolute total isn't available

  return (
    <div className="flex flex-row flex-wrap items-start gap-3">
      <StatCard
        amount={totalDisplayAmount}
        title={totalCasesTitle}
        icon={ClipboardDocumentListIcon}
        iconColor="text-slate-500"
        isLoading={isLoadingOverallCounts} // Use specific loading for this card
        // This card could also have an onClick to clear all filters if desired
      />
      {(CASE_STATUS_DISPLAY_ORDER || []).length > 0 && (
        <div
          aria-hidden="true"
          className="self-stretch w-px mx-1 bg-gradient-to-b from-transparent via-gray-300 to-transparent"
        ></div>
      )}
      {(CASE_STATUS_DISPLAY_ORDER || []).map((status) => {
        const appearance = STATUS_APPEARANCE[status] || {
          icon: CubeTransparentIcon,
          color: "text-gray-400",
          label: status.toString(), // Fallback label,
        };
        const count = caseCountsByStatus[status] ?? 0;

        return (
          <StatCard
            key={status}
            amount={count}
            title={appearance.label}
            icon={appearance.icon}
            iconColor={appearance.color}
            onClick={
              onCaseStatusCardClick
                ? () => onCaseStatusCardClick(status)
                : undefined
            }
            isActive={activeCaseStatusFilter === status}
            isLoading={isLoadingStatusSpecificCounts} // Use specific loading for these cards
          />
        );
      })}
    </div>
  );
};

export default CategoryStats;
