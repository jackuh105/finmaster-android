"use client"

import * as React from "react"
import { startOfMonth, endOfMonth, isWithinInterval, parseISO } from "date-fns"
import { DateRange } from "react-day-picker"

import { useTransactions } from "@/hooks/use-transactions";
import { FilterToolbar } from "@/components/analytics/FilterToolbar"
import { StatsCards } from "@/components/analytics/StatsCards"
import { AnalyticsCharts } from "@/components/analytics/AnalyticsCharts"

export default function AnalyticsPage() {
  const { transactions } = useTransactions()

  // Default to current month
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  })

  const [transactionType, setTransactionType] = React.useState<string>("All")

  // Extract available types dynamically
  const availableTypes = React.useMemo(() => {
    const types = new Set(transactions.map((t) => t.type))
    return Array.from(types)
  }, [transactions])

  // Filter transactions
  const filteredTransactions = React.useMemo(() => {
    return transactions.filter((t) => {
      // Filter by Type
      if (transactionType !== "All" && t.type !== transactionType) {
        return false
      }

      // Filter by Date Range
      if (dateRange?.from && dateRange?.to) {
        const transactionDate = parseISO(t.date) // t.date is "YYYY-MM-DD" string
        return isWithinInterval(transactionDate, {
          start: dateRange.from,
          end: dateRange.to,
        })
      }

      return true
    })
  }, [transactions, transactionType, dateRange])

  return (
    <div className="container mx-auto py-8 px-4">

      <FilterToolbar
        dateRange={dateRange}
        setDateRange={setDateRange}
        transactionType={transactionType}
        setTransactionType={setTransactionType}
        availableTypes={availableTypes}
      />

      <StatsCards transactions={filteredTransactions} />

      <AnalyticsCharts transactions={filteredTransactions} />
    </div>
  )
}
