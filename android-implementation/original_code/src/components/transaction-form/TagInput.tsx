import { cn } from "@/lib/utils";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";

export default function TagInput(
	{ title, value, setValue, tags, className }:
		{ title: string, value: string, setValue: (value: string) => void, tags: string[], className?: string }
) {
	return (
		<div className={cn("flex flex-col gap-2", className)}>
			<p>{title}</p>
			<Input
				type="text"
				className="text-text dark:text-darkText"
				value={value}
				onChange={(e) => setValue(e.target.value)}
			/>
			<div className="flex flex-row flex-wrap gap-2">
				{tags.map((tag, index) => (
					<Badge
						key={`tag-${index}`}
						className="cursor-pointer"
						onClick={() => setValue(tag)}
					>
						{tag}
					</Badge>
				))}
			</div>
		</div>
	)
}