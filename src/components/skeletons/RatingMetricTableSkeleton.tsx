// src/components/skeletons/RatingMetricTableSkeleton.tsx
import React from "react";

interface RatingMetricTableSkeletonProps {
  rows?: number;
}

const RatingMetricTableSkeleton: React.FC<RatingMetricTableSkeletonProps> = ({
  rows = 10,
}) => {
  return (
    <div className="flex flex-col shadow-md rounded-lg overflow-hidden bg-white border border-gray-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 table-fixed">
          <thead className="bg-gray-500 sticky top-0 z-10">
            <tr>
              <th colSpan={7} className="h-13 bg-gray-500 rounded-t-md"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Array.from({ length: rows }).map((_, index) => (
              <tr key={index} className="animate-pulse">
                {/* Order */}
                <td className="w-16 px-3 py-4 whitespace-nowrap">
                  <div className="h-6 w-6 rounded bg-gray-200 mx-auto" />
                </td>
                {/* Name */}
                <td className="w-1/5 px-3 py-4">
                  <div className="h-4 w-3/4 rounded bg-gray-200" />
                </td>
                {/* Description */}
                <td className="w-2/5 px-3 py-4">
                  <div className="h-4 w-11/12 rounded bg-gray-200" />
                  <div className="h-4 w-10/12 rounded bg-gray-200 mt-2" />
                </td>
                {/* Archived */}
                <td className="w-24 px-3 py-4 text-center">
                  <div className="h-6 w-16 rounded-full bg-gray-200 mx-auto" />
                </td>
                {/* Total & Average Score */}
                <td className="w-24 px-3 py-4 text-center">
                  <div className="h-4 w-10 rounded bg-gray-200 mx-auto" />
                </td>
                <td className="w-24 px-3 py-4 text-center">
                  <div className="h-4 w-10 rounded bg-gray-200 mx-auto" />
                </td>
                {/* Actions */}
                <td className="w-32 px-3 py-4 text-center">
                  <div className="inline-block h-8 w-20 rounded bg-gray-200" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RatingMetricTableSkeleton;
