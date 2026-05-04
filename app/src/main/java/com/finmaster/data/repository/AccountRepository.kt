package com.finmaster.data.repository

import com.finmaster.domain.model.Account
import com.finmaster.domain.model.NetworkResult
import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.gotrue.auth
import io.github.jan.supabase.postgrest.from
import io.github.jan.supabase.postgrest.query.Order
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import javax.inject.Inject
import javax.inject.Singleton

@Serializable
data class SupabaseAccount(
    val id: String = "",
    @SerialName("user_id") val userId: String = "",
    val name: String = "",
    @SerialName("is_preset") val isPreset: Boolean = false,
    @SerialName("created_at") val createdAt: String = "",
)

interface AccountRepository {
    fun getAccounts(): Flow<NetworkResult<List<Account>>>
    suspend fun addAccount(name: String): NetworkResult<Account>
    suspend fun updateAccount(id: String, name: String): NetworkResult<Account>
    suspend fun deleteAccount(id: String): NetworkResult<Unit>
}

@Singleton
class AccountRepositoryImpl @Inject constructor(
    private val supabaseClient: SupabaseClient,
) : AccountRepository {

    override fun getAccounts(): Flow<NetworkResult<List<Account>>> = flow {
        emit(NetworkResult.Loading)
        try {
            val data = supabaseClient.from("accounts").select {
                order("created_at", Order.ASCENDING)
            }.decodeList<SupabaseAccount>()
            val accounts = data.map { Account(it.id, it.userId, it.name, it.isPreset, it.createdAt) }
            emit(NetworkResult.Success(accounts))
        } catch (e: Exception) {
            emit(NetworkResult.Error(e.message ?: "Failed to fetch accounts"))
        }
    }

    override suspend fun addAccount(name: String): NetworkResult<Account> {
        return try {
            val userId = supabaseClient.auth.currentUserOrNull()?.id
                ?: return NetworkResult.Error("Not authenticated")
            val data = supabaseClient.from("accounts").insert(mapOf("name" to name, "user_id" to userId)) {
                select()
            }.decodeSingle<SupabaseAccount>()
            NetworkResult.Success(Account(data.id, data.userId, data.name, data.isPreset, data.createdAt))
        } catch (e: Exception) {
            NetworkResult.Error(e.message ?: "Failed to create account")
        }
    }

    override suspend fun updateAccount(id: String, name: String): NetworkResult<Account> {
        return try {
            val data = supabaseClient.from("accounts").update(mapOf("name" to name)) {
                filter { eq("id", id) }
                select()
            }.decodeSingle<SupabaseAccount>()
            NetworkResult.Success(Account(data.id, data.userId, data.name, data.isPreset, data.createdAt))
        } catch (e: Exception) {
            NetworkResult.Error(e.message ?: "Failed to update account")
        }
    }

    override suspend fun deleteAccount(id: String): NetworkResult<Unit> {
        return try {
            supabaseClient.from("accounts").delete { filter { eq("id", id) } }
            NetworkResult.Success(Unit)
        } catch (e: Exception) {
            NetworkResult.Error(e.message ?: "Failed to delete account")
        }
    }
}
