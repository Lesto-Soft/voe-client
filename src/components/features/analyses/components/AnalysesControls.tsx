// components/features/analyses/components/AnalysesControls.tsx
import React from "react";
import { ViewMode, BarChartDisplayMode } from "../types";
import { MONTH_NAMES } from "../constants";
import { getStartAndEndOfWeek } from "../../../../utils/dateUtils";
import {
  ViewColumnsIcon,
  Square3Stack3DIcon,
} from "@heroicons/react/24/outline";

interface AnalysesControlsProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  barChartMode: BarChartDisplayMode;
  setBarChartMode: (mode: BarChartDisplayMode) => void;
  // --- NEW: Add props for the new toggle ---
  barChartStyle: "grouped" | "stacked";
  setBarChartStyle: (style: "grouped" | "stacked") => void;
  // -----------------------------------------
  currentYear: number;
  setCurrentYear: (year: number) => void;
  uniqueYears: number[];
  currentMonth: number;
  setCurrentMonth: (month: number) => void;
  currentWeek: number;
  setCurrentWeek: (week: number) => void;
  customStartDate: Date | null;
  customEndDate: Date | null;
  handleDateInputChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "start" | "end"
  ) => void;
  startDateForPies: Date | null;
  endDateForPies: Date | null;
}

