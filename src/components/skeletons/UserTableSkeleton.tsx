// src/components/skeletons/UserTableSkeleton.tsx
import React from "react";

interface UserTableSkeletonProps {
  rows?: number;
}

// Define column widths here for consistency (match UserManagementPage thead)
// Adjust these widths as needed!
const columnWidths = {
  avatar: "w-16", // Example: 64px
  username: "w-1/6", // Example: Tighter username column (adjust from previous w-1/5 or w-48)
  name: "w-1/5", // Example
  position: "w-1/5", // Example (Hidden on small)
  email: "w-1/4", // Example (Hidden on small)
  role: "w-1/6", // Example
  edit: "w-20", // Example: Broader edit column (adjust from previous w-16)
};

const rowHeight = "h-13";

const UserTableSkeleton: React.FC<UserTableSkeletonProps> = ({ rows = 10 }) => {
  return (
    <div className="flex flex-col shadow-md rounded-lg overflow-hidden bg-white border border-gray-200">
      <div className="overflow-x-auto">
        {/* Use table-fixed */}
        <table className="min-w-full divide-y divide-gray-200 table-fixed">
          <thead className="bg-gray-500 sticky top-0 z-10">
            <tr>
              {/* Define ALL TH elements with widths and responsive classes */}
              <th
                className={`${columnWidths.avatar} ${rowHeight} px-3 py-4`}
              ></th>
              <th
                className={`${columnWidths.username} ${rowHeight} px-3 py-4`}
              ></th>
              <th
                className={`${columnWidths.name} ${rowHeight} px-3 py-4`}
              ></th>
              {/* Add hidden md:table-cell to match td */}
              <th
                className={`${columnWidths.position} hidden md:table-cell ${rowHeight} px-3 py-4`}
              ></th>
              {/* Add hidden md:table-cell to match td */}
              <th
                className={`${columnWidths.email} hidden md:table-cell ${rowHeight} px-3 py-4`}
              ></th>
              <th
                className={`${columnWidths.role} ${rowHeight} px-3 py-4`}
              ></th>
              <th
                className={`${columnWidths.edit} ${rowHeight} px-3 py-4`}
              ></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Array.from({ length: rows }).map((_, index) => (
              <tr key={index} className="animate-pulse">
                {/* Avatar */}
                <td
                  className={`${columnWidths.avatar} px-3 py-4 whitespace-nowrap`}
                >
                  <div className="h-8 w-8 rounded-full bg-gray-200" />
                </td>
                {/* Username - Make placeholder div narrower (w-1/2) */}
                <td
                  className={`${columnWidths.username} px-3 py-4 whitespace-nowrap`}
                >
                  <div className="h-4 w-1/2 rounded bg-gray-200" />
                </td>
                {/* Name */}
                <td
                  className={`${columnWidths.name} px-3 py-4 whitespace-nowrap`}
                >
                  <div className="h-4 w-1/2 rounded bg-gray-200" />
                </td>
                {/* Position - Add hidden md:table-cell */}
                <td
                  className={`${columnWidths.position} hidden md:table-cell px-3 py-4 whitespace-nowrap`}
                >
                  <div className="h-4 w-2/3 rounded bg-gray-200" />
                </td>
                {/* Email - Add hidden md:table-cell */}
                <td
                  className={`${columnWidths.email} hidden md:table-cell px-3 py-4 whitespace-nowrap`}
                >
                  <div className="h-4 w-5/6 rounded bg-gray-200" />
                </td>
                {/* Role */}
                <td
                  className={`${columnWidths.role} px-3 py-4 whitespace-nowrap`}
                >
                  <div className="h-4 w-1/3 rounded bg-gray-200" />
                </td>
                {/* Edit - Placeholder size remains same, column width set above */}
                <td
                  className={`${columnWidths.edit} px-3 py-4 whitespace-nowrap text-center`}
                >
                  <div className="inline-block h-8 w-30 rounded bg-gray-200" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserTableSkeleton;
