"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Calculator(
	{ display, setDisplay, currency, exchangeRate, handleSubmit }:
		{ display: string, setDisplay: (value: string) => void, currency: string, exchangeRate: number, handleSubmit: (amount: number) => void }
) {
	const inputRef = React.useRef<HTMLInputElement>(null);
	const [newNumber, setNewNumber] = React.useState(display === "0" ? true : false);
	const [operator, setOperator] = React.useState<string | null>(null);
	const [firstOperand, setFirstOperand] = React.useState<number | null>(null);

	const addDigit = (digit: string) => {
		if (newNumber) {
			setDisplay(digit === "." ? "0." : digit);
			setNewNumber(false);
		} else {
			if (digit === "." && display.includes(".")) return;
			else if (display === "0" && digit === ".") setDisplay("0.");
			setDisplay(display === "0" ? digit : display + digit);
		}
	}

	const handleOperation = (op: string) => {
		if (firstOperand !== null && operator !== null) {
			const result = calculate();
			setOperator(op);
			setNewNumber(true);
			setFirstOperand(result!);
		} else {
			setOperator(op);
			setNewNumber(true);
			setFirstOperand(parseFloat(display));
		}
	}

	const handleClear = () => {
		setDisplay("0");
		setOperator(null);
		setNewNumber(true);
		setFirstOperand(null);
	}

	const handleDelete = () => {
		if (display.length === 1) setDisplay("0");
		else setDisplay(display.slice(0, -1));
	}

	const calculate = () => {
		if (firstOperand === null || operator === null) return;
		if (firstOperand !== null && newNumber) {
			setOperator(null);
			return;
		}
		const secondOperand = parseFloat(display);
		let result = 0;
		switch (operator) {
			case "+":
				result = firstOperand + secondOperand;
				break;
			case "-":
				result = firstOperand - secondOperand;
				break;
			case "×":
				result = firstOperand * secondOperand;
				break;
			case "÷":
				result = firstOperand / secondOperand;
				break;
		}
		return result;
	}

	const handleNumPadClick = (key: string) => {
		if ("0123456789.".includes(key)) addDigit(key);
		else if ("+-×÷".includes(key)) handleOperation(key);
		else if (key === "+/-") setDisplay((parseFloat(display) * -1).toString());
		else if (key === "C") handleClear();
		else if (key === "←") handleDelete();
		else if (key === "=") {
			if (firstOperand === null) {
				const amount = currency === "MOP" ? parseFloat(display) : Math.round(parseFloat(display) / exchangeRate * 100) / 100;
				handleSubmit(amount);
			} else {
				const result = calculate();
				setOperator(null);
				setNewNumber(true);
				setFirstOperand(null);
				if (result) setDisplay(result.toString());
			}
		}
	}

	const handleKeyPress = (event: KeyboardEvent) => {
		if (document.activeElement !== inputRef.current) return;
		if (event.key >= "0" && event.key <= "9") addDigit(event.key);
		else if (event.key === ".") addDigit(event.key);
		else if ("+-".includes(event.key)) handleOperation(event.key);
		else if (event.key === "*") handleOperation("×");
		else if (event.key === "/") handleOperation("÷");
		else if (event.key === "Backspace" || event.key === "Delete") handleDelete();
		else if (event.key === "Enter" || event.key === "=") handleNumPadClick("=");
		else if (event.key === "Escape") handleClear();
	}

	React.useEffect(() => {
		window.addEventListener("keydown", handleKeyPress);
		return () => { window.removeEventListener("keydown", handleKeyPress) }
	});

	return (
		<Card className="bg-secondaryBg dark:bg-secondaryBlack flex flex-col divide-y-2 text-text dark:text-darkText h-full rounded-t-base rounded-b-none md:rounded-base border-x-0 border-b-0 md:border-2">
			<p className="p-4 text-center text-xl hidden md:block">Amount</p>
			<div className="flex flex-col">
				<div className={`bg-bg dark:bg-darkBg justify-between px-2 py-1 md:py-2 text-2xl text-text/50 dark:text-darkText/50 ${currency === "MOP" ? "hidden" : "flex flex-row"}`}>
					<p>MOP</p>
					<p className="pr-4">{(parseFloat(display) / exchangeRate).toFixed(2)}</p>
				</div>
				<div className="flex flex-row bg-bg dark:bg-darkBg items-center">
					<p className="pl-2 text-2xl text-text dark:text-darkText">{currency}</p>
					<input
						readOnly
						ref={inputRef}
						value={display}
						className="px-4 py-1 md:py-4 bg-bg dark:bg-darkBg w-10/12 text-right text-3xl focus:outline-dotted focus:outline-black focus:outline-2 focus:-outline-offset-8"
					/>
				</div>
			</div>
			<div className="grid grid-cols-4 gap-2 p-2 md:gap-4 md:p-4 flex-1">
				{["C", "←", "+/-", "÷", "7", "8", "9", "×", "4", "5", "6", "-", "1", "2", "3", "+", "0", "."].map((key) => (
					<Button
						key={key}
						type="button"
						variant={key === operator ? "default" : "neutral"}
						className="p-0 md:p-4 h-full text-xl md:text-base"
						onClick={() => handleNumPadClick(key)}
					>
						{key}
					</Button>
				))}
				<Button
					key={"oper-equal"}
					type="button"
					variant="default"
					className="p-0 md:p-4 h-full col-span-2 text-xl md:text-base"
					onClick={() => handleNumPadClick("=")}
				>
					{firstOperand !== null && operator !== null ? "=" : "Submit"}
				</Button>
			</div>
		</Card>
	)
}