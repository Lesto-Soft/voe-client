// src/components/case-components/RatingDistributionChart.tsx
import React from "react";

interface IRatingDistribution {
  [key: number]: number; // e.g., { 5: 10, 4: 5, 3: 2, 2: 1, 1: 0 }
}

interface RatingDistributionChartProps {
  distribution: IRatingDistribution;
  totalRatings: number;
}

const RatingDistributionChart: React.FC<RatingDistributionChartProps> = ({
  distribution,
  totalRatings,
}) => {
  if (totalRatings === 0) {
    return <p className="text-sm text-gray-500">No ratings yet.</p>;
  }

  return (
    <div className="w-full">
      <div className="flex flex-col-reverse gap-1.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const count = distribution[star] || 0;
          const percentage =
            totalRatings > 0 ? (count / totalRatings) * 100 : 0;
          return (
            <div
              key={star}
              className="flex items-center gap-2"
              title={`${count} users rated ${star} star(s)`}
            >
              <span className="text-xs font-medium text-gray-600 w-10">
                {star} star
              </span>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-400 h-2 rounded-full"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              <span className="text-xs font-medium text-gray-600 w-8 text-right">
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RatingDistributionChart;
