# 09 - State Management & Hooks

This document describes the web app's state management patterns (React hooks, React Query, Context) and their Android equivalents (Repository + ViewModel + Flow).

---

## Web State Architecture

```
┌───────────────────────────────────────────────────────┐
│                   UI Components                        │
│  Read from hooks, dispatch mutations                   │
├───────────────────────────────────────────────────────┤
│            React Query (Server State)                  │
│  useQuery: fetch + cache + stale-while-revalidate      │
│  useMutation: invalidate queries on success            │
├───────────────────────────────────────────────────────┤
│            React Context (Client State)                │
│  TransactionListContext: filters, pagination, search   │
├───────────────────────────────────────────────────────┤
│          Supabase Client (Browser/Server)              │
│  Direct DB queries (RLS-enforced)                      │
│  RPC calls for stored functions                        │
└───────────────────────────────────────────────────────┘
```

---

## Pattern 1: Server State → Repository + Flow

### Web: React Query Hook

```typescript
// use-transactions.ts
const { data, isLoading, error } = useQuery({
  queryKey: ['transactions', options],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*, categories(name), accounts(name)')
      .order('date', { ascending: false })
      .range(offset, offset + limit - 1);
    if (error) throw error;
    return { data: mappedData, count };
  },
});
```

### Android: Repository + Flow

```kotlin
// TransactionRepository.kt
interface TransactionRepository {
    fun getTransactions(options: TransactionQueryOptions): Flow<NetworkResult<List<Transaction>>>
    suspend fun addTransaction(request: CreateTransactionRequest): NetworkResult<Transaction>
    suspend fun updateTransaction(id: String, request: UpdateTransactionRequest): NetworkResult<Transaction>
    suspend fun deleteTransaction(id: String): NetworkResult<Unit>
}

// TransactionRepositoryImpl.kt
class TransactionRepositoryImpl @Inject constructor(
    private val api: TransactionsApi,
    private val transactionDao: TransactionDao
) : TransactionRepository {

    override fun getTransactions(options: TransactionQueryOptions): Flow<NetworkResult<List<Transaction>>> = flow {
        // 1. Emit cached data first
        val cached = transactionDao.getAll(options.userId)
        if (cached.isNotEmpty()) {
            emit(NetworkResult.Success(cached.map { it.toDomain() }))
        } else {
            emit(NetworkResult.Loading)
        }

        // 2. Fetch from API
        try {
            val response = api.getTransactions(
                limit = options.limit,
                offset = options.offset,
                startDate = options.startDate,
                endDate = options.endDate,
                minAmount = options.minAmount,
                maxAmount = options.maxAmount,
                types = options.types,
                q = options.query
            )
            if (response.isSuccessful) {
                val body = response.body()!!
                // 3. Update cache
                transactionDao.upsertAll(body.transactions.map { it.toEntity(options.userId) })
                // 4. Re-emit from cache (Room Flow auto-emits but we re-emit to ensure)
                val updated = transactionDao.getAll(options.userId)
                emit(NetworkResult.Success(updated.map { it.toDomain() }))
            } else {
                // 5. On API error, keep showing cached data but emit error
                emit(NetworkResult.Error("Failed to fetch: ${response.code()}"))
            }
        } catch (e: Exception) {
            if (cached.isEmpty()) {
                emit(NetworkResult.Error(e.message ?: "Network error"))
            }
            // If we have cached data, don't override it with error
        }
    }
}
```

### ViewModel

