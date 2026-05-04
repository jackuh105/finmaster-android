package com.finmaster.ui.components

import androidx.compose.animation.core.animateDpAsState
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.finmaster.ui.theme.FinColors

enum class FinButtonVariant { Default, NoShadow, Neutral, Reverse, Ghost }
enum class FinButtonSize(val height: Dp, val paddingHorizontal: Dp, val fontSize: Int) {
    Default(40.dp, 16.dp, 14),
    Small(36.dp, 12.dp, 14),
    Large(44.dp, 32.dp, 14),
    Icon(40.dp, 0.dp, 14),
}

@Composable
fun FinButton(
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    variant: FinButtonVariant = FinButtonVariant.Default,
    size: FinButtonSize = FinButtonSize.Default,
    enabled: Boolean = true,
    content: @Composable RowScope.() -> Unit,
) {
    val interactionSource = remember { MutableInteractionSource() }
    val isPressed by interactionSource.collectIsPressedAsState()
    val shadowOffset = if (isPressed && variant != FinButtonVariant.NoShadow) 0.dp else 3.dp
    val offsetX by animateDpAsState(
        if (isPressed && variant == FinButtonVariant.Default) 3.dp
        else if (isPressed && variant == FinButtonVariant.Reverse) (-3).dp
        else 0.dp
    )
    val offsetY by animateDpAsState(
        if (isPressed && variant == FinButtonVariant.Default) 3.dp
        else if (isPressed && variant == FinButtonVariant.Reverse) (-3).dp
        else 0.dp
    )

    val (bgColor, borderColor) = when (variant) {
        FinButtonVariant.Default -> FinColors.LightMain to FinColors.LightBorder
        FinButtonVariant.NoShadow -> FinColors.LightMain to FinColors.LightBorder
        FinButtonVariant.Neutral -> Color.White to FinColors.LightBorder
        FinButtonVariant.Reverse -> FinColors.LightMain to FinColors.LightBorder
        FinButtonVariant.Ghost -> Color.Transparent to Color.Transparent
    }

    Button(
        onClick = onClick,
        modifier = modifier
            .offset(x = offsetX, y = offsetY)
            .shadow(
                elevation = shadowOffset,
                shape = RoundedCornerShape(2.dp),
                ambientColor = Color.Black,
                spotColor = Color.Black,
            )
            .height(size.height),
        enabled = enabled,
        shape = RoundedCornerShape(2.dp),
        colors = ButtonDefaults.buttonColors(
            containerColor = bgColor,
            contentColor = if (variant == FinButtonVariant.Neutral) FinColors.LightText else Color.White,
            disabledContainerColor = bgColor.copy(alpha = 0.5f),
            disabledContentColor = FinColors.LightText.copy(alpha = 0.5f),
        ),
        border = if (variant != FinButtonVariant.Ghost || isPressed)
            BorderStroke(2.dp, if (variant == FinButtonVariant.Ghost) FinColors.LightBorder else borderColor)
        else null,
        contentPadding = PaddingValues(horizontal = size.paddingHorizontal, vertical = 0.dp),
        interactionSource = interactionSource,
    ) {
        CompositionLocalProvider(
            LocalTextStyle provides TextStyle(
                fontSize = size.fontSize.sp,
                fontWeight = FontWeight.Medium,
            ),
        ) {
            content()
        }
    }
}
