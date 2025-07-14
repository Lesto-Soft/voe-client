// src/components/features/userManagement/UserStats.tsx
import React from "react";
import StatCard from "../../cards/StatCard"; // Adjust path if necessary
import { Role } from "../../../types/userManagementTypes"; // Adjust path if necessary
import { capitalizeFirstLetter } from "../../../utils/stringUtils"; // Adjust path if necessary
import {
  UserGroupIcon,
  UserIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  ArchiveBoxXMarkIcon,
} from "@heroicons/react/24/solid";

interface UserStatsProps {
  filteredUserCount: number;
  absoluteTotalUserCount: number | null | undefined;
  hasActiveTextFilters?: boolean; // This prop seems unused in the provided snippet, kept for compatibility
  roles: Role[];
  filterRoleIds: string[];
  handleRoleFilterToggle: (roleId: string) => void;
  onShowAllUsers: () => void;
  dynamicRoleCounts: Record<string, number>;
  isLoadingOverallCounts?: boolean;
  isLoadingRoleDefinitions?: boolean;
}

const getRoleAppearance = (
  roleName: string
): { icon: React.ElementType; color: string } => {
  const nameLower = roleName.toLowerCase();
  if (nameLower.includes("админ")) {
    return { icon: BriefcaseIcon, color: "text-indigo-500" };
  }
  if (nameLower.includes("експерт")) {
    return { icon: AcademicCapIcon, color: "text-blue-500" };
  }
  if (nameLower.includes("напуснал") || nameLower.includes("archived")) {
    return { icon: ArchiveBoxXMarkIcon, color: "text-red-400" };
  }
  if (nameLower.includes("базов")) {
    return { icon: UserIcon, color: "text-gray-500" };
  }
  // Fallback for "placeholder-skeleton" or any other unknown role
  return { icon: UserIcon, color: "text-gray-500" };
};

const UserStats: React.FC<UserStatsProps> = ({
  filteredUserCount,
  absoluteTotalUserCount,
  roles,
  filterRoleIds,
  handleRoleFilterToggle,
  onShowAllUsers,
  dynamicRoleCounts,
  isLoadingOverallCounts = false,
  isLoadingRoleDefinitions = false,
}) => {
  const totalUsersDisplay = `${filteredUserCount} (от ${
    absoluteTotalUserCount ?? "N/A"
  })`;
  const showDivider = isLoadingRoleDefinitions || roles.length > 0;

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-start">
      <StatCard
        amount={totalUsersDisplay}
        title="Общо Потребители"
        icon={UserGroupIcon}
        iconColor="text-slate-500"
        isActive={filterRoleIds.length === 0}
        onClick={onShowAllUsers}
        isLoading={isLoadingOverallCounts}
        expectsOutOfTextFormat={true}
        className="w-full lg:w-52" // Responsive width
      />

      {showDivider && (
        <div
          aria-hidden="true"
          className="hidden lg:block self-stretch w-px mx-1 bg-gradient-to-b from-transparent via-gray-300 to-transparent"
        ></div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:flex lg:flex-row lg:flex-wrap lg:gap-3 lg:flex-1">
        {isLoadingRoleDefinitions && roles.length === 0
          ? // Pre-load 4 skeleton role cards
            Array.from({ length: 4 }).map((_, index) => {
              const appearance = getRoleAppearance("placeholder-skeleton");
              return (
                <StatCard
                  key={`skeleton-role-${index}`}
                  amount="" // No amount for skeleton text
                  title="..."
                  icon={appearance.icon}
                  iconColor={appearance.color}
                  isLoading={true}
                  expectsOutOfTextFormat={false}
                  className="w-full lg:w-45" // Responsive width
                />
              );
            })
          : // Display actual role cards
            roles.map((role) => {
              const appearance = getRoleAppearance(role.name);
              const isActive = filterRoleIds.includes(role._id);
              const roleUserCount = dynamicRoleCounts[role._id] ?? 0;

              return (
                <StatCard
                  key={role._id}
                  amount={roleUserCount}
                  title={capitalizeFirstLetter(role.name)}
                  icon={appearance.icon}
                  iconColor={appearance.color}
                  onClick={() => handleRoleFilterToggle(role._id)}
                  isActive={isActive}
                  isLoading={isLoadingRoleDefinitions}
                  expectsOutOfTextFormat={false}
                  className="w-full lg:w-45" // Responsive width
                />
              );
            })}
      </div>
    </div>
  );
};

export default UserStats;
