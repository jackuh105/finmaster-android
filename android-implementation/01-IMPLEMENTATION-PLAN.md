# 01 - Android Implementation Plan

## Overview

This document lays out a phased implementation plan for building the FinMaster Android application as a native client consuming the existing Supabase backend and REST API v1.

The total estimated effort is **7-8 weeks** for a single developer, broken into 5 phases.

---

## Prerequisite: Backend API Change

**Required change to the web backend before starting Android development:**

The current API v1 authentication layer (`src/lib/api-auth.ts`) only supports API key authentication (`Authorization: Bearer fm_xxx`). The Android app needs to authenticate using the Supabase session JWT token (obtained after login).

**Action**: Extend the authentication middleware in `src/lib/api-auth.ts` to also validate Supabase JWT tokens alongside API keys. The Supabase JWT contains the `sub` (user ID) claim which can be used for RLS-compatible queries.

**Verification**: After this change, the following should work:
```
curl -H "Authorization: Bearer <supabase_jwt>" http://localhost:3000/api/v1/transactions
```

---

## Phase 1: Foundation (Week 1)

Goal: Project scaffolding, theme system, networking, navigation shell.

### 1.1 Project Initialization
- Create Android project with `minSdk = 26`, `targetSdk = 35`
- Configure Gradle with Kotlin DSL
- Add dependencies: Compose, Hilt, Retrofit, Room, Navigation, Coroutines
- Set up `FinMasterApp.kt` with `@HiltAndroidApp`

### 1.2 Theme System
- Implement Neo-brutalism design tokens in Compose
- Create custom `Colors`, `Typography`, `Shapes` objects
- Implement `FinMasterTheme` composable with dark/light mode support
- Create grid background composable
- See `06-DESIGN-SYSTEM.md` for exact tokens

### 1.3 Base UI Components
Build the foundational composables that all screens will use:

| Component | Web Equivalent | Key Features |
|-----------|---------------|--------------|
| `FinButton` | `button.tsx` | 5 variants (default, noShadow, neutral, reverse, ghost), 4 sizes, shadow animation on press |
| `FinCard` | `card.tsx` | 2px black border, header/content/footer slots, 2 variants |
| `FinTextField` | `input.tsx` | Neo-brutalist border, label, supporting text |
| `FinDialog` | `dialog.tsx` | Overlay with centered card, title/description/content/footer |
| `FinProgressBar` | `progress.tsx` | Horizontal bar with color-coded stages (success/warning/alert) |
| `FinCheckbox` | `checkbox.tsx` | Square checkbox with check icon |
| `FinBadge` | `badge.tsx` | Small tag with 2 variants (default=main color, neutral=gray) |
| `FinDropdown` | `select.tsx` | Exposed dropdown with popup menu |

### 1.4 Networking Layer
- Define Retrofit service interfaces for all API endpoints (see `03-API-SPEC.md`)
- Implement `AuthInterceptor` that injects the Supabase JWT into `Authorization` header
- Create `NetworkResult` sealed class: `Success<T>`, `Error(message, code)`, `Loading`
- Set up serialization with kotlinx.serialization

### 1.5 Navigation Shell
- Implement `FinMasterNavHost` with all route definitions
- Create `FinBottomNav` with 5 tabs: Dashboard, Transactions, Analytics, Calculators, Settings
- Create `FinTopAppBar` with app title and logout action
- Implement auth-gated navigation (redirect to login if not authenticated)

**Verify**: App builds, shows themed screens with navigation, can make authenticated API calls.

---

## Phase 2: Auth + Core CRUD (Weeks 2-3)

Goal: User authentication, transaction management, categories/accounts.

### 2.1 Authentication Module
- Integrate Supabase Kotlin SDK
- Implement `AuthRepository`:
  - `login(email, password)` → Result<Session>
  - `logout()` → clears session
  - `getSession()` → Session?
  - `resetPassword(email)` → sends reset email
- Create `LoginScreen` with email/password fields, error display, "Forgot password" link
- Create `LoginViewModel` managing login state
- Handle session persistence (Supabase SDK handles this automatically)
- Redirect to Dashboard on successful login

### 2.2 Transaction List Screen
- Implement `TransactionRepository`:
  - `getTransactions(limit, offset, filters)` → Flow<List<Transaction>>
  - `deleteTransaction(id)` → Result<Unit>
- Create `TransactionListScreen`:
  - LazyColumn with `TransactionItem` composables
  - Each item shows: date badge, name, category, amount (red for expense)
  - Pull-to-refresh
  - Pagination (load more on scroll to bottom)
