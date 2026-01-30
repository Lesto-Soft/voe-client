// src/components/skeletons/UserTableSkeleton.tsx
import React from "react";

interface CategoryTableSkeletonProps {
  rows?: number;
}

// Define column widths here for consistency (match UserManagementPage thead)
// Adjust these widths as needed!
const columnWidths = {
  name: "w-1/5",
  experts: "w-1/4",
  managers: "w-1/4",
  signalAmount: "w-1/8",
  edit: "w-1/6",
};

const CategoryTableSkeleton: React.FC<CategoryTableSkeletonProps> = ({
  rows = 10,
}) => {
  return (
    <div className="flex flex-col shadow-md rounded-lg overflow-hidden bg-white border border-gray-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 table-fixed">
          <thead className="bg-gray-500 sticky top-0 z-10">
            <tr>
              <th colSpan={5} className="h-13 bg-gray-500 rounded-t-md"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Array.from({ length: rows }).map((_, index) => (
              <tr key={index} className="animate-pulse">
                <td
                  className={`${columnWidths.name} px-3 py-4 whitespace-nowrap`}
                >
                  <div className="h-4 w-1/2 rounded bg-gray-200" />
                </td>
                <td
                  className={`${columnWidths.experts} px-3 py-4 whitespace-nowrap`}
                >
                  <div className="h-4 w-1/2 rounded bg-gray-200" />
                </td>
                <td
                  className={`${columnWidths.managers} px-3 py-4 whitespace-nowrap`}
                >
                  <div className="h-4 w-1/2 rounded bg-gray-200" />
                </td>
                <td
                  className={`${columnWidths.signalAmount} hidden md:table-cell px-3 py-4 whitespace-nowrap`}
                >
                  <div className="h-4 w-1/2 rounded bg-gray-200" />
                </td>
                <td
                  className={`${columnWidths.edit} hidden md:table-cell px-3 py-4 whitespace-nowrap`}
                >
                  <div className="h-8 w-30 rounded bg-gray-200" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CategoryTableSkeleton;
