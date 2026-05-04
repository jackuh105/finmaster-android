"use client";

import { useTransactions } from "@/hooks/use-transactions";
import { useUserSettings } from "@/hooks/use-user-settings";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import BudgetProgressBar from "@/components/ui/BudgetPorgressBar";
import { cn } from "@/lib/utils";
import { SetBudgetDialog } from "./SetBudgetDialog";

export default function BudgetWidget({ className }: { className?: string }) {
  const { transactions } = useTransactions();
  const { budget } = useUserSettings();

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const currentMonthTransactions = transactions.filter(t => {
    const tDate = new Date(t.date);
    return tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
  });

  const totalSpent = currentMonthTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
  const remaining = totalSpent;
  const percentage = budget ? Math.min(100, Math.max(0, (remaining / budget) * 100)) : 0;

  return (
    <Card variant="default" className={cn("bg-secondaryBg dark:bg-secondaryBlack p-2", className)}>
      <CardTitle className="flex flex-row justify-between items-center pl-3">
        <p className="text-text dark:text-darkText">Budget</p>
        <SetBudgetDialog />
      </CardTitle>
      <CardContent>
        {budget === null ? (
          <div className="flex flex-col items-center justify-center p-4 border-2 border-black dark:border-white border-dashed bg-yellow-200 dark:bg-yellow-900/20 mt-2">
            <p className="font-bold text-lg text-black dark:text-white mb-1">No Budget Set</p>
            <p className="text-sm text-black dark:text-white font-medium text-center">
              Please set a budget to start tracking your spending.
            </p>
          </div>
        ) : (
          <>
            <p className="text-text dark:text-darkText mb-2">
              Spent: {totalSpent.toFixed(2)} / {budget}
            </p>
            <BudgetProgressBar value={percentage} />
          </>
        )}
      </CardContent>
    </Card>
  )
}
