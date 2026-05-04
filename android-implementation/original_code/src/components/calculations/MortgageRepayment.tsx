"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

type YearlyData = {
  year: number
  principalPaid: number
  interestPaid: number
  balance: number
  totalPaid: number
  principalRatio: number
  interestRatio: number
}

export default function MortgageRepayment() {
  const [totalPrice, setTotalPrice] = React.useState<number>(9000000)
  const [downPaymentRatio, setDownPaymentRatio] = React.useState<number>(50)
  const [interestRate, setInterestRate] = React.useState<number>(2.72)
  const [loanTerm, setLoanTerm] = React.useState<number>(20)

  const { loanAmount, monthlyPayment, totalInterest, yearlyData } = React.useMemo(() => {
    const loanAmt = totalPrice * (1 - downPaymentRatio / 100)
    const monthlyRate = interestRate / 100 / 12
    const totalMonths = loanTerm * 12
    
    // PMT Formula: P * r * (1 + r)^n / ((1 + r)^n - 1)
    let mPayment = 0
    if (monthlyRate > 0) {
      mPayment =
        (loanAmt * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
        (Math.pow(1 + monthlyRate, totalMonths) - 1)
    } else {
      mPayment = loanAmt / totalMonths
    }

    let balance = loanAmt
    let accumulatedInterest = 0
    const data: YearlyData[] = []

    let currentYearPrincipal = 0
    let currentYearInterest = 0

    for (let month = 1; month <= totalMonths; month++) {
      const interestPayment = balance * monthlyRate
      const principalPayment = mPayment - interestPayment
      
      // Handle last month rounding precision
      let finalPrincipal = principalPayment
      if (month === totalMonths) {
          finalPrincipal = balance
      }

      balance -= finalPrincipal
      accumulatedInterest += interestPayment
      
      currentYearPrincipal += finalPrincipal
      currentYearInterest += interestPayment

      if (month % 12 === 0) {
        const year = month / 12
        const totalYearly = currentYearPrincipal + currentYearInterest
        data.push({
          year,
          principalPaid: currentYearPrincipal,
          interestPaid: currentYearInterest,
          balance: Math.max(0, balance),
          totalPaid: totalYearly,
          principalRatio: (currentYearPrincipal / totalYearly) * 100,
          interestRatio: (currentYearInterest / totalYearly) * 100,
        })
        currentYearPrincipal = 0
        currentYearInterest = 0
      }
    }

    return {
      loanAmount: loanAmt,
      monthlyPayment: mPayment,
      totalInterest: accumulatedInterest,
      yearlyData: data,
    }
  }, [totalPrice, downPaymentRatio, interestRate, loanTerm])

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val)
  }

  return (
    <div className="space-y-8">
      <Card className="bg-white dark:bg-secondaryBlack">
        <CardHeader>
          <CardTitle className="text-text dark:text-darkText">Purchase & Mortgage Repayment (購置物置貸款款項償還計算)</CardTitle>
          <CardDescription className="text-muted-foreground text-text dark:text-darkText">
            Calculate mortgage repayments, interest vs principal breakdown, and amortization schedule.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex flex-col space-y-2 h-full justify-between">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-text dark:text-darkText" htmlFor="totalPrice">Total Property Price (房屋總價)</label>
              <Input 
                id="totalPrice" 
                type="number" 
                className="mt-auto"
                value={totalPrice} 
                onChange={(e) => setTotalPrice(Number(e.target.value))} 
              />
            </div>
            <div className="flex flex-col space-y-2 h-full justify-between">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-text dark:text-darkText" htmlFor="downPaymentRatio">Down Payment Ratio (首付比率 %)</label>
              <Input 
                id="downPaymentRatio" 
                type="number" 
                className="mt-auto"
                value={downPaymentRatio} 
                onChange={(e) => setDownPaymentRatio(Number(e.target.value))} 
              />
            </div>
            <div className="flex flex-col space-y-2 h-full justify-between">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-text dark:text-darkText" htmlFor="interestRate">Annual Interest Rate (貸款年利率 %)</label>
              <Input 
                id="interestRate" 
                type="number" 
                step="0.01" 
                className="mt-auto"
                value={interestRate} 
                onChange={(e) => setInterestRate(Number(e.target.value))} 
              />
            </div>
            <div className="flex flex-col space-y-2 h-full justify-between">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-text dark:text-darkText" htmlFor="loanTerm">Loan Term (貸款年期 Years)</label>
              <Input 
                id="loanTerm" 
                type="number" 
                className="mt-auto"
                value={loanTerm} 
                onChange={(e) => setLoanTerm(Number(e.target.value))} 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg dark:bg-muted/10">
            <div>
              <p className="text-sm font-medium text-muted-foreground text-text dark:text-darkText">Total Loan Amount (貸款總額)</p>
              <p className="text-2xl font-bold text-text dark:text-darkText">{formatCurrency(loanAmount)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground text-text dark:text-darkText">Monthly Repayment (每月總還款金額)</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatCurrency(monthlyPayment)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground text-text dark:text-darkText">Total Interest (償還利息總額)</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{formatCurrency(totalInterest)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-secondaryBlack">
        <CardHeader>
          <CardTitle className="text-text dark:text-darkText">Principal vs Interest Ratio (償還本金和利息佔比)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={yearlyData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#888" opacity={0.2} />
                <XAxis 
                  dataKey="year" 
                  tick={{ fill: '#888' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  tickFormatter={(value) => `${value}%`}
                  tick={{ fill: '#888' }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  formatter={(value: number) => `${value.toFixed(2)}%`}
                  labelFormatter={(label) => `Year ${label}`}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    borderColor: 'hsl(var(--border))',
                    color: 'hsl(var(--foreground))'
                  }}
                />
                <Legend />
                <Bar dataKey="interestRatio" stackId="a" name="Interest (利息)" fill="#ef4444" />
                <Bar dataKey="principalRatio" stackId="a" name="Principal (本金)" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-secondaryBlack">
        <CardHeader>
          <CardTitle className="text-text dark:text-darkText">Amortization Schedule (還款表)</CardTitle>
        </CardHeader>
        <CardContent className="overflow-auto max-h-[500px]">
          <Table>
            <TableHeader className="sticky top-0 bg-white dark:bg-secondaryBlack z-10">
              <TableRow className="border-b border-border dark:border-darkBorder">
                <TableHead className="text-text dark:text-darkText">Year (年期)</TableHead>
                <TableHead className="text-right text-text dark:text-darkText">Principal Paid (償還本金)</TableHead>
                <TableHead className="text-right text-text dark:text-darkText">Interest Paid (償還利息)</TableHead>
                <TableHead className="text-right text-text dark:text-darkText">Total Paid (總還款)</TableHead>
                <TableHead className="text-right text-text dark:text-darkText">Remaining Balance (剩餘本金)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {yearlyData.map((row) => (
                <TableRow key={row.year} className="border-b border-border dark:border-darkBorder hover:bg-muted/50 dark:hover:bg-muted/10">
                  <TableCell className="font-medium text-text dark:text-darkText">{row.year}</TableCell>
                  <TableCell className="text-right text-text dark:text-darkText">{formatCurrency(row.principalPaid)}</TableCell>
                  <TableCell className="text-right text-red-600 dark:text-red-400">{formatCurrency(row.interestPaid)}</TableCell>
                  <TableCell className="text-right text-text dark:text-darkText">{formatCurrency(row.totalPaid)}</TableCell>
                  <TableCell className="text-right text-text dark:text-darkText">{formatCurrency(row.balance)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
