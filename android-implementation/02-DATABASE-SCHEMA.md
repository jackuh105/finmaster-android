# 02 - Database Schema

All tables live in the `public` schema of a Supabase PostgreSQL database. Row Level Security (RLS) is enabled on all tables, with policies scoped to `auth.uid() = user_id`.

---

## Entity Relationship Diagram

```
auth.users (Supabase managed)
  │
  ├── 1:1 ── user_settings
  │
  ├── 1:N ── accounts
  ├── 1:N ── categories
  ├── 1:N ── item_tags
  ├── 1:N ── transactions ── N:1 ── accounts
  │                         ── N:1 ── categories
  └── 1:N ── api_keys
```

---

## Tables

### 1. accounts

Stores user's financial accounts (e.g., "BOC", "AliPay", "HSBC").

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, `DEFAULT gen_random_uuid()` | Unique identifier |
| `user_id` | `UUID` | NOT NULL, FK → `auth.users(id)` | Owning user |
| `name` | `TEXT` | NOT NULL | Account display name |
| `is_preset` | `BOOLEAN` | `DEFAULT FALSE` | Whether shown as quick-select preset |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Creation timestamp |

**RLS Policies**:
- SELECT: `auth.uid() = user_id`
- INSERT: `auth.uid() = user_id`
- UPDATE: `auth.uid() = user_id`
- DELETE: `auth.uid() = user_id`

**Index**: `idx_accounts_user_id` on `(user_id)`

**Android Room Entity**:
```kotlin
@Entity(tableName = "accounts")
data class AccountEntity(
    @PrimaryKey val id: String,
    @ColumnInfo(name = "user_id") val userId: String,
    val name: String,
    @ColumnInfo(name = "is_preset") val isPreset: Boolean,
    @ColumnInfo(name = "created_at") val createdAt: String
)
```

---

### 2. categories

Stores expense/income categories (e.g., "Food", "Transport", "Entertainment").

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, `DEFAULT gen_random_uuid()` | Unique identifier |
| `user_id` | `UUID` | NOT NULL, FK → `auth.users(id)` | Owning user |
| `name` | `TEXT` | NOT NULL | Category display name |
| `is_preset` | `BOOLEAN` | `DEFAULT FALSE` | Whether shown as quick-select preset |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Creation timestamp |

**RLS Policies**: Same pattern as accounts (user-scoped CRUD)

**Index**: `idx_categories_user_id` on `(user_id)`

**Android Room Entity**:
```kotlin
@Entity(tableName = "categories")
data class CategoryEntity(
    @PrimaryKey val id: String,
    @ColumnInfo(name = "user_id") val userId: String,
    val name: String,
    @ColumnInfo(name = "is_preset") val isPreset: Boolean,
    @ColumnInfo(name = "created_at") val createdAt: String
)
```

---

### 3. item_tags

Stores quick-select tags for transaction item names (e.g., "Breakfast", "Lunch", "Dinner").

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, `DEFAULT gen_random_uuid()` | Unique identifier |
| `user_id` | `UUID` | NOT NULL, FK → `auth.users(id)` | Owning user |
| `name` | `TEXT` | NOT NULL | Tag display name |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Creation timestamp |

**RLS Policies**: User-scoped CRUD

**Android Room Entity**:
```kotlin
@Entity(tableName = "item_tags")
data class ItemTagEntity(
    @PrimaryKey val id: String,
    @ColumnInfo(name = "user_id") val userId: String,
    val name: String,
    @ColumnInfo(name = "created_at") val createdAt: String
)
```

---

### 4. user_settings

