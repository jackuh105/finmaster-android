import * as React from "react";
import { cn } from "@/lib/utils";
import {
	Select,
	SelectItem,
	SelectValue,
	SelectGroup,
	SelectTrigger,
	SelectContent,
} from "@/components/ui/select";
import { useExchangeRate } from "@/hooks/use-exchange-rate";

export default function ExchangeRate(
	{ value, setValue, currency, setCurrency, items, date, className }:
		{ value: number, setValue: (value: number) => void, currency: string, setCurrency: (value: string) => void, items: string[], date: string, className?: string }
) {
	const { data: exchangeRateList, isLoading } = useExchangeRate(currency, date);

	// Update value when currency changes or data loads
	React.useEffect(() => {
		if (exchangeRateList && exchangeRateList[currency]) {
			setValue(exchangeRateList[currency]);
		}
	}, [currency, exchangeRateList, setValue]);

	const handleRateChange = (newCurrency: string) => {
		setCurrency(newCurrency);
	}

	return (
		<div className={cn("flex flex-col grow", className)}>
			<p>Currency</p>
			<Select value={currency} onValueChange={(e) => handleRateChange(e)}>
				<SelectTrigger>
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					<SelectGroup>
						{items.map((item, index) => (<SelectItem key={index} value={item}>{item}</SelectItem>))}
					</SelectGroup>
				</SelectContent>
			</Select>
			<div className="flex flex-row justify-between pt-4 gap-2">
				<p>1 MOP =</p>
				<div className="flex flex-row justify-end pr-2 items-center border-2 border-black gap-1 grow">
					<input
						type="number"
						className="text-right focus:outline-none bg-secondaryBg dark:bg-secondaryBlack"
						value={isLoading ? 0 : value}  // Show 0 or formatted placeholder during load
						onChange={(e) => setValue(parseFloat(e.target.value))}
					/>
					<p>{currency}</p>
				</div>
			</div>
		</div>
	)
}