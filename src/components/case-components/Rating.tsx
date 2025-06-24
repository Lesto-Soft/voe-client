// src/components/case-components/Rating.tsx (Updated)

import React, { useMemo } from "react";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";
import { PlusIcon, CheckIcon } from "@heroicons/react/24/outline";
import { IRating } from "../../db/interfaces";
import { caseBoxClasses, labelTextClass } from "../../ui/reusable-styles";

// Utility function to calculate user rating (same as in modal)
const calculateUserRating = (
  scores: { metricName: string; score: number }[]
): number => {
  if (!scores || scores.length === 0) return 0;

  const validScores = scores.filter((s) => s.score > 0);
  if (validScores.length === 0) return 0;

  const sum = validScores.reduce((acc, s) => acc + s.score, 0);
  return sum / validScores.length;
};

// Utility function to calculate overall case rating
const calculateCaseRating = (ratings: IRating[]): number => {
  if (!ratings || ratings.length === 0) return 0;

  const userRatings = ratings.map((r) => calculateUserRating(r.scores));
  const validRatings = userRatings.filter((rating) => rating > 0);

  if (validRatings.length === 0) return 0;

  const sum = validRatings.reduce((acc, rating) => acc + rating, 0);
  return sum / validRatings.length;
};

interface MinimalRatingProps {
  ratings: IRating[];
  onOpenModal: () => void;
  disabled?: boolean;
  hasUserRated?: boolean;
}

const CaseRating: React.FC<MinimalRatingProps> = ({
  ratings = [],
  onOpenModal,
  disabled,
  hasUserRated = false,
}) => {
  const { average, total } = useMemo(() => {
    if (!ratings || ratings.length === 0) {
      return { average: 0, total: 0 };
    }

    // Use the calculation method
    const calculatedAverage = calculateCaseRating(ratings);

    return {
      average: calculatedAverage,
      total: ratings.length,
    };
  }, [ratings]);

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

      {total > 0 ? (
        <div className="space-y-1">
          <div
            className="flex items-center"
            title={`Средна оценка: ${average.toFixed(1)}`}
          >
            <span className="mr-1.5 text-base font-bold text-gray-800 tracking-tight">
              {average.toFixed(1)}
            </span>
            {[1, 2, 3, 4, 5].map((star) => (
              <StarSolid
                key={star}
                className={`h-4 w-4 ${
                  average >= star ? "text-yellow-400" : "text-gray-300"
                }`}
              />
            ))}
            <span className="ml-1 text-sm text-gray-500 font-medium">
              ({total})
            </span>
          </div>
          {/* {hasUserRated && (
            <div className="text-xs text-green-600 font-medium">
              Вие сте оценили
            </div>
          )} */}
        </div>
      ) : (
        <div className="mt-1">
          <span className="text-sm text-gray-400 italic">Няма оценки</span>
        </div>
      )}
    </div>
  );
};

export default CaseRating;
