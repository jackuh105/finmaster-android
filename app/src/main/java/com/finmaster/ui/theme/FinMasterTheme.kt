package com.finmaster.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val LightColorScheme = lightColorScheme(
    primary = FinColors.LightMain,
    onPrimary = FinColors.LightText,
    secondary = FinColors.LightSecondary,
    background = FinColors.LightBg,
    surface = FinColors.LightSecondaryBg,
    onBackground = FinColors.LightText,
    onSurface = FinColors.LightText,
    outline = FinColors.LightBorder,
    error = FinColors.Alert,
)

private val DarkColorScheme = darkColorScheme(
    primary = FinColors.LightMain,
    onPrimary = FinColors.DarkText,
    secondary = FinColors.LightSecondary,
    background = FinColors.DarkBg,
    surface = FinColors.DarkSecondaryBg,
    onBackground = FinColors.DarkText,
    onSurface = FinColors.DarkText,
    outline = FinColors.DarkBorder,
    error = FinColors.Alert,
)

@Composable
fun FinMasterTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

    MaterialTheme(
        colorScheme = colorScheme,
        typography = FinTypographySet,
        shapes = FinShapesSet,
        content = content
    )
}
