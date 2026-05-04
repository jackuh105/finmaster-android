import * as XLSX from 'xlsx';

export interface TransactionImportRow {
  date: string;
  name: string;
  category?: string;
  account?: string;
  amount: number;
  description?: string;
}

export interface ParseResult {
  transactions: TransactionImportRow[];
  errors: string[];
  warnings: string[];
}

interface CategoryItem {
  id: string;
  name: string;
}

interface AccountItem {
  id: string;
  name: string;
}

/**
 * Generates a template xlsx file for transaction import.
 * Includes headers and an example row.
 */
export function generateTransactionTemplate(
  categories: CategoryItem[],
  accounts: AccountItem[]
): void {
  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();

  // Headers
  const headers = ["Date", "Name", "Category", "Account", "Amount", "Description"];

  // Example row
  const exampleRow = [
    "2026-01-22",
    "Example Transaction",
    categories.length > 0 ? categories[0].name : "Food",
    accounts.length > 0 ? accounts[0].name : "Cash",
    100.00,
    "This is an example description"
  ];

  // Create data array
  const data = [headers, exampleRow];

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(data);

  // Set column widths for better readability
  ws['!cols'] = [
    { wch: 12 },  // Date
    { wch: 25 },  // Name
    { wch: 15 },  // Category
    { wch: 15 },  // Account
    { wch: 12 },  // Amount
    { wch: 30 },  // Description
  ];

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, "Transactions");

  // Create a reference sheet with valid categories and accounts
  if (categories.length > 0 || accounts.length > 0) {
    const refData: string[][] = [["Valid Categories", "Valid Accounts"]];
    const maxRows = Math.max(categories.length, accounts.length);

    for (let i = 0; i < maxRows; i++) {
      refData.push([
        categories[i]?.name ?? "",
        accounts[i]?.name ?? ""
      ]);
    }

    const refWs = XLSX.utils.aoa_to_sheet(refData);
    refWs['!cols'] = [{ wch: 20 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, refWs, "Reference");
  }

  // Generate and download file
  XLSX.writeFile(wb, "transaction_import_template.xlsx");
}

/**
 * Parses a date string in various formats and returns YYYY-MM-DD format.
 */
function parseDate(value: unknown): string | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  // Handle Excel serial date numbers
  if (typeof value === "number") {
    const date = XLSX.SSF.parse_date_code(value);
    if (date) {
      const year = date.y;
      const month = String(date.m).padStart(2, "0");
      const day = String(date.d).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
    return null;
  }

  const str = String(value).trim();

  // Try parsing YYYY-MM-DD format
  const isoMatch = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  // Try parsing DD/MM/YYYY or MM/DD/YYYY format
  const slashMatch = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashMatch) {
    const [, first, second, year] = slashMatch;
    // Assume DD/MM/YYYY format (common in many regions)
    return `${year}-${second.padStart(2, "0")}-${first.padStart(2, "0")}`;
  }

  return null;
}

/**
 * Parses an uploaded xlsx file and returns transaction data.
 */
export async function parseTransactionFile(
  file: File,
  categories: CategoryItem[],
  accounts: AccountItem[]
): Promise<ParseResult> {
  const transactions: TransactionImportRow[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];

  // Create lookup maps for validation
  const categoryMap = new Map(categories.map(c => [c.name.toLowerCase(), c]));
  const accountMap = new Map(accounts.map(a => [a.name.toLowerCase(), a]));

  try {
    // Read file as ArrayBuffer
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });

    // Get first sheet
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      errors.push("No sheets found in the file");
      return { transactions, errors, warnings };
    }

    const worksheet = workbook.Sheets[sheetName];

    // Convert to JSON with header row
    const data = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
      defval: "",
    });

    if (data.length === 0) {
      errors.push("No data found in the file");
      return { transactions, errors, warnings };
    }

    // Process each row
    data.forEach((row, index) => {
      const rowNum = index + 2; // +2 because of 0-index and header row

      // Extract values (handle case-insensitive header matching)
      const getValue = (keys: string[]): unknown => {
        for (const key of keys) {
          if (key in row) return row[key];
          const lowerKey = key.toLowerCase();
          for (const rowKey of Object.keys(row)) {
            if (rowKey.toLowerCase() === lowerKey) return row[rowKey];
          }
        }
        return undefined;
      };

      const dateValue = getValue(["Date", "date", "DATE"]);
      const nameValue = getValue(["Name", "name", "NAME"]);
      const categoryValue = getValue(["Category", "category", "CATEGORY", "Type", "type"]);
      const accountValue = getValue(["Account", "account", "ACCOUNT"]);
      const amountValue = getValue(["Amount", "amount", "AMOUNT"]);
      const descValue = getValue(["Description", "description", "DESCRIPTION", "Desc", "desc"]);

      // Validate date
      const date = parseDate(dateValue);
      if (!date) {
        errors.push(`Row ${rowNum}: Invalid or missing date "${dateValue}"`);
        return;
      }

      // Validate name
      const name = String(nameValue ?? "").trim();
      if (!name) {
        errors.push(`Row ${rowNum}: Name is required`);
        return;
      }

      // Validate amount
      let amount: number;
      if (typeof amountValue === "number") {
        amount = amountValue;
      } else {
        const parsed = parseFloat(String(amountValue ?? ""));
        if (isNaN(parsed)) {
          errors.push(`Row ${rowNum}: Invalid amount "${amountValue}"`);
          return;
        }
        amount = parsed;
      }

      if (amount <= 0) {
        errors.push(`Row ${rowNum}: Amount must be greater than 0`);
        return;
      }

      // Validate category (optional)
      let category: string | undefined;
      const categoryStr = String(categoryValue ?? "").trim();
      if (categoryStr) {
        const matchedCategory = categoryMap.get(categoryStr.toLowerCase());
        if (matchedCategory) {
          category = matchedCategory.name;
        } else {
          warnings.push(`Row ${rowNum}: Category "${categoryStr}" not found, will be ignored`);
        }
      }

      // Validate account (optional)
      let account: string | undefined;
      const accountStr = String(accountValue ?? "").trim();
      if (accountStr) {
        const matchedAccount = accountMap.get(accountStr.toLowerCase());
        if (matchedAccount) {
          account = matchedAccount.name;
        } else {
          warnings.push(`Row ${rowNum}: Account "${accountStr}" not found, will be ignored`);
        }
      }

      // Description (optional)
      const description = String(descValue ?? "").trim() || undefined;

      transactions.push({
        date,
        name,
        category,
        account,
        amount,
        description,
      });
    });

  } catch (error) {
    errors.push(`Failed to parse file: ${error instanceof Error ? error.message : "Unknown error"}`);
  }

  return { transactions, errors, warnings };
}
