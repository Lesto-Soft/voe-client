// src/components/case-components/CaseRatingDisplay.tsx (Final UI Polish)

import React, { useMemo } from "react";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";
import { PlusIcon, CheckIcon } from "@heroicons/react/24/outline";
import { IMetricScore } from "../../db/interfaces";
import { caseBoxClasses, labelTextClass } from "../../ui/reusable-styles";

interface CaseRatingDisplayProps {
  metricScores: IMetricScore[];
  calculatedRating: number | null | undefined;
  onOpenModal: () => void;
  disabled?: boolean;
  hasUserRated?: boolean;
}

const CaseRatingDisplay: React.FC<CaseRatingDisplayProps> = ({
  metricScores = [],
  calculatedRating,
  onOpenModal,
  disabled,
  hasUserRated,
}) => {
  const { average, totalRaters } = useMemo(() => {
    const avg = calculatedRating || 0;
    const uniqueUserIds = new Set(metricScores.map((score) => score.user._id));
    const total = uniqueUserIds.size;
    return {
      average: avg,
      totalRaters: total,
    };
  }, [metricScores, calculatedRating]);

  // --- THIS IS THE CHANGE ---
  // Calculate the percentage width for the foreground stars
  const starFillPercentage = useMemo(() => {
    // Ensure the average is between 0 and 5, then calculate percentage
    const clampedAverage = Math.max(0, Math.min(5, average));
    return (clampedAverage / 5) * 100;
  }, [average]);

  return (
    <div className={`${caseBoxClasses} flex-col !items-start`}>
      <div className="flex items-center gap-1">
        <span className={labelTextClass}>Оценка:</span>
        {!disabled && (
          <button
            onClick={onOpenModal}
            className={`p-0.5 rounded-full transition-colors ${
              hasUserRated
                ? "text-green-600 hover:bg-green-50"
                : "text-blue-600 hover:bg-blue-50"
            }`}
            title={
              hasUserRated
                ? "Редактирайте вашата оценка"
                : "Добавете вашата оценка"
            }
          >
            {hasUserRated ? (
              <CheckIcon className="h-4 w-4" />
            ) : (
              <PlusIcon className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      {totalRaters > 0 ? (
        <div className="space-y-1 mt-1">
          <div
            className="flex items-center"
            title={`Средна оценка: ${average.toFixed(2)}`}
          >
            <span className="mr-1.5 text-base font-bold text-gray-800 tracking-tight">
              {average.toFixed(1)}
            </span>

            {/* --- THIS IS THE NEW JSX LOGIC --- */}
            <div className="relative flex">
              {/* Background Layer: Empty Stars */}
              <div className="flex text-gray-300">
                {[...Array(5)].map((_, i) => (
                  <StarSolid key={`bg-${i}`} className="h-4 w-4" />
                ))}
              </div>
              {/* Foreground Layer: Filled Stars (Clipped) */}
              <div
                className="absolute top-0 left-0 h-full overflow-hidden whitespace-nowrap flex"
                style={{ width: `${starFillPercentage}%` }}
              >
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <StarSolid key={`fg-${i}`} className="h-4 w-4" />
                  ))}
                </div>
              </div>
            </div>

            <span className="ml-1 text-sm text-gray-500 font-medium">
              ({totalRaters})
            </span>
          </div>
        </div>
      ) : (
        <div className="mt-1">
          <span className="text-sm text-gray-400 italic">Няма оценки</span>
        </div>
      )}
    </div>
  );
};

export default CaseRatingDisplay;
