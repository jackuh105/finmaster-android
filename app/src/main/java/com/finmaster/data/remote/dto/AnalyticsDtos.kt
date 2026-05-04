package com.finmaster.data.remote.dto

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class TotalExpenseResponse(
    @SerialName("start_date") val startDate: String,
    @SerialName("end_date") val endDate: String,
    @SerialName("total_expense") val totalExpense: Double,
    @SerialName("transaction_count") val transactionCount: Int,
)

@Serializable
data class DailyExpenseDto(
    val date: String,
    val amount: Double,
)

@Serializable
data class DailyExpensesResponse(
    @SerialName("daily_expenses") val dailyExpenses: List<DailyExpenseDto>,
)

@Serializable
data class CategoryExpenseDto(
    val category: String,
    val amount: Double,
)

@Serializable
data class CategoryExpensesResponse(
    @SerialName("category_expenses") val categoryExpenses: List<CategoryExpenseDto>,
)

@Serializable
data class ApiError(
    val error: String,
)
