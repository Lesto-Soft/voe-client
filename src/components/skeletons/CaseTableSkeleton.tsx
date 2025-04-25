import React from "react";

interface CaseTableSkeletonProps {
  rows?: number;
}

const CaseTableSkeleton: React.FC<CaseTableSkeletonProps> = ({ rows = 10 }) => {
  // Define static headers matching CaseTable (adjust if needed)
  const headers = [
    "Номер",
    "Приоритет",
    "Тип",
    "Подател",
    "Категории",
    "Дата",
    "Статус",
  ];

  return (
    <div className="flex-1 min-h-0 overflow-y-auto sm:px-6 lg:px-">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50 sticky top-0 z-10">
          <tr>
            {/* Static Headers */}
            {headers.map((header) => (
              <th
                key={header}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
            {/* Optional: Add empty th if CaseTable has an actions column */}
            {/* <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">Edit</span>
            </th> */}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {/* Pulsing Rows - Loop uses the 'rows' prop which defaults to 10 */}
          {Array.from({ length: rows }).map((_, index) => (
            <tr key={index} className="animate-pulse">
              {/* Match number of columns to headers */}
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div className="bg-gray-200 rounded w-5/6 animate-pulse">
                  &nbsp;
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div className="bg-gray-200 rounded w-3/4 animate-pulse">
                  &nbsp;
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div className="bg-gray-200 rounded w-1/2 animate-pulse">
                  &nbsp;
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div className="bg-gray-200 rounded w-2/3 animate-pulse">
                  &nbsp;
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div className="bg-gray-200 rounded w-3/4 animate-pulse">
                  &nbsp;
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div className="bg-gray-200 rounded w-1/2 animate-pulse">
                  &nbsp;
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div className="bg-gray-200 rounded w-2/3 animate-pulse">
                  &nbsp;
                </div>
              </td>
              {/* Optional: Add empty td if CaseTable has an actions column */}
              {/* <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                 <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </td> */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CaseTableSkeleton;
