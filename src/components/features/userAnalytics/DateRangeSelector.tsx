import React, { useState, useEffect, useRef } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import { bg } from "date-fns/locale/bg";
import { startOfDay, endOfDay, subDays } from "../../../utils/dateUtils";
import { XCircleIcon } from "@heroicons/react/24/solid";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

import "react-datepicker/dist/react-datepicker.css";

registerLocale("bg", bg);

// Custom Header Component for the DatePicker
const CustomHeader = ({
  date,
  changeYear,
  decreaseMonth,
  increaseMonth,
  prevMonthButtonDisabled,
  nextMonthButtonDisabled,
}: {
  date: Date;
  changeYear: (year: number) => void;
  decreaseMonth: () => void;
  increaseMonth: () => void;
  prevMonthButtonDisabled: boolean;
  nextMonthButtonDisabled: boolean;
}) => {
  const currentYear = new Date().getFullYear();
  const startYear = 2020;
  const years = [];
  for (let i = currentYear; i >= startYear; i--) {
    years.push(i);
  }

  return (
    <div className="flex items-center justify-between px-2 py-1 bg-gray-50 border-b border-gray-200">
      <button
        type="button"
        onClick={decreaseMonth}
        disabled={prevMonthButtonDisabled}
        className="p-1 rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
      </button>
      <div className="flex items-baseline gap-x-2">
        <span className="text-sm font-semibold text-gray-800 capitalize">
          {date.toLocaleString("bg-BG", { month: "long" })}
        </span>
        <select
          value={date.getFullYear()}
          onChange={({ target: { value } }) => changeYear(parseInt(value))}
          className="text-sm font-semibold text-gray-700 bg-transparent border-0 cursor-pointer focus:ring-0 p-0"
        >
          {years.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
      <button
        type="button"
        onClick={increaseMonth}
        disabled={nextMonthButtonDisabled}
        className="p-1 rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronRightIcon className="h-5 w-5 text-gray-600" />
      </button>
    </div>
  );
};

interface DateRangeSelectorProps {
  dateRange: { startDate: Date | null; endDate: Date | null };
  onDateRangeChange: (range: {
    startDate: Date | null;
    endDate: Date | null;
  }) => void;
  justify?: "end" | "between";
}

const presets = [
  { label: "7 Дни", shortLabel: "7", days: 6 },
  { label: "30 Дни", shortLabel: "30", days: 29 },
  { label: "90 Дни", shortLabel: "90", days: 89 },
];

const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  dateRange,
  onDateRangeChange,
  justify = "between",
}) => {
  const [activePreset, setActivePreset] = useState<string | null>("All Time");
  const today = new Date();
  // create a ref for the scrollable container
  const presetsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const { startDate, endDate } = dateRange;

    if (!startDate && !endDate) {
      setActivePreset("All Time");
      return;
    }

    const isSameDay = (d1: Date | null, d2: Date | null): boolean => {
      if (!d1 || !d2) return false;
      return (
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate()
      );
    };

    if (isSameDay(endDate, endOfDay(new Date()))) {
      for (const preset of presets) {
        const presetStartDate = startOfDay(subDays(new Date(), preset.days));
        if (isSameDay(startDate, presetStartDate)) {
          setActivePreset(preset.label);
          return;
        }
      }
    }

    setActivePreset(null);
  }, [dateRange]);

  // add a new useEffect to handle mouse wheel scrolling
  useEffect(() => {
    const scrollContainer = presetsContainerRef.current;
    if (!scrollContainer) return;

    const handleWheel = (e: WheelEvent) => {
      // Proceed only if scrolling vertically and the container is overflowing
      if (
        e.deltaY !== 0 &&
        scrollContainer.scrollWidth > scrollContainer.clientWidth
      ) {
        e.preventDefault(); // Prevent the main page from scrolling
        scrollContainer.scrollBy({
          left: e.deltaY * 1.5, // Use deltaY to scroll horizontally
          behavior: "smooth",
        });
      }
    };

    scrollContainer.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      scrollContainer.removeEventListener("wheel", handleWheel);
    };
  }, []); // Run this effect only once

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

  const handleDateChange = (date: Date | null, type: "start" | "end") => {
    setActivePreset(null);
    if (type === "start") {
      onDateRangeChange({
        startDate: date ? startOfDay(date) : null,
        endDate: dateRange.endDate,
      });
    } else {
      onDateRangeChange({
        startDate: dateRange.startDate,
        endDate: date ? endOfDay(date) : null,
      });
    }
  };

  const handleClearSingleDate = (type: "start" | "end") => {
    setActivePreset(null);
    if (type === "start") {
      onDateRangeChange({
        startDate: null,
        endDate: dateRange.endDate,
      });
    } else {
      onDateRangeChange({
        startDate: dateRange.startDate,
        endDate: null,
      });
    }
  };

  const getButtonClass = (isActive: boolean) =>
    `border hover:cursor-pointer px-1 py-0.5 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-colors duration-150 focus:outline-none ${
      isActive
        ? "bg-indigo-600 text-white shadow-sm border-indigo-700"
        : "bg-white text-gray-700 hover:bg-gray-200 border-gray-200"
    }`;

  return (
    // attach the ref and add horizontal padding here
    <div
      className={`flex flex-row items-center space-x-1 ${
        justify === "end" ? "justify-end" : "justify-between"
      }`}
    >
      <div
        ref={presetsContainerRef}
        className="flex items-center justify-start space-x-1 sm:space-x-2 overflow-x-auto custom-scrollbar-xs px-1"
      >
        <button
          onClick={handleAllTimeClick}
          className={getButtonClass(activePreset === "All Time")}
        >
          <span className="lg:hidden">Цял</span>
          <span className="hidden lg:inline">Цял период</span>
        </button>
        {presets.map((preset) => (
          <button
            key={preset.label}
            onClick={() => handlePresetClick(preset)}
            className={getButtonClass(activePreset === preset.label)}
          >
            <span className="lg:hidden">{preset.shortLabel}</span>
            <span className="hidden lg:inline">{preset.label}</span>
          </button>
        ))}
      </div>
      <div className="flex items-center gap-x-2 text-sm">
        <div className="relative flex items-center">
          <span className="text-gray-600 mr-1">От:</span>
          <DatePicker
            selected={dateRange.startDate}
            onChange={(date) => handleDateChange(date, "start")}
            selectsStart
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            maxDate={today}
            dateFormat="dd/MM/yy"
            locale="bg"
            popperPlacement="bottom-end"
            showYearDropdown
            scrollableYearDropdown
            yearDropdownItemNumber={15}
            renderCustomHeader={(props) => <CustomHeader {...props} />}
            className="p-0.5 pl-2 pr-7 border border-gray-300 rounded bg-white text-sm shadow-sm focus:outline-none focus:border-indigo-500 w-28 cursor-pointer"
            calendarClassName="font-mulish"
            placeholderText="дд/мм/гг"
          />
          {dateRange.startDate && (
            <button
              onClick={() => handleClearSingleDate("start")}
              className="cursor-pointer absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
              title="Изчисти"
            >
              <XCircleIcon className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="relative flex items-center">
          <span className="text-gray-600 mr-1">До:</span>
          <DatePicker
            selected={dateRange.endDate}
            onChange={(date) => handleDateChange(date, "end")}
            selectsEnd
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            minDate={dateRange.startDate || undefined}
            maxDate={today}
            dateFormat="dd/MM/yy"
            locale="bg"
            popperPlacement="bottom-end"
            showYearDropdown
            scrollableYearDropdown
            yearDropdownItemNumber={15}
            renderCustomHeader={(props) => <CustomHeader {...props} />}
            className="p-0.5 pl-2 pr-7 border border-gray-300 rounded bg-white text-sm shadow-sm focus:outline-none focus:border-indigo-500 w-28 cursor-pointer"
            calendarClassName="font-mulish"
            placeholderText="дд/мм/гг"
          />
          {dateRange.endDate && (
            <button
              onClick={() => handleClearSingleDate("end")}
              className="cursor-pointer absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
              title="Изчисти"
            >
              <XCircleIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DateRangeSelector;
