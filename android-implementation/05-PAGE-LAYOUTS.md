# 05 - Page Layouts & Data Flow

This document describes every page/screen in the app, its component composition, and data dependencies. Use this as the blueprint for building each Android screen.

---

## Page 1: Login (`/auth/login`)

**File**: `src/app/auth/login/page.tsx`

### Layout
```
┌──────────────────────────────────────────┐
│          (Centered on grid bg)            │
│  ┌────────────────────────────────────┐   │
│  │         Card (max-w-lg)            │   │
│  │  ┌──────────────────────────────┐  │   │
│  │  │  "Login to your account"     │  │   │
│  │  │  (text-2xl font-heading)     │  │   │
│  │  └──────────────────────────────┘  │   │
│  │  [Email Input]                     │   │
│  │  [Password Input]                  │   │
│  │  (Error banner: red bg, red border,│   │
│  │   white text, 14px bold)           │   │
│  │  [Login Button (full width)]       │   │
│  └────────────────────────────────────┘   │
└──────────────────────────────────────────┘
```

### Data Flow
1. User enters email + password
2. On submit: calls `supabase.auth.signInWithPassword({ email, password })`
3. On success: `router.push("/")` + `router.refresh()`
4. On error: sets `error` state, displays in red banner

### States
- **Default**: Empty form
- **Loading**: Button shows "Logging in...", disabled
- **Error**: Red banner with error message below password field
- **Success**: Redirect to dashboard

### Android
- `LoginScreen.kt` with `LoginViewModel`
- ViewModel exposes: `email`, `password`, `isLoading`, `error`, `login()` function
- On success: navigate to Dashboard, clear back stack

---

## Page 2: Dashboard / Home (`/`)

**File**: `src/app/page.tsx`

### Layout
```
┌──────────────────────────────────────────────────────────┐
│  (max-w-7xl container, p-4 gap-4)                        │
│                                                          │
│  Desktop (md:grid-cols-6):         Mobile (flex-col):    │
│  ┌──────────────┬──────────┐      ┌──────────────┐      │
│  │ BudgetWidget │  Quick   │      │ BudgetWidget │      │
│  │  (col-4)     │ Actions  │      │ Quick Actions│      │
│  │              │ (col-2)  │      │ ShortTxList  │      │
│  ├──────────────┴──────────┤      │ SpendingChart│      │
│  │ ShortTxList │ Spending  │      └──────────────┘      │
│  │  (col-3)    │ Chart    │                             │
│  │             │ (col-3)  │                             │
│  └─────────────┴──────────┘                             │
└──────────────────────────────────────────────────────────┘
```

### Component Composition

**BudgetWidget** (`col-span-4`):
- Card with "Budget" title + "Set Budget" button
- If budget is null: yellow dashed card "No Budget Set"
- If budget set: "Spent: X / Y" + BudgetProgressBar
- Data: `useTransactions()` (all) + `useUserSettings()` (budget)

**Quick Actions** (`col-span-2`):
- Card: "Quick Actions" title
- Single "Add new item" button (links to /transaction-list/add)
- Different padding on mobile vs desktop

**ShortTransactionList** (`md:col-span-3`):
- Card: "Recent Transaction" title + "More" button
- 5 most recent transactions
- Data: `useTransactions({ limit: 5 })`

**SpendingOverviewChart** (`md:col-span-3`):
- Card: "Expenses by category" title, "Current month" subtitle
- Donut pie chart from `useMonthlyStats()`
- Data: RPC `get_monthly_category_stats` for current month

### Android
- `DashboardScreen.kt` with `DashboardViewModel`
- `LazyColumn` with items: BudgetCard, QuickActionsCard, RecentTransactionsCard, SpendingPieChart
- On mobile: full-width single column layout

---

## Page 3: Transaction List (`/transaction-list`)

**File**: `src/app/transaction-list/page.tsx`

### Layout
```
Desktop (md:grid-cols-3):              Mobile:
┌─────────┬──────────────┐            ┌──────────────┐
│ Toolbox │ SearchBar    │            │ ActionButtons│
│ (col-1) │              │            │ (horizontal) │
│ ┌─────┐ │              │            ├──────────────┤
│ │Amt  │ │              │            │ SearchBar +  │
│ │Filter│ │              │            │ Filter btn   │
│ ├─────┤ │              │            ├──────────────┤
│ │Type │ │              │            │ (if open)    │
│ │Filter│ │              │            │ MobileFilters│
│ ├─────┤ │              │            ├──────────────┤
│ │Add  │ │  DataTable   │            │ MobileTxList │
│ │Import│ │  (paginated) │            └──────────────┘
│ │Export│ │              │
│ └─────┘ └──────────────┘
└──────────────────────────────────────┘
```

### Component Composition

**ActionButtons** (mobile: horizontal row, desktop: vertical in sidebar):
- "New Transaction" → navigates to `/transaction-list/add`
- "Import" → opens ImportDialog
- "Export" → opens ExportDialog

**SearchBar**: Search input with Chinese segmentation

**FilterToolbar (desktop sidebar)**:
- **AmountFilter**: DualRangeSlider for min/max amount
- **TypeFilter**: Checkbox list of categories with show more/less

