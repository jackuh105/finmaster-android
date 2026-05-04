# 03 - API Specification (REST v1)

Base URL: `https://<your-project>.supabase.co/api/v1` (or `http://localhost:3000/api/v1` in dev)

## Authentication

All endpoints require authentication via the `Authorization` header:

**For Android app (Supabase JWT)**:
```
Authorization: Bearer <supabase_access_token>
```
The token is obtained from Supabase Auth after login. The `sub` claim contains the user's UUID.

**For external integrations (API Key)**:
```
Authorization: Bearer <api_key>
```
API keys start with `fm_` prefix. Each key has privilege flags.

## Response Format

**Success**: JSON body with HTTP status 200 (or 201 for creation)
**Error**: `{"error": "<message>"}` with appropriate HTTP status

Error status codes:
- `401`: Missing or invalid authentication
- `403`: Valid authentication but insufficient privileges
- `400`: Validation error / bad request

---

## Endpoints Summary

| Method | Path | Description |
|--------|------|-------------|
| GET | `/accounts` | List all accounts |
| POST | `/accounts` | Create account |
| PATCH | `/accounts/:id` | Update account name |
| DELETE | `/accounts/:id` | Delete account |
| GET | `/categories` | List all categories |
| POST | `/categories` | Create category |
| PATCH | `/categories/:id` | Update category name |
| DELETE | `/categories/:id` | Delete category |
| GET | `/transactions` | List transactions (paginated, filterable) |
| POST | `/transactions` | Create transaction |
| PATCH | `/transactions/:id` | Update transaction |
| DELETE | `/transactions/:id` | Delete transaction |
| GET | `/budget/limit` | Get current budget |
| PATCH | `/budget/limit` | Update budget amount |
| GET | `/budget/usage` | Get budget usage for current month |
| GET | `/analytics/total-expense` | Total expense for date range |
| GET | `/analytics/daily-expense` | Daily expense breakdown |
| GET | `/analytics/category-expense` | Category expense breakdown |

---

## Accounts

### GET `/accounts`

Returns all accounts for the authenticated user, ordered by name.

**Response (200)**:
```json
{
  "accounts": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "name": "BOC",
      "is_preset": false,
      "created_at": "2026-03-03T01:23:45.678Z"
    }
  ]
}
```

### POST `/accounts`

Create a new account.

**Request Body**:
```json
{ "name": "AliPay" }
```
- `name` (string, required): Account name

**Response (201)**:
```json
{
  "account": {
    "id": "uuid",
    "name": "AliPay",
    "user_id": "uuid",
    "is_preset": false,
    "created_at": "2026-03-03T11:00:00.000Z"
  }
}
```

### PATCH `/accounts/:id`

Update an account's name.

**Request Body**:
```json
{ "name": "HSBC Main" }
```

**Response (200)**:
```json
{
  "account": { "id": "uuid", "name": "HSBC Main", ... }
}
```

### DELETE `/accounts/:id`

Delete an account.

**Response (200)**:
```json
{ "message": "Account deleted successfully" }
```

---

## Categories

Identical structure to Accounts.

### GET `/categories`

**Response (200)**:
```json
{
  "categories": [
    { "id": "uuid", "name": "Food", "user_id": "uuid", "is_preset": true, "created_at": "..." }
  ]
}
```

### POST `/categories`

**Request Body**: `{ "name": "Entertainment" }`

**Response (201)**: `{ "category": { ... } }`

### PATCH `/categories/:id`

**Request Body**: `{ "name": "New Name" }`

### DELETE `/categories/:id`

**Response**: `{ "message": "Category deleted successfully" }`

---

## Transactions

### GET `/transactions`

List transactions with pagination and filters.

**Query Parameters**:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | int | 10 | Number of records per page |
| `offset` | int | 0 | Starting offset for pagination |
| `startDate` | string | null | Filter by start date (YYYY-MM-DD) |
| `endDate` | string | null | Filter by end date (YYYY-MM-DD) |
| `minAmount` | number | null | Minimum amount filter |
| `maxAmount` | number | null | Maximum amount filter |
| `types` | string | null | Comma-separated category names for filtering |
| `q` | string | null | Search query (searches name and description, case-insensitive ILIKE) |

**Response (200)**:
```json
{
  "transactions": [
    {
      "id": "uuid",
      "name": "Ramen lunch",
      "description": "Spicy miso ramen",
      "amount": 85.50,
      "date": "2026-03-15",
      "category": "Food",
      "account": "BOC",
      "created_at": "2026-03-15T12:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 10,
    "offset": 0
  }
}
```

**Android Retrofit Interface**:
```kotlin
interface TransactionsApi {
    @GET("api/v1/transactions")
    suspend fun getTransactions(
        @Query("limit") limit: Int = 20,
        @Query("offset") offset: Int = 0,
        @Query("startDate") startDate: String? = null,
        @Query("endDate") endDate: String? = null,
        @Query("minAmount") minAmount: Double? = null,
        @Query("maxAmount") maxAmount: Double? = null,
        @Query("types") types: String? = null,
        @Query("q") q: String? = null,
    ): TransactionsResponse
}
```

