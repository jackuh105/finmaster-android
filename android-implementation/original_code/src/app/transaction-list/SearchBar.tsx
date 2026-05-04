"use client";
import * as React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useTransactionListContext } from "@/context/TransactionListContext";

import { cn } from "@/lib/utils";

export default function SearchBar({ className }: { className?: string }) {
	const { setQuery } = useTransactionListContext();
	const [rawQuery, setRawQuery] = React.useState("");

	const handleQuery = (e: React.ChangeEvent<HTMLInputElement>) => {
		let tokens: Array<string> = [];
		const segmenter = new Intl.Segmenter("zh", { granularity: "word" });
		const str = e.target.value.toString().trim().toLowerCase();
		const segments = segmenter.segment(str);
		Array.from(segments).forEach((seg) => { if (seg.isWordLike) tokens = tokens.concat(seg.segment) });
		setQuery(tokens.join(" "));
		setRawQuery(e.target.value);
	}

	return (
		<div className={cn("flex flex-row items-center bg-secondaryBg dark:bg-secondaryBlack px-3 border-border border-2", className)}>
			<Search className="text-text dark:text-darkText" />
			<Input
				type="search"
				value={rawQuery}
				onChange={handleQuery}
				className="text-lg bg-transparent text-text dark:text-darkText border-none focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0"
			/>
		</div>
	)
}