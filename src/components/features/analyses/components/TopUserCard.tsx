import React from "react";
import { TrophyIcon } from "@heroicons/react/24/outline"; // <-- NEW: Import from Heroicons
import UserAvatar from "../../../cards/UserAvatar";
import UserLink from "../../../global/UserLink";
import { TopUserStat } from "../types";

// The local TrophyIcon SVG component has been removed.

interface TopUserCardProps {
  title: string;
  stat: TopUserStat;
  actionText: string;
  onPodiumClick?: () => void;
}

const TopUserCard: React.FC<TopUserCardProps> = ({
  title,
  stat,
  actionText,
  onPodiumClick,
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center min-h-[270px] relative">
      {stat && onPodiumClick && (
        <button
          onClick={onPodiumClick}
          className="absolute top-2 right-2 p-1.5 rounded-full text-gray-400 hover:bg-yellow-100 hover:text-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-colors"
          title="Виж пълната класация"
        >
          {/* The usage remains the same, but it now renders the imported icon */}
          <TrophyIcon className="w-5 h-5" />
        </button>
      )}

      <h3 className="text-base font-semibold text-center text-gray-800 mb-3 px-8">
        {title}
      </h3>
      <div className="flex-grow flex flex-col justify-center items-center">
        {stat ? (
          <>
            <UserAvatar
              name={stat.user.name}
              imageUrl={stat.user.avatar}
              size={48}
            />
            <div className="mt-2">
              <UserLink user={stat.user} type="table" />
            </div>
            <p className="text-sm text-gray-600 mt-1">
              <span className="font-bold">{stat.count}</span> {actionText}
            </p>
          </>
        ) : (
          <p className="text-gray-500">Няма данни</p>
        )}
      </div>
    </div>
  );
};

export default TopUserCard;