Stores user-specific configuration. One row per user.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `user_id` | `UUID` | PK, FK → `auth.users(id)` | Owning user |
| `budget` | `NUMERIC` | `DEFAULT 5000` | Monthly budget amount |
| `default_category_id` | `UUID` | FK → `categories(id)` | Default category for new transactions |
| `default_account_id` | `UUID` | FK → `accounts(id)` | Default account for new transactions |
| `updated_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Last update timestamp |

**RLS Policies**: User-scoped SELECT, INSERT, UPDATE. No DELETE policy (settings should persist).

**Android Room Entity**:
```kotlin
@Entity(tableName = "user_settings")
data class UserSettingsEntity(
    @PrimaryKey @ColumnInfo(name = "user_id") val userId: String,
    val budget: Double?,
    @ColumnInfo(name = "default_category_id") val defaultCategoryId: String?,
    @ColumnInfo(name = "default_account_id") val defaultAccountId: String?,
    @ColumnInfo(name = "updated_at") val updatedAt: String
)
```

---

### 5. transactions

The core table. Stores all financial records.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, `DEFAULT gen_random_uuid()` | Unique identifier |
| `user_id` | `UUID` | NOT NULL, FK → `auth.users(id)` | Owning user |
| `name` | `TEXT` | NOT NULL | Transaction name (e.g., "Ramen lunch") |
| `description` | `TEXT` | NULLABLE | Optional notes |
| `amount` | `NUMERIC` | NOT NULL | Transaction amount |
| `date` | `DATE` | NOT NULL | Transaction date (YYYY-MM-DD) |
| `category_id` | `UUID` | FK → `categories(id)` | Associated category |
| `account_id` | `UUID` | FK → `accounts(id)` | Associated account |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Record creation timestamp |

**RLS Policies**: User-scoped CRUD

**Indexes**:
- `idx_transactions_user_id` on `(user_id)`
- `idx_transactions_date` on `(date)`

**Android Room Entity**:
```kotlin
@Entity(tableName = "transactions")
data class TransactionEntity(
    @PrimaryKey val id: String,
    @ColumnInfo(name = "user_id") val userId: String,
    val name: String,
    val description: String?,
    val amount: Double,
    val date: String,        // "YYYY-MM-DD"
    @ColumnInfo(name = "category_id") val categoryId: String?,
    @ColumnInfo(name = "account_id") val accountId: String?,
    @ColumnInfo(name = "created_at") val createdAt: String
)
```

---

### 6. api_keys

Stores API keys for external integrations. Keys are stored as SHA-256 hashes.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `UUID` | PK, `DEFAULT gen_random_uuid()` | Unique identifier |
| `user_id` | `UUID` | NOT NULL, FK → `auth.users(id)` | Owning user |
| `name` | `TEXT` | NOT NULL | Human-readable key name |
| `key_hash` | `TEXT` | NOT NULL | SHA-256 hash of the API key |
| `key_prefix` | `TEXT` | NOT NULL | First few characters for display (e.g., "fm_abc...") |
| `privileges` | `JSONB` | DEFAULT `{"read":true,"create":false,"update":false,"delete":false}` | Permission flags |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Creation timestamp |
| `last_used_at` | `TIMESTAMPTZ` | NULLABLE | Last usage timestamp |

**Constraints**: `UNIQUE(user_id, name)` - key names must be unique per user.

**RLS Policies**: User-scoped CRUD

---

## Stored Functions (RPC)

### get_monthly_category_stats(start_date DATE, end_date DATE)

Returns category spending totals for a date range.

**Parameters**:
- `start_date`: DATE - Start of range
- `end_date`: DATE - End of range

**Returns**: `TABLE (category_name TEXT, total_amount NUMERIC)`

**SQL**:
```sql
SELECT
  COALESCE(c.name, 'Uncategorized') as category_name,
  SUM(t.amount) as total_amount
FROM transactions t
LEFT JOIN categories c ON t.category_id = c.id
WHERE t.user_id = auth.uid()
  AND t.date >= start_date
  AND t.date <= end_date
GROUP BY c.name;
```

**Usage**: Dashboard pie chart, analytics category breakdown.

**Android API call**:
```kotlin
// Via Supabase Kotlin SDK:
supabase.rpc("get_monthly_category_stats") {
    param("start_date", "2026-03-01")
    param("end_date", "2026-03-31")
}
```

### get_distinct_transaction_months()

Returns all unique year-month combinations with transactions, ordered by most recent first.

**Returns**: `TABLE (year_month TEXT)` - Format: "YYYY-MM"

**SQL**:
```sql
SELECT DISTINCT TO_CHAR(t.date, 'YYYY-MM') as year_month
FROM transactions t
WHERE t.user_id = auth.uid()
ORDER BY year_month DESC;
```

**Usage**: Mobile month selector dropdown in transaction list.

---

## Extensions

- `uuid-ossp`: Enables `gen_random_uuid()` for ID generation.
