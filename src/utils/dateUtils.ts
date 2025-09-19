// src/utils/dateUtils.ts
import moment from "moment";

/**
 * Calculates the ISO 8601 week number for a given date.
 * @param date - The date for which to determine the week number.
 * @returns The ISO week number.
 */
export const getWeekOfYear = (date: Date): number => {
  const target = new Date(date.valueOf());
  const dayOfWeek = target.getDay();
  target.setDate(target.getDate() + 4 - (dayOfWeek === 0 ? 7 : dayOfWeek));
  const yearStart = new Date(target.getFullYear(), 0, 1);
  const weekNumber = Math.ceil(
    ((target.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
  );
  return weekNumber;
};

/**
 * Calculates the start and end dates of a given ISO week and year.
 * @param weekNumber - The ISO week number (1-53).
 * @param year - The year.
 * @returns An object containing the start and end Date objects for the week.
 */
export const getStartAndEndOfWeek = (
  weekNumber: number,
  year: number
): { start: Date; end: Date } => {
  const firstDayOfYear = new Date(Date.UTC(year, 0, 1));
  const firstDayOfWeek = firstDayOfYear.getUTCDay();
  let daysToFirstThursday = 4 - (firstDayOfWeek || 7);
  if (daysToFirstThursday < -3) daysToFirstThursday += 7;
  const thursdayOfTargetWeek = new Date(
    Date.UTC(year, 0, 1 + daysToFirstThursday + (weekNumber - 1) * 7)
  );
  const startDate = new Date(thursdayOfTargetWeek);
  startDate.setUTCDate(thursdayOfTargetWeek.getUTCDate() - 3);
  startDate.setUTCHours(0, 0, 0, 0);
  const endDate = new Date(startDate);
  endDate.setUTCDate(startDate.getUTCDate() + 6);
  endDate.setUTCHours(23, 59, 59, 999);
  return { start: startDate, end: endDate };
};

export const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month, 0).getDate();
};

export const startOfDay = (date: Date): Date => {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
};

export const endOfDay = (date: Date): Date => {
  const newDate = new Date(date);
  newDate.setHours(23, 59, 59, 999);
  return newDate;
};

export const subDays = (date: Date, days: number): Date => {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() - days);
  return newDate;
};

// ✅ MODIFIED: This function is now more robust and handles all known date formats.
export const parseActivityDate = (dateValue: string | number | Date): Date => {
  // If it's already a valid Date object, return it immediately.
  if (dateValue instanceof Date) {
    return dateValue;
  }

  // Handle numeric timestamps or stringified timestamps (e.g., from case.date).
  if (
    typeof dateValue === "number" ||
    (typeof dateValue === "string" && /^\d+$/.test(dateValue))
  ) {
    return new Date(parseInt(String(dateValue), 10));
  }

  // For the specific "DD-Mon-YYYY HH:mm" format (from older answer.date fields),
  // parse it as if it were a UTC time to resolve the timezone mismatch.
  if (
    typeof dateValue === "string" &&
    /^\d{2}-[A-Za-z]{3}-\d{4} \d{2}:\d{2}$/.test(dateValue)
  ) {
    return moment.utc(dateValue, "DD-MMM-YYYY HH:mm", "en").toDate();
  }

  // For all other standard formats (like full ISO 8601 strings from newer approved_date fields),
  // let moment handle the parsing.
  return moment(dateValue).toDate();
};
