// src/components/case-components/CaseRatingDisplay.tsx (Refactored)

import React, { useMemo } from "react";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";
import { PlusIcon, CheckIcon } from "@heroicons/react/24/outline";
import { IMetricScore } from "../../db/interfaces";
import { caseBoxClasses, labelTextClass } from "../../ui/reusable-styles";

// --- REMOVED --- The old calculation utility functions are no longer needed here.

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
    // The average is now passed directly from the parent component.
    const avg = calculatedRating || 0;

    // We calculate the total number of unique raters.
    const uniqueUserIds = new Set(metricScores.map((score) => score.user._id));
    const total = uniqueUserIds.size;

    return {
      average: avg,
      totalRaters: total,
    };
  }, [metricScores, calculatedRating]);

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
            {[1, 2, 3, 4, 5].map((star) => (
              <StarSolid
                key={star}
                className={`h-4 w-4 ${
                  average >= star
                    ? "text-yellow-400"
                    : average >= star - 0.5
                    ? "text-yellow-400" // Half-star logic (optional but nice)
                    : "text-gray-300"
                }`}
              />
            ))}
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
