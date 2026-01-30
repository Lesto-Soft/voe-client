import React from "react";
import ClearableInput from "../global/inputs/ClearableInput";

interface UserSearchBarProps {
  filterUsername: string;
  setFilterUsername: (value: string) => void;
  filterName: string;
  setFilterName: (value: string) => void;
  filterEmail: string;
  setFilterEmail: (value: string) => void;
  filterPosition: string;
  setFilterPosition: (value: string) => void;
  filterFinancial: boolean;
  setFilterFinancial: (value: boolean) => void;
  filterManager: boolean;
  setFilterManager: (value: boolean) => void;
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
  filterManager,
  setFilterManager,
}) => {
  const financialToggleId = "financial-approver-toggle";
  const managerToggleId = "manager-toggle";

  return (
    <div className="pt-2.5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-x-4 gap-y-3 items-start">
        <ClearableInput
          id="filterName"
          label="Име на потребител"
          value={filterName}
          onChange={setFilterName}
          placeholder="Търси по име..."
        />

        {/* Filter by Username */}
        <ClearableInput
          id="filterUsername"
          label="Потребителско име"
          value={filterUsername}
          onChange={setFilterUsername}
          placeholder="Търси по потр. име..."
        />

        {/* Filter by Position */}
        <ClearableInput
          id="filterPosition"
          label="Позиция"
          value={filterPosition}
          onChange={setFilterPosition}
          placeholder="Търси по позиция..."
        />

        {/* Filter by Email */}
        <ClearableInput
          id="filterEmail"
          label="Имейл"
          value={filterEmail}
          onChange={setFilterEmail}
          placeholder="Търси по имейл..."
        />

        {/* Toggle Button for Financial Approver Filter */}
        <div>
          <label
            htmlFor={financialToggleId} // <-- ADDED htmlFor
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Финансови
          </label>
          <button
            type="button"
            id={financialToggleId} // <-- ADDED id
            onClick={() => setFilterFinancial(!filterFinancial)}
            className={`hover:cursor-pointer w-full px-3 py-2 rounded-md shadow-sm text-sm font-normal transition-colors duration-150 ease-in-out
              ${
                filterFinancial
                  ? "bg-indigo-600 text-white hover:bg-indigo-700 border-transparent"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
              }
            `}
            aria-pressed={filterFinancial}
            title={
              filterFinancial
                ? "Показване не само на финансови одобрители"
                : "Показване само на финансови одобрители"
            }
          >
            {filterFinancial ? "Филтрирани" : "Нефилтрирани"}
          </button>
        </div>

        {/* Toggle Button for Manager Filter */}
        <div>
          <label
            htmlFor={managerToggleId} // <-- ADDED htmlFor
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Мениджъри
          </label>
          <button
            type="button"
            id={managerToggleId} // <-- ADDED id
            onClick={() => setFilterManager(!filterManager)}
            className={`hover:cursor-pointer w-full px-3 py-2 rounded-md shadow-sm text-sm font-normal transition-colors duration-150 ease-in-out
              ${
                filterManager
                  ? "bg-indigo-600 text-white hover:bg-indigo-700 border-transparent" // Active state styling
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300" // Inactive state styling
              }
            `}
            aria-pressed={filterManager} // Indicates the toggle state for accessibility
            title={
              filterManager
                ? "Показване не само на мениджъри" // Tooltip when filter is ON (changed from Ръководители to Мениджъри)
                : "Показване само на мениджъри" // Tooltip when filter is OFF
            }
          >
            {filterManager ? "Филтрирани" : "Нефилтрирани"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserSearchBar;
