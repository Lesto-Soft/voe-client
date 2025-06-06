// src/components/features/userAnalytics/DateRangeSelector.tsx
import React from "react";
import { startOfDay, endOfDay, subDays } from "../../../utils/dateUtils";

interface DateRangeSelectorProps {
  dateRange: { startDate: Date | null; endDate: Date | null };
  onDateRangeChange: (range: {
    startDate: Date | null;
    endDate: Date | null;
  }) => void;
}

const presets = [
  { label: "Last 7 Days", days: 6 },
  { label: "Last 30 Days", days: 29 },
  { label: "Last 90 Days", days: 89 },
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
  const handlePresetClick = (days: number) => {
    onDateRangeChange({
      startDate: startOfDay(subDays(new Date(), days)),
      endDate: endOfDay(new Date()),
    });
  };

  const handleAllTimeClick = () => {
    onDateRangeChange({ startDate: null, endDate: null });
  };

  const handleDateInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "start" | "end"
  ) => {
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
    `px-3 py-1 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-colors duration-150 focus:outline-none ${
      isActive
        ? "bg-indigo-600 text-white shadow-sm"
        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
    }`;

  const isAllTimeActive = !dateRange.startDate && !dateRange.endDate;

  return (
    <div className="mb-3 space-y-2">
      <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto pb-1 custom-scrollbar-xs">
        <button
          onClick={handleAllTimeClick}
          className={getButtonClass(isAllTimeActive)}
        >
          All Time
        </button>
        {presets.map((preset) => (
          <button
            key={preset.label}
            onClick={() => handlePresetClick(preset.days)}
            className={getButtonClass(false)} // Active state for presets can be complex, skipping for now
          >
            {preset.label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-x-2 text-sm">
        <span className="text-gray-600">From:</span>
        <input
          type="date"
          value={toInputFormat(dateRange.startDate)}
          onChange={(e) => handleDateInputChange(e, "start")}
          className="p-1.5 border border-gray-300 rounded bg-white text-sm shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        />
        <span className="text-gray-600">To:</span>
        <input
          type="date"
          value={toInputFormat(dateRange.endDate)}
          onChange={(e) => handleDateInputChange(e, "end")}
          min={toInputFormat(dateRange.startDate)}
          className="p-1.5 border border-gray-300 rounded bg-white text-sm shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
    </div>
  );
};

export default DateRangeSelector;
