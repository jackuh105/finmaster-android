# 07 - Data Models & Type Definitions

This document maps all TypeScript types from the web app to equivalent Kotlin data classes for the Android app. It also covers API request/response DTOs.

---

## Domain Models (Kotlin)

### Transaction

**TypeScript** (`src/types/Transaction.ts`):
```typescript
type Transaction = {
  id: string;
  name: string;
  desc?: string;       // description
  type: string;         // category name (mapped from categories.name)
  account?: string;     // account name (mapped from accounts.name)
  amount: number;
  date: string;         // "YYYY-MM-DD"
}
```

**Kotlin Domain Model**:
```kotlin
data class Transaction(
    val id: String,
    val name: String,
    val description: String?,
    val category: String,    // Category name
    val account: String?,    // Account name
    val amount: Double,
    val date: String,        // "YYYY-MM-DD"
    val categoryId: String?, // For updates
    val accountId: String?   // For updates
)
```

### Account

**TypeScript** (from `useAccounts` hook):
```typescript
type Account = {
  id: string;
  user_id: string;
  name: string;
  is_preset: boolean;
  created_at: string;
}
```

**Kotlin Domain Model**:
```kotlin
data class Account(
    val id: String,
    val userId: String,
    val name: String,
    val isPreset: Boolean,
    val createdAt: String
)
```

### Category

**TypeScript** (from `useCategories` hook):
```typescript
type Category = {
  id: string;
  user_id: string;
  name: string;
  is_preset: boolean;
  created_at: string;
}
```

**Kotlin Domain Model**:
```kotlin
data class Category(
    val id: String,
    val userId: String,
    val name: String,
    val isPreset: Boolean,
    val createdAt: String
)
```

### ItemTag

**TypeScript** (from `useItemTags` hook):
```typescript
type ItemTag = {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}
```

**Kotlin Domain Model**:
```kotlin
data class ItemTag(
    val id: String,
    val userId: String,
    val name: String,
    val createdAt: String
)
```

### UserSettings

**TypeScript** (from `useUserSettings` hook):
```typescript
type UserSettings = {
  user_id: string;
  budget: number | null;  // null when no settings exist
  default_category_id?: string;
  default_account_id?: string;
  updated_at?: string;
}
```

**Kotlin Domain Model**:
```kotlin
data class UserSettings(
    val userId: String,
    val budget: Double?,
    val defaultCategoryId: String?,
    val defaultAccountId: String?,
    val updatedAt: String?
)
```

### ApiKey

**TypeScript** (from `useApiKeys` hook):
```typescript
type ApiKey = {
  id: string;
  user_id: string;
  name: string;
  key_prefix: string;  // e.g., "fm_abc..."
  privileges: {
    read: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
  };
  created_at: string;
  last_used_at: string | null;
}
```

**Kotlin Domain Model**:
```kotlin
data class ApiKey(
    val id: String,
    val userId: String,
    val name: String,
    val keyPrefix: String,
    val privileges: ApiKeyPrivileges,
    val createdAt: String,
    val lastUsedAt: String?
)

data class ApiKeyPrivileges(
    val read: Boolean,
    val create: Boolean,
    val update: Boolean,
    val delete: Boolean
)
```

---

## Analytics Models

### MonthlyCategoryStat

**TypeScript** (`useMonthlyStats`):
```typescript
type MonthlyCategoryStat = {
  category_name: string;
  total_amount: number;
}
```

**Kotlin**:
```kotlin
@Serializable
data class MonthlyCategoryStat(
    @SerialName("category_name") val categoryName: String,
    @SerialName("total_amount") val totalAmount: Double
)
```

### TotalExpenseResponse

**TypeScript** (from `/analytics/total-expense`):
```typescript
type TotalExpenseResponse = {
  start_date: string;
  end_date: string;
  total_expense: number;
  transaction_count: number;
}
```

**Kotlin**:
```kotlin
@Serializable
data class TotalExpenseResponse(
    @SerialName("start_date") val startDate: String,
    @SerialName("end_date") val endDate: String,
    @SerialName("total_expense") val totalExpense: Double,
    @SerialName("transaction_count") val transactionCount: Int
)
```

