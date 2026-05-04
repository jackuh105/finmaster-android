package com.finmaster.data.remote.dto

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class BudgetResponse(
    val budget: Double,
    @SerialName("updated_at") val updatedAt: String? = null,
)

@Serializable
data class UpdateBudgetRequest(val budget: Double)

@Serializable
data class BudgetUsageResponse(
    val budget: Double,
    val spent: Double,
    val remaining: Double,
    val percentage: Double,
)
