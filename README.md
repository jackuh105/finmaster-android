# FinMaster Android

Native Android app for [FinMaster](https://github.com/your-org/finmaster) — a personal finance tracker with a Neo-brutalism design aesthetic.

## Features

- **Dashboard** — Monthly budget tracking, spending donut chart, recent transactions
- **Transactions** — Full CRUD with month selector, search, and category/amount filters
- **Analytics** — Total expenses, daily breakdown, category breakdown by date range
- **Calculators** — Fixed deposit comparison, compound interest, financial freedom point, mortgage repayment
- **Settings** — Category and account management, budget configuration

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Language | Kotlin |
| UI | Jetpack Compose + Material 3 |
| Navigation | Compose Navigation (type-safe) |
| Auth | Supabase Kotlin SDK (GoTrue) |
| Database | Supabase PostgreSQL (via PostgREST) |
| Local cache | Room (SQLite) |
| DI | Hilt |
| Async | Kotlin Coroutines + Flow |
| Min SDK | API 26 (Android 8.0) |

## Setup

### 1. Configure Supabase

Create `local.properties` in the project root (auto-gitignored):

```properties
sdk.dir=/path/to/Android/sdk
supabase.url=https://your-project.supabase.co
supabase.anon.key=your-anon-key
```

Find these values in your Supabase project dashboard under **Settings → API**.

### 2. Database setup

Run the SQL in `android-implementation/db/` on your Supabase project:
- `schema.sql` — Creates all tables with Row Level Security
- `functions.sql` — Creates `get_monthly_category_stats` and `get_distinct_transaction_months` RPC functions

### 3. Build

```bash
./gradlew assembleDebug
```

## Project Structure

```
app/src/main/java/com/finmaster/
├── FinMasterApp.kt              # @HiltAndroidApp Application
├── MainActivity.kt              # Single Activity entry point
├── di/                          # Hilt modules
├── data/
│   ├── remote/dto/              # API DTOs (@Serializable)
│   ├── local/db/                # Room database + DAOs
│   ├── local/entity/            # Room entities
│   ├── local/datastore/         # Session management
│   └── repository/              # Repository implementations
├── domain/model/                # Domain models
├── ui/
│   ├── navigation/              # NavHost, routes, bottom nav
│   ├── theme/                   # Neo-brutalism design system
│   ├── components/              # Shared composables (FinButton, FinCard, etc.)
│   ├── auth/                    # Login, reset password
│   ├── dashboard/               # Budget widget, pie chart, recent transactions
│   ├── transactions/            # Transaction list, add/edit, filters
│   ├── analytics/               # Expense stats and charts
│   ├── calculators/             # 4 financial calculators
│   └── settings/                # Categories, accounts, budget
└── util/                        # Date formatting, currency utils
```

## Architecture

**Supabase direct queries** — The app uses the Supabase Kotlin SDK to query PostgreSQL directly (like the web app). Row Level Security ensures users only see their own data. No intermediate REST API needed.

**Cache-aside with Room** — Room serves as a local cache. Data flows:
1. Emit cached Room data immediately
2. Fetch latest from Supabase
3. Update Room (Flow auto-emits changes)

## Design

Neo-brutalism aesthetic throughout:
- 2px solid black borders on all containers
- Hard shadows (3px offset, no blur)
- Warm peach `#FFEDD6` background with 70px grid pattern
- Orange `#FF7A05` accent
- Minimal 2px corner radius
