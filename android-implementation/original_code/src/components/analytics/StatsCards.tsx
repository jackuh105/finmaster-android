"use client"

import * as React from "react"
import { TrendingUp, DollarSign, Wallet } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Transaction } from "@/types/Transaction"

interface StatsCardsProps {
  transactions: Transaction[]
}

export function StatsCards({ transactions }: StatsCardsProps) {
  const totalExpense = React.useMemo(() => {
    return transactions.reduce((acc, curr) => acc + curr.amount, 0)
  }, [transactions])

  const topCategory = React.useMemo(() => {
    if (transactions.length === 0) return "N/A"

    const categoryTotals: Record<string, number> = {}
    transactions.forEach(t => {
      categoryTotals[t.type] = (categoryTotals[t.type] || 0) + t.amount
    })

    let maxCat = "N/A"
    let maxVal = 0

    Object.entries(categoryTotals).forEach(([cat, val]) => {
      if (val > maxVal) {
        maxVal = val
        maxCat = cat
      }
    })

    return maxCat
  }, [transactions])

  const largestExpense = React.useMemo(() => {
    if (transactions.length === 0) return 0
    return Math.max(...transactions.map(t => t.amount))
  }, [transactions])

  return (
    <div className="grid gap-4 md:grid-cols-3 mb-6">
      <Card className="bg-secondaryBg dark:bg-secondaryBlack text-text dark:text-darkText">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Expense</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${totalExpense.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            For selected period
          </p>
        </CardContent>
      </Card>
      <Card className="bg-secondaryBg dark:bg-secondaryBlack text-text dark:text-darkText">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top Category</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{topCategory}</div>
          <p className="text-xs text-muted-foreground">
            Highest spending type
          </p>
        </CardContent>
      </Card>
      <Card className="bg-secondaryBg dark:bg-secondaryBlack text-text dark:text-darkText">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Largest Single Expense</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${largestExpense.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            Max transaction amount
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
