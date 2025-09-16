// Mock configuration for notification types. In a real app, this might come from a shared constants file.
import React, { useState } from "react";
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

interface NotificationSettingsProps {
  settings: {
    inApp: { [key: string]: boolean };
    email: { [key: string]: boolean };
  };
  onChange: (type: "inApp" | "email", key: string, value: boolean) => void;
  density: "comfortable" | "compact"; // <-- Add density prop
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  settings,
  onChange,
  density,
}) => {
  const [activeTab, setActiveTab] = useState<"inApp" | "email">("inApp");

  const renderToggles = (type: "inApp" | "email") => (
    <div className={density === "compact" ? "space-y-3" : "space-y-4"}>
      {mockNotificationTypes.map(({ key, label, description }) => (
        <div key={key} className="flex items-start justify-between">
          <div className="pr-4">
            <p className="font-medium text-gray-800">{label}</p>
            <p className="text-xs text-gray-500">{description}</p>
          </div>
          <Switch.Root
            checked={settings[type][key] || false}
            onCheckedChange={(checked) => onChange(type, key, checked)}
            className="group relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 data-[state=checked]:bg-indigo-600"
          >
            <Switch.Thumb className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out data-[state=checked]:translate-x-5" />
          </Switch.Root>
        </div>
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
        <div className={density === "compact" ? "p-5" : "p-6"}>
          {activeTab === "inApp"
            ? renderToggles("inApp")
            : renderToggles("email")}
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
