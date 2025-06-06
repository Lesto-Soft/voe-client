// utils/dateUtils.ts

/**
 * Calculates the ISO 8601 week number for a given date.
 * @param date - The date for which to determine the week number.
 * @returns The ISO week number.
 */
export const getWeekOfYear = (date: Date): number => {
  const target = new Date(date.valueOf());
  // Set to Thursday of the current week (ISO 8601 week definition)
  // target.setDate(target.getDate() + 3 - ((target.getDay() + 6) % 7)); // Original logic
  // A more common way to find Thursday:
  const dayOfWeek = target.getDay(); // Sunday is 0, Monday is 1, ...
  target.setDate(target.getDate() + 4 - (dayOfWeek === 0 ? 7 : dayOfWeek));

  // Get the first day of the year
  const yearStart = new Date(target.getFullYear(), 0, 1);

  // Calculate full weeks to nearest Thursday
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
 * The start date is the Monday at 00:00:00.
 * The end date is the Sunday at 23:59:59.999.
 */
export const getStartAndEndOfWeek = (
  weekNumber: number,
  year: number
): { start: Date; end: Date } => {
  // Create a date for the first day of the given year
  const firstDayOfYear = new Date(Date.UTC(year, 0, 1));

  // Calculate the day of the week for Jan 1st (0 for Sunday, 1 for Monday, ..., 6 for Saturday)
  const firstDayOfWeek = firstDayOfYear.getUTCDay();

  // Calculate the date of the first Thursday of the year.
  // If Jan 1st is Mon, Tue, Wed, or Thu, then the first week starts in this year.
  // Otherwise (Fri, Sat, Sun), the first week starts in the previous year,
  // or Jan 1st is part of the last week of the previous year.
  let daysToFirstThursday = 4 - (firstDayOfWeek || 7); // if firstDayOfWeek is 0 (Sun), treat as 7
  if (daysToFirstThursday < -3) daysToFirstThursday += 7; // handles cases where Jan 1 is Fri, Sat, Sun more clearly

  // Calculate the date of the Thursday of the target week.
  const thursdayOfTargetWeek = new Date(
    Date.UTC(year, 0, 1 + daysToFirstThursday + (weekNumber - 1) * 7)
  );

  // The Monday of the target week is Thursday - 3 days.
  const startDate = new Date(thursdayOfTargetWeek);
  startDate.setUTCDate(thursdayOfTargetWeek.getUTCDate() - 3);
  startDate.setUTCHours(0, 0, 0, 0); // Set to start of the day

  // The Sunday of the target week is Monday + 6 days.
  const endDate = new Date(startDate);
  endDate.setUTCDate(startDate.getUTCDate() + 6);
  endDate.setUTCHours(23, 59, 59, 999); // Set to end of the day

  return { start: startDate, end: endDate };
};

/**
 * Gets the number of days in a specific month of a specific year.
 * @param year - The full year (e.g., 2023).
 * @param month - The month number (1 for January, 2 for February, etc.).
 * @returns The number of days in the specified month and year.
 */
export const getDaysInMonth = (year: number, month: number): number => {
  // JavaScript's Date object treats month as 0-indexed (0 for January, 11 for December).
  // By passing 0 as the day for the *next* month, it rolls back to the last day of the target month.
  return new Date(year, month, 0).getDate();
};

/**
 * Returns the start of a given date (00:00:00).
 * @param date - The date to modify.
 * @returns A new Date object set to the beginning of the day.
 */
export const startOfDay = (date: Date): Date => {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
};

/**
 * Returns the end of a given date (23:59:59.999).
 * @param date - The date to modify.
 * @returns A new Date object set to the end of the day.
 */
export const endOfDay = (date: Date): Date => {
  const newDate = new Date(date);
  newDate.setHours(23, 59, 59, 999);
  return newDate;
};

/**
 * Subtracts a specified number of days from a date.
 * @param date - The date to subtract from.
 * @param days - The number of days to subtract.
 * @returns A new Date object representing the result.
 */
export const subDays = (date: Date, days: number): Date => {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() - days);
  return newDate;
};
