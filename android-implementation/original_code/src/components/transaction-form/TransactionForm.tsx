"use client";
import * as React from "react";
import { Card } from "@/components/ui/card";
import TagInput from "./TagInput";
import { format } from "date-fns";
import TagSelect from "./TagSelect";
import Calculator from "./Calculator";
import ExchangeRate from "./ExchangeRate";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import DatePicker from "@/components/ui/date-picker";
import { type Transaction } from "@/types/Transaction";
import { useTransactions } from "@/hooks/use-transactions";
import { DateRange } from "react-day-picker";

import { useCategories } from "@/hooks/use-categories";
import { useItemTags } from "@/hooks/use-item-tags";
import { useAccounts } from "@/hooks/use-accounts";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

import PeriodicTransactionFields from "./PeriodicTransactionFields";
import { PeriodType, ExpenseDay, generatePeriodicDates } from "@/lib/periodicUtils";

export default function TransactionForm({ data }: { data?: Transaction }) {
	const router = useRouter();
	const { addTransaction, addTransactions, updateTransaction } = useTransactions();
	const { itemTags } = useItemTags();
	const { categories } = useCategories();
	const { accounts: accountData } = useAccounts();

	const types = categories.map((c: any) => c.name);
	const typePresets = categories.filter((c: any) => c.is_preset).map((c: any) => c.name);

	const accounts = accountData.map((a: any) => a.name);
	const accountPresets = accountData.filter((a: any) => a.is_preset).map((a: any) => a.name);

	// TODO: allow user to customize the options
	const currencies = ["MOP", "HKD", "CNY", "JPY", "TWD", "USD", "AUD"];

	// states
	const [item, setItem] = React.useState(data ? data.name : "");
	const [type, setType] = React.useState(data ? data.type : "");
	const [currency, setCurrency] = React.useState("MOP");
	const [exchangeRate, setExchangeRate] = React.useState(1);
	const [description, setDescription] = React.useState(data ? data.desc : "");
	const [display, setDisplay] = React.useState(data ? data.amount.toString() : "0");
	const [account, setAccount] = React.useState(data && data.account ? data.account : "");
	const [date, setDate] = React.useState<Date | undefined>(undefined);
	const [showDetails, setShowDetails] = React.useState(false);

	// Periodic transaction states
	const [isPeriodicEnabled, setIsPeriodicEnabled] = React.useState(false);
	const [period, setPeriod] = React.useState<PeriodType>("monthly");
	const [expenseDay, setExpenseDay] = React.useState<ExpenseDay>(1);
	const [dateRange, setDateRange] = React.useState<DateRange | undefined>(undefined);

	React.useEffect(() => {
		if (data) {
			setDate(new Date(data.date));
		} else {
			setDate(new Date());
		}
	}, []);

	const handleSubmit = async (amount: number) => {
		if (isNaN(amount) || amount <= 0) {
			alert("Amount must be a valid positive number");
			return;
		}

		if (!item.trim()) {
			alert("Item cannot be empty");
			return;
		}

		const selectedCategory = categories.find((c: any) => c.name === type);
		const selectedAccount = accountData.find((a: any) => a.name === account);

		try {
			if (data) {
				// Updating existing transaction - periodic mode not applicable
				await updateTransaction({
					id: data.id,
					updates: {
						name: item,
						amount: amount,
						date: date ? format(date, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
						desc: description,
						category_id: selectedCategory?.id,
						account_id: selectedAccount?.id
					}
				});
			} else if (isPeriodicEnabled && dateRange?.from && dateRange?.to) {
				// Create periodic transactions
				const transactionDates = generatePeriodicDates(
					period,
					expenseDay,
					dateRange.from,
					dateRange.to
				);

				if (transactionDates.length === 0) {
					alert("No transaction dates found in the selected range. Please adjust your settings.");
					return;
				}

				const transactions = transactionDates.map((transactionDate) => ({
					name: item,
					amount: amount,
					date: format(transactionDate, "yyyy-MM-dd"),
					description: description,
					category_id: selectedCategory?.id,
					account_id: selectedAccount?.id
				}));

				await addTransactions(transactions);
			} else {
				// Single transaction
				await addTransaction({
					name: item,
					amount: amount,
					date: date ? format(date, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
					description: description,
					category_id: selectedCategory?.id,
					account_id: selectedAccount?.id
				});
			}
			router.push('/transaction-list');
		} catch (error) {
			console.error("Failed to save transaction:", error);
			alert("Failed to save transaction. Please try again.");
		}
	}

	return (
		<div className="flex flex-col md:grid md:grid-cols-3 w-full max-w-7xl gap-4 pt-2 md:pt-4 pb-[45vh] md:pb-0">
			<Card className="col-span-2 bg-secondaryBg dark:bg-secondaryBlack p-4 flex flex-col space-y-4 text-text dark:text-darkText">
				<TagInput title="Item" value={item} setValue={setItem} tags={itemTags} />
				<div className="flex flex-col md:flex-row gap-4">
					<TagSelect title="Type" value={type} setValue={setType} items={types} presets={typePresets} />
					{/* Hide single date picker when periodic mode is enabled */}
					{!isPeriodicEnabled && (
						<div className="flex flex-col w-full md:w-auto">
							<p>Date</p>
							<DatePicker date={date} setDate={setDate} />
						</div>
					)}
				</div>

				<div className="flex flex-col md:grid md:grid-cols-2 gap-4">
					<TagSelect title="Account" value={account} setValue={setAccount} items={accounts} presets={accountPresets} />
					<div className={`${showDetails ? "block" : "hidden"} md:block`}>
						<ExchangeRate
							date={date ? format(date, "yyyy-MM-dd") : "latest"}
							value={exchangeRate}
							setValue={setExchangeRate}
							currency={currency}
							setCurrency={setCurrency}
							items={currencies}
						/>
					</div>
				</div>

				{/* Periodic transaction fields - only show when not editing */}
				{!data && (
					<div className={`${showDetails ? "block" : "hidden"} md:block`}>
						<PeriodicTransactionFields
							isEnabled={isPeriodicEnabled}
							setIsEnabled={setIsPeriodicEnabled}
							period={period}
							setPeriod={setPeriod}
							expenseDay={expenseDay}
							setExpenseDay={setExpenseDay}
							dateRange={dateRange}
							setDateRange={setDateRange}
						/>
					</div>
				)}

				<div className={`${showDetails ? "block" : "hidden"} md:block`}>
					<p>Description</p>
					<Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
				</div>

				<Button
					variant="ghost"
					className="md:hidden flex items-center justify-center h-6 border-none"
					onClick={() => setShowDetails(!showDetails)}
				>
					{showDetails ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
				</Button>
			</Card>
			<div className="fixed bottom-0 left-0 right-0 z-40 h-[45vh] md:h-auto md:relative md:z-0 md:col-span-1">
				<Calculator
					display={display}
					setDisplay={setDisplay}
					currency={currency}
					exchangeRate={exchangeRate}
					handleSubmit={handleSubmit}
				/>
			</div>
		</div>
	)
}