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

type CurrencyRow = {
  currency: string
  buyRate: number
  sellRate: number
  interestRate: number // percentage
  isBase?: boolean
}

// Initial default rows
const INITIAL_ROWS: CurrencyRow[] = [
  { currency: "MOP", buyRate: 1, sellRate: 1, interestRate: 2.0, isBase: true },
  { currency: "HKD", buyRate: 1.0315, sellRate: 1.03, interestRate: 2.5 },
  { currency: "USD", buyRate: 8.05, sellRate: 8.0, interestRate: 3.5 },
  { currency: "CNY", buyRate: 1.12, sellRate: 1.11, interestRate: 1.5 },
]

export default function FixedDepositCurrencyDiff() {
  const [basePrincipal, setBasePrincipal] = React.useState<number>(100000)
  const [days, setDays] = React.useState<number>(31)
  const [rows, setRows] = React.useState<CurrencyRow[]>(INITIAL_ROWS)
  const [, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function fetchRates() {
      const dateStr = "latest" // Or format(new Date(), "yyyy-MM-dd")
      const sourceUrl = `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@${dateStr}/v1/currencies/mop.json`
      const fallbackUrl = `https://${dateStr}.currency-api.pages.dev/v1/currencies/mop.json`

      async function getRates(url: string) {
        const res = await fetch(url)
        if (!res.ok) throw new Error("Failed to fetch")
        return res.json()
      }

      try {
        let data
        try {
          data = await getRates(sourceUrl)
        } catch {
          console.log("Main source failed, trying fallback...")
          data = await getRates(fallbackUrl)
        }

        if (data && data.mop) {
          const rates = data.mop
          setRows((prevRows) =>
            prevRows.map((row) => {
              if (row.isBase) return row
              const code = row.currency.toLowerCase()
              const rate = rates[code]
              if (rate) {
                // Invert rate because API gives 1 MOP = X Foreign, we need 1 Foreign = X MOP (Buy/Sell rates usually around this)
                // Wait, typical bank rates:
                // Buy: Bank sells to you. You give MOP, get Foreign. Rate = MOP/Foreign?
                // Screenshot example: HKD Buy 1.0313 -> You need 1.0313 MOP to buy 1 HKD.
                // API: 1 MOP = 0.96 HKD. So 1 HKD = 1/0.96 = 1.041 MOP.
                // Let's calculate inverse.
                const inverseRate = 1 / rate
                // For simplicity, set both Buy/Sell to this mid-market rate, user can adjust.
                return {
                  ...row,
                  buyRate: parseFloat(inverseRate.toFixed(4)),
                  sellRate: parseFloat((inverseRate * 0.995).toFixed(4)), // Slightly lower for sell
                }
              }
              return row
            })
          )
        }
      } catch (err) {
        console.error("Failed to fetch exchange rates", err)
      } finally {
        setLoading(false)
      }
    }

    fetchRates()
  }, [])

  const handleRowChange = (index: number, field: keyof CurrencyRow, value: string) => {
    const numValue = parseFloat(value)
    if (isNaN(numValue)) return
    setRows((prev) => {
      const newRows = [...prev]
      newRows[index] = { ...newRows[index], [field]: numValue }
      return newRows
    })
  }

  // Calculate Base Row (MOP) result for comparison logic
  // According to screenshot:
  // Base MOP Interest = Principal * Rate * Days / 365
  // Base MOP Equivalent = Interest (since 1:1)
  // Difference is (Row Equivalent - Base Equivalent)

  const baseRow = rows.find((r) => r.isBase) || rows[0]
  const baseInterest = (basePrincipal * baseRow.interestRate * 0.01 * days) / 365
  const baseEquivalent = baseInterest * baseRow.sellRate // Usually 1

  return (
    <div className="space-y-8">
      <Card className="bg-white dark:bg-secondaryBlack">
        <CardHeader>
          <CardTitle className="text-text dark:text-darkText">Fixed Deposit Currency Difference (定存幣值差距)</CardTitle>
          <CardDescription className="text-muted-foreground text-text dark:text-darkText">
            Compare interest returns across different currencies, accounting for exchange rates.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-text dark:text-darkText">Principal (MOP)</label>
              <Input
                type="number"
                value={basePrincipal}
                onChange={(e) => setBasePrincipal(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-text dark:text-darkText">Days</label>
              <Input
                type="number"
                value={days}
                onChange={(e) => setDays(parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-secondaryBlack">
        <CardHeader>
          <CardTitle className="text-text dark:text-darkText">Comparison Table</CardTitle>
        </CardHeader>
        <CardContent className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border dark:border-darkBorder">
                <TableHead className="w-[80px] text-text dark:text-darkText">Currency</TableHead>
                <TableHead className="text-text dark:text-darkText">Buy Rate</TableHead>
                <TableHead className="text-text dark:text-darkText">Sell Rate</TableHead>
                <TableHead className="text-text dark:text-darkText">Principal (Foreign)</TableHead>
                <TableHead className="text-text dark:text-darkText">Interest Rate (%)</TableHead>
                <TableHead className="text-text dark:text-darkText">Interest</TableHead>
                <TableHead className="text-text dark:text-darkText">Equivalent (MOP)</TableHead>
                <TableHead className="text-right text-text dark:text-darkText">Difference</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, index) => {
                // Calculations
                // 1. Principal (Foreign) = Base Principal / Buy Rate
                const principalForeign = basePrincipal / row.buyRate

                // 2. Interest = Principal (Foreign) * Rate * Days / 365
                const interest = (principalForeign * row.interestRate * 0.01 * days) / 365

                // 3. Equivalent MOP = Interest * Sell Rate
                const equivalentMop = interest * row.sellRate

                // 4. Difference = Equivalent - Base Equivalent
                const difference = equivalentMop - baseEquivalent

                return (
                  <TableRow key={row.currency} className="border-b border-border dark:border-darkBorder hover:bg-muted/50 dark:hover:bg-muted/10">
                    <TableCell className="font-medium text-text dark:text-darkText">{row.currency}</TableCell>
                    <TableCell>
                      <Input
                        className="h-8 w-24"
                        type="number"
                        step="0.0001"
                        value={row.buyRate}
                        onChange={(e) => handleRowChange(index, "buyRate", e.target.value)}
                        disabled={row.isBase}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        className="h-8 w-24"
                        type="number"
                        step="0.0001"
                        value={row.sellRate}
                        onChange={(e) => handleRowChange(index, "sellRate", e.target.value)}
                        disabled={row.isBase}
                      />
                    </TableCell>
                    <TableCell className="text-text dark:text-darkText">{principalForeign.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex items-center text-text dark:text-darkText">
                        <Input
                          className="h-8 w-20 mr-1"
                          type="number"
                          step="0.01"
                          value={row.interestRate}
                          onChange={(e) =>
                            handleRowChange(index, "interestRate", e.target.value)
                          }
                        />
                        %
                      </div>
                    </TableCell>
                    <TableCell className="text-text dark:text-darkText">{interest.toFixed(2)}</TableCell>
                    <TableCell className="text-text dark:text-darkText">{equivalentMop.toFixed(2)}</TableCell>
                    <TableCell
                      className={`text-right font-bold ${difference > 0 ? "text-green-600 dark:text-green-500" : difference < 0 ? "text-red-500 dark:text-red-500" : "text-text dark:text-darkText"
                        }`}
                    >
                      {difference.toFixed(2)}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
