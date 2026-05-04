package com.finmaster.domain.model

data class MonthlyCategoryStat(
    val categoryName: String,
    val totalAmount: Double,
)

data class TotalExpenseData(
    val startDate: String,
    val endDate: String,
    val totalExpense: Double,
    val transactionCount: Int,
)

data class DailyExpense(
    val date: String,
    val amount: Double,
)

data class CategoryExpense(
    val category: String,
    val amount: Double,
)

data class BudgetData(
    val budget: Double,
    val updatedAt: String? = null,
)

data class BudgetUsage(
    val budget: Double,
    val spent: Double,
    val remaining: Double,
    val percentage: Double,
)
