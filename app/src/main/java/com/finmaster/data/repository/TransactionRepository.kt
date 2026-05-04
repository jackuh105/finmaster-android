package com.finmaster.data.repository

import com.finmaster.data.local.db.TransactionDao
import com.finmaster.data.local.entity.TransactionEntity
import com.finmaster.data.remote.dto.CreateTransactionRequest
import com.finmaster.data.remote.dto.UpdateTransactionRequest
import com.finmaster.domain.model.NetworkResult
import com.finmaster.domain.model.Transaction
import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.gotrue.auth
import io.github.jan.supabase.postgrest.from
import io.github.jan.supabase.postgrest.query.Order
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.flow.flow
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import java.time.Instant
import javax.inject.Inject
import javax.inject.Singleton

data class TransactionQueryOptions(
    val limit: Int = 20,
    val offset: Int = 0,
    val startDate: String? = null,
    val endDate: String? = null,
    val minAmount: Double? = null,
    val maxAmount: Double? = null,
    val types: Set<String>? = null,
    val query: String? = null,
)

@Serializable
data class SupabaseTransaction(
    val id: String = "",
    @SerialName("user_id") val userId: String = "",
    val name: String = "",
    val description: String? = null,
    val amount: Double = 0.0,
    val date: String = "",
    @SerialName("category_id") val categoryId: String? = null,
    @SerialName("account_id") val accountId: String? = null,
    @SerialName("created_at") val createdAt: String? = null,
)

interface TransactionRepository {
    fun getTransactions(options: TransactionQueryOptions): Flow<NetworkResult<List<Transaction>>>
    suspend fun addTransaction(request: CreateTransactionRequest): NetworkResult<Transaction>
    suspend fun updateTransaction(id: String, request: UpdateTransactionRequest): NetworkResult<Transaction>
    suspend fun deleteTransaction(id: String): NetworkResult<Unit>
    fun getRecentTransactions(limit: Int): Flow<List<Transaction>>
    suspend fun getDistinctMonths(): List<String>
}

