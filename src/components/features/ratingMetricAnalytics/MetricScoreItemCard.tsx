import React from "react";
import { IMetricScore } from "../../../db/interfaces";
import ShowDate from "../../global/ShowDate";
import CaseLink from "../../global/CaseLink";
import UserLink from "../../global/UserLink";
import { StarIcon } from "@heroicons/react/24/solid";
import { TIERS } from "../../../utils/GLOBAL_PARAMETERS";

// Helper to determine color based on score
const getScoreCellStyle = (score: number | undefined | null): string => {
  if (!score || score === 0) return "text-gray-500";
  if (score >= TIERS.GOLD) return "text-amber-500";
  if (score >= TIERS.SILVER) return "text-slate-500";
  if (score >= TIERS.BRONZE) return "text-orange-700";
  return "text-red-500";
};

interface MetricScoreItemCardProps {
  score: IMetricScore;
}

const MetricScoreItemCard: React.FC<MetricScoreItemCardProps> = ({ score }) => {
  const tFunctionForCaseLink = (key: string): string => {
    if (key === "details_for") return "Детайли за";
    return key;
  };

  if (!score || !score.user || !score.case) {
    return (
      <div className="p-3 sm:p-4 border-b border-gray-200 text-sm text-red-500">
        Липсващи данни за този рейтинг.
      </div>
    );
  }

  const scoreColorClass = getScoreCellStyle(score.score);

  return (
    <div className="p-3 sm:p-4 border-b border-gray-100 hover:bg-gray-50 group transition-colors duration-150">
      {/* MODIFIED: Added flex-wrap and gap for responsiveness */}
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <div className="flex items-center flex-wrap gap-x-2 min-w-0 text-sm">
          <div className="flex-shrink-0">
            <UserLink user={score.user} />
          </div>
          <div className="text-gray-600 min-w-0 hidden sm:block">
            <span className="mx-0">даде</span>
          </div>
          <div
            className={`flex items-center justify-center font-bold ${scoreColorClass}`}
            title={`Оценка: ${score.score} от 5`}
          >
            <StarIcon className={`h-5 w-5 mr-1 ${scoreColorClass}`} />
            <span>{score.score} / 5</span>
          </div>
          <div className="text-gray-600 min-w-0 hidden sm:block">
            <span className="mx-0">на</span>
          </div>
          {/* MODIFIED: Removed fixed width div */}
          <div className="flex-shrink-0">
            <CaseLink my_case={score.case} t={tFunctionForCaseLink} />
          </div>
        </div>
        <div className="flex items-center space-x-4 self-center">
          <div className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
            <ShowDate date={score.date} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricScoreItemCard;
