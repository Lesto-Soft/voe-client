import React from "react";
import { useState } from "react";
import { StarIcon } from "@heroicons/react/24/outline";
import { IRating } from "../../db/interfaces";

const CaseRating: React.FC<{
  ratings?: IRating[];
  onRate?: (rating: number) => void;
  disabled?: boolean;
}> = ({ ratings = [], onRate, disabled }) => {
  // Calculate average rating
  const avg =
    ratings.length > 0
      ? Math.round(
          ratings.reduce((sum, r) => sum + (r.rating || 0), 0) / ratings.length
        )
      : 0;
  const [hovered, setHovered] = useState<number | null>(null);
  const [selected, setSelected] = useState<number>(avg);

  const handleClick = (star: number) => {
    console.log(star);
    if (disabled) return;
    setSelected(star);
    onRate?.(star);
  };

  return (
    <div className="">
      {[5, 4, 3, 2, 1].reverse().map((star) => (
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
            className={`inline-block transition-transform duration-150 hover:cursor-pointer ${
              hovered === star
                ? "scale-125"
                : hovered && star <= hovered
                ? "scale-110"
                : ""
            }`}
          >
            <StarIcon
              className={`h-5 w-5 transition-colors duration-150 ${
                (hovered ?? selected) >= star
                  ? "text-yellow-400"
                  : "text-gray-300"
              }`}
              fill={(hovered ?? selected) >= star ? "#facc15" : "none"}
              stroke="currentColor"
            />
          </span>
        </button>
      ))}
      <span className="mr-2 text-sm text-gray-500">
        {ratings.length > 0 ? `(${ratings.length})` : ""}
      </span>
    </div>
  );
};

export default CaseRating;