```kotlin
@HiltViewModel
class TransactionListViewModel @Inject constructor(
    private val transactionRepository: TransactionRepository
) : ViewModel() {

    // Filter state (client state)
    private val _amountRange = MutableStateFlow(0f..1000f)
    val amountRange: StateFlow<ClosedFloatingPointRange<Float>> = _amountRange.asStateFlow()

    private val _selectedCategories = MutableStateFlow<Set<String>>(emptySet())
    val selectedCategories: StateFlow<Set<String>> = _selectedCategories.asStateFlow()

    private val _searchQuery = MutableStateFlow("")
    val searchQuery: StateFlow<String> = _searchQuery.asStateFlow()

    private val _currentPage = MutableStateFlow(0)
    val currentPage: StateFlow<Int> = _currentPage.asStateFlow()

    // Data state (server state)
    val transactions: StateFlow<NetworkResult<List<Transaction>>> = combine(
        _amountRange, _selectedCategories, _searchQuery, _currentPage
    ) { range, categories, query, page ->
        TransactionQueryOptions(
            limit = 20,
            offset = page * 20,
            startDate = null,
            endDate = null,
            minAmount = range.start.toDouble(),
            maxAmount = range.endInclusive.toDouble(),
            types = if (categories.isEmpty()) null else categories.joinToString(","),
            query = query.ifEmpty { null }
        )
    }.flatMapLatest { options ->
        transactionRepository.getTransactions(options)
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), NetworkResult.Loading)

    fun onAmountRangeChange(range: ClosedFloatingPointRange<Float>) {
        _amountRange.value = range
        _currentPage.value = 0
    }

    fun onCategoryToggle(category: String) {
        val current = _selectedCategories.value.toMutableSet()
        if (current.contains(category)) current.remove(category) else current.add(category)
        _selectedCategories.value = current
        _currentPage.value = 0
    }

    fun onSearchQueryChange(query: String) {
        _searchQuery.value = query
        _currentPage.value = 0
    }

    fun onPageChange(page: Int) {
        _currentPage.value = page
    }

    fun deleteTransaction(id: String) {
        viewModelScope.launch {
            transactionRepository.deleteTransaction(id)
            // Repository will refresh the cache
        }
    }
}
```

---

## Pattern 2: Mutation → suspend function + cache invalidation

### Web: React Query Mutation

```typescript
const addTransactionMutation = useMutation({
  mutationFn: async (newTransaction) => {
    const { error } = await supabase.from('transactions').insert([...]);
    if (error) throw error;
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['transactions'] });
  },
});
```

### Android: Repository suspend function

```kotlin
override suspend fun addTransaction(request: CreateTransactionRequest): NetworkResult<Transaction> {
    return try {
        val response = api.createTransaction(request)
        if (response.isSuccessful) {
            val body = response.body()!!
            val entity = body.transaction.toEntity()
            transactionDao.upsert(entity)
            NetworkResult.Success(body.transaction.toDomain())
        } else {
            NetworkResult.Error("Failed to create: ${response.code()}")
        }
    } catch (e: Exception) {
        NetworkResult.Error(e.message ?: "Network error")
    }
}
```

The Room Flow will automatically emit the updated data to any observers.

---

## Pattern 3: Client State → MutableStateFlow / Compose State

### Web: React Context

```typescript
// TransactionListContext.tsx
const TransactionListContext = createContext({
  amountFilter: [number, number],
  setAmountFilter: Dispatch<SetStateAction<number[]>>,
  typeFilter: Set<string>,
  setTypeFilter: Dispatch<SetStateAction<Set<string>>>,
  query: string,
  setQuery: Dispatch<SetStateAction<string>>,
  page: number,
  setPage: Dispatch<SetStateAction<number>>,
});
```

### Android: ViewModel StateFlow properties

Client state lives directly in the ViewModel as `MutableStateFlow` properties. No separate context needed - each screen's ViewModel holds its own UI state.

---

## Hook → Repository Mapping

