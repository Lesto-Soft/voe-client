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
  totalCaseCount: number;
  caseCountsByStatus: Record<CaseStatus, number>;
  isLoading?: boolean; // New prop
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
  caseCountsByStatus,
  isLoading = false, // Default isLoading to false
}) => {
  const totalCasesTitle = "Общо Сигнали";

  return (
    <div className="flex flex-row flex-wrap items-start gap-3">
      <StatCard
        amount={totalCaseCount}
        title={totalCasesTitle}
        icon={ClipboardDocumentListIcon}
        iconColor="text-slate-500"
        isLoading={isLoading} // Pass isLoading prop
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
          label: "Unknown Status",
        };
        const count = caseCountsByStatus[status] ?? 0;

        return (
          <StatCard
            key={status}
            amount={count}
            title={appearance.label}
            icon={appearance.icon}
            iconColor={appearance.color}
            isLoading={isLoading} // Pass isLoading prop
          />
        );
      })}
    </div>
  );
};

export default CategoryStats;
