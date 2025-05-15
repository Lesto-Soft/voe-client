// src/components/features/categoryManagement/CategoryStats.tsx
import React from "react";
import StatCard from "../../cards/StatCard"; // Adjust path as needed
import {
  ICaseStatus as CaseStatus,
  CASE_STATUS_DISPLAY_ORDER,
} from "../../../db/interfaces"; // Adjust path for your CaseStatus enum and display order
import {
  ClipboardDocumentListIcon, // For "Total Cases/Signals"
  FolderOpenIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ArchiveBoxXMarkIcon,
  CubeTransparentIcon, // Fallback icon
} from "@heroicons/react/24/solid";

// Define props for CategoryStats to display case counts
interface CategoryStatsProps {
  totalCaseCount: number; // Total number of cases/signals
  caseCountsByStatus: Record<CaseStatus, number>; // Counts for each specific status
}

// Define icon, color, and label mapping for case statuses for the StatCard
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
}) => {
  const totalCasesTitle = "Общо Сигнали";

  return (
    <div className="flex flex-row flex-wrap items-start gap-3">
      <StatCard
        amount={totalCaseCount}
        title={totalCasesTitle}
        icon={ClipboardDocumentListIcon} // Icon for "Total Cases/Signals"
        iconColor="text-slate-500"
        // No onClick or isActive as this is display-only for filtering
      />
      {/* Optional: Divider can be conditional or styled differently if needed */}
      {(CASE_STATUS_DISPLAY_ORDER || []).length > 0 && (
        <div
          aria-hidden="true"
          className="self-stretch w-px mx-1 bg-gradient-to-b from-transparent via-gray-300 to-transparent"
        ></div>
      )}
      {/* Map over CASE_STATUS_DISPLAY_ORDER to ensure consistent order */}
      {(CASE_STATUS_DISPLAY_ORDER || []).map((status) => {
        const appearance = STATUS_APPEARANCE[status] || {
          icon: CubeTransparentIcon, // Fallback icon
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
            // No onClick or isActive
          />
        );
      })}
    </div>
  );
};

export default CategoryStats;
