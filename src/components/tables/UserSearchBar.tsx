// src/components/search/UserSearchBar.tsx
import React from "react";

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
  filterFinancial: boolean; // This is the boolean we're adding a toggle for
  setFilterFinancial: (value: boolean) => void;
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
  filterFinancial,
  setFilterFinancial,
}) => {
  return (
    <div className="pt-2.5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-3 items-start">
        {/* Filter by Name */}
        <div>
          <label
            htmlFor="filterName"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Име на потребител
          </label>
          <input
            type="text"
            id="filterName"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
            placeholder="Търси по име..."
          />
        </div>

        {/* Filter by Username */}
        <div>
          <label
            htmlFor="filterUsername"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Потребителско име
          </label>
          <input
            type="text"
            id="filterUsername"
            value={filterUsername}
            onChange={(e) => setFilterUsername(e.target.value)}
            className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
            placeholder="Търси по потр. име..."
          />
        </div>

        {/* Filter by Position */}
        <div>
          <label
            htmlFor="filterPosition"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Позиция
          </label>
          <input
            type="text"
            id="filterPosition"
            value={filterPosition}
            onChange={(e) => setFilterPosition(e.target.value)}
            className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
            placeholder="Търси по позиция..."
          />
        </div>

        {/* Filter by Email */}
        <div>
          <label
            htmlFor="filterEmail"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Имейл
          </label>
          <input
            type="text"
            id="filterEmail"
            value={filterEmail}
            onChange={(e) => setFilterEmail(e.target.value)}
            className="bg-white w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
            placeholder="Търси по имейл..."
          />
        </div>

        {/* Toggle Button for Financial Approver Filter */}
        <div>
          <label
            // Optional: If you want to associate label with button for screen readers,
            // ensure button has an `id` and use `htmlFor` here.
            // However, for a toggle button, the button's text and aria-pressed attribute are key.
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Финансови одобрители
          </label>
          <button
            type="button" // Important for accessibility and preventing form submission
            onClick={(e) => setFilterFinancial(!filterFinancial)}
            className={`w-full px-3 py-2 rounded-md shadow-sm text-sm font-normal focus:border-1  focus:border-blue-500 transition-colors duration-150 ease-in-out
              ${
                filterFinancial
                  ? "bg-blue-600 text-white hover:bg-blue-700 border-transparent" // Active state styling
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300" // Inactive state styling
              }
            `}
            aria-pressed={filterFinancial} // Indicates the toggle state for accessibility
            title={
              filterFinancial
                ? "Показване само на финансови контрольор" // Tooltip when filter is ON
                : "Показване на всички потребители (спрямо този критерий)" // Tooltip when filter is OFF
            }
          >
            {filterFinancial ? "Само такива" : "Нефилтрирани"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserSearchBar;
