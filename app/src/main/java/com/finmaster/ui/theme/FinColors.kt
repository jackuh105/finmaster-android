package com.finmaster.ui.theme

import androidx.compose.ui.graphics.Color

object FinColors {
    // Light theme
    val LightMain = Color(0xFFFF7A05)
    val LightBg = Color(0xFFFFEDD6)
    val LightSecondaryBg = Color(0xFFFFFFFF)
    val LightText = Color(0xFF402E32)
    val LightBorder = Color(0xFF000000)
    val LightOverlay = Color(0xCC000000)
    val LightSecondary = Color(0xFFA1714F)
    val LightMainAccent = Color(0xFF005247)

    // Dark theme
    val DarkBg = Color(0xFF322215)
    val DarkSecondaryBg = Color(0xFF212121)
    val DarkText = Color(0xFFEEEFE9)
    val DarkBorder = Color(0xFF000000)

    // Status colors
    val Alert = Color(0xFFF34257)
    val Warning = Color(0xFFFDC045)
    val Success = Color(0xFF009141)

    // Chart colors (light)
    val Chart1 = Color(0xFFF28B82)
    val Chart2 = Color(0xFF81C995)
    val Chart3 = Color(0xFF8AB4F8)
    val Chart4 = Color(0xFFFDD663)
    val Chart5 = Color(0xFFFFB74D)

    val ChartColors = listOf(Chart1, Chart2, Chart3, Chart4, Chart5)

    // Chart colors (dark)
    val DarkChart1 = Color(0xFF3B6FD4)
    val DarkChart2 = Color(0xFF2EA87A)
    val DarkChart3 = Color(0xFFD97A2B)
    val DarkChart4 = Color(0xFF9B59B6)
    val DarkChart5 = Color(0xFFE0557B)

    val DarkChartColors = listOf(DarkChart1, DarkChart2, DarkChart3, DarkChart4, DarkChart5)
}
