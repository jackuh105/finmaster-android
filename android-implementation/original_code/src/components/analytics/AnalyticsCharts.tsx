"use client"

import * as React from "react"
import { Pie, PieChart, Bar, BarChart, CartesianGrid, XAxis, Legend } from "recharts"
import { Transaction } from "@/types/Transaction"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface AnalyticsChartsProps {
  transactions: Transaction[]
}

export function AnalyticsCharts({ transactions }: AnalyticsChartsProps) {
  // Pie Chart Data: Expense by Category
  const pieData = React.useMemo(() => {
    const categoryTotals: Record<string, number> = {}
    transactions.forEach(t => {
      categoryTotals[t.type] = (categoryTotals[t.type] || 0) + t.amount
    })

    // Assign colors dynamically for now, or loop through a palette
    const colors = [
      "hsl(var(--chart-1))",
      "hsl(var(--chart-2))",
      "hsl(var(--chart-3))",
      "hsl(var(--chart-4))",
      "hsl(var(--chart-5))",
      "var(--color-chrome)",
      "var(--color-safari)",
    ]

    return Object.entries(categoryTotals).map(([type, amount], index) => ({
      type,
      amount,
      fill: colors[index % colors.length]
    }))
  }, [transactions])

  const pieConfig = React.useMemo(() => {
    const config: ChartConfig = {}
    pieData.forEach((item) => {
      config[item.type] = {
        label: item.type,
        color: item.fill
      }
    })
    return config
  }, [pieData])


  // Bar Chart Data: Daily Expense Trend
  const barData = React.useMemo(() => {
    const dailyTotals: Record<string, number> = {}
    transactions.forEach(t => {
      // Date is string "YYYY-MM-DD" in mock data
      const date = t.date
      dailyTotals[date] = (dailyTotals[date] || 0) + t.amount
    })

    return Object.entries(dailyTotals)
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .map(([date, amount]) => ({
        date,
        amount
      }))

  }, [transactions])

  const barConfig = {
    amount: {
      label: "Amount",
      color: "hsl(var(--chart-1))"
    }
  } satisfies ChartConfig


  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Pie Chart */}
      <Card className="flex flex-col bg-secondaryBg dark:bg-secondaryBlack text-text dark:text-darkText min-w-0">
        <CardHeader className="items-center pb-0">
          <CardTitle>Expenses by Category</CardTitle>
          <CardDescription className="text-text dark:text-darkText">Breakdown of transaction types</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <ChartContainer
            config={pieConfig}
            className="mx-auto aspect-square max-h-[300px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={pieData}
                dataKey="amount"
                nameKey="type"
                innerRadius={60}
                strokeWidth={2}
                stroke="#000"
              >
                {/* Cells are handled by data fill property */}
              </Pie>
              <Legend />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Bar Chart */}
      <Card className="flex flex-col bg-secondaryBg dark:bg-secondaryBlack text-text dark:text-darkText min-w-0">
        <CardHeader>
          <CardTitle>Daily Expenses</CardTitle>
          <CardDescription className="text-text dark:text-darkText">Trend over selected period</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={barConfig} className="min-h-[200px] w-full">
            <BarChart data={barData} margin={{ right: 16 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(5)}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="amount" fill="var(--color-amount)" radius={4} stroke="#000" strokeWidth={2} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
