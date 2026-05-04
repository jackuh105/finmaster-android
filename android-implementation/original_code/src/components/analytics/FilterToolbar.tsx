"use client"

import * as React from "react"
import { DateRange } from "react-day-picker"
import { startOfMonth, endOfMonth, subDays } from "date-fns"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface FilterToolbarProps {
  dateRange: DateRange | undefined
  setDateRange: (date: DateRange | undefined) => void
  transactionType: string
  setTransactionType: (type: string) => void
  availableTypes: string[]
}

export function FilterToolbar({
  dateRange,
  setDateRange,
  transactionType,
  setTransactionType,
  availableTypes,
}: FilterToolbarProps) {

  const handleRangeSelect = (range: "month" | "30days" | "90days" | "7days") => {
    const today = new Date()
    let from = today
    let to = today

    switch (range) {
      case "month":
        from = startOfMonth(today)
        to = endOfMonth(today)
        break
      case "30days":
        from = subDays(today, 30)
        to = today
        break
      case "90days":
        from = subDays(today, 90)
        to = today
        break
      case "7days":
        from = subDays(today, 7)
        to = today
        break
    }

    setDateRange({ from, to })
  }

  return (
    <div className="flex flex-col gap-4 mb-6 md:flex-row">
      <div className="flex flex-row gap-4 w-full md:w-auto">
        <DatePickerWithRange className="flex-1" date={dateRange} setDate={setDateRange} />

        <Select value={transactionType} onValueChange={setTransactionType}>
          <SelectTrigger className="flex-1 bg-white dark:bg-secondaryBlack min-w-[100px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Types</SelectItem>
            {availableTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button variant="neutral" size="sm" onClick={() => handleRangeSelect("month")}>
          Current Month
        </Button>
        <Button variant="neutral" size="sm" onClick={() => handleRangeSelect("7days")}>
          Last 7 Days
        </Button>
        <Button variant="neutral" size="sm" className="hidden md:inline-block" onClick={() => handleRangeSelect("30days")}>
          Last 30 Days
        </Button>
        <Button variant="neutral" size="sm" onClick={() => handleRangeSelect("90days")}>
          Last 90 Days
        </Button>
      </div>
    </div>
  )
}
