# 04 - UI Components Reference

This document describes every UI component from the web app that must be recreated in Android Compose. Each section covers the component's purpose, visual appearance, props/state, behavior, and Android implementation guidance.

---

## Part A: Base UI Components (Shadcn/UI Wrappers)

These are the foundation components used everywhere. They wrap Radix UI primitives with Neo-brutalism styling.

### A1. Button (`button.tsx`)

**Purpose**: Primary action trigger with multiple visual variants.

**Variants**:
| Variant | Background | Border | Shadow | Hover Effect |
|---------|-----------|--------|--------|--------------|
| `default` | `bg-main` (#FF7A05) | 2px solid black | 3px 3px 0px black | Translates 3px right+down, shadow disappears (button "presses in") |
| `noShadow` | `bg-main` (#FF7A05) | 2px solid black | None | No translation |
| `neutral` | White (dark: #212121) | 2px solid black | 3px 3px 0px black | Same press effect as default |
| `reverse` | `bg-main` | 2px solid black | None | Translates -3px left+up, shadow appears (reverse press) |
| `ghost` | Transparent | None (appears on hover) | None | Border appears on hover |

**Sizes**: `default` (h-10 px-4 py-2), `sm` (h-9 px-3), `lg` (h-11 px-8), `icon` (h-10 w-10)

**States**: Default, hover, focus-visible (ring-2 ring-black), disabled (opacity-50, no pointer events)

**Typography**: 14px, font-weight 500, text color `text-text` (#402E32)

**Android Implementation**:
```kotlin
@Composable
fun FinButton(
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    variant: FinButtonVariant = FinButtonVariant.Default,
    size: FinButtonSize = FinButtonSize.Default,
    enabled: Boolean = true,
    content: @Composable RowScope.() -> Unit
)
```
Use `Modifier.offset()` for the press animation. Use `InteractionSource` to detect press state. Apply `Modifier.shadow()` for the shadow effect.

---

### A2. Card (`card.tsx`)

**Purpose**: Content container with border and optional header.

**Visual**: 2px solid black border, padded content area. Two color variants:
- `default`: `bg-secondaryBg` (white in light, #212121 in dark)
- `inner`: `bg-bg` (#FFEDD6 light, #322215 dark)

**Structure**:
- `CardHeader`: Contains `CardTitle` (text-lg font-bold) and `CardDescription` (text-sm muted)
- `CardContent`: Main content area with padding
- `CardFooter`: Bottom area (rarely used)

**Typography**: Title is 18px bold, description is 14px muted

**Android Implementation**:
```kotlin
@Composable
fun FinCard(
    modifier: Modifier = Modifier,
    variant: FinCardVariant = FinCardVariant.Default,
    header: @Composable (() -> Unit)? = null,
    content: @Composable () -> Unit
)
```
Use `Surface` or `Card` with `border = BorderStroke(2.dp, Color.Black)`.

---

### A3. Input (`input.tsx`)

**Purpose**: Text/number input field.

**Visual**: 2px solid black border, white background. Height 40px. Rounded corners 2px. Focus ring: 2px solid black offset-2.

**Types supported**: text, number, search, email, password

**States**: Default, focus (ring-2 ring-black), disabled (opacity-50, cursor-not-allowed)

**Typography**: 16px (text-lg), text color `text-text`

**Special**: Number inputs hide the browser's inner spin buttons.

**Android Implementation**:
```kotlin
@Composable
fun FinTextField(
    value: String,
    onValueChange: (String) -> Unit,
    modifier: Modifier = Modifier,
    label: String? = null,
    placeholder: String? = null,
    keyboardType: KeyboardType = KeyboardType.Text,
    enabled: Boolean = true,
    isError: Boolean = false,
    singleLine: Boolean = true
)
```
Use `OutlinedTextField` with custom `BorderStroke(2.dp, Color.Black)` and `RoundedCornerShape(2.dp)`.

---

### A4. Dialog (`dialog.tsx`)

**Purpose**: Modal overlay for confirmations, forms, and detail views.

**Visual**: Semi-transparent dark overlay (`rgba(0,0,0,0.8)`). Centered card with:
- 2px solid black border
- White background
- Padding 24px
- Shadow: 4px 4px 0px black
- Max width 425px

**Structure**:
- `DialogHeader`: Title + optional description
- `DialogContent`: Scrollable content area
- `DialogFooter`: Action buttons (right-aligned)

**Animation**: Fade in overlay, scale in card. Close on overlay click or Escape key.

**Android Implementation**:
```kotlin
@Composable
fun FinDialog(
    open: Boolean,
    onDismiss: () -> Unit,
    title: String,
    description: String? = null,
    confirmButton: @Composable (() -> Unit)? = null,
    dismissButton: @Composable (() -> Unit)? = null,
    content: @Composable () -> Unit
)
```
Use `Dialog` composable with `dialogTheme = false` for custom styling.

---

### A5. Progress (`progress.tsx`)

**Purpose**: Horizontal progress bar, primarily for budget tracking.

**Visual**: 2px solid black border container (height 16px). Filled portion uses `bg-main` (#FF7A05) with a right border. The fill grows from left to right.

**Color variants** (via `barClassName`):
- Default: `bg-main` (#FF7A05 - orange)
- `bg-success`: #009141 (green, < 30%)
- `bg-warning`: #FDC045 (yellow, 30-60%)
- `bg-alert`: #F34257 (red, > 60%)

**Props**: `value` (0-100 number)

**Android Implementation**:
```kotlin
@Composable
fun FinProgressBar(
    value: Float, // 0f to 100f
    modifier: Modifier = Modifier,
    color: Color = FinColors.Main
)
```
Use `LinearProgressIndicator` with custom `drawBehind` for the border, or custom `Canvas` drawing.

---

### A6. Badge (`badge.tsx`)

**Purpose**: Small tag/chip for displaying categories, tags, or status.

**Visual**: Inline flex, 2px black border, 2px border radius. Padding: 4px horizontal, 2px vertical. Font: 12px, font-weight 500.

**Variants**:
- `default`: `bg-main` (#FF7A05), black text
- `neutral`: White bg (dark: #212121), `text-text` (dark: `darkText`)

**Behavior**: Often used as clickable quick-select chips.

**Android Implementation**:
```kotlin
@Composable
fun FinBadge(
    text: String,
    modifier: Modifier = Modifier,
    variant: FinBadgeVariant = FinBadgeVariant.Default,
    onClick: (() -> Unit)? = null
)
```
Use `Surface` with `RoundedCornerShape(2.dp)`.

---

### A7. Checkbox (`checkbox.tsx`)

**Purpose**: Toggleable checkbox for multi-select filters.

**Visual**: Square (16x16px), 2px border, white background. When checked: `bg-main` with a white checkmark icon. Border radius 2px.

**States**: Unchecked, checked, focus-visible (ring-2 ring-black offset-2)

**Android Implementation**:
```kotlin
@Composable
fun FinCheckbox(
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit,
    modifier: Modifier = Modifier
)
```
Custom `Checkbox` with `CheckboxColors` using Neo-brutalism colors.

---

### A8. Select (`select.tsx`)

**Purpose**: Dropdown select for choosing from a list of options.

**Visual**: 40px height trigger with 2px border, white background. Selected text shown. Dropdown content: white card with 2px border, shadow, each item as clickable row.

**States**: Default, open, disabled

**Android Implementation**:
```kotlin
@Composable
fun FinDropdown(
    value: String,
    onValueChange: (String) -> Unit,
    options: List<String>,
    modifier: Modifier = Modifier,
    label: String? = null,
    placeholder: String? = null
)
```
Use `ExposedDropdownMenuBox` with `OutlinedTextField` as anchor.

---

### A9. Switch (`switch.tsx`)

**Purpose**: Toggle switch for binary on/off states.

**Visual**: Track: rounded-full, 2px border, background changes on state. Thumb: circle with 2px border, translates on toggle.

**Used in**: Periodic transaction toggle.

**Android Implementation**: Material3 `Switch` with custom colors matching the theme.

---

### A10. Table (`table.tsx`)

**Purpose**: Data table for displaying structured data.

**Visual**: Full-width table with 2px borders on cells. Header cells: bold text, slightly darker background. Body cells: regular text. Rows have hover state.

**Columns**: Date, Name, Type, Amount, Actions (dropdown with Edit/Delete)

**Features**: Column sorting (click header to toggle asc/desc), client-side or server-side pagination.

**Android Implementation**: Not a direct 1:1 port. Use `LazyColumn` with `TransactionItem` composable instead of a full table (better for mobile). The mobile web version (`MobileTransactionList`) already uses a card/list pattern.

---

### A11. Slider (`DualRangeSlider.tsx`)

**Purpose**: Range slider with two thumbs for min/max value selection (used in Amount Filter).

**Visual**: Track: 2px border, rounded, height 12px, white background. Range fill: `bg-main`. Thumbs: 20px circles, 2px border, white background. Labels above/below thumbs showing current values.

**Android Implementation**:
```kotlin
@Composable
fun FinRangeSlider(
    valueRange: ClosedFloatingPointRange<Float>,
    onValueChange: (ClosedFloatingPointRange<Float>) -> Unit,
    modifier: Modifier = Modifier,
    valueRangeBounds: ClosedFloatingPointRange<Float> = 0f..1000f
)
```
Use `RangeSlider` from Material3 with custom `SliderColors`.

---

### A12. DatePicker (`date-picker.tsx`)

**Purpose**: Single date picker using react-day-picker.

**Visual**: White card with 2px border and shadow. Calendar grid with day cells. Selected date: `bg-main`. Today: bold text.

**Android Implementation**: Material3 `DatePickerDialog`.

---

### A13. DateRangePicker (`date-range-picker.tsx`)

**Purpose**: Date range picker for selecting start and end dates.

**Visual**: Same style as DatePicker but with two inputs: "From" and "To" dates, both with calendar icons.

**Android Implementation**: Material3 `DateRangePicker`.

---

### A14. Chart Components (`chart.tsx`)

**Purpose**: Chart wrapper utilities for Recharts integration.

**Visual**: Provides `ChartContainer` (responsive container), `ChartTooltip` (custom styled tooltip), `ChartTooltipContent` (tooltip content layout).

**Charts used in the app**:
1. **PieChart**: Category expense breakdown (donut/pie)
2. **BarChart**: Daily expense trend
3. **LineChart**: Compound interest growth over time

**Android Implementation**: Use Vico library for Compose-native charts. Customize to match Neo-brutalism style (thick borders, bold labels, custom color palette).

---

### A15. Popover (`popover.tsx`)

**Purpose**: Floating content panel, used for calendar pickers and dropdowns.

**Visual**: White card, 2px border, shadow. Animated in/out (scale + fade).

**Android Implementation**: Use `DropdownMenu` or `Popup` composable.

---

### A16. DropdownMenu (`dropdown-menu.tsx`)

**Purpose**: Context menu for row actions (Edit/Delete).

**Visual**: Floating card with 2px border. Items: hover highlight, separator lines between groups.

**Android Implementation**: Use `DropdownMenu` composable.

---

### A17. Label (`label.tsx`)

**Purpose**: Form label text.

**Visual**: 14px, font-weight 500, no special styling. Color: `text-text`.

**Android Implementation**: Standard `Text` composable.

---

### A18. Textarea (`textarea.tsx`)

**Purpose**: Multi-line text input for descriptions.

**Visual**: Same as Input but with min-height for multiple lines. 2px border, 2px radius.

**Android Implementation**: `FinTextField` with `singleLine = false` and `minHeight`.

---

### A19. RadioGroup (`radio-group.tsx`)

**Purpose**: Radio button group for exclusive selection (used in Export dialog for scope selection).

**Visual**: Circle buttons with dot indicator. 2px border.

**Android Implementation**: `RadioButton` in a `Column` with custom colors.

---

## Part B: Domain-Specific Components

### B1. BudgetWidget (`BudgetWidget.tsx`)

**Purpose**: Dashboard card showing monthly budget status.

**Features**:
- Shows spent amount vs budget (e.g., "Spent: 3200.50 / 5000")
- Color-coded progress bar (green/yellow/red based on percentage)
- "Set Budget" button that opens `SetBudgetDialog`
- Empty state when no budget is set: dashed border card with yellow background, "No Budget Set" message, "Please set a budget to start tracking your spending"

**Data**: Reads from `useTransactions()` (all transactions) and `useUserSettings()` (budget amount). Filters transactions for current month.

**Logic**:
```
totalSpent = sum of current month transaction amounts
percentage = min(100, max(0, (totalSpent / budget) * 100))
barColor: <30% = green, 30-60% = yellow, >60% = red
```

**Android**: `BudgetCard` composable in dashboard package.

---

### B2. SetBudgetDialog (`SetBudgetDialog.tsx`)

**Purpose**: Modal dialog for setting/updating the monthly budget.

**Features**:
- Triggered by "Set Budget" button
- Contains a number input with label "Budget"
- "Save changes" button that calls `updateBudget()` mutation
- Closes on save

**Android**: Part of `BudgetSettingScreen` or inline dialog.

---

### B3. SpendingOverviewChart (`SpendingOverviewChart.tsx`)

**Purpose**: Dashboard pie chart showing expense breakdown by category for the current month.

**Features**:
- Uses `useMonthlyStats()` hook which calls `get_monthly_category_stats` RPC
- Renders a donut/pie chart with `recharts` PieChart
- Each category gets a color from the chart palette
- Legend showing category names
- Center label showing total amount
- Title: "Expenses by category", subtitle: "Current month"

**Data format**:
```typescript
{ category_name: string, total_amount: number }[]
```

**Android**: `SpendingPieChart` composable in dashboard package.

---

### B4. ShortTransactionList (`shortTransactionList.tsx`)

**Purpose**: Dashboard card showing the 5 most recent transactions.

**Features**:
- Card with "Recent Transaction" title and "More" button (links to /transaction-list)
- List of up to 5 transactions
- Each item: date badge (small bordered box), name (truncated on mobile with "..."), amount (red, formatted to 2 decimals)
- Items separated by dotted divider (`divide-y-2`)

**Data**: `useTransactions({ limit: 5 })`

**Android**: `RecentTransactionsCard` composable in dashboard package.

---

### B5. TransactionForm (`TransactionForm.tsx`)

**Purpose**: Form for creating and editing transactions. The most complex form in the app.

**Features**:
1. **Item name input** (`TagInput`): Text input + quick-select tag badges below
2. **Category selector** (`TagSelect`): Dropdown + preset badge chips
3. **Date picker**: Single date, hidden when periodic mode is on
4. **Account selector**: Dropdown + preset badge chips
5. **Amount input with calculator** (`Calculator`): Number display + calculator keypad
6. **Description textarea**: Multi-line input for notes
7. **Currency & exchange rate**: Currency dropdown + exchange rate input (for multi-currency)
8. **Periodic transaction toggle** (`PeriodicTransactionFields`):
   - Switch to enable
   - Period type: weekly/monthly/yearly
   - Expense day: day of week (weekly), day of month (monthly), month+day (yearly)
   - Date range picker (from/to)

**Submit logic**:
- Validate required fields (amount > 0, item not empty)
- If editing: call `updateTransaction()`
- If periodic: generate dates via `generatePeriodicDates()`, call `addTransactions()` (batch)
- If single: call `addTransaction()`
- Redirect to transaction list on success

**Android**: `TransactionFormScreen` with a scrollable `Column` containing all sections.

---

### B6. Calculator (`Calculator.tsx`)

**Purpose**: Built-in calculator for amount input in the transaction form.

**Visual**: Grid of buttons (4 columns x 5 rows):
- Display at top showing current value
- Row 1: AC (clear), DEL (delete), ., ÷
- Row 2: 7, 8, 9, ×
- Row 3: 4, 5, 6, -
- Row 4: 1, 2, 3, +
- Row 5: 0 (span 2), = (span 2)

**Behavior**:
- Number buttons append to display
- Operator buttons: if previous calculation pending, compute it first
- = computes the result
- AC clears everything
- DEL removes last character
- Decimal point allowed once per number

**Android**: `CalculatorComposable` using `LazyVerticalGrid` with `GridCells.Fixed(4)`.

---

### B7. TagInput (`TagInput.tsx`)

**Purpose**: Text input with clickable tag badges below for quick selection.

**Features**:
- Label text above
- Text input field
- Row of `Badge` components below, clicking one sets the input value

**Props**: `title`, `value`, `setValue`, `tags: string[]`

**Android**: `TagInputField` composable with `FlowRow` for badges.

---

### B8. TagSelect (`TagSelect.tsx`)

**Purpose**: Dropdown select with preset badge chips for quick category/account selection.

**Features**:
- Label text above
- Dropdown with all options
- Below: row of `Badge` chips showing either presets or first 5 items
- Clicking a badge sets the dropdown value

**Props**: `title`, `value`, `setValue`, `items: string[]`, `presets?: string[]`

**Android**: `TagSelectField` composable combining `FinDropdown` + `FlowRow` of `FinBadge`.

---

### B9. PeriodicTransactionFields (`PeriodicTransactionFields.tsx`)

**Purpose**: UI for configuring recurring/periodic transactions.

**Features**:
- Enable switch (toggle on/off)
- When enabled, shows:
  - Period type selector: weekly / monthly / yearly
  - Expense day selector:
    - Weekly: dropdown with days of week (Sunday-Saturday)
    - Monthly: number input or dropdown (1-31)
    - Yearly: month dropdown + day input
  - Date range picker (from/to)

**Data**: `PeriodType = "weekly" | "monthly" | "yearly"`, `ExpenseDay = number | { month: number; day: number }`

**Android**: `PeriodicTransactionSection` composable.

---

### B10. ExchangeRate (`ExchangeRate.tsx`)

**Purpose**: Currency selection and exchange rate input in the transaction form.

**Features**:
- Currency dropdown (MOP, HKD, CNY, JPY, TWD, USD, AUD)
- Exchange rate input (number, default 1)

**Android**: `ExchangeRateSection` composable.

---

### B11. ItemsFilter (`ItemsFilter.tsx`)

**Purpose**: Checkbox-based filter for categories/types.

**Features**:
- Section title "Type" with "Clear" link when items are selected
- Shows first 3 items always visible
- "Show more"/"Show less" toggle for remaining items
- Each item: checkbox + name label
- Selected items set shown as count: "x selected"

**Props**: `types: string[]`, `onChange: (idSet: Set<number>) => void`

**Android**: `CategoryFilterSection` composable with `LazyColumn` or expandable `Column`.

---

### B12. DualRangeSlider (`DualRangeSlider.tsx`)

Already covered in A11.

---

### B13. DataTable (`DataTable.tsx`) + Columns (`Columns.tsx`)

**Purpose**: Full transaction data table with sorting and pagination.

**Features**:
- Uses `@tanstack/react-table` for table logic
- Columns: Date (sortable), Name, Type, Amount (sortable), Actions (dropdown: Edit/Delete)
- Manual pagination: Previous/Next buttons with page number input
- Server-side pagination (page count from API)

**Columns definition**:
```
Date: Sortable header, plain cell
Name: Plain header, plain cell
Type: Plain header, plain cell  
Amount: Sortable header, formatted to 2 decimal places
Actions: Dropdown menu with "Edit" (calls onEdit) and "Delete" (calls onDelete with confirmation)
```

**Android**: Not directly ported. Use `LazyColumn` with `TransactionItemRow` composables. Pagination via infinite scroll (load more on scroll to bottom).

---

### B14. BudgetProgressBar (`BudgetProgressBar.tsx`)

**Purpose**: Thin wrapper around Progress with color logic.

**Logic**:
```
value < 30  → "bg-success" (green #009141)
value < 60  → "bg-warning" (yellow #FDC045)
else        → "bg-alert"   (red #F34257)
```

**Android**: Included in `FinProgressBar` or as standalone `BudgetProgressBar` composable.

---

### B15. Columns (`Columns.tsx`)

**Purpose**: Defines the column configuration for the transaction data table.

**Columns**:
1. `date` - Sortable, shows date string
2. `name` - Plain display of transaction name
3. `type` - Category name
4. `amount` - Sortable, formatted to 2 decimal places
5. `actions` - DropdownMenu with Edit + Delete options, delete shows confirmation dialog

**Android**: Not needed (replaced by LazyColumn item layout).

---

### B16. SearchBar (`SearchBar.tsx`)

**Purpose**: Search input with Chinese text segmentation for the transaction list.

**Features**:
- Search icon at left
- Text input, 18px font, transparent background
- Uses `Intl.Segmenter("zh", { granularity: "word" })` to tokenize Chinese text
- Tokenizes the query into space-separated words before passing to the API

**Android Implementation**:
```kotlin
@Composable
fun SearchBar(
    query: String,
    onQueryChange: (String) -> Unit,
    modifier: Modifier = Modifier
)
```
For Chinese text segmentation, use `java.text.BreakIterator` with `Locale.CHINESE` or a simple character-level split.

---

### B17. ActionButtons (`ActionButtons.tsx`)

**Purpose**: Action button group for the transaction list page.

**Features**:
- Desktop: Vertical stack - "New Transaction" (full width, default variant), then row with "Import" + "Export" (neutral variant)
- Mobile: Horizontal row - "Add Transaction", "Import", "Export"
- All link to respective screens/dialogs

**Android**: `TransactionActions` composable with `Row` or `Column` depending on screen width.

---

### B18. ExportDialog (`ExportDialog.tsx`)

**Purpose**: Dialog for exporting transactions to CSV.

**Features**:
- Scope selection: "All transactions" or "Date range" (radio group)
- When "Date range" selected: shows date range picker
- "Export" button that:
  1. Fetches transactions for selected scope
  2. Generates CSV via `generateTransactionCSV()`
  3. Triggers browser download via `downloadCSV()`
- Loading state during export

**Android**: Share CSV via `Intent.ACTION_SEND` with `text/csv` MIME type.

---

### B19. ImportDialog (`ImportDialog.tsx`)

**Purpose**: Dialog for importing transactions from XLSX files.

**Features**:
1. "Download Template" button - generates an XLSX template with column headers and dropdown validation for categories/accounts
2. File upload input (.xlsx, .xls)
3. File validation: parses the file, checks headers, validates category/account names
4. Preview of parsed transactions before import
5. Import button that batch-creates transactions
6. Success/error feedback

**Android**: Use Apache POI library for XLSX parsing. Use `ActivityResultContracts.GetContent` for file picking.

---

### B20. FilterList (`FilterList.tsx`)

**Purpose**: Wrapper that connects the transaction list context to the DataTable.

**Features**:
- Reads filter state from `TransactionListContext`
- Calls `useTransactions()` with filter options
- Passes data to `DataTable` with pagination callbacks
- Handles edit navigation and delete with confirmation

**Android**: Integrated directly into `TransactionListScreen`.

---

### B21. MobileTransactionList (`MobileTransactionList.tsx`)

**Purpose**: Mobile-optimized transaction list with month-based filtering.

**Features**:
- Month selector dropdown (YYYY-MM format, showing only months with transactions)
- Expandable transaction items (click to show/hide details)
- Each collapsed item: date badge, name, amount
- Each expanded item: shows description, category, account, edit/delete buttons
- Uses `useTransactionMonths()` hook (calls `get_distinct_transaction_months` RPC)
- Month auto-selects to most recent available month

**Android**: Primary list design for Android. Each transaction as an expandable card.

---

### B22. MobileFilters (`MobileFilters.tsx`)

**Purpose**: Wrapper combining AmountFilter and TypeFilter for mobile display.

**Features**: Simple card container with padding, holding AmountFilter and TypeFilter in vertical stack.

**Android**: `FilterBottomSheet` composable (use `ModalBottomSheet`).

---

### B23. TypeFilter (`TypeFilter.tsx`)

**Purpose**: Category-based filter for transactions.

**Features**:
- Reads categories from `useCategories()` hook
- Converts category names to ItemsFilter
- Maps checked item indices back to category name strings
- Updates `TransactionListContext.typeFilter`

**Android**: `CategoryFilterChips` composable with `FilterChip` components.

---

### B24. AmountFilter (`AmountFilter.tsx`)

**Purpose**: Amount range filter for transactions.

**Features**:
- Reads maxAmount from `TransactionListContext`
- Uses DualRangeSlider with range [0, maxAmount]
- Labels: "Min" and "Max" with current values
- Updates `TransactionListContext.amountFilter` on change

**Android**: `AmountRangeFilter` composable with `RangeSlider`.

---

### B25. ModeToggle (`ModeToggle.tsx`)

**Purpose**: Dark/light theme toggle button.

**Features**:
- Uses `next-themes` to toggle theme
- Sun icon in light mode, Moon icon in dark mode
- Dropdown menu with 3 options: Light, Dark, System

**Android**: `ThemeToggle` icon button using `MaterialTheme` state.

---

### B26. UserProfile (`UserProfile.tsx`)

**Purpose**: User info display and logout button in the header.

**Features**:
- If not logged in: "Login" button linking to /auth/login
- If logged in: User icon + email (hidden on small screens) + Logout button

**Android**: `UserProfileSection` in top app bar showing email and logout icon.

---

### B27. Header / HeaderContent (`header.tsx`, `header-content.tsx`)

**Purpose**: App navigation header with desktop nav and mobile hamburger menu.

**Features**:
- Sticky top bar with 2px bottom border
- Left: App title "Finance Master" + desktop navigation links (Dashboard, Transaction, Analytics, FinCalculate, Settings)
- Right: ModeToggle + UserProfile
- Mobile: Hamburger button that toggles slide-down menu with all nav links + user section

**Navigation links**: Only shown when user is logged in.

**Android**: Replaced by `FinBottomNav` + `FinTopAppBar`.

---

## Part C: Calculator Components

### C1. FixedDepositCurrencyDiff (`FixedDepositCurrencyDiff.tsx`)

**Purpose**: Compare fixed deposit returns across different currencies.

**Features**:
- Auto-fetches live exchange rates from `@fawazahmed0/currency-api` on mount
- Configurable principal and days
- Currency rows with: currency name, buy rate, sell rate, interest rate
- Base currency (MOP) is always present
- Calculates interest for each currency: `(principal * rate% * days) / 365`
- Converts to base equivalent: `interest * sellRate`
- Shows difference from base
- Rate fetching with fallback URL

**Android Implementation**:
```kotlin
@Composable
fun FixedDepositDiffScreen(viewModel: FixedDepositDiffViewModel)
```
Fetch rates from same API using Retrofit or Ktor client.

### C2. BuyHoldCompoundInterest (`BuyHoldCompoundInterest.tsx`)

**Purpose**: Calculate compound interest growth for buy-and-hold strategy.

**Inputs**:
- Monthly deposit amount
- Annual return rate (%)
- Inflation rate (%)
- Transaction fee (per transaction)
- Deposit frequency (times per year)
- Investment years

**Outputs**:
- Yearly breakdown table: Year, Annual Invested, Cumulative Invested, Profit, Total Amount, Present Value, ROI%
- Line chart: Total Amount and Present Value over time

**Formula**: `totalAmount = previousTotal * (1 + rate) + annualNetInvested`

**Android**: Table as `LazyColumn`, chart using Vico `LineChart`.

### C3. FinancialFreedomPoint (`FinancialFreedomPoint.tsx`)

**Purpose**: Calculate the asset needed for financial freedom.

**Inputs**:
- Monthly expenses
- Annual return rate (%)

**Outputs**:
- Monthly return rate: `(1 + annualRate)^(1/12) - 1`
- Freedom point asset: `monthlyExpenses / monthlyReturnRate`

**Android**: Simple two-input form with results display.

### C4. MortgageRepayment (`MortgageRepayment.tsx`)

**Purpose**: Calculate mortgage repayment schedule.

**Inputs**:
- Total property price
- Down payment ratio (%)
- Interest rate (%)
- Loan term (years)

**Outputs**:
- Loan amount, monthly payment, total interest
- Yearly amortization table: Year, Principal Paid, Interest Paid, Balance, Total Paid, Principal Ratio%, Interest Ratio%
- Bar chart: Principal vs Interest per year

**Formula (PMT)**: `P * r * (1+r)^n / ((1+r)^n - 1)`

**Android**: Table as `LazyColumn`, chart using Vico `BarChart`.

---

## Part D: Layout Components

### D1. RootLayout (`layout.tsx`)

**Purpose**: App shell wrapping all pages.

**Structure**:
```
<html>
  <body class="bg-grid antialiased">
    <ThemeProvider>
      <QueryProvider>
        <Header />        ← Navigation bar
        {children}        ← Page content
      </QueryProvider>
    </ThemeProvider>
    <SpeedInsights />
  </body>
</html>
```

**Typography**: Geist Sans (variable weight 100-900) + Geist Mono (variable weight 100-900). These are custom WOFF fonts.

**Background**: Grid pattern (70px squares with 1px lines at low opacity).

**Android**: `FinMasterTheme` composable wrapping the entire app, with `Scaffold` for `TopAppBar` + `BottomBar` + content.

### D2. ThemeProvider (`theme-provider.tsx`)

**Purpose**: Wraps `next-themes` ThemeProvider providing light/dark/system mode.

**Android**: `FinMasterTheme` with `isSystemInDarkTheme()` and `darkTheme`/`lightTheme` color schemes.

### D3. QueryProvider (`query-provider.tsx`)

**Purpose**: Wraps TanStack React Query Provider + DevTools.

**Android**: Not needed. Room + Repository + Flow replaces React Query's server state management.
