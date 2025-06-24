// src/components/case-components/Rating.tsx (Updated for smaller size)

import React, { useMemo } from "react";
import { StarIcon as StarSolid } from "@heroicons/react/24/solid";
import { PlusIcon } from "@heroicons/react/24/outline";
import { IRating } from "../../db/interfaces";
import { caseBoxClasses, labelTextClass } from "../../ui/reusable-styles";

interface MinimalRatingProps {
  ratings: IRating[];
  onOpenModal: () => void;
  disabled?: boolean;
}

const CaseRating: React.FC<MinimalRatingProps> = ({
  ratings = [],
  onOpenModal,
  disabled,
}) => {
  const { average, total } = useMemo(() => {
    if (!ratings || ratings.length === 0) {
      return { average: 0, total: 0 };
    }
    const totalScore = ratings.reduce((sum, r) => sum + r.overallScore, 0);
    return {
      average: parseFloat((totalScore / ratings.length).toFixed(1)),
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
            className="p-0.5 rounded-full text-blue-600 hover:bg-blue-50"
            title="Добавете или редактирайте вашата оценка"
          >
            <PlusIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      {total > 0 ? (
        <div
          className="flex items-center mt-1"
          title={`Средна оценка: ${average}`}
        >
          {/* MODIFIED: Reduced font size and margin for the number */}
          <span className="mr-1.5 text-base font-bold text-gray-800 tracking-tight">
            {average.toFixed(1)}
          </span>
          {[1, 2, 3, 4, 5].map((star) => (
            <StarSolid
              key={star}
              // MODIFIED: Reduced star size from h-5 w-5 to h-4 w-4
              className={`h-4 w-4 ${
                average >= star ? "text-yellow-400" : "text-gray-300"
              }`}
            />
          ))}
          {/* MODIFIED: Reduced left margin for the count */}
          <span className="ml-1 text-sm text-gray-500 font-medium">
            ({total})
          </span>
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
