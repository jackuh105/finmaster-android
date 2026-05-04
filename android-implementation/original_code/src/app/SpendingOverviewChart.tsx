"use client"

import * as React from "react"
import { Cell, Label, Pie, PieChart, Legend } from "recharts"
import { useTheme } from "next-themes"
import { useMonthlyStats } from "@/hooks/use-monthly-stats";

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

import { cn, formatCompactNumber } from "@/lib/utils";

export function SpendingOverviewChart({ className }: { className?: string }) {
  const { theme } = useTheme();
  const { data: stats = [] } = useMonthlyStats();

  const pieData = React.useMemo(() => {
    // Assign colors dynamically for now, or loop through a palette
    const colors = [
      "hsl(var(--chart-1))",
      "hsl(var(--chart-2))",
      "hsl(var(--chart-3))",
      "hsl(var(--chart-4))",
      "hsl(var(--chart-5))",
      "var(--color-chrome)",
      "var(--color-safari)",
      "var(--color-safari-1)",
      "var(--color-safari-2)",
    ]

    return stats.map((stat, index) => ({
      type: stat.category_name,
      visitors: stat.total_amount, // Keeping key as 'visitors' or changing to 'amount' but ensuring consistency
      amount: stat.total_amount, // Adding amount for clarity
      fill: colors[index % colors.length]
    }))
  }, [stats])

  const chartConfig = React.useMemo(() => {
    const config: ChartConfig = {
      amount: {
        label: "Amount",
      }
    }
    pieData.forEach((item) => {
      config[item.type] = {
        label: item.type,
        color: item.fill
      }
    })
    return config
  }, [pieData])

  const totalAmount = React.useMemo(() => {
    return pieData.reduce((acc, curr) => acc + curr.amount, 0)
  }, [pieData])

  return (
    <Card variant={"default"} className={cn("flex flex-col bg-secondaryBg dark:bg-secondaryBlack col-span-3 text-text dark:text-darkText", className)}>
      <CardHeader className="items-center pb-0">
        <CardTitle>Expenses by category</CardTitle>
        <CardDescription className="text-text dark:text-darkText">Current month</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
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
            >
              {
                pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} stroke="#000" strokeWidth={2} />
                ))
              }
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill={theme === "light" ? "black" : "white"}
                      >
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) - 25}
                          className="fill-muted-foreground text-lg"
                        >
                          Total
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 5}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {formatCompactNumber(totalAmount)}
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
            <Legend />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
