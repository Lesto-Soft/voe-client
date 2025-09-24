import React, { useState } from "react";
import { FlagIcon } from "@heroicons/react/24/solid";

const AutomationSettings: React.FC = () => {
  // State for the reminder periods
  const [reminders, setReminders] = useState({
    high: { value: 3, unit: "days" },
    medium: { value: 7, unit: "days" },
    low: { value: 14, unit: "days" },
  });

  // NEW: A single state for the weekend toggle
  const [includeWeekends, setIncludeWeekends] = useState(true);

  const handleSave = () => {
    // The save function now includes the global weekend setting
    console.log("Saving Reminder Settings:", {
      ...reminders,
      includeWeekends,
    });
    alert("Настройките за напомняния са запазени (симулация).");
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-800">
        Автоматични напомняния за сигнали
      </h2>
      <p className="mt-1 text-sm text-gray-600">
        Настройте след колко време системата да изпраща известие за сигнали,
        които не са приключени.
      </p>
      <hr className="my-4 border-gray-200" />
      <div className="space-y-4 max-w-md">
        {/* High Priority */}
        <div className="flex items-center gap-4">
          <label className="w-48 flex items-center gap-1.5 font-semibold text-red-600 flex-shrink-0">
            <FlagIcon className="h-5 w-5" />
            Висок приоритет:
          </label>
          <input
            type="number"
            value={reminders.high.value}
            onChange={(e) =>
              setReminders((p) => ({
                ...p,
                high: { ...p.high, value: Number(e.target.value) },
              }))
            }
            className="w-20 rounded-md border-gray-300 p-2"
          />
          <select
            value={reminders.high.unit}
            onChange={(e) =>
              setReminders((p) => ({
                ...p,
                high: { ...p.high, unit: e.target.value },
              }))
            }
            className="cursor-pointer rounded-md border-gray-300 p-2"
          >
            <option value="days">Дни</option>
            <option value="hours">Часове</option>
          </select>
        </div>

        {/* Medium Priority */}
        <div className="flex items-center gap-4">
          <label className="w-48 flex items-center gap-1.5 font-semibold text-yellow-600 flex-shrink-0">
            <FlagIcon className="h-5 w-5" />
            Среден приоритет:
          </label>
          <input
            type="number"
            value={reminders.medium.value}
            onChange={(e) =>
              setReminders((p) => ({
                ...p,
                medium: { ...p.medium, value: Number(e.target.value) },
              }))
            }
            className="w-20 rounded-md border-gray-300 p-2"
          />
          <select
            value={reminders.medium.unit}
            onChange={(e) =>
              setReminders((p) => ({
                ...p,
                medium: { ...p.medium, unit: e.target.value },
              }))
            }
            className="cursor-pointer rounded-md border-gray-300 p-2"
          >
            <option value="days">Дни</option>
            <option value="hours">Часове</option>
          </select>
        </div>

        {/* Low Priority */}
        <div className="flex items-center gap-4">
          <label className="w-48 flex items-center gap-1.5 font-semibold text-green-600 flex-shrink-0">
            <FlagIcon className="h-5 w-5" />
            Нисък приоритет:
          </label>
          <input
            type="number"
            value={reminders.low.value}
            onChange={(e) =>
              setReminders((p) => ({
                ...p,
                low: { ...p.low, value: Number(e.target.value) },
              }))
            }
            className="w-20 rounded-md border-gray-300 p-2"
          />
          <select
            value={reminders.low.unit}
            onChange={(e) =>
              setReminders((p) => ({
                ...p,
                low: { ...p.low, unit: e.target.value },
              }))
            }
            className="cursor-pointer rounded-md border-gray-300 p-2"
          >
            <option value="days">Дни</option>
            <option value="hours">Часове</option>
          </select>
        </div>
      </div>

      {/* --- NEW: Single Weekend Toggle --- */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <label className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={includeWeekends}
            onChange={(e) => setIncludeWeekends(e.target.checked)}
            className="cursor-pointer h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="font-medium">
            Включи уикендите в изчисляването на периода
          </span>
        </label>
        <p className="ml-8 text-xs text-gray-500">
          Ако е включено, напомнянията ще се броят в календарни дни. Ако е
          изключено - в работни дни.
        </p>
      </div>

      <div className="pt-6 mt-2 border-t border-gray-200 text-right">
        <button
          onClick={handleSave}
          className="cursor-pointer bg-blue-600 text-white px-5 py-2 rounded-md text-sm font-semibold hover:bg-blue-700"
        >
          Запази промените
        </button>
      </div>
    </div>
  );
};

export default AutomationSettings;
