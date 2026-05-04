package com.finmaster.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.finmaster.ui.theme.FinColors

enum class FinBadgeVariant { Default, Neutral }

@Composable
fun FinBadge(
    text: String,
    modifier: Modifier = Modifier,
    variant: FinBadgeVariant = FinBadgeVariant.Default,
    onClick: (() -> Unit)? = null,
) {
    val bgColor = when (variant) {
        FinBadgeVariant.Default -> FinColors.LightMain
        FinBadgeVariant.Neutral -> MaterialTheme.colorScheme.surface
    }
    val textColor = when (variant) {
        FinBadgeVariant.Default -> FinColors.LightText
        FinBadgeVariant.Neutral -> MaterialTheme.colorScheme.onSurface
    }

    Surface(
        modifier = modifier.then(
            if (onClick != null) Modifier.clickable { onClick() } else Modifier
        ),
        shape = RoundedCornerShape(2.dp),
        color = bgColor,
        border = BorderStroke(2.dp, FinColors.LightBorder),
    ) {
        Text(
            text = text,
            modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp),
            fontSize = 12.sp,
            fontWeight = FontWeight.Medium,
            color = textColor,
        )
    }
}