- Create `TransactionListViewModel` with filter state

### 2.3 Add/Edit Transaction Screen
- Implement `AddTransactionScreen`:
  - Item name input with quick-tag selection (Badge chips)
  - Category dropdown (Select)
  - Amount input with built-in calculator
  - Date picker (DatePickerDialog)
  - Account dropdown
  - Description textarea
  - Currency selector + exchange rate input
  - Periodic transaction toggle (weekly/monthly/yearly + date range)
  - Submit button
- Implement `EditTransactionScreen` (similar, prefilled with existing data)

### 2.4 Categories & Accounts Management
- Implement `CategoryRepository` and `AccountRepository`
- Add management screens within Settings:
  - List existing categories/accounts
  - Add new (text input + submit)
  - Edit name (inline editing)
  - Delete (with confirmation dialog)
  - Toggle preset flag
- Support item tags (quick-select tags for transaction names)

### 2.5 Budget Management
- Implement `BudgetRepository`:
  - `getBudget()` → budget amount
  - `updateBudget(amount)` → Result<Unit>
- Create `BudgetSettingScreen` with number input
- Show budget progress bar on Dashboard

**Verify**: Full CRUD for transactions, categories, accounts, and budget works. Data syncs with Supabase.

---

## Phase 3: Dashboard + Analytics (Weeks 3-4)

Goal: Home dashboard with overview widgets and analytics page with charts.

### 3.1 Dashboard Screen
- **Budget Widget**: Shows monthly spending vs budget with progress bar
  - Color-coded: green (<30%), yellow (30-60%), red (>60%)
  - "Set Budget" button that opens budget dialog
- **Quick Actions Card**: "Add Transaction" button linking to add screen
- **Recent Transactions**: Shows last 5 transactions with date, name, amount
  - "More" button linking to full transaction list
- **Spending Pie Chart**: Category breakdown for current month
  - Uses actual data from `get_monthly_category_stats` RPC

### 3.2 Analytics Screen
- **Filter Toolbar**:
  - Date range picker with quick presets (7 days, 30 days, 90 days, This month)
  - Category type filter dropdown
- **Stats Cards** (3 cards):
  - Total Expense for period
  - Top Category by spending
  - Largest Single Expense
- **Category Pie Chart**: Expense breakdown by category
- **Daily Bar Chart**: Expense trend over time (date on X, amount on Y)

### 3.3 Chart Implementation
- Choose a Compose-compatible charting library (Vico recommended)
- Customize chart styling to match Neo-brutalism:
  - Thick axis lines (2px)
  - Bold labels
  - Chart colors matching `--chart-1` through `--chart-5`
  - Remove default grid styling, add custom grid

**Verify**: Dashboard shows real data with correct calculations. Analytics filters work. Charts render with correct data.

---

## Phase 4: Advanced Features + Offline (Weeks 5-6)

Goal: Financial calculators, import/export, offline support.

### 4.1 Financial Calculators
Four calculator screens, each with input fields and computed results:

1. **Fixed Deposit Currency Difference**
   - Inputs: principal, days, currency rows (buy rate, sell rate, interest rate)
   - Live exchange rate fetching from external API
   - Results: interest comparison across currencies
   - Auto-fetches real rates from `@fawazahmed0/currency-api`

2. **Buy & Hold Compound Interest**
   - Inputs: monthly deposit, annual return rate, inflation rate, transaction fee, deposit frequency, years
   - Results: yearly breakdown table (invested, profit, total, present value, ROI)
   - Line chart showing total amount and present value over time

3. **Financial Freedom Point**
   - Inputs: monthly expenses, annual return rate
   - Results: monthly return rate, freedom point asset
   - Simple two-input calculator

4. **Mortgage Repayment**
   - Inputs: total price, down payment ratio, interest rate, loan term
   - Results: loan amount, monthly payment, total interest, yearly amortization table
   - Bar chart showing principal vs interest paid per year

### 4.2 Import/Export
- **Export**: Generate CSV from transactions, share via Android ShareSheet
- **Import**: Parse XLSX file, validate against existing categories/accounts, preview before import, batch insert
- Use Apache POI library for XLSX parsing

### 4.3 Offline Support (Room)
- Define Room entities matching database schema
- Create DAOs with Flow-returning queries
- Implement cache-aside in repositories:
  ```
  getTransactions():
    1. Emit Room data immediately
    2. Fetch from API
    3. On success: update Room, Room Flow auto-emits new data
    4. On failure: keep showing Room data, show error banner
  ```
- Offline indicator banner at top of screen when network unavailable
- Queue writes when offline (optional, can skip for MVP)