const AnalysesControls: React.FC<AnalysesControlsProps> = (props) => {
  const {
    viewMode,
    setViewMode,
    barChartMode,
    setBarChartMode,
    // --- NEW: Destructure the new props ---
    barChartStyle,
    setBarChartStyle,
    // ------------------------------------
    currentYear,
    setCurrentYear,
    uniqueYears,
    currentMonth,
    setCurrentMonth,
    currentWeek,
    setCurrentWeek,
    customStartDate,
    customEndDate,
    handleDateInputChange,
    startDateForPies,
    endDateForPies,
  } = props;

  // This is a shared part of the UI for toggles, let's create a helper component/function for it
  const renderToggles = () => (
    <div className="flex items-center space-x-4 ml-auto">
      {/* === REPLACE THIS ENTIRE BLOCK === */}
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-600">
          Стил на графиката:
        </span>
        <button
          type="button"
          onClick={() => setBarChartStyle("grouped")}
          title="Групиран" // Tooltip for accessibility
          className={`p-1.5 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 transition-colors ${
            barChartStyle === "grouped"
              ? "bg-sky-600 text-white shadow-sm"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          <ViewColumnsIcon className="h-5 w-5" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => setBarChartStyle("stacked")}
          title="Натрупан" // Tooltip for accessibility
          className={`p-1.5 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 transition-colors ${
            barChartStyle === "stacked"
              ? "bg-sky-600 text-white shadow-sm"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          <Square3Stack3DIcon className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
      {/* === END OF REPLACEMENT === */}

      {/* This part for "Покажи по:" remains the same */}
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-600">Покажи по:</span>
        <button
          onClick={() => setBarChartMode("type")}
          className={`px-3 py-1.5 text-xs sm:text-sm rounded-md focus:outline-none ${
            barChartMode === "type"
              ? "bg-sky-600 text-white shadow-sm"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Тип
        </button>
        <button
          onClick={() => setBarChartMode("priority")}
          className={`px-3 py-1.5 text-xs sm:text-sm rounded-md focus:outline-none ${
            barChartMode === "priority"
              ? "bg-sky-600 text-white shadow-sm"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Приоритет
        </button>
      </div>
    </div>
  );

  const renderDateControls = () => {
    let weekDateRangeStr = "";
    if (viewMode === "weekly") {
      try {
        const { start, end } = getStartAndEndOfWeek(currentWeek, currentYear);
        weekDateRangeStr = ` (${start.toLocaleDateString("bg-BG", {
          day: "2-digit",
          month: "2-digit",
        })} - ${end.toLocaleDateString("bg-BG", {
          day: "2-digit",
          month: "2-digit",
        })})`;
      } catch (error) {
        console.error("Error calculating week date range:", error);
        weekDateRangeStr = " (грешка в датите)";
      }
    }

    let displayedPeriod = "Зареждане...";
    if (viewMode === "all") {
      displayedPeriod = "Всички данни";
    } else if (viewMode === "yearly") {
      displayedPeriod = `Година ${currentYear}`;
    } else if (viewMode === "monthly" && startDateForPies) {
      displayedPeriod = `${
        MONTH_NAMES[startDateForPies.getMonth()]
      } ${startDateForPies.getFullYear()}`;
    } else if (viewMode === "weekly" && startDateForPies) {
      displayedPeriod = `Седмица ${currentWeek}, ${currentYear}${weekDateRangeStr}`;
    } else if (viewMode === "custom" && startDateForPies && endDateForPies) {
      displayedPeriod = `${startDateForPies.toLocaleDateString(
        "bg-BG"
      )} - ${endDateForPies.toLocaleDateString("bg-BG")}`;
    } else if (viewMode === "custom") {
      displayedPeriod = "Изберете период";
    }

    return (
      <div className="flex flex-wrap gap-x-3 gap-y-2 items-center p-3 bg-gray-50 border-b border-gray-200 min-h-16">
        {/* Year selector */}
        {(viewMode === "yearly" ||
          viewMode === "monthly" ||
          viewMode === "weekly") && (
          <select
            value={currentYear}
            onChange={(e) => setCurrentYear(parseInt(e.target.value))}
            className="p-2 border border-gray-300 rounded bg-white text-sm shadow-sm focus:ring-sky-500 focus:border-sky-500"
          >
            {uniqueYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        )}
        {/* Month selector */}
        {viewMode === "monthly" && (
          <select
            value={currentMonth}
            onChange={(e) => setCurrentMonth(parseInt(e.target.value))}
            className="p-2 border border-gray-300 rounded bg-white text-sm shadow-sm focus:ring-sky-500 focus:border-sky-500"
          >
            {MONTH_NAMES.map((name, index) => (
              <option key={index + 1} value={index + 1}>
                {name}
              </option>
            ))}
          </select>
        )}
        {/* Week selector */}
        {viewMode === "weekly" && (
          <div className="flex items-center gap-1">
            <span className="text-sm text-gray-600">Седмица:</span>
            <input
              type="number"
              value={currentWeek}
              onChange={(e) =>
                setCurrentWeek(
                  Math.max(1, Math.min(53, parseInt(e.target.value) || 1))
                )
              }
              className="p-2 border border-gray-300 rounded bg-white text-sm w-16 shadow-sm focus:ring-sky-500 focus:border-sky-500"
              min="1"
              max="53"
            />
            <span className="text-xs text-gray-500 whitespace-nowrap">
              {weekDateRangeStr}
            </span>
          </div>
        )}
        {/* Custom date inputs */}
        {viewMode === "custom" && (
          <>
            <input
              type="date"
              value={
                customStartDate
                  ? customStartDate.toISOString().split("T")[0]
                  : ""
              }
              onChange={(e) => handleDateInputChange(e, "start")}
              className="p-2 border border-gray-300 rounded bg-white text-sm shadow-sm focus:ring-sky-500 focus:border-sky-500"
            />
            <span className="text-gray-500">-</span>
            <input
              type="date"
              value={
                customEndDate ? customEndDate.toISOString().split("T")[0] : ""
              }
              onChange={(e) => handleDateInputChange(e, "end")}
              min={
                customStartDate
                  ? customStartDate.toISOString().split("T")[0]
                  : undefined
              }
              className="p-2 border border-gray-300 rounded bg-white text-sm shadow-sm focus:ring-sky-500 focus:border-sky-500"
            />
          </>
        )}

        <div
          className="text-sm text-gray-700 font-medium bg-sky-100 px-2 py-1 rounded whitespace-nowrap overflow-hidden text-ellipsis"
          style={{ maxWidth: "300px" }}
          title={displayedPeriod}
        >
          {displayedPeriod}
        </div>

        {/* --- MODIFIED: Use the new renderToggles function --- */}
        {renderToggles()}
      </div>
    );
  };

  return (
    <>
      <div className="flex space-x-0 border-b border-gray-200">
        {(["all", "yearly", "monthly", "weekly", "custom"] as ViewMode[]).map(
          (mode) => (
            <button
              key={mode}
              className={`px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-medium focus:outline-none -mb-px border-b-2 ${
                viewMode === mode
                  ? "border-sky-500 text-sky-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
              onClick={() => setViewMode(mode)}
            >
              {mode === "all"
                ? "Всички"
                : mode === "yearly"
                ? "Годишни"
                : mode === "monthly"
                ? "Месечни"
                : mode === "weekly"
                ? "Седмични"
                : "Период"}
            </button>
          )
        )}
      </div>

      {/* Simplified rendering logic */}
      {viewMode === "all" ? (
        <div className="flex flex-wrap gap-x-3 gap-y-2 items-center p-3 bg-gray-50 border-b border-gray-200 min-h-16">
          <div className="text-sm text-gray-700 font-medium bg-sky-100 px-2 py-1 rounded">
            Всички данни
          </div>
          {/* --- MODIFIED: Use the new renderToggles function --- */}
          {renderToggles()}
        </div>
      ) : (
        renderDateControls()
      )}
    </>
  );
};

export default AnalysesControls;
