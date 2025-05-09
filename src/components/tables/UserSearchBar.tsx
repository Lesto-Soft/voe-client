// src/components/search/UserSearchBar.tsx
import React from "react";
// We don't need complex hooks like useLazyQuery or useDebounce here
// We might need icons if adding clear buttons later, but not for basic inputs

// Define the shape of the props expected from UserManagementPage
interface UserSearchBarProps {
  filterUsername: string;
  setFilterUsername: (value: string) => void;
  filterName: string;
  setFilterName: (value: string) => void;
  filterEmail: string;
  setFilterEmail: (value: string) => void;
  filterPosition: string;
  setFilterPosition: (value: string) => void;
  // Optional: Add translation function if needed
  // t: (key: string) => string;
}

const UserSearchBar: React.FC<UserSearchBarProps> = ({
  filterUsername,
  setFilterUsername,
  filterName,
  setFilterName,
  filterEmail,
  setFilterEmail,
  filterPosition,
  setFilterPosition,
  // t = (key) => key, // Default passthrough if t not provided
}) => {
  // No internal state needed here if debouncing is handled in parent

  // --- Render Logic ---
  return (
    // Container with padding, similar to CaseSearchBar
    // px-4 sm:px-6 lg:px-8
    <div className="pt-2.5">
      {/* Grid layout for filter inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-3 items-start">
        {/* Filter by Name */}
        <div>
          <label
            htmlFor="filterName"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {/* {t("name")} */} Име {/* Replace with t('name') */}
          </label>
          <input
            type="text"
            id="filterName"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
            placeholder="Търси по име..." // Example placeholder
          />
        </div>

        {/* Filter by Username */}
        <div>
          <label
            htmlFor="filterUsername"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {/* {t("username")} */} Потребителско име{" "}
            {/* Replace with t('username') if using i18n */}
          </label>
          <input
            type="text"
            id="filterUsername"
            value={filterUsername}
            onChange={(e) => setFilterUsername(e.target.value)}
            className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
            placeholder="Търси по потр. име..." // Example placeholder
          />
        </div>

        {/* Filter by Position */}
        <div>
          <label
            htmlFor="filterPosition"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {/* {t("position")} */} Позиция {/* Replace with t('position') */}
          </label>
          <input
            type="text"
            id="filterPosition"
            value={filterPosition}
            onChange={(e) => setFilterPosition(e.target.value)}
            className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
            placeholder="Търси по позиция..." // Example placeholder
          />
        </div>

        {/* Filter by Email */}
        <div>
          <label
            htmlFor="filterEmail"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {/* {t("email")} */} Имейл {/* Replace with t('email') */}
          </label>
          <input
            type="text" // Use text for easier partial matching, could use type="email"
            id="filterEmail"
            value={filterEmail}
            onChange={(e) => setFilterEmail(e.target.value)}
            className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
            placeholder="Търси по имейл..." // Example placeholder
          />
        </div>

        {/* Add more filters here if needed */}
      </div>
    </div>
  );
};

export default UserSearchBar;
