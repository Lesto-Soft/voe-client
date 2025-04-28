import React from "react";

interface CaseTableSkeletonProps {
  rows?: number;
}

const CaseTableSkeleton: React.FC<CaseTableSkeletonProps> = ({ rows = 10 }) => {
  return (
    <div className="flex-1 min-h-0 overflow-y-auto sm:px-6 lg:px-8">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-500 sticky top-0 z-10">
          <tr>
            <th colSpan={9} className="h-13 bg-gray-500 rounded-t-md"></th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {Array.from({ length: rows }).map((_, index) => (
            <tr key={index} className="animate-pulse">
              <td className="w-24 px-3 py-4 whitespace-nowrap text-sm text-gray-500 border-b border-gray-200">
                <div className="bg-gray-200 rounded w-5/6 h-4" />
              </td>
              <td className="w-28 px-3 py-4 whitespace-nowrap text-sm text-gray-500 border-b border-gray-200">
                <div className="bg-gray-200 rounded w-3/4 h-4" />
              </td>
              <td className="w-32 px-3 py-4 whitespace-nowrap text-sm text-gray-500 border-b border-gray-200">
                <div className="bg-gray-200 rounded w-1/2 h-4" />
              </td>
              <td className="max-w-[150px] px-3 py-4 text-sm break-words">
                <div className="bg-gray-200 rounded w-2/3 h-4" />
              </td>
              <td className="max-w-[180px] px-3 py-4 whitespace-nowrap text-sm text-gray-500 border-b border-gray-200 hidden md:table-cell">
                <div className="bg-gray-200 rounded w-3/4 h-4" />
              </td>
              <td className="max-w-[200px] sm:max-w-[250px] lg:max-w-[300px] px-3 py-4 whitespace-nowrap text-sm text-gray-500 border-b border-gray-200">
                <div className="bg-gray-200 rounded w-5/6 h-4" />
              </td>
              <td className="w-32 px-3 py-4 whitespace-nowrap text-sm text-gray-500 border-b border-gray-200">
                <div className="bg-gray-200 rounded w-1/2 h-4" />
              </td>
              <td className="w-32 px-3 py-4 whitespace-nowrap text-sm text-gray-500 border-b border-gray-200">
                <div className="bg-gray-200 rounded w-2/3 h-4" />
              </td>
              <td className="w-16 px-3 py-4 whitespace-nowrap text-sm text-gray-500 border-b border-gray-200">
                <div className="bg-gray-200 rounded w-6 h-4 mx-auto" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CaseTableSkeleton;
