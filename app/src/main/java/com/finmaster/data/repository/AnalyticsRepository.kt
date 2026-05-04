package com.finmaster.data.repository

import com.finmaster.domain.model.*
import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.postgrest.from
import io.github.jan.supabase.postgrest.query.Order
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import javax.inject.Inject
import javax.inject.Singleton

@Serializable
data class SupabaseMonthlyCategoryStat(
    @SerialName("category_name") val categoryName: String = "",
    @SerialName("total_amount") val totalAmount: Double = 0.0,
)

@Serializable
data class SupabaseDailyExpense(
    val date: String = "",
    val amount: Double = 0.0,
)

interface AnalyticsRepository {
    suspend fun getTotalExpense(startDate: String, endDate: String): NetworkResult<TotalExpenseData>
    suspend fun getDailyExpenses(startDate: String, endDate: String): NetworkResult<List<DailyExpense>>
    suspend fun getCategoryExpenses(startDate: String, endDate: String): NetworkResult<List<CategoryExpense>>
}

@Singleton
class AnalyticsRepositoryImpl @Inject constructor(
    private val supabaseClient: SupabaseClient,
) : AnalyticsRepository {

    override suspend fun getTotalExpense(startDate: String, endDate: String): NetworkResult<TotalExpenseData> {
        return try {
            val data = supabaseClient.from("transactions").select()
                .decodeList<SupabaseTransaction>()
            val filtered = data.filter { it.date >= startDate && it.date <= endDate }
            val total = filtered.sumOf { it.amount }
            NetworkResult.Success(TotalExpenseData(startDate, endDate, total, filtered.size))
        } catch (e: Exception) {
            NetworkResult.Error(e.message ?: "Failed to fetch analytics")
        }
    }

    override suspend fun getDailyExpenses(startDate: String, endDate: String): NetworkResult<List<DailyExpense>> {
        return try {
            val data = supabaseClient.from("transactions").select {
                order("date", Order.ASCENDING)
            }.decodeList<SupabaseDailyExpense>()
            val filtered = data.filter { it.date >= startDate && it.date <= endDate }
            val grouped = filtered.groupBy { it.date }.map { (date, items) ->
                DailyExpense(date, items.sumOf { it.amount })
            }
            NetworkResult.Success(grouped)
        } catch (e: Exception) {
            NetworkResult.Error(e.message ?: "Failed to fetch daily expenses")
        }
    }

    override suspend fun getCategoryExpenses(startDate: String, endDate: String): NetworkResult<List<CategoryExpense>> {
        return try {
            // Fetch categories for name resolution
            val categories = supabaseClient.from("categories").select()
                .decodeList<SupabaseCategory>()
            val categoryMap = categories.associate { it.id to it.name }

            // Fetch transactions
            val transactions = supabaseClient.from("transactions").select()
                .decodeList<SupabaseTransaction>()
            val filtered = transactions.filter { it.date >= startDate && it.date <= endDate }

            // Group by categoryId and resolve real names
            val grouped = filtered.groupBy { it.categoryId }
                .map { (categoryId, items) ->
                    val name = categoryId?.let { categoryMap[it] } ?: "Uncategorized"
                    CategoryExpense(name, items.sumOf { it.amount })
                }
            NetworkResult.Success(grouped)
        } catch (e: Exception) {
            NetworkResult.Error(e.message ?: "Failed to fetch category expenses")
        }
    }
}
