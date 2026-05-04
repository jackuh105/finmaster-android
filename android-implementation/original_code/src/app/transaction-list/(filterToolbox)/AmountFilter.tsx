"use client";
import { useTransactionListContext } from "@/context/TransactionListContext";
import { DualRangeSlider } from "@/components/ui/DualRangeSlider";

export default function AmountFilter() {
  const { amountFilter, setAmountFilter, maxAmount } = useTransactionListContext();

  return (
    <div className="flex flex-col space-y-4 text-text dark:text-darkText bg-secondaryBg dark:bg-secondaryBlack">
      <p>Amount Range ({amountFilter[0]} ~ {amountFilter[1]})</p>
      <DualRangeSlider
        value={amountFilter}
        onValueChange={setAmountFilter}
        min={0}
        max={maxAmount}
        step={10}
      />
    </div>
  )
}