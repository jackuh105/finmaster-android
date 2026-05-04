"use client"

import * as React from "react"

import FixedDepositCurrencyDiff from "@/components/calculations/FixedDepositCurrencyDiff"
import BuyHoldCompoundInterest from "@/components/calculations/BuyHoldCompoundInterest"
import FinancialFreedomPoint from "@/components/calculations/FinancialFreedomPoint"
import MortgageRepayment from "@/components/calculations/MortgageRepayment"


const CALCULATORS = [
  {
    id: "fixed-deposit-diff",
    name: "Regular Deposit Difference (定存幣值差距)",
    component: FixedDepositCurrencyDiff,
  },
  {
    id: "buy-hold-compound",
    name: "Buy & Hold Compound (買進持有複利投資)",
    component: BuyHoldCompoundInterest,
  },
  {
    id: "freedom-point",
    name: "Financial Freedom Point (跨越點)",
    component: FinancialFreedomPoint,
  },
  {
    id: "loan-repayment",
    name: "Loan Repayment (購置物業貸款)",
    component: MortgageRepayment,
  },
]

const NullComponent = () => null

export default function FinCalculatePage() {
  const [selectedId, setSelectedId] = React.useState(CALCULATORS[0].id)

  const ActiveComponent = CALCULATORS.find((c) => c.id === selectedId)?.component || NullComponent

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)] w-full">
      {/* Mobile View - Accordion Style */}
      <div className="md:hidden flex flex-col w-full">
        {CALCULATORS.map((calc) => (
          <React.Fragment key={calc.id}>
            <button
              onClick={() => setSelectedId(selectedId === calc.id ? "" : calc.id)}
              className={`
                w-full text-left p-4 border-b-2 border-border dark:border-darkBorder font-base text-lg transition-colors
                ${selectedId === calc.id
                  ? "bg-main text-black font-bold"
                  : "bg-white dark:bg-secondaryBlack text-text dark:text-darkText"
                }
              `}
            >
              {calc.name}
            </button>
            {selectedId === calc.id && (
              <div className="p-4 bg-bg dark:bg-darkBg border-b-2 border-border dark:border-darkBorder animate-in slide-in-from-top-2 duration-200">
                <calc.component />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-full md:w-1/4 lg:w-1/5 border-r-2 border-border dark:border-darkBorder bg-white dark:bg-secondaryBlack flex-col">
        <nav className="flex flex-col">
          {CALCULATORS.map((calc) => (
            <button
              key={calc.id}
              onClick={() => setSelectedId(calc.id)}
              className={`
                w-full text-left p-4 border-b-2 border-border dark:border-darkBorder font-base text-lg transition-colors
                ${selectedId === calc.id
                  ? "bg-main text-black font-bold"
                  : "bg-white dark:bg-secondaryBlack hover:bg-main/50 dark:hover:bg-main/50 text-text dark:text-darkText"
                }
              `}
            >
              {calc.name}
            </button>
          ))}
        </nav>
      </aside>

      {/* Desktop Main Content */}
      <main className="hidden md:block flex-1 p-4 md:p-8 bg-bg dark:bg-darkBg overflow-auto">
        <ActiveComponent />
      </main>
    </div>
  )
}
