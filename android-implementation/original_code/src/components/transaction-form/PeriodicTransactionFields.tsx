"use client";
import * as React from "react";
import { DateRange } from "react-day-picker";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import {
  PeriodType,
  ExpenseDay,
  WEEKDAYS,
  MONTHS,
  MONTH_DAYS,
} from "@/lib/periodicUtils";

interface PeriodicTransactionFieldsProps {
  isEnabled: boolean;
  setIsEnabled: (value: boolean) => void;
  period: PeriodType;
  setPeriod: (value: PeriodType) => void;
  expenseDay: ExpenseDay;
  setExpenseDay: (value: ExpenseDay) => void;
  dateRange: DateRange | undefined;
  setDateRange: (value: DateRange | undefined) => void;
}

export default function PeriodicTransactionFields({
  isEnabled,
  setIsEnabled,
  period,
  setPeriod,
  expenseDay,
  setExpenseDay,
  dateRange,
  setDateRange,
}: PeriodicTransactionFieldsProps) {
  // For yearly period, we need month and day
  const yearlyMonth = typeof expenseDay === "object" ? expenseDay.month : 0;
  const yearlyDay = typeof expenseDay === "object" ? expenseDay.day : 1;

  const handlePeriodChange = (newPeriod: PeriodType) => {
    setPeriod(newPeriod);
    // Reset expense day to appropriate default when period changes
    switch (newPeriod) {
      case "weekly":
        setExpenseDay(1); // Monday
        break;
      case "monthly":
        setExpenseDay(1); // 1st of month
        break;
      case "yearly":
        setExpenseDay({ month: 0, day: 1 }); // January 1st
        break;
    }
  };

  const handleYearlyMonthChange = (month: number) => {
    setExpenseDay({ month, day: yearlyDay });
  };

  const handleYearlyDayChange = (day: number) => {
    setExpenseDay({ month: yearlyMonth, day });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Periodic expense toggle */}
      <div className="flex items-center gap-3">
        <Switch
          id="periodic-expense"
          checked={isEnabled}
          onCheckedChange={setIsEnabled}
        />
        <Label htmlFor="periodic-expense" className="cursor-pointer">
          Periodic Expense
        </Label>
      </div>

      {/* Periodic fields - shown when enabled */}
      {isEnabled && (
        <div className="flex flex-col md:flex-row gap-4">
          {/* Period select */}
          <div className="flex flex-col flex-1">
            <p>Period</p>
            <Select value={period} onValueChange={(v) => handlePeriodChange(v as PeriodType)}>
              <SelectTrigger>
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Expense day - dynamic based on period */}
          {period === "weekly" && (
            <div className="flex flex-col flex-1">
              <p>Day of Week</p>
              <Select
                value={String(expenseDay as number)}
                onValueChange={(v) => setExpenseDay(Number(v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  {WEEKDAYS.map((day) => (
                    <SelectItem key={day.value} value={String(day.value)}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {period === "monthly" && (
            <div className="flex flex-col flex-1">
              <p>Day of Month</p>
              <Select
                value={String(expenseDay as number)}
                onValueChange={(v) => setExpenseDay(Number(v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  {MONTH_DAYS.map((day) => (
                    <SelectItem key={day.value} value={String(day.value)}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {period === "yearly" && (
            <>
              <div className="flex flex-col flex-1">
                <p>Month</p>
                <Select
                  value={String(yearlyMonth)}
                  onValueChange={(v) => handleYearlyMonthChange(Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((month) => (
                      <SelectItem key={month.value} value={String(month.value)}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col flex-1">
                <p>Day</p>
                <Select
                  value={String(yearlyDay)}
                  onValueChange={(v) => handleYearlyDayChange(Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTH_DAYS.map((day) => (
                      <SelectItem key={day.value} value={String(day.value)}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {/* Date range */}
          <div className="flex flex-col flex-1 min-w-0 md:min-w-[300px]">
            <p>Valid Period</p>
            <DatePickerWithRange date={dateRange} setDate={setDateRange} />
          </div>
        </div>
      )}
    </div>
  );
}
