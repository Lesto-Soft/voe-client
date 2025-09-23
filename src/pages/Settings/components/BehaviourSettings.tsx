import React, { useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDownIcon } from "@heroicons/react/24/solid";

// Import the settings components
import DashboardSettings from "./behaviour/DashboardSettings";
import UserManagementSettings from "./behaviour/UserManagementSettings";
import UserPageSettings from "./behaviour/UserPageSettings";
import AnalysesSettings from "./behaviour/AnalysesSettings";

// Placeholders for components that are not yet built but are visualized in the menu
const PlaceholderComponent: React.FC<{ title: string }> = ({ title }) => (
  <div className="p-4 bg-gray-100 rounded-md">
    Placeholder for {title} Settings
  </div>
);

type BehaviorTab =
  | "dashboard"
  | "analyses"
  | "userManagement"
  | "categoryManagement"
  | "ratingMetricManagement"
  | "userPage"
  | "categoryPage"
  | "metricPage";

const BehaviorSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<BehaviorTab>("dashboard");

  // NEW: A nested structure to define the dropdown menus
  const navStructure = [
    {
      trigger: "Табло на",
      items: [
        { key: "dashboard", label: "Сигнали" },
        { key: "tasks", label: "Задачи", disabled: true },
      ],
    },
    {
      trigger: "Управление на",
      items: [
        { key: "userManagement", label: "Потребители" },
        { key: "categoryManagement", label: "Категории", disabled: true },
        {
          key: "ratingMetricManagement",
          label: "Метрики за оценка",
          disabled: true,
        },
      ],
    },
    {
      trigger: "Страница на",
      items: [
        { key: "userPage", label: "Потребител" },
        { key: "categoryPage", label: "Категория", disabled: true },
        { key: "metricPage", label: "Метрика", disabled: true },
      ],
    },
    {
      trigger: "Анализи",
      items: [{ key: "analyses", label: "Анализи" }],
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardSettings />;
      case "userManagement":
        return <UserManagementSettings />;
      case "userPage":
        return <UserPageSettings />;
      case "analyses":
        return <AnalysesSettings />;
      case "categoryManagement":
        return <PlaceholderComponent title="Category Management" />;
      // Add other cases here if you build them out
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
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          {navStructure.map((group) => {
            const isGroupActive = group.items.some(
              (item) => item.key === activeTab
            );
            const commonClasses = `whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm focus:outline-none`;
            const activeClasses = `border-blue-500 text-blue-600`;
            const inactiveClasses = `border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300`;

            // --- NEW: Conditional Rendering Logic ---
            if (group.items.length === 1) {
              const singleItem = group.items[0];
              return (
                <button
                  key={singleItem.key}
                  onClick={() => setActiveTab(singleItem.key)}
                  className={`${commonClasses} ${
                    isGroupActive ? activeClasses : inactiveClasses
                  }`}
                >
                  {group.trigger}
                </button>
              );
            } else {
              return (
                <DropdownMenu.Root key={group.trigger}>
                  <DropdownMenu.Trigger asChild>
                    <button
                      className={`flex items-center gap-1 ${commonClasses} ${
                        isGroupActive ? activeClasses : inactiveClasses
                      }`}
                    >
                      {group.trigger}
                      <ChevronDownIcon className="h-4 w-4" />
                    </button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Portal>
                    <DropdownMenu.Content
                      sideOffset={5}
                      className="z-10 bg-white min-w-[220px] p-2 rounded-md shadow-lg border border-gray-200"
                    >
                      {group.items.map((item) => (
                        <DropdownMenu.Item
                          key={item.key}
                          disabled={item.disabled}
                          onSelect={() => setActiveTab(item.key)}
                          className={`w-full text-left p-2 rounded text-sm cursor-pointer focus:outline-none focus:bg-gray-100 ${
                            activeTab === item.key
                              ? "bg-blue-50 text-blue-700"
                              : item.disabled
                              ? "text-gray-400 hover:cursor-not-allowed"
                              : "hover:bg-gray-100 text-gray-800"
                          }`}
                        >
                          {item.label}
                        </DropdownMenu.Item>
                      ))}
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>
              );
            }
          })}
        </nav>
      </div>

      <div className="mt-6">{renderContent()}</div>
    </div>
  );
};

export default BehaviorSettings;
