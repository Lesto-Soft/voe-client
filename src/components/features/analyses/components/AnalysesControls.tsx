// src/components/features/analyses/components/AnalysesControls.tsx
import React from "react";
import { ViewMode, BarChartDisplayMode } from "../types";
import { MONTH_NAMES } from "../constants";
import { getStartAndEndOfWeek } from "../../../../utils/dateUtils";
import {
  ViewColumnsIcon,
  Square3Stack3DIcon,
} from "@heroicons/react/24/outline";
import { customInputStyles } from "../../../../utils/style-helpers";
import DateRangeSelector from "../../userAnalytics/DateRangeSelector";

interface AnalysesControlsProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  barChartMode: BarChartDisplayMode;
  setBarChartMode: (mode: BarChartDisplayMode) => void;
  barChartStyle: "grouped" | "stacked";
  setBarChartStyle: (style: "grouped" | "stacked") => void;
  currentYear: number;
  setCurrentYear: (year: number) => void;
  uniqueYears: number[];
  currentMonth: number;
  setCurrentMonth: (month: number) => void;
  currentWeek: number;
  setCurrentWeek: (week: number) => void;
  customStartDate: Date | null;
  customEndDate: Date | null;
  handleCustomDateRangeChange: (range: {
    startDate: Date | null;
    endDate: Date | null;
  }) => void;
  startDateForPies: Date | null;
  endDateForPies: Date | null;
  activeTopTab?: "cases" | "tasks";
  setActiveTopTab?: (tab: "cases" | "tasks") => void;
}

const AnalysesControls: React.FC<AnalysesControlsProps> = (props) => {
  const {
    viewMode,
    setViewMode,
    barChartMode,
    setBarChartMode,
    barChartStyle,
    setBarChartStyle,
    currentYear,
    setCurrentYear,
    uniqueYears,
    currentMonth,
    setCurrentMonth,
    currentWeek,
    setCurrentWeek,
    customStartDate,
    customEndDate,
    handleCustomDateRangeChange,
    startDateForPies,
    // endDateForPies,
    activeTopTab,
    setActiveTopTab,
  } = props;

  const isTasksTab = activeTopTab === "tasks";

  const renderToggles = () => (
    <div className="flex items-center space-x-4 ml-auto">
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-600">
          Стил на графиката:
        </span>
        <button
          type="button"
          onClick={() => setBarChartStyle("grouped")}
          title="Групиран" // Tooltip for accessibility
          className={`hover:cursor-pointer p-1.5 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 transition-colors ${
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
          className={`hover:cursor-pointer p-1.5 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 transition-colors ${
            barChartStyle === "stacked"
              ? "bg-sky-600 text-white shadow-sm"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          <Square3Stack3DIcon className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-600">Покажи по:</span>
        <button
          onClick={() => setBarChartMode(isTasksTab ? "status" : "type")}
          className={`hover:cursor-pointer px-3 py-1.5 text-xs sm:text-sm rounded-md focus:outline-none ${
            barChartMode === (isTasksTab ? "status" : "type")
              ? "bg-sky-600 text-white shadow-sm"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          {isTasksTab ? "Статус" : "Тип"}
        </button>
        <button
          onClick={() => setBarChartMode("priority")}
          className={`hover:cursor-pointer px-3 py-1.5 text-xs sm:text-sm rounded-md focus:outline-none ${
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
    console.log(displayedPeriod);
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
    } else if (viewMode === "custom") {
      // ✅ UPDATED: This logic now handles single-sided date ranges correctly.
      // It uses the direct custom props for clarity.
      const startStr = customStartDate
        ? customStartDate.toLocaleDateString("bg-BG")
        : null;
      const endStr = customEndDate
        ? customEndDate.toLocaleDateString("bg-BG")
        : null;

      if (startStr && endStr) {
        displayedPeriod = `${startStr} - ${endStr}`;
      } else if (startStr) {
        displayedPeriod = `От ${startStr}`;
      } else if (endStr) {
        displayedPeriod = `До ${endStr}`;
      } else {
        displayedPeriod = "Изберете период";
      }
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
            className="hover:cursor-pointer p-2 border border-gray-300 rounded bg-white text-sm shadow-sm focus:ring-sky-500 focus:border-sky-500"
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
            className="hover:cursor-pointer p-2 border border-gray-300 rounded bg-white text-sm shadow-sm focus:ring-sky-500 focus:border-sky-500"
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
              className="custom-number-input p-2 border border-gray-300 rounded bg-white text-sm w-16 shadow-sm focus:ring-sky-500 focus:border-sky-500"
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
          <DateRangeSelector
            dateRange={{
              startDate: customStartDate,
              endDate: customEndDate,
            }}
            onDateRangeChange={handleCustomDateRangeChange}
          />
        )}

        {/* we do not need this displayed period for anything other than the total period
         <div
          className="text-sm text-gray-700 font-medium bg-sky-100 px-2 py-1 rounded whitespace-nowrap overflow-hidden text-ellipsis"
          style={{ maxWidth: "300px" }}
          title={displayedPeriod}
        >
          {displayedPeriod}
        </div> */}

        {renderToggles()}
      </div>
    );
  };

  return (
    <>
      <style>{customInputStyles}</style>
      <div className="flex items-center border-b border-gray-200">
        {/* Tab toggle: Сигнали / Задачи */}
        {setActiveTopTab && (
          <div className="flex items-center mr-4 pl-3">
            <div className="inline-flex rounded-md shadow-sm" role="group">
              <button
                type="button"
                onClick={() => setActiveTopTab("cases")}
                className={`hover:cursor-pointer px-3 py-1.5 text-xs font-medium ${
                  activeTopTab === "cases"
                    ? "bg-sky-600 text-white z-10 ring-1 ring-sky-500"
                    : "bg-white text-gray-900 hover:bg-gray-100"
                } rounded-l-lg border border-gray-200 focus:z-10 focus:ring-1 focus:ring-sky-500`}
              >
                Сигнали
              </button>
              <button
                type="button"
                onClick={() => setActiveTopTab("tasks")}
                className={`hover:cursor-pointer px-3 py-1.5 text-xs font-medium ${
                  activeTopTab === "tasks"
                    ? "bg-sky-600 text-white z-10 ring-1 ring-sky-500"
                    : "bg-white text-gray-900 hover:bg-gray-100"
                } rounded-r-md border border-gray-200 focus:z-10 focus:ring-1 focus:ring-sky-500`}
              >
                Задачи
              </button>
            </div>
          </div>
        )}
        {(["all", "yearly", "monthly", "weekly", "custom"] as ViewMode[]).map(
          (mode) => (
            <button
              key={mode}
              className={`hover:cursor-pointer px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-medium focus:outline-none -mb-px border-b-2 ${
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
          {renderToggles()}
        </div>
      ) : (
        renderDateControls()
      )}
    </>
  );
};

export default AnalysesControls;
