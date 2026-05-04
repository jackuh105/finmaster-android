"use client";
import { createContext, useContext, useState, useMemo } from "react";
import { useTransactions } from "@/hooks/use-transactions";

type TransactionListContextType = {
  amountFilter: number[]; // number pair: [min, max]
  setAmountFilter: React.Dispatch<React.SetStateAction<number[]>>;
  typeFilter: Set<string>; // string array of types
  setTypeFilter: React.Dispatch<React.SetStateAction<Set<string>>>;
  query: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
  maxAmount: number;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  pageSize: number;
  setPageSize: React.Dispatch<React.SetStateAction<number>>;
};

export const TransactionListContext = createContext<TransactionListContextType | null>(null);

export default function TransactionListContextProvider({ children }: { children: React.ReactNode }) {
  const { transactions } = useTransactions();
  const [query, setQuery] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<Set<string>>(new Set);
  const [amountFilter, setAmountFilter] = useState<number[]>([0, 1000]);
  const [page, setPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);

  const maxAmount = useMemo(() => {
    if (transactions.length > 0) {
      return Math.ceil(Math.max(...transactions.map((t) => Number(t.amount))));
    }
    return 1000;
  }, [transactions]);

  const [prevMaxAmount, setPrevMaxAmount] = useState(maxAmount);

  // Adjust amountFilter when maxAmount increases (e.g. data loaded)
  if (maxAmount !== prevMaxAmount) {
    setPrevMaxAmount(maxAmount);
    if (maxAmount > amountFilter[1]) {
      setAmountFilter([0, maxAmount]);
    }
  }
  
  return (
    <TransactionListContext.Provider value={{
      amountFilter, setAmountFilter, typeFilter, setTypeFilter, query, setQuery, maxAmount,
      page, setPage, pageSize, setPageSize
    }}>
      {children}
    </TransactionListContext.Provider>
  );
}

export function useTransactionListContext() {
  const context = useContext(TransactionListContext);
  if (!context) throw new Error("useTransactionListContext must be used within a TransactionListContextProvider");
  return context;
}