// src/components/features/userAnalytics/DateRangeSelector.tsx
import React, { useState, useEffect } from "react";
import { startOfDay, endOfDay, subDays } from "../../../utils/dateUtils";
import { customInputStyles } from "../../../utils/style-helpers";

interface DateRangeSelectorProps {
  dateRange: { startDate: Date | null; endDate: Date | null };
  onDateRangeChange: (range: {
    startDate: Date | null;
    endDate: Date | null;
  }) => void;
}

const presets = [
  { label: "7 Дни", days: 6 },
  { label: "30 Дни", days: 29 },
  { label: "90 Дни", days: 89 },
];

// Helper to format date for the input element (YYYY-MM-DD)
const toInputFormat = (date: Date | null): string => {
  if (!date) return "";
  return date.toISOString().split("T")[0];
};

const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  dateRange,
  onDateRangeChange,
}) => {
  const [activePreset, setActivePreset] = useState<string | null>("All Time");

  // ADDED: This effect syncs the highlighted button with the actual date range from props.
  useEffect(() => {
    const { startDate, endDate } = dateRange;

    // Case 1: "All Time" is selected.
    if (!startDate && !endDate) {
      setActivePreset("All Time");
      return;
    }

    // Helper to compare if two dates are the same day, ignoring time.
    const isSameDay = (d1: Date | null, d2: Date | null): boolean => {
      if (!d1 || !d2) return false;
      return (
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate()
      );
    };

    // Case 2: Check if the date range matches one of the presets.
    // Our presets always end on the current day.
    if (isSameDay(endDate, endOfDay(new Date()))) {
      for (const preset of presets) {
        const presetStartDate = startOfDay(subDays(new Date(), preset.days));
        if (isSameDay(startDate, presetStartDate)) {
          setActivePreset(preset.label);
          return; // Found a matching preset, so we exit.
        }
      }
    }

    // Case 3: If no presets match, it's a custom date range.
    setActivePreset(null);
  }, [dateRange]); // This hook runs whenever the dateRange prop changes.

  const handlePresetClick = (preset: { label: string; days: number }) => {
    setActivePreset(preset.label);
    onDateRangeChange({
      startDate: startOfDay(subDays(new Date(), preset.days)),
      endDate: endOfDay(new Date()),
    });
  };

  const handleAllTimeClick = () => {
    setActivePreset("All Time");
    onDateRangeChange({ startDate: null, endDate: null });
  };

  const handleDateInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "start" | "end"
  ) => {
    setActivePreset(null);
    const valueAsDate = e.target.value ? new Date(e.target.value) : null;
    if (type === "start") {
      onDateRangeChange({
        startDate: valueAsDate ? startOfDay(valueAsDate) : null,
        endDate: dateRange.endDate,
      });
    } else {
      onDateRangeChange({
        startDate: dateRange.startDate,
        endDate: valueAsDate ? endOfDay(valueAsDate) : null,
      });
    }
  };

  const getButtonClass = (isActive: boolean) =>
    `hover:cursor-pointer px-3 py-1 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-colors duration-150 focus:outline-none ${
      isActive
        ? "bg-indigo-600 text-white shadow-sm"
        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
    }`;

  return (
    <>
      <style>{customInputStyles}</style>
      <div className="flex flex-row justify-end space-x-5">
        <div className="flex items-center justify-center space-x-1 sm:space-x-2 overflow-x-auto custom-scrollbar-xs">
          <button
            onClick={handleAllTimeClick}
            className={getButtonClass(activePreset === "All Time")}
          >
            Целия период
          </button>
          {presets.map((preset) => (
            <button
              key={preset.label}
              onClick={() => handlePresetClick(preset)}
              className={getButtonClass(activePreset === preset.label)}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-x-2 text-sm">
          <span className="text-gray-600">От:</span>
          <input
            type="date"
            value={toInputFormat(dateRange.startDate)}
            onChange={(e) => handleDateInputChange(e, "start")}
            className="custom-date-input p-1.5 border border-gray-300 rounded bg-white text-sm shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
          <span className="text-gray-600">До:</span>
          <input
            type="date"
            value={toInputFormat(dateRange.endDate)}
            onChange={(e) => handleDateInputChange(e, "end")}
            min={toInputFormat(dateRange.startDate)}
            className="custom-date-input p-1.5 border border-gray-300 rounded bg-white text-sm shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>
    </>
  );
};

export default DateRangeSelector;
