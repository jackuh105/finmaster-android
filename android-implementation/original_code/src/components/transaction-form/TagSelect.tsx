import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";
import {
	Select,
	SelectItem,
	SelectValue,
	SelectGroup,
	SelectTrigger,
	SelectContent,
} from "@/components/ui/select";

export default function TagSelect(
	{ title, value, setValue, items, presets, className }:
		{ title: string, value: string, setValue: (value: string) => void, items: string[], presets?: string[], className?: string }
) {
	return (
		<div className={cn("flex flex-col grow", className)}>
			<p>{title}</p>
			<Select value={value} onValueChange={setValue}>
				<SelectTrigger>
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					<SelectGroup>
						{items.map((item, index) => (<SelectItem key={index} value={item}>{item}</SelectItem>))}
					</SelectGroup>
				</SelectContent>
			</Select>
			<div className="flex flex-row flex-wrap gap-2 pt-4">
				{(presets || items.slice(0, 5)).map((item, index) => (
					<Badge
						key={index}
						className="cursor-pointer"
						onClick={() => setValue(item)}
					>
						{item}
					</Badge>
				))}
			</div>
		</div>
	)
}