**MobileFilters**: Wrapper for AmountFilter + TypeFilter (shown in collapsible section)

**FilterList / DataTable**:
- Transaction table with columns: Date↓, Name, Type, Amount, Actions
- Actions dropdown: Edit (navigate to edit page), Delete (confirm dialog)
- Pagination: Previous / [Page input] of N / Next
- Data: `useTransactions({ range, amountFilter, typeFilter, searchQuery })`

### Data Flow
```
TransactionListContext (React Context)
  ├── amountFilter: [number, number]    ← AmountFilter
  ├── typeFilter: Set<string>           ← TypeFilter
  ├── query: string                     ← SearchBar
  ├── page: number, pageSize: number    ← DataTable pagination
  └── maxAmount: number                 ← calculated from all transactions

FilterList reads all context values → passes to useTransactions() → renders DataTable
```

### States
- **Loading**: Table skeleton or spinner
- **Empty**: "No results." message in table body
- **Error**: Alert message
- **Normal**: Paginated transaction rows

### Android
- `TransactionListScreen.kt` with `TransactionListViewModel`
- ViewModel holds: amountRange, selectedCategories, searchQuery, currentPage, transactions
- Filter button opens `ModalBottomSheet` with AmountFilter + CategoryFilter
- `LazyColumn` with load-more pagination

---

## Page 4: Add Transaction (`/transaction-list/add`)

**File**: `src/app/transaction-list/add/page.tsx` (delegates to `TransactionForm`)

### Layout
```
┌──────────────────────────────────────────────┐
│  Desktop (md:grid-cols-3):                   │
│  ┌──────────────────────┬─────────────────┐  │
│  │  Form Fields (col-2) │ Calculator      │  │
│  │                      │ (col-1)         │  │
│  │  Item name + tags    │  ┌───────────┐  │  │
│  │  Category + date     │  │ Display   │  │  │
│  │  Account             │  │ Keypad    │  │  │
│  │  Description         │  │  (4x5)    │  │  │
│  │  Currency + rate     │  │           │  │  │
│  │  Periodic toggle     │  └───────────┘  │  │
│  │  [Submit]            │                 │  │
│  └──────────────────────┴─────────────────┘  │
└──────────────────────────────────────────────┘
```

### Component Composition
- **TagInput**: Item name + quick-select badges
- **TagSelect**: Category dropdown + preset badges
- **DatePicker**: Single date (hidden if periodic enabled)
- **TagSelect**: Account dropdown + preset badges
- **Textarea**: Description
- **TagSelect**: Currency dropdown + ExchangeRate input
- **Switch + PeriodicTransactionFields**: Periodic toggle + config
- **Calculator**: Amount display + keypad
- **Submit button**: Validates and saves

### Data Dependencies
- `useItemTags()` - quick-select tags for item name
- `useCategories()` - category list
- `useAccounts()` - account list
- `useTransactions()` - `addTransaction()` and `addTransactions()` mutations

### Submit Logic
1. Validate: amount > 0, item name not empty
2. If editing: `updateTransaction({ id, updates })`
3. If periodic + dateRange set: generate dates → `addTransactions(batch)`
4. If single: `addTransaction(data)`
5. Navigate to transaction list

### Android
- `AddTransactionScreen.kt` with `AddTransactionViewModel`
- Scrollable form layout with all sections
- Calculator integrated inline or as a section

---

## Page 5: Edit Transaction (`/transaction-list/edit/[id]`)

**File**: `src/app/transaction-list/edit/[id]/page.tsx`

Same layout as Add Transaction, but prefilled with existing transaction data. Uses the same `TransactionForm` component with `data` prop.

### Android
- Reuse the same form composable with `isEditing = true` flag
- Pre-fill all fields from the existing transaction
- On submit: call `updateTransaction()` instead of `addTransaction()`

---

## Page 6: Analytics (`/analytics`)

**File**: `src/app/analytics/page.tsx`

### Layout
```
┌──────────────────────────────────────────┐
│  FilterToolbar                           │
│  [DateRangePicker] [QuickRange dropdown] │
│  [Type dropdown: All]                    │
├──────────────────────────────────────────┤
│  StatsCards (3 cards in a row)           │
│  ┌─────────┬──────────┬──────────────┐   │
│  │ Total   │ Top      │ Largest      │   │
│  │ Expense │ Category │ Single Exp.  │   │
│  └─────────┴──────────┴──────────────┘   │
├──────────────────────────────────────────┤
│  AnalyticsCharts (2-column grid)         │
│  ┌──────────────────┬──────────────────┐ │
│  │ Pie Chart        │ Bar Chart        │ │
│  │ Expenses by      │ Daily Expense    │ │
│  │ Category         │ Trend            │ │
│  └──────────────────┴──────────────────┘ │
└──────────────────────────────────────────┘
```

### Data Flow
1. `useTransactions()` fetches all transactions
2. Filter by date range (from DateRangePicker) and type (from dropdown)
3. Pass filtered transactions to:
   - `StatsCards` → calculates total, top category, largest single
   - `AnalyticsCharts` → builds pie chart (category breakdown) and bar chart (daily trend)

