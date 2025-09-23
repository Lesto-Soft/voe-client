import React, { useState } from "react";
import DateRangeSelector from "../../../../components/features/userAnalytics/DateRangeSelector";

const AnalysesSettings: React.FC = () => {
  // State for this page's specific settings
  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });
  const [defaultMainView, setDefaultMainView] = useState<"cases" | "users">(
    "cases"
  );
  const [defaultChartView, setDefaultChartView] = useState<"type" | "priority">(
    "type"
  );
  const [defaultChartStyle, setDefaultChartStyle] = useState<
    "grouped" | "stacked"
  >("grouped");

  const handleSave = () => {
    const settingsToSave = {
      isDateFilterOpen,
      dateRange,
      defaultMainView,
      defaultChartView,
      defaultChartStyle,
    };
    console.log("Saving Analyses Page Default Settings:", settingsToSave);
    alert("Настройките за страница 'Анализи' са запазени (симулация).");
  };

  // Helper sub-component for consistent layout
  const SettingRow: React.FC<{ title: string; children: React.ReactNode }> = ({
    title,
    children,
  }) => (
    <div className="py-4 sm:grid sm:grid-cols-5 sm:gap-3 sm:items-center">
      <h3 className="text-sm font-medium text-gray-700 sm:col-span-1">
        {title}
      </h3>
      <div className="mt-2 sm:mt-0 sm:col-span-4">{children}</div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 divide-y divide-gray-200">
        <SettingRow title="Основен изглед">
          <div className="flex gap-2">
            <button
              onClick={() => setDefaultMainView("cases")}
              className={`px-3 py-1 text-sm rounded ${
                defaultMainView === "cases"
                  ? "bg-blue-600 text-white"
                  : "bg-white hover:bg-gray-100"
              }`}
            >
              Статистики за сигнали
            </button>
            <button
              onClick={() => setDefaultMainView("users")}
              className={`px-3 py-1 text-sm rounded ${
                defaultMainView === "users"
                  ? "bg-blue-600 text-white"
                  : "bg-white hover:bg-gray-100"
              }`}
            >
              Потребителска класация
            </button>
          </div>
        </SettingRow>

        <SettingRow title="Изглед на графиката">
          <div className="flex gap-2">
            <button
              onClick={() => setDefaultChartView("type")}
              className={`px-3 py-1 text-sm rounded ${
                defaultChartView === "type"
                  ? "bg-blue-600 text-white"
                  : "bg-white hover:bg-gray-100"
              }`}
            >
              По Тип
            </button>
            <button
              onClick={() => setDefaultChartView("priority")}
              className={`px-3 py-1 text-sm rounded ${
                defaultChartView === "priority"
                  ? "bg-blue-600 text-white"
                  : "bg-white hover:bg-gray-100"
              }`}
            >
              По Приоритет
            </button>
          </div>
        </SettingRow>

        <SettingRow title="Стил на графиката">
          <div className="flex gap-2">
            <button
              onClick={() => setDefaultChartStyle("grouped")}
              className={`px-3 py-1 text-sm rounded ${
                defaultChartStyle === "grouped"
                  ? "bg-blue-600 text-white"
                  : "bg-white hover:bg-gray-100"
              }`}
            >
              Групиран
            </button>
            <button
              onClick={() => setDefaultChartStyle("stacked")}
              className={`px-3 py-1 text-sm rounded ${
                defaultChartStyle === "stacked"
                  ? "bg-blue-600 text-white"
                  : "bg-white hover:bg-gray-100"
              }`}
            >
              Натрупан
            </button>
          </div>
        </SettingRow>

        <SettingRow title="Филтър за дата">
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isDateFilterOpen}
                onChange={(e) => setIsDateFilterOpen(e.target.checked)}
                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="font-medium text-gray-700 text-sm">
                Активен по подразбиране
              </span>
            </label>
            <div
              className={
                !isDateFilterOpen ? "opacity-50 pointer-events-none" : ""
              }
            >
              <DateRangeSelector
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
              />
            </div>
          </div>
        </SettingRow>
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

export default AnalysesSettings;
