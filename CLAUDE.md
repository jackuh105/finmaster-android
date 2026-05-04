# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FinMaster is a personal finance Android app (Kotlin + Jetpack Compose) that consumes an existing Next.js/Supabase backend. It tracks transactions, budgets, analytics, and provides financial calculators -- all with a **Neo-brutalism** design aesthetic.

**Full implementation specification:** `android-implementation/` (10 documents covering architecture, schema, API, UI, design system, data models, auth, and state management). Read these before making significant changes.

## Build & Development Commands

Once the project is scaffolded, standard Gradle commands will apply:

```bash
./gradlew assembleDebug        # Build debug APK
./gradlew assembleRelease      # Build release APK
./gradlew test                 # Run unit tests
./gradlew connectedAndroidTest # Run instrumented tests
./gradlew ktlintCheck          # Lint Kotlin code (if ktlint plugin configured)
./gradlew :app:testDebugUnitTest --tests "com.finmaster.*" # Run specific tests
```

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Language | Kotlin |
| UI | Jetpack Compose (declarative) |
| Navigation | Compose Navigation (type-safe) |
| Networking | Retrofit + OkHttp + kotlinx.serialization |
| Local DB | Room (SQLite) -- see cache-aside pattern below |
| DI | Hilt (compile-time) |
| Async | Kotlin Coroutines + Flow |
| Auth | Supabase Kotlin SDK (shared user pool with web) |
| Charts | Vico (Compose-native) |
| Architecture | MVVM + Repository |
| Min SDK | API 26 (Android 8.0) |

## Architecture

### Package Structure

```
app/src/main/java/com/finmaster/
├── FinMasterApp.kt           # @HiltAndroidApp Application class
├── MainActivity.kt           # Single Activity entry point
├── di/                       # Hilt modules (Network, Database, Repository)
├── data/
│   ├── remote/api/           # Retrofit service interfaces
│   ├── remote/dto/           # API request/response DTOs (@Serializable)
│   ├── remote/interceptor/   # AuthInterceptor (JWT injection)
│   ├── local/db/             # Room database, DAOs
│   ├── local/entity/         # Room entities
│   ├── local/datastore/      # DataStore preferences
│   └── repository/           # Repository implementations
├── domain/model/             # Pure domain models
├── ui/
│   ├── navigation/           # NavHost, route definitions, bottom nav
│   ├── theme/                # Neo-brutalism theme (FinColors, FinTypography, FinShapes, FinMasterTheme, GridBackground)
│   ├── components/           # Shared composables (FinButton, FinCard, FinTextField, FinDialog, etc.)
│   ├── auth/                 # LoginScreen, ResetPasswordScreen + ViewModels
│   ├── dashboard/            # DashboardScreen with BudgetWidget, SpendingPieChart, RecentTransactions
│   ├── transactions/         # TransactionListScreen, AddEditTransactionScreen
│   ├── analytics/            # AnalyticsScreen with StatsCards and charts
│   ├── calculators/          # 4 financial calculator screens
│   └── settings/             # SettingsScreen (categories, accounts, tags, API keys, budget)
└── util/                     # Extensions, date utils, currency formatting
```

### Cache-Aside Pattern with Room

**Room is the single source of truth.** The UI observes Room via Flow. Repositories follow this pattern:

1. Read: emit Room data immediately → fetch from API → update Room (Flow auto-emits new data)
2. Write: call API → on success, update Room → on failure, show error (cached data still displayed)
3. No explicit cache invalidation needed -- Room Flows are reactive

### Auth Architecture

```
Android App → Supabase Auth SDK (login/logout/session) → Supabase JWT
         → AuthInterceptor adds JWT to all API requests
         → FinMaster REST API v1 validates JWT, returns user data
```

Session observation drives navigation: `Authenticated` → main app, `NotAuthenticated` → login screen. Supabase SDK persists sessions automatically.

### Data Flow per Screen

- **ViewModel** holds `MutableStateFlow` for client state (filters, search, pagination)
- **ViewModel** uses `flatMapLatest` to combine filter flows → call repository
- **Repository** returns `Flow<NetworkResult<T>>` (Success/Error/Loading sealed class)
- **Composable** collects StateFlow and renders accordingly

### Backend API

Base URL is configured via `BuildConfig.API_BASE_URL`. The existing REST API v1 (`api/v1/`) handles all CRUD. **Required backend change:** extend `api-auth.ts` to validate Supabase JWT tokens alongside existing API key auth (see `01-IMPLEMENTATION-PLAN.md`).

## Neo-Brutalism Design System

Key design tokens (see `06-DESIGN-SYSTEM.md` for full spec):

- **Borders:** 2px solid black on all containers
- **Shadows:** `3px 3px 0px 0px #000` (hard, no blur)
- **Corners:** 2px radius
- **Background:** Warm peach `#FFEDD6` (light) / dark brown `#322215` (dark), with 70px grid pattern
- **Accent:** Orange `#FF7A05`
- **Typography:** Geist Sans variable font, weight 500 body / 700 headings
- **Button press animation:** translates 3px into its shadow on press

Custom composables replicate Shadcn/UI components: `FinButton` (5 variants), `FinCard`, `FinTextField`, `FinDialog`, `FinProgressBar`, `FinBadge`, `FinCheckbox`, `FinDropdown`.

## Source of Truth for Original Web App

When you need to reference the original component's code (for layout, styling, behavior alignment), ask the user to provide the specific TypeScript/React source file. The `01-IMPLEMENTATION-PLAN.md` contains a file-to-feature mapping table showing which web source files correspond to which Android targets.
