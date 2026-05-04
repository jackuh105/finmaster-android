package com.finmaster.data.remote.dto

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class AccountsResponse(
    val accounts: List<AccountDto>,
)

@Serializable
data class AccountDto(
    val id: String,
    @SerialName("user_id") val userId: String,
    val name: String,
    @SerialName("is_preset") val isPreset: Boolean = false,
    @SerialName("created_at") val createdAt: String,
)

@Serializable
data class CreateAccountRequest(val name: String)

@Serializable
data class UpdateAccountRequest(val name: String)

@Serializable
data class AccountResponse(val account: AccountDto)

@Serializable
data class CategoriesResponse(
    val categories: List<CategoryDto>,
)

@Serializable
data class CategoryDto(
    val id: String,
    @SerialName("user_id") val userId: String,
    val name: String,
    @SerialName("is_preset") val isPreset: Boolean = false,
    @SerialName("created_at") val createdAt: String,
)

@Serializable
data class CreateCategoryRequest(val name: String)

@Serializable
data class UpdateCategoryRequest(val name: String)

@Serializable
data class CategoryResponse(val category: CategoryDto)