### POST `/transactions`

Create a new transaction.

**Request Body**:
```json
{
  "name": "Ramen lunch",
  "amount": 85.50,
  "date": "2026-03-15",
  "description": "Spicy miso ramen",
  "category_id": "uuid-of-food-category",
  "account_id": "uuid-of-boc-account"
}
```

Required fields: `name`, `amount`, `date`

**Response (201)**:
```json
{
  "transaction": {
    "id": "uuid",
    "user_id": "uuid",
    "name": "Ramen lunch",
    "description": "Spicy miso ramen",
    "amount": 85.50,
    "date": "2026-03-15",
    "category_id": "uuid",
    "account_id": "uuid",
    "created_at": "2026-03-15T12:00:00.000Z"
  }
}
```

**Android Retrofit**:
```kotlin
@POST("api/v1/transactions")
suspend fun createTransaction(@Body body: CreateTransactionRequest): TransactionResponse

@Serializable
data class CreateTransactionRequest(
    val name: String,
    val amount: Double,
    val date: String,
    val description: String? = null,
    @SerialName("category_id") val categoryId: String? = null,
    @SerialName("account_id") val accountId: String? = null
)
```

### PATCH `/transactions/:id`

Update a transaction.

**Request Body**: Same fields as POST, all optional.

**Response (200)**: Updated transaction object.

### DELETE `/transactions/:id`

Delete a transaction.

**Response (200)**: `{"message":"Transaction deleted successfully"}`

---

## Budget

### GET `/budget/limit`

Get the current monthly budget.

**Response (200)**:
```json
{
  "budget": 5000,
  "updated_at": "2026-03-01T00:00:00.000Z"
}
```

### PATCH `/budget/limit`

Update the monthly budget.

**Request Body**:
```json
{ "budget": 8000 }
```

**Response (200)**:
```json
{ "budget": 8000, "updated_at": "..." }
```

### GET `/budget/usage`

Get current month's budget usage breakdown.

**Response (200)**:
```json
{
  "budget": 5000,
  "spent": 3200.50,
  "remaining": 1799.50,
  "percentage": 64.01
}
```

---

## Analytics

### GET `/analytics/total-expense`

Total expense for a date range.

**Parameters**:
- `startDate` (required): YYYY-MM-DD
- `endDate` (required): YYYY-MM-DD

**Response (200)**:
```json
{
  "start_date": "2026-03-01",
  "end_date": "2026-03-31",
  "total_expense": 3200.50,
  "transaction_count": 45
}
```

### GET `/analytics/daily-expense`

Daily expense breakdown for a date range.

**Parameters**: Same as total-expense.

**Response (200)**:
```json
{
  "daily_expenses": [
    { "date": "2026-03-01", "amount": 150.00 },
    { "date": "2026-03-02", "amount": 200.00 }
  ]
}
```

### GET `/analytics/category-expense`

Category expense breakdown for a date range.

**Parameters**: Same as total-expense.

**Response (200)**:
```json
{
  "category_expenses": [
    { "category": "Food", "amount": 1200.00 },
    { "category": "Transport", "amount": 500.00 }
  ]
}
```

---

## Android API Client Setup

### Retrofit Configuration

```kotlin
@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {

    @Provides
    @Singleton
    fun provideOkHttpClient(authInterceptor: AuthInterceptor): OkHttpClient {
        return OkHttpClient.Builder()
            .addInterceptor(authInterceptor)
            .addInterceptor(HttpLoggingInterceptor().apply {
                level = if (BuildConfig.DEBUG) Level.BODY else Level.NONE
            })
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .build()
    }

    @Provides
    @Singleton
    fun provideRetrofit(okHttpClient: OkHttpClient): Retrofit {
        return Retrofit.Builder()
            .baseUrl(BuildConfig.API_BASE_URL) // e.g., "https://xxx.supabase.co/"
            .client(okHttpClient)
            .addConverterFactory(Json.asConverterFactory("application/json".toMediaType()))
            .build()
    }
}
```

### AuthInterceptor

```kotlin
class AuthInterceptor @Inject constructor(
    private val sessionManager: SessionManager
) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val token = runBlocking { sessionManager.getAccessToken() }
        val request = if (token != null) {
            chain.request().newBuilder()
                .addHeader("Authorization", "Bearer $token")
                .build()
        } else {
            chain.request()
        }
        return chain.proceed(request)
    }
}
```

### Base URL Configuration

The Android app should have a `BuildConfig` field for the API base URL. For Supabase projects, this is the project URL (e.g., `https://abcdefghijklm.supabase.co/`).

Create a `app.properties` or use BuildConfig:
```
API_BASE_URL="https://YOUR_PROJECT.supabase.co/"
```
