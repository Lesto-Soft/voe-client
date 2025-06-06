// components/features/analyses/components/TopUserCard.tsx
import React from "react";
import UserAvatar from "../../../cards/UserAvatar";
import UserLink from "../../../global/UserLink";
import { TopUserStat } from "../types";

interface TopUserCardProps {
  title: string;
  stat: TopUserStat;
  actionText: string; // e.g., "signals", "answers", "approvals"
}

const TopUserCard: React.FC<TopUserCardProps> = ({
  title,
  stat,
  actionText,
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center min-h-[170px]">
      <h3 className="text-base font-semibold text-center text-gray-800 mb-3">
        {title}
      </h3>
      {stat ? (
        <>
          <UserAvatar
            name={stat.user.name}
            imageUrl={stat.user.avatar}
            size={48}
          />
          <div className="mt-2">
            {/* Assuming UserLink needs a 'type' prop, 'table' seems reasonable here */}
            <UserLink user={stat.user} type="table" />
          </div>
          <p className="text-sm text-gray-600 mt-1">
            <span className="font-bold">{stat.count}</span> {actionText}
          </p>
        </>
      ) : (
        <div className="flex-grow flex items-center justify-center">
          <p className="text-gray-500">Няма данни</p>
        </div>
      )}
    </div>
  );
};

export default TopUserCard;
