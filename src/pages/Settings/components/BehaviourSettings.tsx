import React, { useState } from "react";

// Import the new settings components for each page
import DashboardSettings from "./behaviour/DashboardSettings";
import UserManagementSettings from "./behaviour/UserManagementSettings"; // <-- NEW IMPORT
import UserPageSettings from "./behaviour/UserPageSettings";

// Placeholders for other components that would follow the same pattern
const CategoryManagementSettings = () => (
  <div className="p-4 bg-gray-100 rounded-md">
    Placeholder for Category Management Filter Settings
  </div>
);

type BehaviorTab =
  | "dashboard"
  | "userManagement"
  | "categoryManagement"
  | "userPage"
  | "categoryPage"
  | "metricPage";

const BehaviorSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<BehaviorTab>("dashboard");

  const tabs: { key: BehaviorTab; label: string }[] = [
    { key: "dashboard", label: "Табло" },
    { key: "userManagement", label: "Управление потребители" },
    { key: "userPage", label: "Страница Потребител" },
    { key: "categoryManagement", label: "Управление категории" },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardSettings />;
      case "userManagement":
        return <UserManagementSettings />; // <-- MODIFIED
      case "categoryManagement":
        return <CategoryManagementSettings />;
      case "userPage":
        return <UserPageSettings />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-800">
        Поведение и изгледи по подразбиране
      </h2>
      <p className="mt-1 text-sm text-gray-600">
        Настройте как да изглеждат и работят различните страници при
        първоначално зареждане.
      </p>

      <div className="mt-4 border-b border-gray-200">
        <nav
          className="-mb-px flex space-x-6 overflow-x-auto"
          aria-label="Tabs"
        >
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-6">{renderContent()}</div>
    </div>
  );
};

export default BehaviorSettings;
