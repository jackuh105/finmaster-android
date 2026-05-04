import {
  addWeeks,
  addMonths,
  addYears,
  setDay,
  setDate,
  setMonth,
  getDaysInMonth,
  isAfter,
  isBefore,
  isEqual,
  startOfDay,
} from "date-fns";

export type PeriodType = "weekly" | "monthly" | "yearly";

/**
 * For weekly: day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
 * For monthly: day of month (1-31)
 * For yearly: { month: 0-11, day: 1-31 }
 */
export type ExpenseDay = number | { month: number; day: number };

/**
 * Get the number of days in a given month, handling edge cases
 */
function getValidDayForMonth(targetDay: number, date: Date): number {
  const daysInMonth = getDaysInMonth(date);
  return Math.min(targetDay, daysInMonth);
}

/**
 * Generate all transaction dates within the given range based on period and expense day
 */
export function generatePeriodicDates(
  period: PeriodType,
  expenseDay: ExpenseDay,
  startDate: Date,
  endDate: Date
): Date[] {
  const dates: Date[] = [];
  const normalizedStart = startOfDay(startDate);
  const normalizedEnd = startOfDay(endDate);

  if (isAfter(normalizedStart, normalizedEnd)) {
    return dates;
  }

  switch (period) {
    case "weekly": {
      const dayOfWeek = expenseDay as number;
      // Find the first occurrence of the target day of week on or after startDate
      let current = setDay(normalizedStart, dayOfWeek, { weekStartsOn: 0 });

      // If the calculated date is before start, move to next week
      if (isBefore(current, normalizedStart)) {
        current = addWeeks(current, 1);
      }

      while (isBefore(current, normalizedEnd) || isEqual(current, normalizedEnd)) {
        dates.push(new Date(current));
        current = addWeeks(current, 1);
      }
      break;
    }

    case "monthly": {
      const targetDay = expenseDay as number;
      // Start from the month of startDate
      let current = new Date(normalizedStart.getFullYear(), normalizedStart.getMonth(), 1);

      while (isBefore(current, normalizedEnd) || isEqual(current, normalizedEnd)) {
        const validDay = getValidDayForMonth(targetDay, current);
        const transactionDate = setDate(current, validDay);

        if (
          (isAfter(transactionDate, normalizedStart) || isEqual(transactionDate, normalizedStart)) &&
          (isBefore(transactionDate, normalizedEnd) || isEqual(transactionDate, normalizedEnd))
        ) {
          dates.push(new Date(transactionDate));
        }

        current = addMonths(current, 1);
      }
      break;
    }

    case "yearly": {
      const { month: targetMonth, day: targetDay } = expenseDay as { month: number; day: number };
      // Start from the year of startDate
      let currentYear = normalizedStart.getFullYear();
      const endYear = normalizedEnd.getFullYear();

      while (currentYear <= endYear) {
        let transactionDate = new Date(currentYear, targetMonth, 1);
        const validDay = getValidDayForMonth(targetDay, transactionDate);
        transactionDate = setDate(transactionDate, validDay);

        if (
          (isAfter(transactionDate, normalizedStart) || isEqual(transactionDate, normalizedStart)) &&
          (isBefore(transactionDate, normalizedEnd) || isEqual(transactionDate, normalizedEnd))
        ) {
          dates.push(new Date(transactionDate));
        }

        currentYear++;
      }
      break;
    }
  }

  return dates;
}

/**
 * Get display label for day of week
 */
export const WEEKDAYS = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

/**
 * Get display label for months
 */
export const MONTHS = [
  { value: 0, label: "January" },
  { value: 1, label: "February" },
  { value: 2, label: "March" },
  { value: 3, label: "April" },
  { value: 4, label: "May" },
  { value: 5, label: "June" },
  { value: 6, label: "July" },
  { value: 7, label: "August" },
  { value: 8, label: "September" },
  { value: 9, label: "October" },
  { value: 10, label: "November" },
  { value: 11, label: "December" },
];

/**
 * Generate array of days 1-31 for monthly selection
 */
export const MONTH_DAYS = Array.from({ length: 31 }, (_, i) => ({
  value: i + 1,
  label: `${i + 1}`,
}));