### DailyExpense

**TypeScript** (from `/analytics/daily-expense`):
```typescript
type DailyExpense = {
  date: string;
  amount: number;
}
```

**Kotlin**:
```kotlin
@Serializable
data class DailyExpense(
    val date: String,
    val amount: Double
)
```

### CategoryExpense

**TypeScript** (from `/analytics/category-expense`):
```typescript
type CategoryExpense = {
  category: string;
  amount: number;
}
```

**Kotlin**:
```kotlin
@Serializable
data class CategoryExpense(
    val category: String,
    val amount: Double
)
```

---

## API Request/Response DTOs

### Transactions

```kotlin
// Response wrapper
@Serializable
data class TransactionsResponse(
    val transactions: List<TransactionDto>,
    val pagination: PaginationInfo
)

@Serializable
data class TransactionDto(
    val id: String,
    val name: String,
    val description: String? = null,
    val amount: Double,
    val date: String,
    val category: String? = null,
    val account: String? = null,
    @SerialName("category_id") val categoryId: String? = null,
    @SerialName("account_id") val accountId: String? = null,
    @SerialName("created_at") val createdAt: String? = null
)

@Serializable
data class PaginationInfo(
    val total: Int,
    val limit: Int,
    val offset: Int
)

// Create request
@Serializable
data class CreateTransactionRequest(
    val name: String,
    val amount: Double,
    val date: String,
    val description: String? = null,
    @SerialName("category_id") val categoryId: String? = null,
    @SerialName("account_id") val accountId: String? = null
)

// Update request
@Serializable
data class UpdateTransactionRequest(
    val name: String? = null,
    val amount: Double? = null,
    val date: String? = null,
    val description: String? = null,
    @SerialName("category_id") val categoryId: String? = null,
    @SerialName("account_id") val accountId: String? = null
)

// Single transaction response
@Serializable
data class TransactionResponse(
    val transaction: TransactionDto
)

// Delete response
@Serializable
data class DeleteResponse(
    val message: String
)
```

### Accounts

```kotlin
@Serializable
data class AccountsResponse(
    val accounts: List<AccountDto>
)

@Serializable
data class AccountDto(
    val id: String,
    @SerialName("user_id") val userId: String,
    val name: String,
    @SerialName("is_preset") val isPreset: Boolean,
    @SerialName("created_at") val createdAt: String
)

@Serializable
data class CreateAccountRequest(val name: String)
@Serializable
data class UpdateAccountRequest(val name: String)
@Serializable
data class AccountResponse(val account: AccountDto)
```

### Categories

```kotlin
@Serializable
data class CategoriesResponse(
    val categories: List<CategoryDto>
)

@Serializable
data class CategoryDto(
    val id: String,
    @SerialName("user_id") val userId: String,
    val name: String,
    @SerialName("is_preset") val isPreset: Boolean,
    @SerialName("created_at") val createdAt: String
)

@Serializable
data class CreateCategoryRequest(val name: String)
@Serializable
data class UpdateCategoryRequest(val name: String)
@Serializable
data class CategoryResponse(val category: CategoryDto)
```

### Budget

```kotlin
@Serializable
data class BudgetResponse(
    val budget: Double,
    @SerialName("updated_at") val updatedAt: String?
)

@Serializable
data class UpdateBudgetRequest(val budget: Double)

@Serializable
data class BudgetUsageResponse(
    val budget: Double,
    val spent: Double,
    val remaining: Double,
    val percentage: Double
)
```

### Analytics

```kotlin
@Serializable
data class DailyExpensesResponse(
    @SerialName("daily_expenses") val dailyExpenses: List<DailyExpense>
)

@Serializable
data class CategoryExpensesResponse(
    @SerialName("category_expenses") val categoryExpenses: List<CategoryExpense>
)
```

### Error

```kotlin
@Serializable
data class ApiError(
    val error: String
)
```

---

## Calculator Models

### FixedDepositCurrencyDiff

```kotlin
data class CurrencyRow(
    val currency: String,
    val buyRate: Double,
    val sellRate: Double,
    val interestRate: Double,
    val isBase: Boolean = false
)

data class CurrencyResult(
    val currency: String,
    val interest: Double,
    val equivalent: Double,
    val difference: Double
)
```

