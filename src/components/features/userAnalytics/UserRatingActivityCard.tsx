import React from "react";
import { ICase, IUser } from "../../../db/interfaces";
import ShowDate from "../../global/ShowDate";
import CaseLink from "../../global/CaseLink";
import { StarIcon } from "@heroicons/react/24/outline";
import { TIERS } from "../../../utils/GLOBAL_PARAMETERS";

// Helper to get medal color style based on the score.
// This is duplicated from SortableMetricRow, but can be moved to a shared util file later.
const getScoreCellStyle = (score: number | undefined | null): string => {
  if (!score || score === 0) {
    return "font-bold text-gray-500"; // Default style for no score
  }
  if (score >= TIERS.GOLD) return "font-bold text-amber-500"; // Gold
  if (score >= TIERS.SILVER) return "font-bold text-slate-500"; // Silver
  if (score >= TIERS.BRONZE) return "font-bold text-orange-700"; // Bronze
  return "font-bold text-red-500"; // Below bronze
};

interface UserRatingActivityCardProps {
  ratedCase: ICase;
  averageScore: number;
  date: string;
  actor: IUser;
}

const UserRatingActivityCard: React.FC<UserRatingActivityCardProps> = ({
  ratedCase,
  averageScore,
  date,
}) => {
  // A simple t-function for CaseLink, as it expects one.
  function tFunctionForCaseLinkProp(key: string): string {
    if (key === "details_for") {
      return "Детайли за";
    }
    return key;
  }

  const scoreStyle = getScoreCellStyle(averageScore);

  return (
    <div className="p-3 sm:p-4 border-b border-gray-100 hover:bg-gray-50 group transition-colors duration-150">
      <div className="flex items-start space-x-2 sm:space-x-3">
        <div className="flex-shrink-0 pt-2">
          <StarIcon className="h-5 w-5 text-yellow-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between text-sm mb-1">
            <div className="flex items-baseline gap-x-1.5 min-w-0 mr-2 text-gray-700">
              {/* <span
                className="font-medium text-gray-800 truncate group-hover:text-blue-600 transition-colors"
                title={actor.name}
              >
                {actor.name}
              </span> */}
              <span className="whitespace-nowrap">Даде на сигнал</span>
              <div className="w-[70px] flex-shrink-0">
                <CaseLink my_case={ratedCase} t={tFunctionForCaseLinkProp} />
              </div>
              <div className="mt-2 text-sm flex items-center">
                <p className="text-gray-700"> оценка:</p>
                <p className={`ml-2 text-base ${scoreStyle}`}>
                  {averageScore.toFixed(2)}
                </p>
              </div>
            </div>
            {date && (
              <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0 mt-1 sm:mt-0 self-start sm:self-baseline">
                <ShowDate date={date} />
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserRatingActivityCard;
