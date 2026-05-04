package com.finmaster.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.finmaster.ui.theme.FinColors

enum class FinCardVariant { Default, Inner }

@Composable
fun FinCard(
    modifier: Modifier = Modifier,
    variant: FinCardVariant = FinCardVariant.Default,
    header: @Composable (() -> Unit)? = null,
    content: @Composable () -> Unit,
) {
    val bgColor = when (variant) {
        FinCardVariant.Default -> MaterialTheme.colorScheme.surface
        FinCardVariant.Inner -> MaterialTheme.colorScheme.background
    }
    Card(
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(2.dp),
        colors = CardDefaults.cardColors(containerColor = bgColor),
        border = BorderStroke(2.dp, FinColors.LightBorder),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp),
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            header?.invoke()
            content()
        }
    }
}

@Composable
fun FinCardTitle(text: String) {
    Text(
        text = text,
        fontSize = 18.sp,
        fontWeight = FontWeight.Bold,
        color = MaterialTheme.colorScheme.onSurface,
    )
}

@Composable
fun FinCardDescription(text: String) {
    Text(
        text = text,
        fontSize = 14.sp,
        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f),
    )
}

@Composable
fun FinCardHeader(
    title: String,
    description: String? = null,
) {
    Column {
        FinCardTitle(title)
        if (description != null) {
            Spacer(modifier = Modifier.height(4.dp))
            FinCardDescription(description)
        }
    }
}
