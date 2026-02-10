// src/components/features/analyses/hooks/useAnalysesFilters.ts
import { useState, useMemo, useEffect, useRef } from "react";
import {
  getWeekOfYear,
  getStartAndEndOfWeek,
} from "../../../../utils/dateUtils";
import { ViewMode, BarChartDisplayMode } from "../types";

export const useAnalysesFilters = (
  dates: Date[],
  initialBarChartMode: BarChartDisplayMode = "type"
) => {
  // --- State Management ---
  const [viewMode, setViewMode] = useState<ViewMode>("all");
  const [barChartMode, setBarChartMode] =
    useState<BarChartDisplayMode>(initialBarChartMode);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1); // 1-12
  const [currentWeek, setCurrentWeek] = useState(getWeekOfYear(new Date()));
  const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
  const [customEndDate, setCustomEndDate] = useState<Date | null>(null);

  // Reset barChartMode when initialBarChartMode changes (tab switch)
  const prevInitialMode = useRef(initialBarChartMode);
  useEffect(() => {
    if (prevInitialMode.current !== initialBarChartMode) {
      setBarChartMode(initialBarChartMode);
      prevInitialMode.current = initialBarChartMode;
    }
  }, [initialBarChartMode]);

  // --- Memoized Calculations for Unique Years ---
  const uniqueYears = useMemo(() => {
    if (dates.length === 0) {
      return [new Date().getFullYear()];
    }
    const yearsSet = new Set<number>();
    dates.forEach((d) => {
      if (!isNaN(d.getTime())) {
        yearsSet.add(d.getFullYear());
      }
    });
    // Ensure the current year is included if there's no data for it yet
    yearsSet.add(new Date().getFullYear());
    return Array.from(yearsSet).sort((a, b) => b - a);
  }, [dates]);

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
        eDate = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);
        break;
      case "weekly":
        ({ start: sDate, end: eDate } = getStartAndEndOfWeek(
          currentWeek,
          currentYear
        ));
        break;
      case "custom":
        // ✅ MODIFIED: Replaced the single `&&` check with two separate checks.
        // This ensures that a single selected date is passed through correctly.
        if (customStartDate) {
          sDate = new Date(customStartDate);
          sDate.setHours(0, 0, 0, 0);
        }
        if (customEndDate) {
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
  const handleCustomDateRangeChange = (range: {
    startDate: Date | null;
    endDate: Date | null;
  }) => {
    setCustomStartDate(range.startDate);
    setCustomEndDate(range.endDate);
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
    handleCustomDateRangeChange,
  };
};
