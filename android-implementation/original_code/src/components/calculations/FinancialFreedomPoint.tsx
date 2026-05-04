"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function FinancialFreedomPoint() {
  // Inputs
  const [monthlyExpenses, setMonthlyExpenses] = React.useState<number>(23923)
  const [annualReturnRate, setAnnualReturnRate] = React.useState<number>(4.0) // %

  // Calculation
  const results = React.useMemo(() => {
    // Monthly Return Rate = (1 + Annual Rate)^(1/12) - 1
    // Rate should be decimal for calculation (e.g. 4% -> 0.04)
    const annualRateDecimal = annualReturnRate / 100
    const monthlyReturnRateDecimal = Math.pow(1 + annualRateDecimal, 1 / 12) - 1
    
    // Freedom Point Asset = Monthly Expenses / Monthly Return Rate
    const freedomPointAsset = monthlyReturnRateDecimal > 0 
      ? monthlyExpenses / monthlyReturnRateDecimal 
      : 0

    return {
      monthlyReturnRatePercentage: monthlyReturnRateDecimal * 100,
      freedomPointAsset
    }
  }, [monthlyExpenses, annualReturnRate])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatPercentage = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    }).format(value) + "%"
  }

  return (
    <div className="space-y-8">
      <Card className="bg-white dark:bg-secondaryBlack">
        <CardHeader>
          <CardTitle className="text-text dark:text-darkText">Financial Freedom Point (跨越點 - 財富自由計算)</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col space-y-2 h-full justify-between">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-text dark:text-darkText" htmlFor="monthlyExpenses">
              Monthly Expenses (每月支出)
            </label>
            <Input
              className="mt-auto"
              id="monthlyExpenses"
              type="number"
              value={monthlyExpenses}
              onChange={(e) => setMonthlyExpenses(Number(e.target.value))}
            />
          </div>
          <div className="flex flex-col space-y-2 h-full justify-between">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-text dark:text-darkText" htmlFor="annualReturnRate">
              Annual Return Rate (年報酬率 %)
            </label>
            <Input
              className="mt-auto"
              id="annualReturnRate"
              type="number"
              step="0.1"
              value={annualReturnRate}
              onChange={(e) => setAnnualReturnRate(Number(e.target.value))}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-secondaryBlack">
        <CardHeader>
          <CardTitle className="text-text dark:text-darkText">Results (計算結果)</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col space-y-2 p-4 rounded-lg bg-secondaryBg dark:bg-secondaryBlack border-2 border-border dark:border-darkBorder">
            <p className="text-sm font-medium text-text dark:text-darkText">Monthly Return Rate (月報酬率)</p>
            <p className="text-2xl font-bold text-main">
              {formatPercentage(results.monthlyReturnRatePercentage)}
            </p>
            <p className="text-xs text-muted-foreground text-text dark:text-darkText">
              Formula: (1 + Annual Rate)^(1/12) - 1
            </p>
          </div>
          <div className="flex flex-col space-y-2 p-4 rounded-lg bg-secondaryBg dark:bg-secondaryBlack border-2 border-border dark:border-darkBorder">
            <p className="text-sm font-medium text-text dark:text-darkText">Freedom Point Asset (跨越資產)</p>
            <p className="text-2xl font-bold text-main">
              {formatCurrency(results.freedomPointAsset)}
            </p>
            <p className="text-xs text-muted-foreground text-text dark:text-darkText">
              Formula: Monthly Expenses / Monthly Return Rate
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