| Web Hook | Android Repository | Key Methods |
|----------|-------------------|-------------|
| `useTransactions()` | `TransactionRepository` | `getTransactions()`, `addTransaction()`, `updateTransaction()`, `deleteTransaction()`, `addTransactions()` (batch) |
| `useCategories()` | `CategoryRepository` | `getCategories()`, `addCategory()`, `updateCategory()`, `deleteCategory()`, `togglePreset()` |
| `useAccounts()` | `AccountRepository` | `getAccounts()`, `addAccount()`, `updateAccount()`, `deleteAccount()`, `togglePreset()` |
| `useItemTags()` | `ItemTagRepository` | `getItemTags()`, `addItemTag()`, `updateItemTag()`, `deleteItemTag()` |
| `useUserSettings()` | `BudgetRepository` | `getBudget()`, `updateBudget()`, `getSettings()`, `updateSettings()` |
| `useApiKeys()` | `ApiKeyRepository` | `getApiKeys()`, `createApiKey()`, `deleteApiKey()`, `updatePrivileges()` |
| `useMonthlyStats()` | `AnalyticsRepository` | `getCategoryStats(startDate, endDate)` |
| `useTransactionMonths()` | `TransactionRepository` | `getDistinctMonths()` |
| `useExchangeRate()` | Not needed as hook; fetch inline in calculator | Fetch from currency API |
| `useLunr()` | Not needed; use Supabase ILIKE search | API `q` parameter handles search |

---

## Hook Details

### useTransactions(options?)

**Purpose**: Fetch and mutate transactions.

**Query Key**: `['transactions', options]` - automatically refetches when options change.

**Query Function**:
1. Build query with optional join on categories (inner join when type filter active)
2. Apply all filters: limit, offset, amount range, type filter, search query, date range
3. Return `{ data: Transaction[], count: number }` (count for pagination total)

**Options**:
```typescript
{
  limit?: number;        // default: undefined (all)
  range?: [number, number]; // pagination range
  amountFilter?: [number, number];
  typeFilter?: string[];
  searchQuery?: string;
  startDate?: string;
  endDate?: string;
}
```

**Mutations**: `addTransaction()`, `addTransactions()` (batch for periodic), `updateTransaction()`, `deleteTransaction()`

**Android**: `TransactionRepository` with same filter parameters. Batch insert for periodic transactions.

---

### useCategories()

**Purpose**: CRUD for categories.

**Query Key**: `['categories']`, `staleTime: Infinity` (rarely changes, manual invalidation)

**Query**: `SELECT * FROM categories ORDER BY created_at ASC`

**Mutations**: `addCategory({ name, is_preset })`, `deleteCategory(name)`, `updateCategory({ oldName, newName })`, `togglePreset({ name, is_preset })`

**Note**: Mutations identify categories by `name`, not `id`. This is important for the Android implementation too.

**Android**: `CategoryRepository`. Use name-based identification for consistency with web.

---

### useAccounts()

**Purpose**: CRUD for accounts. Identical pattern to `useCategories()`.

**Query**: `SELECT * FROM accounts ORDER BY created_at ASC`

**Note**: Also uses name-based identification for mutations.

---

### useItemTags()

**Purpose**: CRUD for quick-select item tags.

**Query Key**: `['item_tags']`
**Query**: `SELECT * FROM item_tags ORDER BY created_at ASC`

**Mutations**: `addItemTag(name)`, `deleteItemTag(name)`, `updateItemTag({ oldName, newName })`

---

### useUserSettings()

**Purpose**: Fetch and update user settings (budget, defaults).

**Query Key**: `['user_settings']`

**Query Function**:
1. Get current user: `supabase.auth.getUser()`
2. If no user, return null
3. Fetch settings row: `SELECT * FROM user_settings WHERE user_id = ...`
4. Handle empty result (PGRST116 error code) → return `{ budget: null }`

**Mutation**: `updateBudget(amount)` → upserts `{ user_id, budget, updated_at }`

**Return**: `{ budget, isLoading, error, updateBudget }`

**Android**: `BudgetRepository` using API endpoints `GET /budget/limit` and `PATCH /budget/limit`.

---

### useMonthlyStats(date?)

**Purpose**: Fetch category spending totals for a given month.

