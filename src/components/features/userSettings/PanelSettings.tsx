// src/components/features/userSettings/PanelSettings.tsx
import React from "react";

interface PanelSettingsProps {
  density: "comfortable" | "compact";
}

const PanelSettings: React.FC<PanelSettingsProps> = ({ density }) => {
  return (
    <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg overflow-hidden transition-colors">
      <div
        className={`px-4 sm:px-6 ${density === "compact" ? "py-4" : "py-5"}`}
      >
        <h2 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">
          Състояние на Панели
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
          Платформата автоматично ще запомни кои странични панели оставяте
          отворени или затворени.
        </p>
      </div>
      <div
        className={`border-t border-gray-200 dark:border-slate-700 px-4 sm:p-6 text-center ${
          density === "compact" ? "py-6" : "py-8"
        }`}
      >
        <div className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25A2.25 2.25 0 0113.5 8.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
            />
          </svg>
        </div>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Няма ръчни настройки тук. Просто използвайте бутоните за
          свиване/разширяване на панелите на съответните страници.
        </p>
      </div>
    </div>
  );
};

export default PanelSettings;
