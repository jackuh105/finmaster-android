package com.finmaster.util

import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.time.temporal.ChronoUnit

object DateUtils {
    fun today(): String = LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE)

    fun currentMonthStart(): String = LocalDate.now().withDayOfMonth(1).format(DateTimeFormatter.ISO_LOCAL_DATE)

    fun currentMonthEnd(): String = LocalDate.now().withDayOfMonth(
        LocalDate.now().lengthOfMonth()
    ).format(DateTimeFormatter.ISO_LOCAL_DATE)

    fun daysAgo(days: Int): String = LocalDate.now().minusDays(days.toLong()).format(DateTimeFormatter.ISO_LOCAL_DATE)

    fun formatDate(date: String): String {
        return try {
            val parsed = LocalDate.parse(date)
            parsed.format(DateTimeFormatter.ofPattern("MMM d, yyyy"))
        } catch (e: Exception) {
            date
        }
    }

    fun generatePeriodicDates(
        startDate: String,
        endDate: String,
        periodType: com.finmaster.domain.model.PeriodType,
        expenseDay: com.finmaster.domain.model.ExpenseDay,
    ): List<String> {
        val start = LocalDate.parse(startDate)
        val end = LocalDate.parse(endDate)
        val dates = mutableListOf<LocalDate>()
        var current = start

        while (!current.isAfter(end)) {
            val match = when (expenseDay) {
                is com.finmaster.domain.model.ExpenseDay.DayOfWeek ->
                    current.dayOfWeek.value == expenseDay.day % 7 + 1
                is com.finmaster.domain.model.ExpenseDay.DayOfMonth ->
                    current.dayOfMonth == expenseDay.day
                is com.finmaster.domain.model.ExpenseDay.DayOfYear ->
                    current.monthValue == expenseDay.month + 1 && current.dayOfMonth == expenseDay.day
            }

            if (match) {
                dates.add(current)
            }

            current = when (periodType) {
                com.finmaster.domain.model.PeriodType.Weekly -> current.plusDays(1)
                com.finmaster.domain.model.PeriodType.Monthly -> current.plusDays(1)
                com.finmaster.domain.model.PeriodType.Yearly -> current.plusDays(1)
            }
        }

        return dates.map { it.format(DateTimeFormatter.ISO_LOCAL_DATE) }
    }
}
