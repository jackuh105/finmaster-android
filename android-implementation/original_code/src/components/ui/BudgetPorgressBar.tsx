import { Progress } from "@/components/ui/progress";

export default function BudgetProgressBar({ value } : { value: number }) {
  const barColor = value < 30 ? "bg-success" : value < 60 ? "bg-warning" : "bg-alert";
  return <Progress value={value} barClassName={barColor} />
}