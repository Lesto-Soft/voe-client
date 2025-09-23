import React, { useState } from "react";
import UserSearchBar from "../../../../components/tables/UserSearchBar";

const UserManagementSettings: React.FC = () => {
  // State for the User Management default settings
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const [filterName, setFilterName] = useState("");
  const [filterUsername, setFilterUsername] = useState("");
  const [filterPosition, setFilterPosition] = useState("");
  const [filterEmail, setFilterEmail] = useState("");
  const [filterFinancial, setFilterFinancial] = useState(false);
  const [filterManager, setFilterManager] = useState(false);

  const handleSave = () => {
    const settingsToSave = {
      isFilterOpen,
      filterName,
      filterUsername,
      filterPosition,
      filterEmail,
      filterFinancial,
      filterManager,
    };
    console.log("Saving User Management Default Settings:", settingsToSave);
    alert("Настройките за Управление на потребители са запазени (симулация).");
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isFilterOpen}
            onChange={(e) => setIsFilterOpen(e.target.checked)}
            className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="font-medium text-gray-700">
            Филтрите да са отворени по подразбиране
          </span>
        </label>
      </div>

      <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
        <p className="text-sm font-medium text-gray-600 mb-2">
          Стойности на филтрите по подразбиране:
        </p>
        {/* NOTE: UserSearchBar would also be modified to be a fully "controlled component", 
                  accepting its state via props.
                */}
        <UserSearchBar
          filterName={filterName}
          setFilterName={setFilterName}
          filterUsername={filterUsername}
          setFilterUsername={setFilterUsername}
          filterPosition={filterPosition}
          setFilterPosition={setFilterPosition}
          filterEmail={filterEmail}
          setFilterEmail={setFilterEmail}
          filterFinancial={filterFinancial}
          setFilterFinancial={setFilterFinancial}
          filterManager={filterManager}
          setFilterManager={setFilterManager}
        />
      </div>

      <div className="pt-4 border-t border-t-gray-200 text-right">
        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-5 py-2 rounded-md text-sm font-semibold hover:bg-blue-700"
        >
          Запази настройките
        </button>
      </div>
    </div>
  );
};

export default UserManagementSettings;
