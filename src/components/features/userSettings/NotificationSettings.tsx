// src/components/features/userSettings/NotificationSettings.tsx
import React, { useState, useMemo } from "react";
import * as Switch from "@radix-ui/react-switch";

const mockNotificationTypes = [
  {
    key: "new_comment_on_case",
    label: "Нов коментар по сигнал",
    description: "Когато някой коментира сигнал, който сте създали.",
  },
  {
    key: "new_answer_on_case",
    label: "Ново решение по сигнал",
    description: "Когато някой предложи решение по сигнал, който сте създали.",
  },
  {
    key: "mention_in_comment",
    label: "Споменаване в коментар",
    description: "Когато някой Ви спомене с @username в коментар.",
  },
  {
    key: "mention_in_answer",
    label: "Споменаване в решение",
    description: "Когато някой Ви спомене с @username в решение.",
  },
  {
    key: "approve_answer_close_case",
    label: "Одобрено решение",
    description: "Когато решение, което сте предложили, бъде одобрено.",
  },
];

type Priority = "LOW" | "MEDIUM" | "HIGH";
type NotificationType = "inApp" | "email";
type Preferences = { [key in Priority]: boolean };

interface NotificationSettingsProps {
  settings: {
    inApp: { [key: string]: Preferences };
    email: { [key: string]: Preferences };
  };
  onChange: (
    type: NotificationType,
    key: string,
    priority: Priority | "all",
    value: boolean
  ) => void;
  density: "comfortable" | "compact";
}

const priorityStyles: {
  [key in Priority]: { text: string; accent: string; bg: string };
} = {
  LOW: {
    text: "text-green-600 dark:text-green-400",
    accent: "accent-green-500",
    bg: "bg-green-100 dark:bg-green-900/50",
  },
  MEDIUM: {
    text: "text-yellow-600 dark:text-yellow-400",
    accent: "accent-yellow-500",
    bg: "bg-yellow-100 dark:bg-yellow-900/50",
  },
  HIGH: {
    text: "text-red-600 dark:text-red-400",
    accent: "accent-red-500",
    bg: "bg-red-100 dark:bg-red-900/50",
  },
};

const NotificationRow: React.FC<{
  type: NotificationType;
  config: (typeof mockNotificationTypes)[0];
  preferences: Preferences;
  density: "comfortable" | "compact";
  onChange: NotificationSettingsProps["onChange"];
}> = ({ type, config, preferences = {}, density, onChange }) => {
  const { key, label, description } = config;

  const isAllOn = !!(preferences.LOW && preferences.MEDIUM && preferences.HIGH);
  const isAnyOn = !!(preferences.LOW || preferences.MEDIUM || preferences.HIGH);
  const isIndeterminate = isAnyOn && !isAllOn;

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-start sm:justify-between ${
        density === "compact" ? "py-3" : "py-4"
      } border-b border-gray-200 dark:border-slate-700 last:border-b-0`}
    >
      <div className="flex items-start gap-4 pr-4">
        <Switch.Root
          checked={isAllOn}
          onCheckedChange={(checked) => onChange(type, key, "all", checked)}
          className={`group mt-1 relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 
              ${
                isAllOn
                  ? "bg-indigo-600"
                  : isIndeterminate
                  ? "bg-slate-400 dark:bg-slate-500"
                  : "bg-gray-200 dark:bg-slate-600"
              }`}
          title={isAllOn ? "Изключи всички" : "Включи всички"}
        >
          <Switch.Thumb className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out data-[state=checked]:translate-x-5" />
        </Switch.Root>
        <div>
          <p className="font-medium text-gray-800 dark:text-gray-200">
            {label}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {description}
          </p>
        </div>
      </div>

      <div
        className={`flex-shrink-0 flex items-center gap-3 sm:gap-4 mt-3 sm:mt-1 ${
          density === "compact" ? "pl-12" : "pl-16"
        }`}
      >
        {(["LOW", "MEDIUM", "HIGH"] as Priority[]).map((priority) => (
          <div key={priority} className="flex items-center">
            <input
              type="checkbox"
              id={`${type}-${key}-${priority}`}
              checked={preferences[priority] || false}
              onChange={(e) => onChange(type, key, priority, e.target.checked)}
              className={`h-4 w-4 rounded border-gray-300 dark:border-slate-600 focus:ring-indigo-500 bg-gray-100 dark:bg-slate-900 cursor-pointer ${priorityStyles[priority].accent}`}
            />
            <label
              htmlFor={`${type}-${key}-${priority}`}
              className={`ml-2 text-xs font-medium ${priorityStyles[priority].text} cursor-pointer`}
            >
              {priority}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  settings,
  onChange,
  density,
}) => {
  const [activeTab, setActiveTab] = useState<NotificationType>("inApp");

  const handleToggleAllByPriority = (priority: Priority) => {
    const currentTabSettings = settings[activeTab];
    // Check if ALL notifications for this priority are already ON
    const areAllCurrentlyOn = mockNotificationTypes.every(
      (config) => currentTabSettings[config.key]?.[priority]
    );
    // If they are all on, the new value will be false (turn them off). Otherwise, turn them on.
    const newValue = !areAllCurrentlyOn;
    mockNotificationTypes.forEach((config) => {
      onChange(activeTab, config.key, priority, newValue);
    });
  };

  const renderToggles = (type: NotificationType) => (
    <div>
      {/* Header for Priority Toggles */}
      <div
        className={`hidden sm:flex justify-end ${
          density === "compact" ? "pb-2" : "pb-3"
        }`}
      >
        <div className={`flex items-center gap-3 sm:gap-4`}>
          {(["LOW", "MEDIUM", "HIGH"] as Priority[]).map((priority) => (
            <button
              key={priority}
              onClick={() => handleToggleAllByPriority(priority)}
              className={`px-2 py-1 text-xs font-bold rounded-md transition-colors ${priorityStyles[priority].text} ${priorityStyles[priority].bg} hover:opacity-80`}
              title={`Превключи всички ${priority} известия`}
            >
              Превключи
            </button>
          ))}
        </div>
      </div>

      {mockNotificationTypes.map((config) => (
        <NotificationRow
          key={config.key}
          type={type}
          config={config}
          preferences={settings[type][config.key]}
          density={density}
          onChange={onChange}
        />
      ))}
    </div>
  );

  return (
    <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg overflow-hidden transition-colors">
      <div
        className={`px-4 sm:px-6 ${density === "compact" ? "py-4" : "py-5"}`}
      >
        <h2 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">
          Известия
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
          Изберете кога и как да получавате известия.
        </p>
      </div>
      <div className="border-t border-gray-200 dark:border-slate-700">
        <div className="border-b border-gray-200 dark:border-slate-700">
          <nav className="-mb-px flex space-x-6 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab("inApp")}
              className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
                activeTab === "inApp"
                  ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600"
              }`}
            >
              В приложението
            </button>
            <button
              onClick={() => setActiveTab("email")}
              className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
                activeTab === "email"
                  ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600"
              }`}
            >
              Имейл
            </button>
          </nav>
        </div>
        <div className={density === "compact" ? "px-5" : "px-6"}>
          {activeTab === "inApp"
            ? renderToggles("inApp")
            : renderToggles("email")}
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
