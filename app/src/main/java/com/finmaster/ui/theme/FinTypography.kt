package com.finmaster.ui.theme

import androidx.compose.material3.Typography
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp

object FinTypography {
    val Heading = TextStyle(fontWeight = FontWeight.Bold, fontSize = 18.sp)
    val Title = TextStyle(fontWeight = FontWeight.Bold, fontSize = 24.sp)
    val Body = TextStyle(fontWeight = FontWeight.Medium, fontSize = 16.sp)
    val Label = TextStyle(fontWeight = FontWeight.Medium, fontSize = 14.sp)
    val Badge = TextStyle(fontWeight = FontWeight.Medium, fontSize = 12.sp)
    val Small = TextStyle(fontWeight = FontWeight.Medium, fontSize = 12.sp)
}

val FinTypographySet = Typography(
    bodyLarge = FinTypography.Body,
    bodyMedium = FinTypography.Label,
    titleLarge = FinTypography.Title,
    titleMedium = FinTypography.Heading,
    labelSmall = FinTypography.Badge,
    labelMedium = FinTypography.Label,
)
