package com.finmaster.ui.theme

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

@Composable
fun GridBackground(modifier: Modifier = Modifier) {
    val isDark = isSystemInDarkTheme()
    Canvas(modifier = modifier.fillMaxSize()) {
        val gridSize = 70.dp.toPx()
        val gridColor = if (isDark) {
            Color.White.copy(alpha = 0.1f)
        } else {
            Color.Black.copy(alpha = 0.1f)
        }
        val strokeWidth = 1.dp.toPx()

        var x = 0f
        while (x < size.width) {
            drawLine(gridColor, Offset(x, 0f), Offset(x, size.height), strokeWidth)
            x += gridSize
        }
        var y = 0f
        while (y < size.height) {
            drawLine(gridColor, Offset(0f, y), Offset(size.width, y), strokeWidth)
            y += gridSize
        }
    }
}
