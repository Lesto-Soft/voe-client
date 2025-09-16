// src/components/features/userSettings/AppearanceSettings.tsx
import React from "react";
import { CalendarIcon, ClockIcon } from "@heroicons/react/24/outline";

// A more flexible button that can contain complex visual previews
const SettingButton = <T extends string>({
  label,
  children,
  currentValue,
  value,
  onClick,
  density,
}: {
  label: string;
  children: React.ReactNode;
  currentValue: T;
  value: T;
  onClick: (value: T) => void;
  density: "comfortable" | "compact";
}) => {
  const isActive = currentValue === value;
  const heightClass = density === "compact" ? "h-28" : "h-32"; // Compact is shorter
  return (
    <button
      type="button"
      onClick={() => onClick(value)}
      className={`flex-1 rounded-lg p-3 text-sm font-medium border-2 transition-all duration-150 flex flex-col items-center justify-start gap-2 ${heightClass}
        ${
          isActive
            ? "bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm dark:bg-indigo-900/30 dark:border-indigo-600 dark:text-indigo-300"
            : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-300 dark:hover:bg-slate-700"
        }`}
    >
      <div className="w-full h-full flex items-center justify-center rounded-md bg-gray-100 dark:bg-slate-900 p-2 border border-gray-200 dark:border-slate-600">
        {children}
      </div>
      <span className={isActive ? "font-bold" : ""}>{label}</span>
    </button>
  );
};

// A simple button for the date format setting
const SimpleSettingButton = <T extends string>({
  option,
  currentValue,
  onClick,
  density,
}: {
  option: { value: T; label: string; icon: React.ElementType };
  currentValue: T;
  onClick: (value: T) => void;
  density: "comfortable" | "compact";
}) => {
  const isActive = currentValue === option.value;
  const heightClass = density === "compact" ? "h-20" : "h-24";
  return (
    <button
      type="button"
      onClick={() => onClick(option.value)}
      className={`flex-1 rounded-lg p-3 text-sm font-medium border-2 transition-all duration-150 flex flex-col items-center justify-center gap-2 ${heightClass}
        ${
          isActive
            ? "bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm dark:bg-indigo-900/30 dark:border-indigo-600 dark:text-indigo-300"
            : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-300 dark:hover:bg-slate-700"
        }`}
    >
      <option.icon className="h-6 w-6" />
      <span className="text-center">{option.label}</span>
    </button>
  );
};

interface AppearanceSettingsProps {
  settings: {
    theme: "light" | "dark";
    layoutDensity: "comfortable" | "compact";
    defaultDateFormat: "relative" | "absolute";
  };
  onChange: (newSettings: Partial<AppearanceSettingsProps["settings"]>) => void;
}

const AppearanceSettings: React.FC<AppearanceSettingsProps> = ({
  settings,
  onChange,
}) => {
  const density = settings.layoutDensity;
  const dateFormatOptions = [
    {
      value: "relative",
      label: 'Относителна ("преди 2 часа")',
      icon: ClockIcon,
    },
    {
      value: "absolute",
      label: 'Абсолютна ("15/09/2025")',
      icon: CalendarIcon,
    },
  ] as const;

  return (
    <div className="bg-white dark:bg-slate-800 shadow-md rounded-lg overflow-hidden transition-colors">
      <div
        className={`px-4 sm:px-6 ${density === "compact" ? "py-4" : "py-5"}`}
      >
        <h2 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">
          Изглед и Оформление
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
          Персонализирайте как изглежда платформата.
        </p>
      </div>
      <div
        className={`border-t border-gray-200 dark:border-slate-700 px-4 sm:p-6 ${
          density === "compact" ? "py-4 space-y-4" : "py-5 space-y-6"
        }`}
      >
        <div>
          <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">
            Тема
          </h3>
          <div className="mt-2 grid grid-cols-2 gap-4">
            <SettingButton
              label="Светла"
              value="light"
              currentValue={settings.theme}
              onClick={(value) => onChange({ theme: value })}
              density={density}
            >
              <div className="w-full h-full p-2 bg-white rounded flex flex-col justify-between border border-gray-200">
                <div className="h-1 w-3/4 bg-gray-700 rounded-sm"></div>
                <div className="h-1 w-1/2 bg-indigo-500 rounded-sm"></div>
                <div className="h-1 w-full bg-gray-300 rounded-sm"></div>
              </div>
            </SettingButton>
            <SettingButton
              label="Тъмна"
              value="dark"
              currentValue={settings.theme}
              onClick={(value) => onChange({ theme: value })}
              density={density}
            >
              <div className="w-full h-full p-2 bg-slate-800 rounded flex flex-col justify-between border border-slate-700">
                <div className="h-1 w-3/4 bg-slate-300 rounded-sm"></div>
                <div className="h-1 w-1/2 bg-indigo-500 rounded-sm"></div>
                <div className="h-1 w-full bg-slate-600 rounded-sm"></div>
              </div>
            </SettingButton>
          </div>
        </div>

        <div>
          <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">
            Гъстота на изгледа
          </h3>
          <div className="mt-2 grid grid-cols-2 gap-4">
            <SettingButton
              label="Комфортен"
              value="comfortable"
              currentValue={settings.layoutDensity}
              onClick={(value) => onChange({ layoutDensity: value })}
              density={density}
            >
              <div className="w-full h-full p-2 flex flex-col justify-center space-y-2">
                <div className="h-1 rounded-sm bg-gray-400 dark:bg-slate-500"></div>
                <div className="h-1 rounded-sm bg-gray-400 dark:bg-slate-500"></div>
                <div className="h-1 rounded-sm bg-gray-400 dark:bg-slate-500"></div>
              </div>
            </SettingButton>
            <SettingButton
              label="Компактен"
              value="compact"
              currentValue={settings.layoutDensity}
              onClick={(value) => onChange({ layoutDensity: value })}
              density={density}
            >
              <div className="w-full h-full p-2 flex flex-col justify-center space-y-1">
                <div className="h-1 rounded-sm bg-gray-400 dark:bg-slate-500"></div>
                <div className="h-1 rounded-sm bg-gray-400 dark:bg-slate-500"></div>
                <div className="h-1 rounded-sm bg-gray-400 dark:bg-slate-500"></div>
              </div>
            </SettingButton>
          </div>
        </div>

        <div>
          <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">
            Формат на датата по подразбиране
          </h3>
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {dateFormatOptions.map((opt) => (
              <SimpleSettingButton
                key={opt.value}
                option={opt}
                currentValue={settings.defaultDateFormat}
                onClick={(value) => onChange({ defaultDateFormat: value })}
                density={density}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppearanceSettings;
