// components/features/analyses/hooks/useProcessedTaskAnalyticsData.ts
import { useMemo } from "react";
import { ITask } from "../../../../db/interfaces";
import {
  getDaysInMonth,
  getStartAndEndOfWeek,
} from "../../../../utils/dateUtils";
import { BarChartDisplayMode, ViewMode } from "../types";
import { BarSeriesConfig } from "../../../charts/BarChart";
import {
  DAY_NAMES_FULL,
  MONTH_NAMES,
  PRIORITY_COLORS,
  PRIORITY_TRANSLATIONS,
  STATUS_COLORS,
  STATUS_TRANSLATIONS,
} from "../constants";

// --- TYPE DEFINITIONS ---
interface AnalyticsFilters {
  viewMode: ViewMode;
  barChartMode: BarChartDisplayMode;
  currentYear: number;
  currentMonth: number;
  currentWeek: number;
  startDateForPies: Date | null;
  endDateForPies: Date | null;
  isAllTimePies: boolean;
}

const parseTaskDate = (task: ITask): Date => new Date(task.createdAt || "");

// --- THE HOOK ---
export const useProcessedTaskAnalyticsData = (
  allTasks: ITask[] | undefined,
  filters: AnalyticsFilters
) => {
  const {
    viewMode,
    barChartMode,
    currentYear,
    currentMonth,
    currentWeek,
    startDateForPies,
    endDateForPies,
    isAllTimePies,
  } = filters;

  const filteredTasksForPieCharts = useMemo(() => {
    if (!allTasks) return [];
    if (isAllTimePies) return allTasks;

    return allTasks.filter((t: ITask) => {
      const taskDate = parseTaskDate(t);
      if (startDateForPies && taskDate < startDateForPies) return false;
      if (endDateForPies && taskDate > endDateForPies) return false;
      return true;
    });
  }, [allTasks, startDateForPies, endDateForPies, isAllTimePies]);

  const barChartDisplayData = useMemo(() => {
    if (!allTasks || allTasks.length === 0) {
      return {
        data: [],
        dataKeyX: "periodLabel",
        title: "Няма данни",
        seriesConfig: [],
      };
    }

    let chartTitle = "";
    let dataForChart: Array<any> = [];
    let seriesConfig: BarSeriesConfig[] = [];

    const statusSeries: BarSeriesConfig[] = [
      { dataKey: "todo", label: STATUS_TRANSLATIONS.TODO, color: STATUS_COLORS.TODO },
      { dataKey: "inProgress", label: STATUS_TRANSLATIONS.IN_PROGRESS, color: STATUS_COLORS.IN_PROGRESS },
      { dataKey: "done", label: STATUS_TRANSLATIONS.DONE, color: STATUS_COLORS.DONE },
    ];
    const prioritySeries: BarSeriesConfig[] = [
      { dataKey: "highPriority", label: PRIORITY_TRANSLATIONS.HIGH, color: PRIORITY_COLORS.HIGH },
      { dataKey: "mediumPriority", label: PRIORITY_TRANSLATIONS.MEDIUM, color: PRIORITY_COLORS.MEDIUM },
      { dataKey: "lowPriority", label: PRIORITY_TRANSLATIONS.LOW, color: PRIORITY_COLORS.LOW },
    ];

    seriesConfig = barChartMode === "status" ? statusSeries : prioritySeries;

    const aggregateTasks = (tasksToAggregate: ITask[]) => {
      if (barChartMode === "status") {
        return {
          todo: tasksToAggregate.filter((t) => t.status === "TODO").length,
          inProgress: tasksToAggregate.filter((t) => t.status === "IN_PROGRESS").length,
          done: tasksToAggregate.filter((t) => t.status === "DONE").length,
        };
      } else {
        return {
          highPriority: tasksToAggregate.filter((t) => t.priority === "HIGH").length,
          mediumPriority: tasksToAggregate.filter((t) => t.priority === "MEDIUM").length,
          lowPriority: tasksToAggregate.filter((t) => t.priority === "LOW").length,
        };
      }
    };

    const modeLabel = barChartMode === "status" ? "по статус" : "по приоритет";

    if (viewMode === "all") {
      chartTitle = `Общо задачи по години (${modeLabel})`;
      const yearlyDataAggregated: { [year: string]: any } = {};
      allTasks.forEach((t: ITask) => {
        const year = parseTaskDate(t).getFullYear().toString();
        if (!yearlyDataAggregated[year]) {
          yearlyDataAggregated[year] = aggregateTasks(
            allTasks.filter(
              (ts: ITask) => parseTaskDate(ts).getFullYear().toString() === year
            )
          );
        }
      });
      dataForChart = Object.keys(yearlyDataAggregated)
        .map((year) => ({ periodLabel: year, ...yearlyDataAggregated[year] }))
        .sort((a, b) => parseInt(a.periodLabel) - parseInt(b.periodLabel));
    } else if (viewMode === "yearly") {
      chartTitle = `Сравнение по месеци (${currentYear}) (${modeLabel})`;
      const yearTasks = allTasks.filter(
        (t: ITask) => parseTaskDate(t).getFullYear() === currentYear
      );
      dataForChart = MONTH_NAMES.map((monthName, index) => {
        const monthTasks = yearTasks.filter(
          (t: ITask) => parseTaskDate(t).getMonth() === index
        );
        return { periodLabel: monthName, ...aggregateTasks(monthTasks) };
      });
    } else if (viewMode === "monthly") {
      chartTitle = `Сравнение по дни (${MONTH_NAMES[currentMonth - 1]} ${currentYear}) (${modeLabel})`;
      const monthTasksFiltered = allTasks.filter((t: ITask) => {
        const taskDate = parseTaskDate(t);
        return (
          taskDate.getFullYear() === currentYear &&
          taskDate.getMonth() === currentMonth - 1
        );
      });
      const daysInSelectedMonth = getDaysInMonth(currentYear, currentMonth);
      dataForChart = Array.from({ length: daysInSelectedMonth }, (_, i) => {
        const dayNumber = i + 1;
        const dayTasks = monthTasksFiltered.filter(
          (t: ITask) => parseTaskDate(t).getDate() === dayNumber
        );
        return { periodLabel: dayNumber.toString(), ...aggregateTasks(dayTasks) };
      });
    } else if (viewMode === "weekly") {
      chartTitle = `Сравнение по дни (Седмица ${currentWeek}, ${currentYear}) (${modeLabel})`;
      const { start, end } = getStartAndEndOfWeek(currentWeek, currentYear);
      const weekTasksFiltered = allTasks.filter((t: ITask) => {
        const d = parseTaskDate(t);
        return d >= start && d <= end;
      });
      dataForChart = DAY_NAMES_FULL.map((dayName, index) => {
        const dayTasks = weekTasksFiltered.filter(
          (t: ITask) => (parseTaskDate(t).getUTCDay() + 6) % 7 === index
        );
        return { periodLabel: dayName, ...aggregateTasks(dayTasks) };
      });
    } else if (viewMode === "custom") {
      let periodString = "Цял период";
      const startStr = startDateForPies?.toLocaleDateString("bg-BG");
      const endStr = endDateForPies?.toLocaleDateString("bg-BG");

      if (startStr && endStr) {
        periodString = `${startStr} - ${endStr}`;
      } else if (startStr) {
        periodString = `От ${startStr}`;
      } else if (endStr) {
        periodString = `До ${endStr}`;
      }

      chartTitle = `Общо по ден от седмицата (${periodString}) (${modeLabel})`;

      const rangeTasksFiltered = allTasks.filter((t: ITask) => {
        const d = parseTaskDate(t);
        if (startDateForPies && d < startDateForPies) return false;
        if (endDateForPies && d > endDateForPies) return false;
        return true;
      });
      dataForChart = DAY_NAMES_FULL.map((name) => {
        const dayTasks = rangeTasksFiltered.filter(
          (t: ITask) =>
            DAY_NAMES_FULL[(parseTaskDate(t).getUTCDay() + 6) % 7] === name
        );
        return { periodLabel: name, ...aggregateTasks(dayTasks) };
      });
    }

    return {
      data: dataForChart,
      dataKeyX: "periodLabel",
      title: chartTitle,
      seriesConfig,
    };
  }, [
    allTasks,
    viewMode,
    barChartMode,
    currentYear,
    currentMonth,
    currentWeek,
    startDateForPies,
    endDateForPies,
  ]);

  const statusPieData = useMemo(() => {
    if (filteredTasksForPieCharts.length === 0) return [];
    const counts: Record<string, number> = { TODO: 0, IN_PROGRESS: 0, DONE: 0 };
    filteredTasksForPieCharts.forEach((t: ITask) => {
      if (counts.hasOwnProperty(t.status)) counts[t.status]++;
    });
    return (Object.keys(counts) as string[])
      .filter((k) => counts[k] > 0)
      .map((k) => ({
        label: STATUS_TRANSLATIONS[k] || k,
        value: counts[k],
        color: STATUS_COLORS[k] || "#CCCCCC",
      }));
  }, [filteredTasksForPieCharts]);

  const priorityPieData = useMemo(() => {
    if (filteredTasksForPieCharts.length === 0) return [];
    const counts: Record<string, number> = { HIGH: 0, MEDIUM: 0, LOW: 0 };
    filteredTasksForPieCharts.forEach((t: ITask) => {
      const key = t.priority?.toUpperCase();
      if (counts.hasOwnProperty(key)) counts[key]++;
    });
    return (Object.keys(counts) as string[])
      .filter((k) => counts[k] > 0)
      .map((k) => ({
        label: PRIORITY_TRANSLATIONS[k] || k,
        value: counts[k],
        color: PRIORITY_COLORS[k] || "#CCCCCC",
      }));
  }, [filteredTasksForPieCharts]);

  const periodTaskSummary = useMemo(() => {
    const totalTasks = filteredTasksForPieCharts.length;
    const todo = filteredTasksForPieCharts.filter((t) => t.status === "TODO").length;
    const inProgress = filteredTasksForPieCharts.filter((t) => t.status === "IN_PROGRESS").length;
    const done = filteredTasksForPieCharts.filter((t) => t.status === "DONE").length;
    const high = filteredTasksForPieCharts.filter((t) => t.priority === "HIGH").length;
    const medium = filteredTasksForPieCharts.filter((t) => t.priority === "MEDIUM").length;
    const low = filteredTasksForPieCharts.filter((t) => t.priority === "LOW").length;
    return { totalTasks, todo, inProgress, done, high, medium, low };
  }, [filteredTasksForPieCharts]);

  const averageCompletionData = useMemo(() => {
    const doneTasks = filteredTasksForPieCharts.filter(
      (t) => t.status === "DONE" && t.createdAt && t.completedAt
    );
    if (doneTasks.length === 0) return { average: null, count: 0 };

    let totalDays = 0;
    doneTasks.forEach((t) => {
      const created = new Date(t.createdAt || "").getTime();
      const completed = new Date(t.completedAt || "").getTime();
      totalDays += (completed - created) / (1000 * 60 * 60 * 24);
    });

    return {
      average: totalDays / doneTasks.length,
      count: doneTasks.length,
    };
  }, [filteredTasksForPieCharts]);

  return {
    barChartDisplayData,
    statusPieData,
    priorityPieData,
    periodTaskSummary,
    averageCompletionData,
  };
};
