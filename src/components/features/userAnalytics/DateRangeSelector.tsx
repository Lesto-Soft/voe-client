// src/components/features/userAnalytics/DateRangeSelector.tsx
import React, { useState, useEffect } from "react"; // 1. Import useState and useEffect from "react";
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
  // 2. ADD STATE TO TRACK THE ACTIVE PRESET
  // Initialize with "All Time" as the default.
  const [activePreset, setActivePreset] = useState<string | null>("All Time");

  const handlePresetClick = (preset: { label: string; days: number }) => {
    // Set the active preset label
    setActivePreset(preset.label);
    onDateRangeChange({
      startDate: startOfDay(subDays(new Date(), preset.days)),
      endDate: endOfDay(new Date()),
    });
  };

  const handleAllTimeClick = () => {
    // Set the active preset to "All Time"
    setActivePreset("All Time");
    onDateRangeChange({ startDate: null, endDate: null });
  };

  const handleDateInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "start" | "end"
  ) => {
    // A custom date change means no preset is active
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

  // This component doesn't know about "isAllTimeActive" directly anymore,
  // it relies on the `activePreset` state.

  return (
    <>
      <style>{customInputStyles}</style>
      <div className="flex flex-row justify-between border-t pt-1 border-gray-200">
        <div className="flex items-center justify-center space-x-1 sm:space-x-2 overflow-x-auto custom-scrollbar-xs">
          {/* 3. UPDATE THE ACTIVE CHECK FOR THE BUTTONS */}
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
