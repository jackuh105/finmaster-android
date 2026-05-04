package com.finmaster.data.repository

import com.finmaster.domain.model.Category
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
data class SupabaseCategory(
    val id: String = "",
    @SerialName("user_id") val userId: String = "",
    val name: String = "",
    @SerialName("is_preset") val isPreset: Boolean = false,
    @SerialName("created_at") val createdAt: String = "",
)

interface CategoryRepository {
    fun getCategories(): Flow<NetworkResult<List<Category>>>
    suspend fun addCategory(name: String): NetworkResult<Category>
    suspend fun updateCategory(id: String, name: String): NetworkResult<Category>
    suspend fun deleteCategory(id: String): NetworkResult<Unit>
}

@Singleton
class CategoryRepositoryImpl @Inject constructor(
    private val supabaseClient: SupabaseClient,
) : CategoryRepository {

    override fun getCategories(): Flow<NetworkResult<List<Category>>> = flow {
        emit(NetworkResult.Loading)
        try {
            val data = supabaseClient.from("categories").select {
                order("created_at", Order.ASCENDING)
            }.decodeList<SupabaseCategory>()
            val categories = data.map { Category(it.id, it.userId, it.name, it.isPreset, it.createdAt) }
            emit(NetworkResult.Success(categories))
        } catch (e: Exception) {
            emit(NetworkResult.Error(e.message ?: "Failed to fetch categories"))
        }
    }

    override suspend fun addCategory(name: String): NetworkResult<Category> {
        return try {
            val userId = supabaseClient.auth.currentUserOrNull()?.id
                ?: return NetworkResult.Error("Not authenticated")
            val data = supabaseClient.from("categories").insert(mapOf("name" to name, "user_id" to userId)) {
                select()
            }.decodeSingle<SupabaseCategory>()
            NetworkResult.Success(Category(data.id, data.userId, data.name, data.isPreset, data.createdAt))
        } catch (e: Exception) {
            NetworkResult.Error(e.message ?: "Failed to create category")
        }
    }

    override suspend fun updateCategory(id: String, name: String): NetworkResult<Category> {
        return try {
            val data = supabaseClient.from("categories").update(mapOf("name" to name)) {
                filter { eq("id", id) }
                select()
            }.decodeSingle<SupabaseCategory>()
            NetworkResult.Success(Category(data.id, data.userId, data.name, data.isPreset, data.createdAt))
        } catch (e: Exception) {
            NetworkResult.Error(e.message ?: "Failed to update category")
        }
    }

    override suspend fun deleteCategory(id: String): NetworkResult<Unit> {
        return try {
            supabaseClient.from("categories").delete { filter { eq("id", id) } }
            NetworkResult.Success(Unit)
        } catch (e: Exception) {
            NetworkResult.Error(e.message ?: "Failed to delete category")
        }
    }
}
