package com.finmaster.ui.dashboard

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.nativeCanvas
import androidx.compose.ui.unit.dp
import com.finmaster.ui.theme.FinColors
import kotlin.math.cos
import kotlin.math.min
import kotlin.math.sin

data class PieSlice(
    val label: String,
    val value: Double,
    val color: Color,
)

@Composable
fun SpendingPieChart(
    slices: List<PieSlice>,
    modifier: Modifier = Modifier,
) {
    if (slices.isEmpty()) return

    val total = slices.sumOf { it.value }
    val chartColors = if (slices.size <= FinColors.ChartColors.size) {
        FinColors.ChartColors
    } else {
        FinColors.ChartColors + FinColors.ChartColors
    }

    val coloredSlices = slices.mapIndexed { index, slice ->
        slice.copy(color = chartColors[index % chartColors.size])
    }

    Column(modifier = modifier) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .aspectRatio(1f)
                .padding(16.dp),
        ) {
            Canvas(modifier = Modifier.fillMaxSize()) {
                val canvasWidth = size.width
                val canvasHeight = size.height
                val diameter = min(canvasWidth, canvasHeight) * 0.7f
                val radius = diameter / 2f
                val centerX = canvasWidth / 2f
                val centerY = canvasHeight / 2f
                val innerRadius = radius * 0.55f
                val strokeWidth = 2.dp.toPx()

                var startAngle = -90f

                coloredSlices.forEach { slice ->
                    if (slice.value > 0) {
                        val sweepAngle = ((slice.value / total) * 360.0).toFloat()
                        drawArc(
                            color = slice.color,
                            startAngle = startAngle,
                            sweepAngle = sweepAngle,
                            useCenter = true,
                            topLeft = Offset(centerX - radius, centerY - radius),
                            size = Size(diameter, diameter),
                            style = androidx.compose.ui.graphics.drawscope.Fill,
                        )
                        drawArc(
                            color = Color.Black,
                            startAngle = startAngle,
                            sweepAngle = sweepAngle,
                            useCenter = true,
                            topLeft = Offset(centerX - radius, centerY - radius),
                            size = Size(diameter, diameter),
                            style = Stroke(width = strokeWidth),
                        )
                        startAngle += sweepAngle
                    }
                }

                // Draw inner circle (donut hole)
                drawCircle(
                    color = Color.White,
                    radius = innerRadius,
                    center = Offset(centerX, centerY),
                )
                drawCircle(
                    color = Color.Black,
                    radius = innerRadius,
                    center = Offset(centerX, centerY),
                    style = Stroke(width = strokeWidth),
                )

                // Draw center text
                val textPaint = android.graphics.Paint().apply {
                    color = android.graphics.Color.BLACK
                    textAlign = android.graphics.Paint.Align.CENTER
                    isAntiAlias = true
                }
                textPaint.textSize = 24.dp.toPx()
                drawContext.canvas.nativeCanvas.drawText(
                    "Total",
                    centerX,
                    centerY - 8.dp.toPx(),
                    textPaint,
                )
                textPaint.textSize = 28.dp.toPx()
                textPaint.isFakeBoldText = true
                drawContext.canvas.nativeCanvas.drawText(
                    formatAmount(total),
                    centerX,
                    centerY + 24.dp.toPx(),
                    textPaint,
                )
            }
        }

        // Legend
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(6.dp),
        ) {
            coloredSlices.filter { it.value > 0 }.forEach { slice ->
                val pct = ((slice.value / total) * 100).toInt()
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                ) {
                    androidx.compose.material3.Text(
                        text = "● ${slice.label}",
                        color = slice.color,
                        style = androidx.compose.material3.MaterialTheme.typography.bodyMedium,
                    )
                    androidx.compose.material3.Text(
                        text = "${formatAmount(slice.value)} ($pct%)",
                        style = androidx.compose.material3.MaterialTheme.typography.bodyMedium,
                        color = androidx.compose.material3.MaterialTheme.colorScheme.onSurface,
                    )
                }
            }
        }
    }
}

private fun formatAmount(value: Double): String {
    return if (value >= 1000000) {
        "%.1fM".format(value / 1000000)
    } else if (value >= 1000) {
        "%.1fK".format(value / 1000)
    } else {
        "%.0f".format(value)
    }
}
