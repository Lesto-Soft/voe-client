import React from "react";
import { UsersIcon } from "@heroicons/react/24/outline";

interface Props {
  totalUsers: number;
  expertCount: number;
  adminCount: number;
}

const RoleStatsCards: React.FC<Props> = ({
  totalUsers,
  expertCount,
  adminCount,
}) => {
  return (
    <div className="flex flex-wrap gap-4">
      <div className="flex min-w-[200px] items-center space-x-3 rounded-md border border-gray-200 bg-white p-4 shadow-sm">
        <UsersIcon className="h-8 w-8 text-gray-400" />
        <div>
          <p className="text-xs text-gray-500">Брой потребители</p>
          <p className="text-2xl font-semibold text-gray-800">{totalUsers}</p>
        </div>
      </div>
      <div className="flex min-w-[200px] items-center space-x-3 rounded-md border border-gray-200 bg-white p-4 shadow-sm">
        <div className="w-[32px]"></div>
        <div>
          <p className="text-xs text-gray-500">Експерти</p>
          <p className="text-2xl font-semibold text-gray-800">{expertCount}</p>
        </div>
      </div>
      <div className="flex min-w-[200px] items-center space-x-3 rounded-md border border-gray-200 bg-white p-4 shadow-sm">
        <div className="w-[32px]"></div>
        <div>
          <p className="text-xs text-gray-500">Администратори</p>
          <p className="text-2xl font-semibold text-gray-800">{adminCount}</p>
        </div>
      </div>
    </div>
  );
};

export default RoleStatsCards;