### FilterToolbar
- DateRangePicker + quick presets: "7 days", "30 days", "90 days", "This month"
- Transaction type dropdown: "All" + dynamic type options from data

### Android
- `AnalyticsScreen.kt` with `AnalyticsViewModel`
- Use API analytics endpoints instead of client-side filtering:
  - `GET /analytics/total-expense?startDate=&endDate=`
  - `GET /analytics/category-expense?startDate=&endDate=`
  - `GET /analytics/daily-expense?startDate=&endDate=`

---

## Page 7: Calculators (`/calculations`)

**File**: `src/app/calculations/page.tsx`

### Layout
```
Desktop:                    Mobile (accordion):
┌────────┬──────────────┐   ┌───────────────────┐
│ Sidebar│ Calculator   │   │ ▼ Calculator 1    │
│        │ Content      │   │   (expanded)      │
│ Calc 1 │              │   │ ▶ Calculator 2    │
│ (active)              │   │ ▶ Calculator 3    │
│ Calc 2 │              │   │ ▶ Calculator 4    │
│ Calc 3 │              │   └───────────────────┘
│ Calc 4 │              │
└────────┴──────────────┘
```

### Components
- Sidebar (desktop): Vertical button list, active item has `bg-main` orange background, bold text
- Accordion (mobile): Toggle sections
- Content area: Shows the active calculator component

### Calculator List
1. Fixed Deposit Currency Difference (定存幣值差距)
2. Buy & Hold Compound Interest (買進持有複利投資)
3. Financial Freedom Point (跨越點)
4. Loan Repayment / Mortgage (購置物業貸款)

### Android
- `CalculatorsScreen.kt`
- Tab-based or navigation-rail-based layout
- Each calculator as a separate composable

---

## Page 8: Settings (`/settings`)

**File**: `src/app/settings/page.tsx`

### Layout
```
Desktop:                          Mobile:
┌───────────┬───────────────────┐ ┌──────────────────────┐
│ Sidebar   │ Content Area      │ │ Tabs (scrollable)    │
│           │                   │ ├──────────────────────┤
│ ⬤ General │ (tab-dependent)   │ │ Content              │
│ ⬤ Budget  │                   │ └──────────────────────┘
│ ⬤ Types   │                   │
│ ⬤ Accounts│                   │
│ ⬤ Items   │                   │
│ ⬤ API Keys│                   │
└───────────┴───────────────────┘
```

### Tabs

**General**:
- Budget input with "Update Budget" button
- Default category dropdown
- Default account dropdown

**Types (Categories)**:
- List of categories with inline edit/delete
- Add new category form
- Toggle "preset" flag for each category

**Accounts**:
- Same pattern as Types but for accounts
- Add/edit/delete accounts
- Toggle "preset" flag

**Items (Tags)**:
- List of item tags with edit/delete
- Add new tag form

**API Keys**:
- List of existing API keys (name, prefix, privileges, created date, last used)
- Create new key: name input, privilege checkboxes (read/create/update/delete)
- New key dialog: shows the full key once (copyable), warning "save it now"
- Delete key with confirmation

### Data Dependencies
- `useUserSettings()` - budget, defaults
- `useCategories()` - category CRUD
- `useAccounts()` - account CRUD
- `useItemTags()` - tag CRUD
- `useApiKeys()` - API key CRUD

### Android
- `SettingsScreen.kt` with tab-based or navigation-destination-based layout
- Each section as a separate composable
- API key management screen

---

## Page 9: Reset Password (`/auth/reset-password`)

**File**: `src/app/auth/reset-password/page.tsx`

Simple page with email input and "Send Reset Link" button. Uses server action to call `supabase.auth.resetPasswordForEmail()`.

### Android
- `ResetPasswordScreen.kt`
- Email input + submit button
- Success: show confirmation message
- Error: show error message

---

## Navigation Map (Web Routes → Android Destinations)

```
/                               → DashboardScreen (BottomNav tab 1)
/transaction-list               → TransactionListScreen (BottomNav tab 2)
/transaction-list/add           → AddTransactionScreen (navigate from TransactionList)
/transaction-list/edit/[id]     → EditTransactionScreen (navigate from TransactionList)
/analytics                      → AnalyticsScreen (BottomNav tab 3)
/calculations                   → CalculatorsScreen (BottomNav tab 4)
/settings                       → SettingsScreen (BottomNav tab 5)
/auth/login                     → LoginScreen (initial if not authenticated)
/auth/reset-password            → ResetPasswordScreen (navigate from Login)
/auth/callback                  → (Handled by Supabase SDK deep link)
/auth/verify-error              → Error screen (if email verification fails)
```

## Bottom Navigation Configuration

| Tab | Icon | Label | Destination |
|-----|------|-------|-------------|
| 1 | Home | Dashboard | DashboardScreen |
| 2 | List | Transactions | TransactionListScreen |
| 3 | Chart | Analytics | AnalyticsScreen |
| 4 | Calculator | Tools | CalculatorsScreen |
| 5 | Settings | Settings | SettingsScreen |
