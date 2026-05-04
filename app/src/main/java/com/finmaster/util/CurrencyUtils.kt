package com.finmaster.util

import java.text.NumberFormat
import java.util.Locale

object CurrencyUtils {
    fun format(amount: Double, currency: String = "MOP"): String {
        val format = NumberFormat.getNumberInstance(Locale.US)
        format.minimumFractionDigits = 2
        format.maximumFractionDigits = 2
        return "${format.format(amount)} $currency"
    }

    fun formatShort(amount: Double): String {
        val format = NumberFormat.getNumberInstance(Locale.US)
        format.minimumFractionDigits = 2
        format.maximumFractionDigits = 2
        return format.format(amount)
    }

    fun formatPercentage(value: Double): String {
        return String.format("%.2f%%", value)
    }
}
