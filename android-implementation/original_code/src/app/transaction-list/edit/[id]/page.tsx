"use client";
import { useParams } from "next/navigation";
import { useTransactions } from "@/hooks/use-transactions";
import TransactionForm from "@/components/transaction-form/TransactionForm"

export default function EditTransaction() {
	const params = useParams<{ id: string }>();
	const { transactions } = useTransactions();
	const transaction = transactions.find(t => t.id === params.id);

	return (
		<TransactionForm data={transaction} />
	)
}