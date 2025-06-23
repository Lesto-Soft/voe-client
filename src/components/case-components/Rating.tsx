// src/components/case-components/Rating.tsx

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
      {/* MODIFIED: Top row now contains the label and the add button */}
      <div className="flex items-center gap-1">
        <span className={labelTextClass}>Rating:</span>
        {!disabled && (
          <button
            onClick={onOpenModal}
            className="p-0.5 rounded-full text-blue-600 hover:bg-blue-50"
            title="Add or edit your rating"
          >
            {/* Adjusted icon size to better fit next to the label */}
            <PlusIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Bottom row for stars and count */}
      <div
        className="flex items-center mt-1"
        title={`Average rating: ${average}`}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <StarSolid
            key={star}
            className={`h-5 w-5 ${
              average >= star ? "text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-1.5 text-sm text-gray-500 font-medium">
          ({total})
        </span>
      </div>
    </div>
  );
};

export default CaseRating;
