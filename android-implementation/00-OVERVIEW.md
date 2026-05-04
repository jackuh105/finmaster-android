# 00 - Project Overview

## What is FinMaster?

FinMaster is a **personal finance web application** built with a **Neo-brutalism** design aesthetic. It allows users to:
- Track income and expenses (transactions)
- Manage budgets and monitor spending progress
- Analyze spending habits through charts and statistics
- Import/export transaction data (XLSX/CSV)
- Use financial calculators (compound interest, mortgage, currency deposits, financial freedom)
- Manage categories, accounts, and item tags
- Generate API keys for external integrations

The current implementation is a **Next.js web application** with a **Supabase backend**. This document set describes how to build a **native Android application** that provides the same functionality, consuming the existing backend.

---

## Technology Stack (Web - Reference)

| Layer | Technology | Notes |
|-------|-----------|-------|
| Framework | Next.js 16 (App Router) | Server Components + Client Components |
| Language | TypeScript | Strict typing throughout |
| UI | React 19 + Shadcn/UI (Radix primitives) | Neo-brutalism custom theme |
| Styles | Tailwind CSS 3.4 | Custom color tokens and utilities |
| State | TanStack React Query v5 | Server state management |
| State | React Context | Client-side filter state |
| Tables | TanStack React Table v8 | Data tables with sorting/pagination |
| Charts | Recharts 2.x | Pie charts, bar charts, line charts |
| Auth | Supabase Auth (email/password) | Session managed via cookies |
| Database | Supabase PostgreSQL | Row Level Security (RLS) enforced |
| API | Next.js Route Handlers (REST v1) | API key authenticated |
| Package Manager | pnpm | Monorepo-style dependency management |

---

## Technology Stack (Android - Target)

| Layer | Technology | Notes |
|-------|-----------|-------|
| Language | Kotlin | Modern, concise, null-safe |
| UI Framework | Jetpack Compose | Declarative, similar mental model to React |
| Navigation | Compose Navigation (Type-Safe) | Screen-based routing |
| Networking | Retrofit + OkHttp + kotlinx.serialization | Industry standard HTTP client |
| Local Database | Room (SQLite) | Offline cache and persistence |
| DI | Hilt | Compile-time dependency injection |
| Async | Kotlin Coroutines + Flow | Reactive data streams |
| Auth | Supabase Kotlin SDK | Shared auth with web |
| Charts | Vico (or custom Canvas) | Compose-native charting |
| Architecture | MVVM + Repository | Clean separation of concerns |
| Min SDK | API 26 (Android 8.0) | Covers 95%+ of devices |

---

## Key Architecture Decisions

### 1. Backend Reuse

The existing Supabase database and REST API v1 endpoints serve as the **single backend** for both web and Android. No backend duplication needed.

The Android app will only need one backend change: **extending API authentication to support Supabase JWT tokens** alongside the existing API key mechanism. This allows logged-in users to call the API directly.

### 2. Neo-brutalism Design in Compose

The web app uses a distinctive design language:
- **Thick borders** (2px solid black on all containers)
- **Hard shadows** (3px 3px 0px offset, no blur)
- **Grid background** (repeating 70px grid lines)
- **High contrast colors** (warm peach `#FFEDD6` background, orange `#FF7A05` accent)
- **Minimal rounded corners** (2px radius)
- **Bold typography** (font-weight 500 body, 700 headings)

These must be replicated in Compose using custom `Shape`, `Modifier.border()`, `Modifier.shadow()`, and a custom `CompositionLocal` theme.

### 3. Offline-First with Room

Since this is a personal finance app, offline support is critical. The architecture uses **Room as the single source of truth** with a **cache-aside** pattern:
- On read: Check Room first, if stale, fetch from API and update Room
- On write: Write to API first, on success, update Room
- The UI always reads from Room (Flow-based observation)

### 4. Shared Authentication

Both web and Android share the same Supabase Auth user pool. A user account created on the web works on Android and vice versa. The Supabase Kotlin SDK handles session persistence natively.

---

## Project Structure (Android)

```
finmaster-android/
├── app/
│   └── src/main/java/com/finmaster/
│       ├── FinMasterApp.kt              # @HiltAndroidApp Application
│       ├── MainActivity.kt              # Single Activity, entry point
│       ├── di/                           # Hilt modules
│       │   ├── NetworkModule.kt
│       │   ├── DatabaseModule.kt
│       │   └── RepositoryModule.kt
│       ├── data/
│       │   ├── remote/api/              # Retrofit interfaces
│       │   ├── remote/dto/              # API response DTOs
│       │   ├── remote/interceptor/      # Auth interceptor
│       │   ├── local/db/                # Room database and DAOs
│       │   ├── local/entity/            # Room entities
│       │   ├── local/datastore/         # Preferences DataStore
│       │   └── repository/              # Repository implementations
│       ├── domain/model/                # Pure domain models
│       ├── ui/
│       │   ├── navigation/              # NavHost and route definitions
│       │   ├── theme/                   # Neo-brutalism theme
│       │   ├── components/              # Shared composables
│       │   ├── auth/                    # Login screen + ViewModel
│       │   ├── dashboard/               # Home dashboard
│       │   ├── transactions/            # Transaction CRUD screens
│       │   ├── analytics/               # Analytics charts
│       │   ├── calculators/             # Financial calculators
│       │   └── settings/                # Settings management
│       └── util/                        # Utility functions
```

---

## Document Index

This directory contains a complete set of implementation documents. They should be read in order:

| # | Document | Content |
|---|----------|---------|
| 00 | `00-OVERVIEW.md` | This file - project context and architecture decisions |
| 01 | `01-IMPLEMENTATION-PLAN.md` | Phased implementation roadmap with priorities |
| 02 | `02-DATABASE-SCHEMA.md` | All database tables, columns, RLS policies, and stored functions |
| 03 | `03-API-SPEC.md` | Complete REST API v1 specification with request/response examples |
| 04 | `04-UI-COMPONENTS.md` | Every UI component with its purpose, props, styles, and variants |
| 05 | `05-PAGE-LAYOUTS.md` | Page-by-page layout, component composition, and data flow |
| 06 | `06-DESIGN-SYSTEM.md` | Design tokens, color palette, typography, spacing, and shadows |
| 07 | `07-DATA-MODELS.md` | All TypeScript types mapped to Kotlin data classes |
| 08 | `08-AUTH-FLOW.md` | Authentication architecture, login/logout flow, session management |
| 09 | `09-STATE-MANAGEMENT.md` | React Query patterns mapped to Repository + Flow patterns |
