package com.finmaster.data.repository

import com.finmaster.domain.model.BudgetData
import com.finmaster.domain.model.BudgetUsage
import com.finmaster.domain.model.NetworkResult
import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.gotrue.auth
import io.github.jan.supabase.postgrest.from
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import javax.inject.Inject
import javax.inject.Singleton

@Serializable
data class SupabaseUserSettings(
    @SerialName("user_id") val userId: String = "",
    val budget: Double? = null,
    @SerialName("default_category_id") val defaultCategoryId: String? = null,
    @SerialName("default_account_id") val defaultAccountId: String? = null,
    @SerialName("updated_at") val updatedAt: String? = null,
)

interface BudgetRepository {
    suspend fun getBudget(): NetworkResult<BudgetData>
    suspend fun updateBudget(amount: Double): NetworkResult<BudgetData>
    suspend fun getBudgetUsage(): NetworkResult<BudgetUsage>
}

@Singleton
class BudgetRepositoryImpl @Inject constructor(
    private val supabaseClient: SupabaseClient,
) : BudgetRepository {

    override suspend fun getBudget(): NetworkResult<BudgetData> {
        return try {
            val userId = supabaseClient.auth.currentUserOrNull()?.id
                ?: return NetworkResult.Error("Not authenticated")
            val data = supabaseClient.from("user_settings")
                .select { filter { eq("user_id", userId) } }
                .decodeList<SupabaseUserSettings>()
                .firstOrNull()
            val budget = data?.budget ?: 0.0
            NetworkResult.Success(BudgetData(budget, data?.updatedAt))
        } catch (e: Exception) {
            NetworkResult.Error(e.message ?: "Failed to fetch budget")
        }
    }

    override suspend fun updateBudget(amount: Double): NetworkResult<BudgetData> {
        return try {
            val userId = supabaseClient.auth.currentUserOrNull()?.id
                ?: return NetworkResult.Error("Not authenticated")
            val now = java.time.Instant.now().toString()
            supabaseClient.from("user_settings").upsert(
                mapOf(
                    "user_id" to userId,
                    "budget" to amount,
                    "updated_at" to now,
                )
            )
            NetworkResult.Success(BudgetData(amount, now))
        } catch (e: Exception) {
            NetworkResult.Error(e.message ?: "Failed to update budget")
        }
    }

    override suspend fun getBudgetUsage(): NetworkResult<BudgetUsage> {
        return try {
            val budgetResult = getBudget()
            val budget = when (budgetResult) {
                is NetworkResult.Success -> budgetResult.data.budget
                else -> 0.0
            }

            val startDate = LocalDate.now().withDayOfMonth(1).format(DateTimeFormatter.ISO_LOCAL_DATE)
            val endDate = LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE)

            val data = supabaseClient.from("transactions").select()
                .decodeList<SupabaseTransaction>()

            val spent = data
                .filter { it.date >= startDate && it.date <= endDate }
                .sumOf { it.amount }
            val remaining = budget - spent
            val percentage = if (budget > 0) (spent / budget) * 100.0 else 0.0

            NetworkResult.Success(BudgetUsage(budget, spent, remaining, percentage))
        } catch (e: Exception) {
            NetworkResult.Error(e.message ?: "Failed to fetch budget usage")
        }
    }
}
