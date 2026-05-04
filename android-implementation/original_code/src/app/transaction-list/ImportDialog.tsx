"use client";

import * as React from "react";
import { Download, Upload, FileSpreadsheet, AlertCircle, CheckCircle2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useCategories } from "@/hooks/use-categories";
import { useAccounts } from "@/hooks/use-accounts";
import { useTransactions } from "@/hooks/use-transactions";
import {
  generateTransactionTemplate,
  parseTransactionFile,
  TransactionImportRow,
} from "@/lib/xlsx-utils";

interface ImportDialogProps {
  trigger: React.ReactNode;
}

export default function ImportDialog({ trigger }: ImportDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [parseResult, setParseResult] = React.useState<{
    transactions: TransactionImportRow[];
    errors: string[];
    warnings: string[];
  } | null>(null);
  const [isImporting, setIsImporting] = React.useState(false);
  const [importSuccess, setImportSuccess] = React.useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const { categories } = useCategories();
  const { accounts } = useAccounts();
  const { addTransactions } = useTransactions();

  const handleDownloadTemplate = () => {
    generateTransactionTemplate(categories, accounts);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setParseResult(null);
    setImportSuccess(false);

    // Parse the file
    const result = await parseTransactionFile(file, categories, accounts);
    setParseResult(result);
  };

  const handleImport = async () => {
    if (!parseResult || parseResult.transactions.length === 0) return;

    setIsImporting(true);

    try {
      // Map category and account names to IDs
      const categoryMap = new Map(categories.map((c) => [c.name, c.id]));
      const accountMap = new Map(accounts.map((a) => [a.name, a.id]));

      const transactionsToAdd = parseResult.transactions.map((t) => ({
        name: t.name,
        amount: t.amount,
        date: t.date,
        description: t.description,
        category_id: t.category ? categoryMap.get(t.category) : undefined,
        account_id: t.account ? accountMap.get(t.account) : undefined,
      }));

      await addTransactions(transactionsToAdd);
      setImportSuccess(true);

      // Close dialog after short delay
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (error) {
      console.error("Import failed:", error);
      alert("Failed to import transactions");
    } finally {
      setIsImporting(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedFile(null);
    setParseResult(null);
    setImportSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const canImport =
    parseResult &&
    parseResult.transactions.length > 0 &&
    parseResult.errors.length === 0 &&
    !isImporting &&
    !importSuccess;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => (isOpen ? setOpen(true) : handleClose())}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg bg-secondaryBg dark:bg-secondaryBlack">
        <DialogHeader>
          <DialogTitle>Import Transactions</DialogTitle>
          <DialogDescription>
            Download the template, fill in your transactions, then upload the file to import.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-4">
          {/* Template Download Section */}
          <div className="flex flex-col gap-2">
            <Label className="font-bold">Step 1: Download Template</Label>
            <p className="text-sm text-muted-foreground">
              Get the template file with your existing categories and accounts pre-filled.
            </p>
            <Button
              variant="neutral"
              onClick={handleDownloadTemplate}
              className="w-full sm:w-auto gap-2"
            >
              <Download className="h-4 w-4" />
              Download Template
            </Button>
          </div>

          {/* File Upload Section */}
          <div className="flex flex-col gap-2">
            <Label className="font-bold">Step 2: Upload Filled File</Label>
            <p className="text-sm text-muted-foreground">
              Select your completed xlsx file to import transactions.
            </p>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Custom styled button */}
            <Button
              variant="neutral"
              onClick={() => fileInputRef.current?.click()}
              className="w-full sm:w-auto gap-2"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Select File (.xlsx)
            </Button>

            {/* Selected file display */}
            {selectedFile && (
              <div className="text-sm flex items-center gap-2 mt-2 p-2 bg-bg dark:bg-darkBg rounded-base border-2 border-border dark:border-darkBorder">
                <FileSpreadsheet className="h-4 w-4" />
                <span className="truncate">{selectedFile.name}</span>
              </div>
            )}
          </div>

          {/* Parse Results */}
          {parseResult && (
            <div className="flex flex-col gap-3">
              {/* Success/Transaction count */}
              {parseResult.transactions.length > 0 && parseResult.errors.length === 0 && (
                <div className="flex items-center gap-2 p-3 bg-success/10 border-2 border-success rounded-base">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  <span className="text-sm">
                    <span className="font-bold">{parseResult.transactions.length}</span> transactions ready to import
                  </span>
                </div>
              )}

              {/* Errors */}
              {parseResult.errors.length > 0 && (
                <div className="flex flex-col gap-2 p-3 bg-alert/10 border-2 border-alert rounded-base">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-alert" />
                    <span className="font-bold text-sm">Errors Found</span>
                  </div>
                  <ul className="text-sm list-disc list-inside max-h-32 overflow-y-auto">
                    {parseResult.errors.slice(0, 10).map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                    {parseResult.errors.length > 10 && (
                      <li className="text-muted-foreground">
                        ...and {parseResult.errors.length - 10} more errors
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {/* Warnings */}
              {parseResult.warnings.length > 0 && (
                <div className="flex flex-col gap-2 p-3 bg-warning/10 border-2 border-warning rounded-base">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-warning" />
                    <span className="font-bold text-sm">Warnings</span>
                  </div>
                  <ul className="text-sm list-disc list-inside max-h-32 overflow-y-auto">
                    {parseResult.warnings.slice(0, 5).map((warning, i) => (
                      <li key={i}>{warning}</li>
                    ))}
                    {parseResult.warnings.length > 5 && (
                      <li className="text-muted-foreground">
                        ...and {parseResult.warnings.length - 5} more warnings
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Import Success Message */}
          {importSuccess && (
            <div className="flex items-center gap-2 p-3 bg-success/10 border-2 border-success rounded-base">
              <CheckCircle2 className="h-5 w-5 text-success" />
              <span className="text-sm font-bold">Import successful!</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="neutral" onClick={handleClose} disabled={isImporting}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={!canImport}
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            {isImporting ? "Importing..." : "Import"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
