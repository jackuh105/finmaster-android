"use client";

import * as React from "react";
import { format, startOfMonth, endOfMonth, parse } from "date-fns";
import { ChevronDown, ChevronRight, Trash2, Edit } from "lucide-react";
import { useRouter } from "next/navigation";

import { useTransactions, useTransactionMonths } from "@/hooks/use-transactions";
import { useTransactionListContext } from "@/context/TransactionListContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Transaction } from "@/types/Transaction";

export default function MobileTransactionList() {
  const router = useRouter();
  const { amountFilter, typeFilter, query } = useTransactionListContext();

  // State for selected month (as YYYY-MM string)
  const [selectedMonthStr, setSelectedMonthStr] = React.useState<string>(
    format(new Date(), "yyyy-MM")
  );

  // State for expanded items (set of IDs)
  const [expandedItems, setExpandedItems] = React.useState<Set<string>>(new Set());

  // Fetch distinct months that have transactions
  const { months: availableMonths, isLoading: isLoadingMonths } = useTransactionMonths();

  // Set the selected month to the most recent month with transactions
  React.useEffect(() => {
    if (availableMonths.length > 0 && !availableMonths.includes(selectedMonthStr)) {
      setSelectedMonthStr(availableMonths[0]);
    }
  }, [availableMonths, selectedMonthStr]);

  // Parse selected month string to Date for filtering
  const selectedMonth = React.useMemo(() => {
    return parse(selectedMonthStr, "yyyy-MM", new Date());
  }, [selectedMonthStr]);

  // Fetch transactions for the selected month
  const { transactions, isLoading, deleteTransaction } = useTransactions({
    startDate: format(startOfMonth(selectedMonth), "yyyy-MM-dd"),
    endDate: format(endOfMonth(selectedMonth), "yyyy-MM-dd"),
    amountFilter: [amountFilter[0], amountFilter[1]],
    typeFilter: Array.from(typeFilter),
    searchQuery: query
  });

  // Try to detect latest transaction month if no data in current month on first load?
  // For now, we stick to user selection.

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const handleMonthChange = (value: string) => {
    setSelectedMonthStr(value);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this transaction?")) {
      try {
        await deleteTransaction(id);
      } catch (error) {
        console.error("Failed to delete", error);
        alert("Failed to delete transaction");
      }
    }
  };

  return (
    <div className="flex flex-col gap-4 pb-20">
      {/* Month Filter */}
      <Select
        value={selectedMonthStr}
        onValueChange={handleMonthChange}
        disabled={isLoadingMonths || availableMonths.length === 0}
      >
        <SelectTrigger className="w-full text-lg font-bold">
          <SelectValue placeholder="Select Month">
            {selectedMonthStr}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {availableMonths.map((month) => (
            <SelectItem key={month} value={month}>
              {month}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Transaction List */}
      <div className="flex flex-col gap-2">
        {isLoading ? (
          <div className="text-center py-4">Loading...</div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-4 text-gray-500">No transactions found for this month.</div>
        ) : (
          transactions.map((t) => (
            <TransactionItem
              key={t.id}
              transaction={t}
              isExpanded={expandedItems.has(t.id)}
              onToggle={() => toggleExpand(t.id)}
              onEdit={() => router.push(`/transaction-list/edit/${t.id}`)}
              onDelete={() => handleDelete(t.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function TransactionItem({
  transaction,
  isExpanded,
  onToggle,
  onEdit,
  onDelete
}: {
  transaction: Transaction;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className="bg-secondaryBg dark:bg-secondaryBlack border-2 overflow-hidden text-text dark:text-darkText">
      <div
        className="p-4 flex flex-row items-start justify-between cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex flex-row gap-2 items-start">
          <div className="mt-1">
            {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm text-gray-500">{transaction.date}</span>
            <span className="font-bold text-lg">{transaction.name}</span>
          </div>
        </div>
        <div className="font-bold text-lg whitespace-nowrap">
          MOP <span className="text-red-500">-{transaction.amount.toFixed(2)}</span>
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 pt-0 border-t-2 border-dashed border-gray-200 dark:border-gray-700 mt-2">
          <div className="py-2 grid grid-cols-2 gap-y-2 text-sm">
            <div className="text-gray-500">Category</div>
            <div className="font-medium text-right">{transaction.type}</div>

            <div className="text-gray-500">Account</div>
            <div className="font-medium text-right">{transaction.account}</div>

            {transaction.desc && (
              <>
                <div className="text-gray-500">Description</div>
                <div className="font-medium text-right mt-1">{transaction.desc}</div>
              </>
            )}
          </div>

          <div className="flex flex-row gap-2 mt-4 justify-end">
            <Button size="sm" variant="default" onClick={(e) => { e.stopPropagation(); onEdit(); }} className="flex gap-1">
              <Edit className="w-4 h-4" /> Edit
            </Button>
            <Button size="sm" variant="default" onClick={(e) => { e.stopPropagation(); onDelete(); }} className="flex gap-1 bg-red-500 hover:bg-red-600 text-white">
              <Trash2 className="w-4 h-4" /> Delete
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