**Query Key**: `['monthly-stats', startDate, endDate]`

**Query Function**: Calls `supabase.rpc('get_monthly_category_stats', { start_date, end_date })`

**Returns**: `MonthlyCategoryStat[]` = `{ category_name: string, total_amount: number }[]`

**Android**: `AnalyticsRepository.getCategoryStats()`. Can use the API endpoint or Supabase RPC.

---

### useTransactionMonths()

**Purpose**: Get distinct months that have transactions (for mobile month selector).

**Query Key**: `['transaction-months']`

**Query Function**: Calls `supabase.rpc('get_distinct_transaction_months')`

**Returns**: `string[]` (e.g., `["2026-03", "2026-02", "2026-01"]`)

---

### useApiKeys()

**Purpose**: CRUD for API keys.

**Query Key**: `['api_keys']`
**Query**: `SELECT id, name, key_prefix, privileges, created_at, last_used_at FROM api_keys`

**Mutations**:
- `createApiKey({ name, privileges })` → returns the full key (only shown once)
- `deleteApiKey(id)`
- `updateApiKeyPrivileges({ id, privileges })`

**Note**: The full API key is only returned at creation time. The UI must display it and warn the user to save it.

---

### useExchangeRate()

**Purpose**: Not used in current codebase (exchange rate is manually entered in the form).

The `FixedDepositCurrencyDiff` calculator fetches live rates directly from `@fawazahmed0/currency-api`.

**Android**: Fetch directly in the calculator ViewModel.

---

### useLunr()

**Purpose**: Client-side full-text search using Lunr.js, with Chinese segmentation support.

**Current code**: The search is actually performed server-side via Supabase `ilike` queries in `useTransactions()`. The `SearchBar` component uses `Intl.Segmenter` for Chinese word segmentation before passing the query.

**Android**: Use server-side search only (`q` parameter in API). For Chinese text segmentation, use `java.text.BreakIterator.getCharacterInstance(Locale.CHINESE)` or send raw text and let the API handle it.

---

## Cache Invalidation Strategy

### Web (React Query)
```typescript
// After any mutation:
queryClient.invalidateQueries({ queryKey: ['transactions'] });
queryClient.invalidateQueries({ queryKey: ['categories'] });
queryClient.invalidateQueries({ queryKey: ['monthly-stats'] });
```

### Android (Room + Repository)
```kotlin
// After any mutation, the repository updates Room directly
// Room's Flow automatically emits the new data to observers
// No explicit invalidation needed - it's reactive by design

override suspend fun addTransaction(request: CreateTransactionRequest): NetworkResult<Transaction> {
    val response = api.createTransaction(request)
    if (response.isSuccessful) {
        val entity = response.body()!!.transaction.toEntity()
        transactionDao.upsert(entity)
        // UI observers automatically receive updated data
    }
    ...
}
```

---

## DI Module Structure

```kotlin
@Module
@InstallIn(SingletonComponent::class)
object RepositoryModule {

    @Provides
    @Singleton
    fun provideTransactionRepository(
        api: TransactionsApi,
        dao: TransactionDao
    ): TransactionRepository = TransactionRepositoryImpl(api, dao)

    @Provides
    @Singleton
    fun provideCategoryRepository(
        api: CategoriesApi,
        dao: CategoryDao
    ): CategoryRepository = CategoryRepositoryImpl(api, dao)

    @Provides
    @Singleton
    fun provideAccountRepository(
        api: AccountsApi,
        dao: AccountDao
    ): AccountRepository = AccountRepositoryImpl(api, dao)

    @Provides
    @Singleton
    fun provideBudgetRepository(
        api: BudgetApi
    ): BudgetRepository = BudgetRepositoryImpl(api)

    @Provides
    @Singleton
    fun provideAnalyticsRepository(
        api: AnalyticsApi
    ): AnalyticsRepository = AnalyticsRepositoryImpl(api)
}
```
