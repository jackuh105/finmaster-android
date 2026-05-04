"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type CalculationRow = {
  year: number
  annualInvested: number
  cumulativeInvested: number
  profit: number
  totalAmount: number
  presentValue: number
  roi: number
}

export default function BuyHoldCompoundInterest() {
  // Inputs
  const [monthlyDeposit, setMonthlyDeposit] = React.useState<number>(30000)
  const [annualReturnRate, setAnnualReturnRate] = React.useState<number>(10) // %
  const [inflationRate, setInflationRate] = React.useState<number>(2) // %
  const [transactionFee, setTransactionFee] = React.useState<number>(20)
  const [depositFrequency, setDepositFrequency] = React.useState<number>(12)
  const [years, setYears] = React.useState<number>(30)

  // Derived state for calculation results
  const data = React.useMemo<CalculationRow[]>(() => {
    const rows: CalculationRow[] = []
    
    let cumulativeInvested = 0
    let totalAmount = 0
    
    // Annual Net Investment = (Monthly Deposit - Fee) * Frequency
    // Note: If fee is per transaction, and we deposit 'frequency' times a year.
    // If the user inputs "Monthly Deposit", we assume that is the gross amount before fee?
    // Based on spreadsheet analysis: Annual Invested = 12 * (Deposit - Fee)
    // Actually, looking at spreadsheet again: Invested = 12 * GS2 - MS2.
    // If GS2 is Monthly Deposit and MS2 is Total Annual Fee (20 * 12).
    // Then yes, effectively (Deposit - Fee) * 12.
    const annualNetInvested = (monthlyDeposit - transactionFee) * depositFrequency

    for (let year = 1; year <= years; year++) {
      cumulativeInvested += annualNetInvested
      
      // Compounding Logic:
      // Previous Total grows by (1 + rate)
      // Then add new annual investment (assuming end of year contribution, or simplified model)
      // Spreadsheet: Year 1 Total = Annual Invested (No growth on first year contributions?)
      // Year 2 Total = Year 2 Invested + Year 1 Total * (1 + rate)
      
      if (year === 1) {
        totalAmount = annualNetInvested
      } else {
        totalAmount = totalAmount * (1 + annualReturnRate / 100) + annualNetInvested
      }

      const profit = totalAmount - cumulativeInvested
      const roi = cumulativeInvested > 0 ? (profit / cumulativeInvested) * 100 : 0
      
      // Present Value = Total Amount / (1 + inflation)^year
      const presentValue = totalAmount / Math.pow(1 + inflationRate / 100, year)

      rows.push({
        year,
        annualInvested: annualNetInvested,
        cumulativeInvested,
        profit,
        totalAmount,
        presentValue,
        roi,
      })
    }
    
    return rows
  }, [monthlyDeposit, annualReturnRate, inflationRate, transactionFee, depositFrequency, years])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="space-y-8">
      {/* Inputs Section */}
      <Card className="bg-white dark:bg-secondaryBlack">
        <CardHeader>
          <CardTitle className="text-text dark:text-darkText">Settings</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="flex flex-col space-y-2 h-full justify-between">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-text dark:text-darkText" htmlFor="monthlyDeposit">Monthly Deposit Amount (每月存入金額)</label>
            <Input
              className="mt-auto"
              id="monthlyDeposit"
              type="number"
              value={monthlyDeposit}
              onChange={(e) => setMonthlyDeposit(Number(e.target.value))}
            />
          </div>
          <div className="flex flex-col space-y-2 h-full justify-between">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-text dark:text-darkText" htmlFor="annualReturnRate">Annual Return Rate (年化報酬率 %)</label>
            <Input
              className="mt-auto"
              id="annualReturnRate"
              type="number"
              step="0.1"
              value={annualReturnRate}
              onChange={(e) => setAnnualReturnRate(Number(e.target.value))}
            />
          </div>
          <div className="flex flex-col space-y-2 h-full justify-between">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-text dark:text-darkText" htmlFor="inflationRate">Inflation Rate (通貨膨脹率 %)</label>
            <Input
              className="mt-auto"
              id="inflationRate"
              type="number"
              step="0.1"
              value={inflationRate}
              onChange={(e) => setInflationRate(Number(e.target.value))}
            />
          </div>
          <div className="flex flex-col space-y-2 h-full justify-between">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-text dark:text-darkText" htmlFor="transactionFee">Transaction Fee (交易手續費)</label>
            <Input
              className="mt-auto"
              id="transactionFee"
              type="number"
              value={transactionFee}
              onChange={(e) => setTransactionFee(Number(e.target.value))}
            />
          </div>
          <div className="flex flex-col space-y-2 h-full justify-between">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-text dark:text-darkText" htmlFor="depositFrequency">Deposit Frequency / Year (每年存入次數)</label>
            <Input
              className="mt-auto"
              id="depositFrequency"
              type="number"
              value={depositFrequency}
              onChange={(e) => setDepositFrequency(Number(e.target.value))}
            />
          </div>
          <div className="flex flex-col space-y-2 h-full justify-between">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-text dark:text-darkText" htmlFor="years">Investment Period (Years)</label>
            <Input
              className="mt-auto"
              id="years"
              type="number"
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Chart Section */}
      <Card className="bg-white dark:bg-secondaryBlack">
        <CardHeader>
          <CardTitle className="text-text dark:text-darkText">Compound Asset Growth Chart (複利資產增長圖)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis tickFormatter={(value) => `${value / 1000}k`} />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  labelFormatter={(label) => `Year ${label}`}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    borderColor: 'hsl(var(--border))',
                    color: 'hsl(var(--foreground))'
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="cumulativeInvested"
                  name="Invested (投入)"
                  stroke="#3b82f6" // blue
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="profit"
                  name="Profit (利潤)"
                  stroke="#ef4444" // red
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="totalAmount"
                  name="Total (總金額)"
                  stroke="#f59e0b" // yellow/orange
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Table Section */}
      <Card className="bg-white dark:bg-secondaryBlack">
        <CardHeader>
          <CardTitle className="text-text dark:text-darkText">Detailed Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border dark:border-darkBorder">
                <TableHead className="text-text dark:text-darkText">Year</TableHead>
                <TableHead className="text-text dark:text-darkText">Invested (Annual)</TableHead>
                <TableHead className="text-text dark:text-darkText">Cumulative Invested</TableHead>
                <TableHead className="text-text dark:text-darkText">Profit</TableHead>
                <TableHead className="text-text dark:text-darkText">Total Amount</TableHead>
                <TableHead className="text-text dark:text-darkText">Present Value (Inflation Adj.)</TableHead>
                <TableHead className="text-text dark:text-darkText">ROI (%)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.year} className="border-b border-border dark:border-darkBorder hover:bg-muted/50 dark:hover:bg-muted/10">
                  <TableCell className="text-text dark:text-darkText">{row.year}</TableCell>
                  <TableCell className="text-text dark:text-darkText">{formatCurrency(row.annualInvested)}</TableCell>
                  <TableCell className="text-text dark:text-darkText">{formatCurrency(row.cumulativeInvested)}</TableCell>
                  <TableCell className={row.profit >= 0 ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"}>
                    {formatCurrency(row.profit)}
                  </TableCell>
                  <TableCell className="font-bold text-text dark:text-darkText">{formatCurrency(row.totalAmount)}</TableCell>
                  <TableCell className="text-text dark:text-darkText">{formatCurrency(row.presentValue)}</TableCell>
                  <TableCell className="text-text dark:text-darkText">{row.roi.toFixed(2)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
