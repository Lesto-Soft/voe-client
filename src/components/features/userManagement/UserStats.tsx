// src/components/features/userManagement/UserStats.tsx
import React from "react";
import StatCard from "../../cards/StatCard"; // Adjust path
import { Role } from "../../../page/types/userManagementTypes"; // Adjust path
import { capitalizeFirstLetter } from "../../../utils/stringUtils"; // Adjust path

interface UserStatsProps {
  totalUserCount: number;
  roles: Role[];
  filterRoleIds: string[];
  handleRoleFilterToggle: (roleId: string) => void;
  onShowAllUsers: () => void;
}

const roleColors = [
  "text-gray-500", // all
  "text-gray-400", // normal
  "text-blue-400", // expert
  "text-indigo-400", // admin
  "text-red-300", // no longer employed
];

const UserStats: React.FC<UserStatsProps> = ({
  totalUserCount,
  roles,
  filterRoleIds,
  handleRoleFilterToggle,
  onShowAllUsers,
}) => {
  return (
    <section className="mb-6 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
      <div className="flex flex-col gap-4 md:flex-row md:flex-wrap md:items-start">
        <StatCard
          amount={totalUserCount ?? 0}
          title="Общо потребители"
          iconColor={roleColors[0]}
          className="w-full md:w-auto"
          isActive={filterRoleIds.length === 0}
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
                amount={role.users?.length || 0}
                title={capitalizeFirstLetter(role.name)}
                iconColor={dynamicColor}
                onClick={() => handleRoleFilterToggle(role._id)}
                isActive={isActive}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
};
export default UserStats;
