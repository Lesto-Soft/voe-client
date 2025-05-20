// src/components/features/userManagement/UserStats.tsx
import React from "react";
import StatCard from "../../cards/StatCard"; // Adjust path
import { Role } from "../../../types/userManagementTypes"; // Adjust path
import { capitalizeFirstLetter } from "../../../utils/stringUtils"; // Adjust path
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
  hasActiveTextFilters?: boolean;
  roles: Role[];
  filterRoleIds: string[];
  handleRoleFilterToggle: (roleId: string) => void;
  onShowAllUsers: () => void;
  dynamicRoleCounts: Record<string, number>;
  isLoadingOverallCounts?: boolean; // Loading for "Общо Потребители" card's numbers
  isLoadingRoleDefinitions?: boolean; // Loading for role list / base data for their dynamic counts
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
  if (nameLower.includes("нормален")) {
    return { icon: UserIcon, color: "text-gray-500" };
  }
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
  return (
    // Main container: flex row, wrap, align items to start, gap between items
    <div className="flex flex-row flex-wrap gap-3">
      <StatCard
        amount={totalUsersDisplay}
        title="Общо Потребители"
        icon={UserGroupIcon}
        iconColor="text-slate-500"
        // className="flex-shrink-0" // Allow shrinking but also growing if space
        isActive={filterRoleIds.length === 0}
        onClick={onShowAllUsers}
        isLoading={isLoadingOverallCounts} // Use specific loading state
      />
      {/* Optional: Divider can be conditional or styled differently if needed */}
      {roles.length > 0 && (
        <div
          aria-hidden="true"
          className="self-stretch w-px mx-1 bg-gradient-to-b from-transparent via-gray-300 to-transparent"
        ></div>
      )}
      {/* Container for role cards: also flex row, wrap, align start, gap */}
      {/* This inner div might not be strictly necessary if the main div handles wrapping well enough */}
      {roles.map((role) => {
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
            isLoading={isLoadingRoleDefinitions} // Use specific loading for role cards
          />
        );
      })}
    </div>
  );
};

export default UserStats;
