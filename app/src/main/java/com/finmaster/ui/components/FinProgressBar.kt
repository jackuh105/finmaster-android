package com.finmaster.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.finmaster.ui.theme.FinColors

@Composable
fun FinProgressBar(
    value: Float,
    modifier: Modifier = Modifier,
) {
    val barColor = when {
        value < 30f -> FinColors.Success
        value < 60f -> FinColors.Warning
        else -> FinColors.Alert
    }

    Box(
        modifier = modifier
            .fillMaxWidth()
            .height(16.dp)
            .clip(RoundedCornerShape(2.dp))
            .background(MaterialTheme.colorScheme.surface),
    ) {
        LinearProgressIndicator(
            progress = value / 100f,
            modifier = Modifier.fillMaxSize(),
            color = barColor,
            trackColor = Color.White,
        )
    }
}
