package com.finmaster.ui.theme

import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Shapes
import androidx.compose.ui.unit.dp

object FinShapes {
    val Base = RoundedCornerShape(2.dp)
    val Circle = RoundedCornerShape(50)
}

val FinShapesSet = Shapes(
    extraSmall = FinShapes.Base,
    small = FinShapes.Base,
    medium = FinShapes.Base,
    large = FinShapes.Base,
    extraLarge = FinShapes.Base,
)
