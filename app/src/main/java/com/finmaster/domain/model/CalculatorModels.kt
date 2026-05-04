package com.finmaster.domain.model

data class CurrencyRow(
    val currency: String,
    val buyRate: Double,
    val sellRate: Double,
    val interestRate: Double,
    val isBase: Boolean = false,
)

data class CurrencyResult(
    val currency: String,
    val interest: Double,
    val equivalent: Double,
    val difference: Double,
)

data class CompoundInterestRow(
    val year: Int,
    val annualInvested: Double,
    val cumulativeInvested: Double,
    val profit: Double,
    val totalAmount: Double,
    val presentValue: Double,
    val roi: Double,
)

data class FreedomPointResult(
    val monthlyReturnRate: Double,
    val freedomPointAsset: Double,
)

data class MortgageResult(
    val loanAmount: Double,
    val monthlyPayment: Double,
    val totalInterest: Double,
)

data class MortgageYearRow(
    val year: Int,
    val principalPaid: Double,
    val interestPaid: Double,
    val balance: Double,
    val totalPaid: Double,
    val principalRatio: Double,
    val interestRatio: Double,
)

enum class PeriodType { Weekly, Monthly, Yearly }

sealed class ExpenseDay {
    data class DayOfWeek(val day: Int) : ExpenseDay()
    data class DayOfMonth(val day: Int) : ExpenseDay()
    data class DayOfYear(val month: Int, val day: Int) : ExpenseDay()
}
