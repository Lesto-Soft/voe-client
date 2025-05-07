// src/components/features/userManagement/UserStats.tsx
import React from "react";
import StatCard from "../../cards/StatCard"; // Adjust path
import { Role } from "../../../page/types/userManagementTypes"; // Adjust path
import { capitalizeFirstLetter } from "../../../utils/stringUtils"; // Adjust path

interface UserStatsProps {
  filteredUserCount: number;
  absoluteTotalUserCount: number | null | undefined;
  hasActiveTextFilters: boolean;
  roles: Role[];
  filterRoleIds: string[];
  handleRoleFilterToggle: (roleId: string) => void;
  onShowAllUsers: () => void;
}

// Define colors here or import from a constants file
const roleColors = [
  "text-gray-500", // all
  "text-gray-400", // normal (example)
  "text-blue-400", // expert (example)
  "text-indigo-400", // admin (example)
  "text-red-300", // no longer employed (example)
];

const UserStats: React.FC<UserStatsProps> = ({
  filteredUserCount,
  absoluteTotalUserCount,
  roles,
  filterRoleIds,
  handleRoleFilterToggle,
  onShowAllUsers,
}) => {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:flex-wrap md:items-start">
      <StatCard
        amount={`${filteredUserCount} (от ${absoluteTotalUserCount})`} // Pass the calculated display value
        title="Общо потребители"
        iconColor={roleColors[0]}
        className="w-full md:w-auto"
        isActive={filterRoleIds.length === 0} // "All Users" card is active when no role filter is selected
        onClick={onShowAllUsers}
      />
      <div
        aria-hidden="true"
        className="hidden md:block self-stretch w-1 mx-2 bg-gradient-to-b from-transparent via-gray-300 to-transparent"
      ></div>
      <div className="grid grid-cols-2 gap-4 md:flex md:flex-wrap md:gap-4">
        {roles.map((role, index) => {
          const colorIndex = (index + 1) % roleColors.length;
          const dynamicColor = roleColors[colorIndex];
          const isActive = filterRoleIds.includes(role._id);
          return (
            <StatCard
              key={role._id}
              amount={role.users?.length || 0} // Role cards show their specific count
              title={capitalizeFirstLetter(role.name)}
              iconColor={dynamicColor}
              onClick={() => handleRoleFilterToggle(role._id)}
              isActive={isActive}
            />
          );
        })}
      </div>
    </div>
  );
};

export default UserStats;
