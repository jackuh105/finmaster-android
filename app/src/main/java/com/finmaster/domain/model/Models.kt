package com.finmaster.domain.model

data class Transaction(
    val id: String,
    val name: String,
    val description: String? = null,
    val category: String? = null,
    val account: String? = null,
    val amount: Double,
    val date: String,
    val categoryId: String? = null,
    val accountId: String? = null,
    val createdAt: String? = null,
)

data class Account(
    val id: String,
    val userId: String,
    val name: String,
    val isPreset: Boolean = false,
    val createdAt: String,
)

data class Category(
    val id: String,
    val userId: String,
    val name: String,
    val isPreset: Boolean = false,
    val createdAt: String,
)

data class ItemTag(
    val id: String,
    val userId: String,
    val name: String,
    val createdAt: String,
)

data class UserSettings(
    val userId: String,
    val budget: Double?,
    val defaultCategoryId: String? = null,
    val defaultAccountId: String? = null,
    val updatedAt: String? = null,
)

data class ApiKey(
    val id: String,
    val userId: String,
    val name: String,
    val keyPrefix: String,
    val privileges: ApiKeyPrivileges,
    val createdAt: String,
    val lastUsedAt: String? = null,
)

data class ApiKeyPrivileges(
    val read: Boolean = true,
    val create: Boolean = false,
    val update: Boolean = false,
    val delete: Boolean = false,
)

sealed class NetworkResult<out T> {
    data class Success<T>(val data: T) : NetworkResult<T>()
    data class Error(val message: String, val code: Int? = null) : NetworkResult<Nothing>()
    data object Loading : NetworkResult<Nothing>()
}
