"use client";
import * as React from "react";
import ItemsFilter from "@/components/ui/ItemsFilter";
import { useCategories } from "@/hooks/use-categories";
import { useTransactionListContext } from "@/context/TransactionListContext";

export default function TypeFilter() {
	const { categories } = useCategories();
	const { setTypeFilter } = useTransactionListContext();
	const types = React.useMemo(() => categories.map(category => category.name), [categories]);

	const handleCheckedItemChange = (idSet: Set<number>) => {
		const newTypeFilter: Set<string> = new Set();
		[...idSet].forEach(id => {newTypeFilter.add(types[id])});
		setTypeFilter(newTypeFilter);
	}

	return (
		<ItemsFilter types={types} onChange={handleCheckedItemChange} />
	)
}