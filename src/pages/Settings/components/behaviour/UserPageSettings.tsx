import React, { useState, useEffect } from "react";
import DateRangeSelector from "../../../../components/features/userAnalytics/DateRangeSelector";

const UserPageSettings: React.FC = () => {
  // State for this page's specific settings
  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });
  const [defaultView, setDefaultView] = useState<"standard" | "analytical">(
    "standard"
  );
  const [panels, setPanels] = useState({
    information: true,
    activity: true,
    statistics: false,
  });

  // NEW: Effect to enforce panel visibility based on the selected view
  useEffect(() => {
    if (defaultView === "analytical") {
      // When switching to Analytical, ensure Statistics is ON
      setPanels((prev) => ({ ...prev, statistics: true }));
    } else if (defaultView === "standard") {
      // When switching to Standard, ensure Activity is ON
      setPanels((prev) => ({ ...prev, activity: true }));
    }
  }, [defaultView]); // This effect runs whenever the defaultView changes

  const handlePanelToggle = (panel: keyof typeof panels) => {
    setPanels((prev) => ({ ...prev, [panel]: !prev[panel] }));
  };

  const handleSave = () => {
    const settingsToSave = { isDateFilterOpen, dateRange, defaultView, panels };
    console.log("Saving User Page Default Settings:", settingsToSave);
    alert("Настройките за страница 'Потребител' са запазени (симулация).");
  };

  return (
    <div className="space-y-8">
      {/* Date Filter Settings */}
      <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isDateFilterOpen}
            onChange={(e) => setIsDateFilterOpen(e.target.checked)}
            className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="font-medium text-gray-700">
            Филтърът за дата да е активен по подразбиране
          </span>
        </label>
        <div className={!isDateFilterOpen ? "opacity-50" : ""}>
          <DateRangeSelector
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
          />
        </div>
      </div>

      {/* View and Panel Settings */}
      <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Изглед по подразбиране
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => setDefaultView("standard")}
              className={`px-3 py-1 text-sm rounded ${
                defaultView === "standard"
                  ? "bg-blue-600 text-white"
                  : "bg-white hover:bg-gray-100"
              }`}
            >
              Стандартен
            </button>
            <button
              onClick={() => setDefaultView("analytical")}
              className={`px-3 py-1 text-sm rounded ${
                defaultView === "analytical"
                  ? "bg-blue-600 text-white"
                  : "bg-white hover:bg-gray-100"
              }`}
            >
              Аналитичен
            </button>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Панели по подразбиране
          </h3>
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={panels.information}
                onChange={() => handlePanelToggle("information")}
                className="h-4 w-4 rounded"
              />{" "}
              Панел "Информация"
            </label>

            {defaultView === "standard" ? (
              <>
                <label className="flex items-center gap-2 cursor-not-allowed opacity-70">
                  <input
                    type="checkbox"
                    checked={panels.activity}
                    onChange={() => handlePanelToggle("activity")}
                    disabled={true}
                    className="h-4 w-4 rounded"
                  />{" "}
                  Панел "Активност"
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={panels.statistics}
                    onChange={() => handlePanelToggle("statistics")}
                    className="h-4 w-4 rounded"
                  />{" "}
                  Панел "Статистика"
                </label>
              </>
            ) : (
              <>
                <label className="flex items-center gap-2 cursor-not-allowed opacity-70">
                  <input
                    type="checkbox"
                    checked={panels.statistics}
                    onChange={() => handlePanelToggle("statistics")}
                    disabled={true}
                    className="h-4 w-4 rounded"
                  />{" "}
                  Панел "Статистика"
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={panels.activity}
                    onChange={() => handlePanelToggle("activity")}
                    className="h-4 w-4 rounded"
                  />{" "}
                  Панел "Активност"
                </label>
              </>
            )}
          </div>
        </div>
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

export default UserPageSettings;
