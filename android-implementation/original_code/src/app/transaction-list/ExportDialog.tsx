"use client";

import * as React from "react";
import { format } from "date-fns";
import { Download } from "lucide-react";
import { DateRange } from "react-day-picker";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useTransactions } from "@/hooks/use-transactions";
import { exportTransactionsToCSV } from "@/lib/csv-export";

type ExportScope = "all" | "range";

interface ExportDialogProps {
  trigger: React.ReactNode;
}

export default function ExportDialog({ trigger }: ExportDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [exportScope, setExportScope] = React.useState<ExportScope>("all");
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(undefined);
  const [isExporting, setIsExporting] = React.useState(false);

  // Fetch transactions based on current selection
  const { transactions, isLoading } = useTransactions(
    exportScope === "range" && dateRange?.from
      ? {
        startDate: format(dateRange.from, "yyyy-MM-dd"),
        endDate: dateRange.to
          ? format(dateRange.to, "yyyy-MM-dd")
          : format(dateRange.from, "yyyy-MM-dd"),
      }
      : {}
  );

  const handleExport = async () => {
    if (exportScope === "range" && !dateRange?.from) {
      alert("Please select a date range");
      return;
    }

    setIsExporting(true);

    try {
      // Generate filename with date info
      const today = format(new Date(), "yyyy-MM-dd");
      let filename = `transactions_${today}.csv`;

      if (exportScope === "range" && dateRange?.from) {
        const fromStr = format(dateRange.from, "yyyy-MM-dd");
        const toStr = dateRange.to
          ? format(dateRange.to, "yyyy-MM-dd")
          : fromStr;
        filename = `transactions_${fromStr}_to_${toStr}.csv`;
      }

      exportTransactionsToCSV(transactions, filename);
      setOpen(false);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export transactions");
    } finally {
      setIsExporting(false);
    }
  };

  const handleScopeChange = (value: string) => {
    setExportScope(value as ExportScope);
    if (value === "all") {
      setDateRange(undefined);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md bg-secondaryBg dark:bg-secondaryBlack max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Export Transactions</DialogTitle>
          <DialogDescription>
            Export your transactions to a CSV file. Choose to export all
            transactions or select a specific date range.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-4">
          {/* Export Scope Selection */}
          <RadioGroup
            value={exportScope}
            onValueChange={handleScopeChange}
            className="flex flex-col gap-3"
          >
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="all" id="export-all" />
              <Label htmlFor="export-all" className="cursor-pointer">
                Export all transactions
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="range" id="export-range" />
              <Label htmlFor="export-range" className="cursor-pointer">
                Export specific date range
              </Label>
            </div>
          </RadioGroup>

          {/* Date Range Picker - shown only when range is selected */}
          {exportScope === "range" && (
            <div className="flex flex-col gap-2">
              <Label className="text-sm text-muted-foreground">
                Select date range:
              </Label>
              <DatePickerWithRange date={dateRange} setDate={setDateRange} />
            </div>
          )}

          {/* Transaction count preview */}
          <div className="text-sm text-muted-foreground">
            {isLoading ? (
              "Loading..."
            ) : (
              <>
                <span className="font-bold">{transactions.length}</span>{" "}
                transactions will be exported
              </>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="neutral"
            onClick={() => setOpen(false)}
            disabled={isExporting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={
              isExporting ||
              isLoading ||
              (exportScope === "range" && !dateRange?.from)
            }
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            {isExporting ? "Exporting..." : "Export"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