### 4.4 Periodic Transactions
- Support creating recurring transactions (weekly/monthly/yearly)
- Generate dates based on period type and expense day
- Batch insert all generated transactions

**Verify**: All calculators produce correct results. CSV export generates valid file. XLSX import parses correctly. Offline mode shows cached data.

---

## Phase 5: Polish + Testing + Release (Week 7)

Goal: Testing, performance, edge cases, Play Store preparation.

### 5.1 Testing
- **Unit tests**: Repository methods, calculator logic, date generation
- **ViewModel tests**: State transitions, error handling
- **UI tests**: Critical flows (login → add transaction → verify in list)
- Use JUnit 5, MockK, Turbine (Flow testing), Compose testing library

### 5.2 Performance
- LazyColumn with stable keys for transaction lists
- `remember` and `derivedStateOf` for expensive calculations
- ProGuard/R8 rules for production builds
- Image/asset optimization

### 5.3 Edge Cases
- Empty states (no transactions, no budget set)
- Loading states (shimmer or skeleton)
- Error states (network failure, auth expired)
- Form validation (required fields, valid amounts)
- Large datasets (10,000+ transactions)

### 5.4 Play Store Preparation
- App signing key generation
- Store listing (title, description, screenshots)
- Privacy policy page
- Internal testing track setup

---

## Backend Changes Required

The Android app requires minimal backend changes. Here is the complete list:

### 1. API Auth Extension (REQUIRED)
File: `src/lib/api-auth.ts`

Add JWT authentication alongside API key authentication so the Android app can call APIs with the Supabase session token:

```typescript
// New function to add:
export async function authenticateJWT(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  
  const token = authHeader.substring(7);
  // Skip if it looks like an API key
  if (token.startsWith("fm_")) return null;
  
  // Validate JWT with Supabase
  const supabase = createServerClient(/*...*/);
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) return null;
  
  return {
    userId: user.id,
    privileges: { read: true, create: true, update: true, delete: true },
  };
}
```

Then update all API route files to try both auth methods.

### 2. CORS Configuration (REQUIRED)
The Next.js API routes need to accept requests from Android origins. This is usually handled by default, but verify CORS headers allow mobile requests.

---

## File-to-Feature Mapping

| Web Source | Android Target |
|------------|---------------|
| `src/app/page.tsx` | `DashboardScreen.kt` + `DashboardViewModel.kt` |
| `src/app/transaction-list/page.tsx` | `TransactionListScreen.kt` |
| `src/app/transaction-list/add/page.tsx` | `AddTransactionScreen.kt` |
| `src/app/transaction-list/edit/[id]/page.tsx` | `EditTransactionScreen.kt` |
| `src/app/analytics/page.tsx` | `AnalyticsScreen.kt` |
| `src/app/calculations/page.tsx` | `CalculatorsScreen.kt` |
| `src/app/settings/page.tsx` | `SettingsScreen.kt` |
| `src/app/auth/login/page.tsx` | `LoginScreen.kt` |
| `src/components/BudgetWidget.tsx` | `BudgetWidget.kt` (in dashboard) |
| `src/app/SpendingOverviewChart.tsx` | `SpendingPieChart.kt` (in dashboard) |
| `src/app/shortTransactionList.tsx` | `RecentTransactions.kt` (in dashboard) |
| `src/components/transaction-form/TransactionForm.tsx` | `TransactionForm.kt` |
| `src/components/transaction-form/Calculator.tsx` | `CalculatorComposable.kt` |
| `src/components/transaction-form/PeriodicTransactionFields.tsx` | `PeriodicTransactionSection.kt` |
| `src/components/transaction-form/ExchangeRate.tsx` | `ExchangeRateSection.kt` |
| `src/components/analytics/StatsCards.tsx` | `StatsCards.kt` |
| `src/components/analytics/AnalyticsCharts.tsx` | `AnalyticsCharts.kt` |
| `src/components/analytics/FilterToolbar.tsx` | `FilterToolbar.kt` |
| `src/app/transaction-list/ExportDialog.tsx` | `ExportFeature.kt` |
| `src/app/transaction-list/ImportDialog.tsx` | `ImportScreen.kt` |
| `src/app/transaction-list/FilterList.tsx` | Part of `TransactionListScreen.kt` |
| `src/app/transaction-list/SearchBar.tsx` | `SearchBar.kt` |
| `src/app/transaction-list/ActionButtons.tsx` | `TransactionActions.kt` |
| `src/components/calculations/*.tsx` | `calculators/` package |