@Singleton
class TransactionRepositoryImpl @Inject constructor(
    private val supabaseClient: SupabaseClient,
    private val dao: TransactionDao,
) : TransactionRepository {

    // Applies all client-side filters to a list of transactions
    private fun applyFilters(transactions: List<Transaction>, options: TransactionQueryOptions): List<Transaction> {
        return transactions.filter { t ->
            (options.startDate == null || t.date >= options.startDate) &&
            (options.endDate == null || t.date <= options.endDate) &&
            (options.minAmount == null || t.amount >= options.minAmount) &&
            (options.maxAmount == null || t.amount <= options.maxAmount) &&
            (options.types.isNullOrEmpty() || (t.category != null && t.category in options.types)) &&
            (options.query.isNullOrBlank() ||
                t.name.contains(options.query, ignoreCase = true) ||
                (t.description?.contains(options.query, ignoreCase = true) == true))
        }
    }

    override fun getTransactions(options: TransactionQueryOptions): Flow<NetworkResult<List<Transaction>>> = flow {
        val userId = supabaseClient.auth.currentUserOrNull()?.id ?: ""
        val rawCached = dao.getAll(userId).firstOrNull().orEmpty()

        // Apply filters to cached data
        val cached = applyFilters(rawCached.map { it.toDomain() }, options)
        if (cached.isNotEmpty()) {
            emit(NetworkResult.Success(cached))
        } else {
            emit(NetworkResult.Loading)
        }

        try {
            // Fetch categories for name resolution on type filtering
            val categories = supabaseClient.from("categories").select()
                .decodeList<SupabaseCategory>()
            val categoryMap = categories.associate { it.id to it.name }

            // Fetch ALL transactions — filtering is done client-side so search works
            val data = supabaseClient.from("transactions").select {
                order("date", Order.DESCENDING)
            }.decodeList<SupabaseTransaction>()

            // Map to domain with resolved category names
            val allTransactions = data.map { t ->
                Transaction(
                    id = t.id, name = t.name, description = t.description,
                    amount = t.amount, date = t.date,
                    categoryId = t.categoryId, accountId = t.accountId,
                    category = t.categoryId?.let { categoryMap[it] },
                    account = null,
                    createdAt = t.createdAt,
                )
            }

            // Apply ALL filters client-side
            val filtered = applyFilters(allTransactions, options)

            // Update cache with filtered results
            val entities = filtered.map { t ->
                TransactionEntity(
                    id = t.id, userId = userId, name = t.name,
                    description = t.description, amount = t.amount, date = t.date,
                    categoryId = t.categoryId, accountId = t.accountId,
                    categoryName = t.category, accountName = t.account,
                    createdAt = t.createdAt ?: Instant.now().toString(),
                )
            }
            if (entities.isNotEmpty()) {
                dao.upsertAll(entities)
            }
            emit(NetworkResult.Success(filtered))
        } catch (e: Exception) {
            if (cached.isEmpty()) {
                emit(NetworkResult.Error(e.message ?: "Failed to fetch transactions"))
            }
        }
    }

    override suspend fun addTransaction(request: CreateTransactionRequest): NetworkResult<Transaction> {
        return try {
            val userId = supabaseClient.auth.currentUserOrNull()?.id
                ?: return NetworkResult.Error("Not authenticated")
            val result = supabaseClient.from("transactions").insert(
                mapOf(
                    "user_id" to userId,
                    "name" to request.name,
                    "amount" to request.amount,
                    "date" to request.date,
                    "description" to request.description,
                    "category_id" to request.categoryId,
                    "account_id" to request.accountId,
                )
            ) {
                select()
            }.decodeSingle<SupabaseTransaction>()

            val entity = TransactionEntity(
                id = result.id, userId = result.userId, name = result.name,
                description = result.description, amount = result.amount, date = result.date,
                categoryId = result.categoryId, accountId = result.accountId,
                categoryName = null, accountName = null,
                createdAt = result.createdAt ?: Instant.now().toString(),
            )
            dao.upsert(entity)
            NetworkResult.Success(result.toDomain())
        } catch (e: Exception) {
            NetworkResult.Error(e.message ?: "Failed to create transaction")
        }
    }

    override suspend fun updateTransaction(id: String, request: UpdateTransactionRequest): NetworkResult<Transaction> {
        return try {
            val updates = mutableMapOf<String, Any?>()
            request.name?.let { updates["name"] = it }
            request.amount?.let { updates["amount"] = it }
            request.date?.let { updates["date"] = it }
            request.description?.let { updates["description"] = it }
            request.categoryId?.let { updates["category_id"] = it }
            request.accountId?.let { updates["account_id"] = it }

            val result = supabaseClient.from("transactions").update(updates) {
                filter { eq("id", id) }
                select()
            }.decodeSingle<SupabaseTransaction>()

            val entity = TransactionEntity(
                id = result.id, userId = result.userId, name = result.name,
                description = result.description, amount = result.amount, date = result.date,
                categoryId = result.categoryId, accountId = result.accountId,
                categoryName = null, accountName = null,
                createdAt = result.createdAt ?: Instant.now().toString(),
            )
            dao.upsert(entity)
            NetworkResult.Success(result.toDomain())
        } catch (e: Exception) {
            NetworkResult.Error(e.message ?: "Failed to update transaction")
        }
    }

    override suspend fun deleteTransaction(id: String): NetworkResult<Unit> {
        return try {
            supabaseClient.from("transactions").delete {
                filter { eq("id", id) }
            }
            dao.deleteById(id)
            NetworkResult.Success(Unit)
        } catch (e: Exception) {
            NetworkResult.Error(e.message ?: "Failed to delete transaction")
        }
    }

    override fun getRecentTransactions(limit: Int): Flow<List<Transaction>> = flow {
        val userId = supabaseClient.auth.currentUserOrNull()?.id ?: return@flow
        dao.getRecent(userId, limit).collect {
            emit(it.map { entity -> entity.toDomain() })
        }
    }

    override suspend fun getDistinctMonths(): List<String> {
        return try {
            @Serializable
            data class MonthRow(@SerialName("year_month") val yearMonth: String = "")

            val result = supabaseClient.from("transactions").select {
                // Cannot use rpc here, use distinct query instead
            }.decodeList<SupabaseTransaction>()

            // Extract unique year-month combinations from fetched data
            result.map { it.date.take(7) }
                .filter { it.length == 7 && it[4] == '-' }
                .distinct()
                .sortedDescending()
        } catch (e: Exception) {
            emptyList()
        }
    }
}

fun SupabaseTransaction.toDomain(): Transaction = Transaction(
    id = id,
    name = name,
    description = description,
    amount = amount,
    date = date,
    categoryId = categoryId,
    accountId = accountId,
    createdAt = createdAt,
)
