import React, { useState } from "react";

type Theme = "light" | "dark" | "system";
type Density = "comfortable" | "compact";
type DateFormat = "relative" | "absolute";

const AppearanceSettings: React.FC = () => {
  // In a real app, these values would come from context or a settings hook
  const [theme, setTheme] = useState<Theme>("system");
  const [density, setDensity] = useState<Density>("comfortable");
  const [language, setLanguage] = useState("bg");
  const [dateFormat, setDateFormat] = useState<DateFormat>("relative");

  const handleSave = () => {
    // TODO: Implement save logic to persist settings
    console.log("Saving Appearance Settings:", {
      theme,
      density,
      language,
      dateFormat,
    });
    alert("Настройките за визия са запазени (симулация).");
  };

  const SettingRow: React.FC<{
    title: string;
    description: string;
    children: React.ReactNode;
  }> = ({ title, description, children }) => (
    <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start">
      <div className="sm:col-span-1">
        <h3 className="text-md font-medium text-gray-800">{title}</h3>
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      </div>
      <div className="mt-2 sm:mt-0 sm:col-span-2">{children}</div>
    </div>
  );

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-800">
        Визия и достъпност
      </h2>
      <p className="mt-1 text-sm text-gray-600">
        Персонализирайте как изглежда и се усеща приложението.
      </p>

      <div className="mt-6 divide-y divide-gray-200">
        <SettingRow
          title="Тема"
          description="Изберете светъл или тъмен изглед."
        >
          <div className="flex gap-2 sm:gap-4">
            <button
              onClick={() => setTheme("light")}
              className={`px-4 py-2 text-sm rounded-md border ${
                theme === "light"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white hover:bg-gray-100"
              }`}
            >
              Светла
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`px-4 py-2 text-sm rounded-md border ${
                theme === "dark"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white hover:bg-gray-100"
              }`}
            >
              Тъмна
            </button>
            <button
              onClick={() => setTheme("system")}
              className={`px-4 py-2 text-sm rounded-md border ${
                theme === "system"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white hover:bg-gray-100"
              }`}
            >
              Системна
            </button>
          </div>
        </SettingRow>

        <SettingRow
          title="Наситеност на изгледа"
          description="Намалете отстоянията, за да виждате повече информация."
        >
          <div className="flex gap-4">
            <button
              onClick={() => setDensity("comfortable")}
              className={`px-4 py-2 text-sm rounded-md border ${
                density === "comfortable"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white hover:bg-gray-100"
              }`}
            >
              Комфортна
            </button>
            <button
              onClick={() => setDensity("compact")}
              className={`px-4 py-2 text-sm rounded-md border ${
                density === "compact"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white hover:bg-gray-100"
              }`}
            >
              Компактна
            </button>
          </div>
        </SettingRow>

        <SettingRow title="Език" description="Изберете езика на интерфейса.">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="max-w-xs w-full rounded-md border border-gray-300 p-2 shadow-sm focus:outline-none focus:border-indigo-500"
          >
            <option value="bg">Български</option>
            <option value="en">English</option>
          </select>
        </SettingRow>

        <SettingRow
          title="Формат на дати"
          description="Изберете как да се показват датите в приложението."
        >
          <div className="mt-2 space-y-3">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="date"
                checked={dateFormat === "relative"}
                onChange={() => setDateFormat("relative")}
                className="h-4 w-4 text-blue-600"
              />{" "}
              Относителен (преди 5 минути)
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="date"
                checked={dateFormat === "absolute"}
                onChange={() => setDateFormat("absolute")}
                className="h-4 w-4 text-blue-600"
              />{" "}
              Абсолютен (23.09.2025 09:30)
            </label>
          </div>
        </SettingRow>
      </div>

      <div className="pt-6 mt-6 border-t border-gray-200 text-right">
        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-5 py-2 rounded-md text-sm font-semibold hover:bg-blue-700"
        >
          Запази промените
        </button>
      </div>
    </div>
  );
};

export default AppearanceSettings;
