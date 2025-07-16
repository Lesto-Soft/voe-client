// components/features/analyses/hooks/useAnalysesFilters.ts
import { useState, useMemo, useEffect } from "react";
import { ICase } from "../../../../db/interfaces";
import {
  getWeekOfYear,
  getStartAndEndOfWeek,
} from "../../../../utils/dateUtils";
import { ViewMode, BarChartDisplayMode } from "../types";

export const useAnalysesFilters = (allCases: ICase[] | undefined) => {
  // --- State Management ---
  const [viewMode, setViewMode] = useState<ViewMode>("all");
  const [barChartMode, setBarChartMode] = useState<BarChartDisplayMode>("type");
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1); // 1-12
  const [currentWeek, setCurrentWeek] = useState(getWeekOfYear(new Date()));
  const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
  const [customEndDate, setCustomEndDate] = useState<Date | null>(null);

  // --- Memoized Calculations for Unique Years ---
  const uniqueYears = useMemo(() => {
    if (!allCases || allCases.length === 0) {
      return [new Date().getFullYear()];
    }
    const yearsSet = new Set<number>();
    allCases.forEach((c: ICase) => {
      if (c.date) {
        const dateObj = new Date(parseInt(c.date));
        if (!isNaN(dateObj.getTime())) {
          yearsSet.add(dateObj.getFullYear());
        }
      }
    });
    // Ensure the current year is included if there's no data for it yet
    yearsSet.add(new Date().getFullYear());
    return Array.from(yearsSet).sort((a, b) => b - a);
  }, [allCases]);

  // --- Effect to Reset Year if it Becomes Invalid ---
  useEffect(() => {
    if (uniqueYears.length > 0 && !uniqueYears.includes(currentYear)) {
      setCurrentYear(uniqueYears[0]);
    }
  }, [uniqueYears, currentYear]);

  // --- Memoized Calculation for Pie Chart Date Range ---
  const { startDateForPies, endDateForPies, isAllTimePies } = useMemo(() => {
    let sDate: Date | null = null;
    let eDate: Date | null = null;
    let allTime = false;

    switch (viewMode) {
      case "all":
        allTime = true;
        break;
      case "yearly":
        sDate = new Date(currentYear, 0, 1, 0, 0, 0, 0);
        eDate = new Date(currentYear, 11, 31, 23, 59, 59, 999);
        break;
      case "monthly":
        sDate = new Date(currentYear, currentMonth - 1, 1, 0, 0, 0, 0);
        eDate = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999); // Day 0 of next month is last day of current month
        break;
      case "weekly":
        ({ start: sDate, end: eDate } = getStartAndEndOfWeek(
          currentWeek,
          currentYear
        ));
        break;
      case "custom":
        if (customStartDate && customEndDate) {
          sDate = new Date(customStartDate);
          sDate.setHours(0, 0, 0, 0);
          eDate = new Date(customEndDate);
          eDate.setHours(23, 59, 59, 999);
        }
        break;
    }
    return {
      startDateForPies: sDate,
      endDateForPies: eDate,
      isAllTimePies: allTime,
    };
  }, [
    viewMode,
    currentYear,
    currentMonth,
    currentWeek,
    customStartDate,
    customEndDate,
  ]);

  // --- Event Handler ---
  const handleDateInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "start" | "end"
  ) => {
    const dateValue = e.target.value ? new Date(e.target.value) : null;
    if (type === "start") {
      setCustomStartDate(dateValue);
      // Reset end date if it's before the new start date
      if (dateValue && customEndDate && dateValue > customEndDate) {
        setCustomEndDate(null);
      }
    } else {
      setCustomEndDate(dateValue);
    }
  };

  // --- Return Values ---
  return {
    // States
    viewMode,
    barChartMode,
    currentYear,
    currentMonth,
    currentWeek,
    customStartDate,
    customEndDate,
    // Derived values
    uniqueYears,
    startDateForPies,
    endDateForPies,
    isAllTimePies,
    // Setters and Handlers
    setViewMode,
    setBarChartMode,
    setCurrentYear,
    setCurrentMonth,
    setCurrentWeek,
    setCustomStartDate,
    setCustomEndDate,
    handleDateInputChange,
  };
};
