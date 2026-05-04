import { Transaction } from "@/types/Transaction";

/**
 * Escapes a field value for CSV format following RFC 4180.
 * If the value contains commas, newlines, or quotes, it wraps in quotes and escapes internal quotes.
 */
function escapeCSVField(value: string | undefined | null): string {
  if (value === null || value === undefined) {
    return "";
  }

  const stringValue = String(value);

  // Check if the value contains characters that require quoting per RFC 4180
  if (stringValue.includes(",") || stringValue.includes("\n") || stringValue.includes("\r") || stringValue.includes('"')) {
    // Escape quotes by doubling them and wrap in quotes
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

/**
 * Generates a CSV string from an array of transactions.
 * Uses comma as separator with proper RFC 4180 quoting for Excel compatibility.
 */
export function generateTransactionCSV(transactions: Transaction[]): string {
  const headers = ["Date", "Name", "Category", "Account", "Amount", "Description"];

  const rows = transactions.map((t) => [
    escapeCSVField(t.date),
    escapeCSVField(t.name),
    escapeCSVField(t.type),
    escapeCSVField(t.account),
    t.amount.toFixed(2),
    escapeCSVField(t.desc),
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  return csvContent;
}

/**
 * Triggers a download of the CSV content as a file.
 */
export function downloadCSV(csvContent: string, filename: string): void {
  // Add BOM for Excel compatibility with UTF-8
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });

  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Exports transactions to a CSV file and triggers download.
 */
export function exportTransactionsToCSV(
  transactions: Transaction[],
  filename: string = "transactions.csv"
): void {
  const csvContent = generateTransactionCSV(transactions);
  downloadCSV(csvContent, filename);
}
