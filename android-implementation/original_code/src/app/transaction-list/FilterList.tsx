"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/transaction-list/DataTable";
import { columns } from "@/components/transaction-list/Columns";
import { useTransactions } from "@/hooks/use-transactions";
import { useTransactionListContext } from "@/context/TransactionListContext";

export default function FilterList() {
  const router = useRouter();
  const { amountFilter, typeFilter, query, page, setPage, pageSize } = useTransactionListContext();
  
  const { transactions, count, deleteTransaction } = useTransactions({
    range: [page * pageSize, (page + 1) * pageSize - 1],
    amountFilter: [amountFilter[0], amountFilter[1]],
    typeFilter: Array.from(typeFilter),
    searchQuery: query
  });

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={transactions}
        pageCount={Math.ceil(count / pageSize)}
        pageIndex={page}
        onPageChange={setPage}
        onEdit={(id) => router.push(`/transaction-list/edit/${id}`)}
        onDelete={async (id) => {
          try {
            await deleteTransaction(id);
          } catch (error) {
            alert("Failed to delete transaction");
            console.error(error);
          }
        }}
      />
    </div>
  )
}