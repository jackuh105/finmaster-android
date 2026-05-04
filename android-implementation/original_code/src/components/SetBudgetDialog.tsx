"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUserSettings } from "@/hooks/use-user-settings";
import { useState } from "react";

function BudgetForm({ budget, onSave }: { budget: number | null, onSave: (val: number) => Promise<void> }) {
  const [value, setValue] = useState<number | string>(budget ?? "");

  const handleSave = () => {
    onSave(Number(value));
  };

  return (
    <>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="budget" className="text-right">
            Budget
          </Label>
          <Input
            id="budget"
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value === "" ? "" : Number(e.target.value))}
            className="col-span-3"
          />
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" onClick={handleSave}>Save changes</Button>
        </DialogClose>
      </DialogFooter>
    </>
  );
}

export function SetBudgetDialog() {
  const { budget, updateBudget } = useUserSettings();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default" className="bg-main">Set budget</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-secondaryBlack text-text dark:text-darkText">
        <DialogHeader>
          <DialogTitle>Set Budget</DialogTitle>
          <DialogDescription>
            Enter your monthly budget below.
          </DialogDescription>
        </DialogHeader>
        <BudgetForm budget={budget} onSave={updateBudget} key={budget ?? 'unset'} />
      </DialogContent>
    </Dialog>
  );
}