### BuyHoldCompoundInterest

```kotlin
data class CompoundInterestRow(
    val year: Int,
    val annualInvested: Double,
    val cumulativeInvested: Double,
    val profit: Double,
    val totalAmount: Double,
    val presentValue: Double,
    val roi: Double
)
```

### FinancialFreedomPoint

```kotlin
data class FreedomPointResult(
    val monthlyReturnRate: Double,    // as percentage
    val freedomPointAsset: Double
)
```

### MortgageRepayment

```kotlin
data class MortgageResult(
    val loanAmount: Double,
    val monthlyPayment: Double,
    val totalInterest: Double
)

data class MortgageYearRow(
    val year: Int,
    val principalPaid: Double,
    val interestPaid: Double,
    val balance: Double,
    val totalPaid: Double,
    val principalRatio: Double,
    val interestRatio: Double
)
```

---

## Periodic Transaction Types

**TypeScript** (`src/lib/periodicUtils.ts`):
```typescript
type PeriodType = "weekly" | "monthly" | "yearly";
type ExpenseDay = number | { month: number; day: number };
```

**Kotlin**:
```kotlin
enum class PeriodType { Weekly, Monthly, Yearly }

sealed class ExpenseDay {
    data class DayOfWeek(val day: Int) : ExpenseDay()        // 0=Sun, 1=Mon, ...
    data class DayOfMonth(val day: Int) : ExpenseDay()       // 1-31
    data class DayOfYear(val month: Int, val day: Int) : ExpenseDay()  // month 0-11, day 1-31
}
```

---

## Room Entities

Room entities closely mirror the DTOs but are annotated for SQLite:

```kotlin
@Entity(tableName = "transactions")
data class TransactionEntity(
    @PrimaryKey val id: String,
    @ColumnInfo(name = "user_id") val userId: String,
    val name: String,
    val description: String?,
    val amount: Double,
    val date: String,
    @ColumnInfo(name = "category_id") val categoryId: String?,
    @ColumnInfo(name = "account_id") val accountId: String?,
    @ColumnInfo(name = "category_name") val categoryName: String?,
    @ColumnInfo(name = "account_name") val accountName: String?,
    @ColumnInfo(name = "created_at") val createdAt: String,
    @ColumnInfo(name = "synced_at") val syncedAt: String
)

@Entity(tableName = "accounts")
data class AccountEntity(
    @PrimaryKey val id: String,
    @ColumnInfo(name = "user_id") val userId: String,
    val name: String,
    @ColumnInfo(name = "is_preset") val isPreset: Boolean = false,
    @ColumnInfo(name = "created_at") val createdAt: String
)

@Entity(tableName = "categories")
data class CategoryEntity(
    @PrimaryKey val id: String,
    @ColumnInfo(name = "user_id") val userId: String,
    val name: String,
    @ColumnInfo(name = "is_preset") val isPreset: Boolean = false,
    @ColumnInfo(name = "created_at") val createdAt: String
)

@Entity(tableName = "item_tags")
data class ItemTagEntity(
    @PrimaryKey val id: String,
    @ColumnInfo(name = "user_id") val userId: String,
    val name: String,
    @ColumnInfo(name = "created_at") val createdAt: String
)

@Entity(tableName = "user_settings")
data class UserSettingsEntity(
    @PrimaryKey @ColumnInfo(name = "user_id") val userId: String,
    val budget: Double?,
    @ColumnInfo(name = "default_category_id") val defaultCategoryId: String?,
    @ColumnInfo(name = "default_account_id") val defaultAccountId: String?,
    @ColumnInfo(name = "updated_at") val updatedAt: String?
)
```

---

## NetworkResult Sealed Class

Used throughout the app for API call results:

```kotlin
sealed class NetworkResult<out T> {
    data class Success<T>(val data: T) : NetworkResult<T>()
    data class Error(val message: String, val code: Int? = null) : NetworkResult<Nothing>()
    data object Loading : NetworkResult<Nothing>()
}
```
