package com.finmaster.data.remote.dto

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class TransactionsResponse(
    val transactions: List<TransactionDto>,
    val pagination: PaginationInfo,
)

@Serializable
data class TransactionDto(
    val id: String,
    val name: String,
    val description: String? = null,
    val amount: Double,
    val date: String,
    val category: String? = null,
    val account: String? = null,
    @SerialName("category_id") val categoryId: String? = null,
    @SerialName("account_id") val accountId: String? = null,
    @SerialName("created_at") val createdAt: String? = null,
) {
    fun toDomain() = com.finmaster.domain.model.Transaction(
        id = id,
        name = name,
        description = description,
        category = category,
        account = account,
        amount = amount,
        date = date,
        categoryId = categoryId,
        accountId = accountId,
        createdAt = createdAt,
    )
}

@Serializable
data class PaginationInfo(
    val total: Int,
    val limit: Int,
    val offset: Int,
)

@Serializable
data class CreateTransactionRequest(
    val name: String,
    val amount: Double,
    val date: String,
    val description: String? = null,
    @SerialName("category_id") val categoryId: String? = null,
    @SerialName("account_id") val accountId: String? = null,
)

@Serializable
data class UpdateTransactionRequest(
    val name: String? = null,
    val amount: Double? = null,
    val date: String? = null,
    val description: String? = null,
    @SerialName("category_id") val categoryId: String? = null,
    @SerialName("account_id") val accountId: String? = null,
)

@Serializable
data class TransactionResponse(
    val transaction: TransactionDto,
)

@Serializable
data class DeleteResponse(
    val message: String,
)
