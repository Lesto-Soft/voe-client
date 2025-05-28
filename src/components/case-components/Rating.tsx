import React from "react";
import { useState } from "react";
import { StarIcon } from "@heroicons/react/24/outline";
import { IRating } from "../../db/interfaces";
import { caseBoxClasses, labelTextClass } from "../../ui/reusable-styles";
import { useRateCase } from "../../graphql/hooks/case";

const CaseRating: React.FC<{
  ratings?: IRating[];
  onRate?: (rating: number) => void;
  disabled?: boolean;
  t: (word: string) => string;
  caseId: string;
  me: any;
  refetch: () => void;
}> = ({ ratings = [], onRate, disabled, t, caseId, me, refetch }) => {
  // Calculate average rating
  const avg =
    ratings && ratings.length > 0
      ? Math.round(
          (ratings.reduce((sum, r) => sum + (r.score || 0), 0) /
            ratings.length) *
            100
        ) / 100 // Round to two decimal places
      : 0;
  const [hovered, setHovered] = useState<number | null>(null);
  const [selected, setSelected] = useState<number>(avg);
  const { rateCase, loading, error, data } = useRateCase();

  if (loading) console.log("Loading rating...");
  if (error) console.error("Error rating case:", error);
  if (data) console.log("Rating data:", data);

  const handleClick = async (star: number) => {
    try {
      await rateCase(caseId, me._id, star);
      await refetch(); // Refetch the data to update the UI
      if (disabled) return;
      setSelected(star);
      onRate?.(star);
    } catch (err) {
      console.error("Error rating case:", err);
    }
  };

  const getStarFill = (rating: number, star: number) => {
    if (rating >= star) return "full"; // Fully filled star
    if (rating >= star - 0.5) return "half"; // Half-filled star
    return "empty"; // Empty star
  };

  return (
    <div className={`${caseBoxClasses} flex-1`}>
      <span className={labelTextClass}>
        {t("rating")} ({avg}):
      </span>

      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => {
          const fillType = getStarFill(hovered ?? selected, star);
          return (
            <button
              key={star}
              type="button"
              className="focus:outline-none"
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => handleClick(star)}
              disabled={disabled}
              aria-label={`Rate ${star}`}
            >
              <span
                className={`inline-block relative transition-transform duration-150 hover:cursor-pointer ${
                  hovered === star
                    ? "scale-125"
                    : hovered && star <= hovered
                    ? "scale-110"
                    : ""
                }`}
              >
                {/* Empty Star */}
                <StarIcon
                  className="h-5 w-5 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                />
                {/* Filled Star */}
                {fillType !== "empty" && (
                  <StarIcon
                    className={`h-5 w-5 absolute top-0 left-0 ${
                      fillType === "full"
                        ? "text-yellow-400"
                        : "text-yellow-400"
                    }`}
                    fill={fillType === "full" ? "#facc15" : "currentColor"}
                    stroke="currentColor"
                    style={
                      fillType === "half"
                        ? { clipPath: "inset(0 50% 0 0)" } // Clip the right half
                        : {}
                    }
                  />
                )}
              </span>
            </button>
          );
        })}
        <span className="ml-2 text-sm text-gray-500">
          {ratings && ratings.length > 0 ? `(${ratings.length})` : ""}
        </span>
      </div>
    </div>
  );
};

export default CaseRating;
