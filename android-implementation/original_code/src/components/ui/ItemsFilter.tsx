"use client";
import * as React from "react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

const DEFAULT_ITEMS_DISPLAY = 3;

function Items({ id, name, checked, setChecked, className }: {
	id: number,
	name: string,
	checked: boolean,
	setChecked: (id: number) => void,
	className?: string | undefined,
}) {
	return (
		<div
			onClick={() => setChecked(id)}
			className={cn(
				"flex flex-row items-center gap-2 border-transparent hover:border-border hover:bg-bg dark:hover:bg-darkBg border py-2 px-3 cursor-pointer",
				className,
			)}
		>
			<Checkbox
				checked={checked}
				onChange={() => setChecked(id)}
				className="bg-white"
			/>
			{name}
		</div>
	)
}

export default function ItemsFilter({ types, onChange }: { types: string[], onChange: (idSet: Set<number>) => void }) {
	const [show, setShow] = React.useState(false);
	const [checkedItems, setCheckedItems] = React.useState<Set<number>>(new Set());

	const handleChecked = (id: number) => {
		const newCheckedItems = new Set(checkedItems);
		if (checkedItems.has(id)) newCheckedItems.delete(id);
		else newCheckedItems.add(id);
		setCheckedItems(newCheckedItems);
		onChange(newCheckedItems);
	}

	const isCheckedItemHidden = () => ([...checkedItems].some(id => id >= DEFAULT_ITEMS_DISPLAY));

	const onClear = () => {
		setCheckedItems(new Set());
		onChange(new Set());
	}

	return (
		<div className="space-y-2 text-text dark:text-darkText">
			<div className="flex flex-row items-center justify-between">
				<p>Type</p>
				{checkedItems.size > 0 && <p onClick={onClear} className="text-main cursor-pointer font-bold hover:underline">Clear</p>}
			</div>
			<div className="flex flex-col space-y-2">
				{types.map((type: string, idx: number) => {
					if (idx < DEFAULT_ITEMS_DISPLAY) return (
						<Items
							id={idx}
							key={`item-${type}`}
							name={type}
							checked={checkedItems.has(idx)}
							setChecked={handleChecked}
						/>
					)
					else return (
						<Items
							id={idx}
							key={`item-${type}`}
							name={type}
							className={show ? "" : "hidden"}
							checked={checkedItems.has(idx)}
							setChecked={handleChecked}
						/>
					)
				})}
			</div>
			<div
				className="cursor-pointer hover:underline hover:decoration-main"
				onClick={() => setShow(!show)}
			>
				<p className={`text-main relative w-fit ${isCheckedItemHidden() && !show ? "after:content-[''] after:w-1.5 after:h-1.5 after:block after:bg-red-500 after:rounded-full after:absolute after:top-0 after:right-0 after:mt-0.5 after:-mr-1.5" : ""}`}>
					{show ? "Hide" : `Show all the ${types.length} types`}
				</p>
			</div>
		</div>
	)
}