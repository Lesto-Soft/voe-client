// src/components/features/categoryManagement/CategoryStats.tsx
import React from "react";
import StatCard from "../../cards/StatCard"; // Adjust path if necessary
import {
  ICaseStatus as CaseStatus,
  CASE_STATUS_DISPLAY_ORDER,
} from "../../../db/interfaces"; // Adjust path if necessary
import {
  ClipboardDocumentListIcon,
  FolderOpenIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ArchiveBoxXMarkIcon,
  CubeTransparentIcon,
} from "@heroicons/react/24/solid";

interface CategoryStatsProps {
  totalCaseCount: number;
  absoluteTotalCaseCountAllTime?: number | null;
  caseCountsByStatus: Record<CaseStatus | string, number>;
  activeCaseStatusFilter?: CaseStatus | string | null;
  onCaseStatusCardClick?: (status: CaseStatus | string | null) => void; // Modified to accept null
  isLoadingOverallCounts?: boolean;
  isLoadingStatusSpecificCounts?: boolean;
}

const STATUS_APPEARANCE: Record<
  CaseStatus,
  { icon: React.ElementType; color: string; label: string }
> = {
  [CaseStatus.Open]: {
    icon: FolderOpenIcon,
    color: "text-green-500",
    label: "Отворен", // Translated
  },
  [CaseStatus.InProgress]: {
    icon: ClockIcon,
    color: "text-yellow-500",
    label: "В Процес", // Translated
  },
  [CaseStatus.AwaitingFinance]: {
    icon: CurrencyDollarIcon,
    color: "text-blue-500",
    label: "За Финанси", // Translated
  },
  [CaseStatus.Closed]: {
    icon: ArchiveBoxXMarkIcon,
    color: "text-gray-500",
    label: "Затворен", // Translated
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
  const totalDisplayAmount =
    absoluteTotalCaseCountAllTime !== undefined &&
    absoluteTotalCaseCountAllTime !== null
      ? `${totalCaseCount} (от ${absoluteTotalCaseCountAllTime})`
      : `${totalCaseCount}`;

  const isMainCardActive =
    activeCaseStatusFilter === null || activeCaseStatusFilter === undefined;
  // Ensure CASE_STATUS_DISPLAY_ORDER is treated as an array, even if it might be undefined/null from props
  const displayOrder = Array.isArray(CASE_STATUS_DISPLAY_ORDER)
    ? CASE_STATUS_DISPLAY_ORDER
    : [];
  const showDivider = displayOrder.length > 0;

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-start">
      <StatCard
        amount={totalDisplayAmount}
        title={totalCasesTitle}
        icon={ClipboardDocumentListIcon}
        iconColor="text-slate-500"
        isLoading={isLoadingOverallCounts}
        expectsOutOfTextFormat={true}
        isActive={isMainCardActive}
        onClick={() => onCaseStatusCardClick && onCaseStatusCardClick(null)} // Pass null to deselect
        className="w-full lg:w-40" // Responsive width
      />

      {showDivider && (
        <div
          aria-hidden="true"
          className="hidden lg:block self-stretch w-px mx-1 bg-gradient-to-b from-transparent via-gray-300 to-transparent"
        ></div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:grid-cols-2 xl:grid-cols-4">
        {displayOrder.map((status) => {
          const appearance = STATUS_APPEARANCE[status] || {
            icon: CubeTransparentIcon,
            color: "text-gray-400",
            label: status.toString(), // Fallback label
          };
          const count = caseCountsByStatus[status] ?? 0;

          return (
            <StatCard
              key={status}
              amount={count}
              title={appearance.label} // Will use translated label
              icon={appearance.icon}
              iconColor={appearance.color}
              onClick={
                onCaseStatusCardClick
                  ? () => onCaseStatusCardClick(status)
                  : undefined
              }
              isActive={activeCaseStatusFilter === status}
              isLoading={isLoadingStatusSpecificCounts}
              expectsOutOfTextFormat={false}
            />
          );
        })}
      </div>
    </div>
  );
};

export default CategoryStats;
