package com.finmaster.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.finmaster.ui.theme.FinColors

@Composable
fun FinTextField(
    value: String,
    onValueChange: (String) -> Unit,
    modifier: Modifier = Modifier,
    label: String? = null,
    placeholder: String? = null,
    keyboardOptions: KeyboardOptions = KeyboardOptions.Default,
    enabled: Boolean = true,
    isError: Boolean = false,
    singleLine: Boolean = true,
    visualTransformation: VisualTransformation = VisualTransformation.None,
    leadingIcon: @Composable (() -> Unit)? = null,
    trailingIcon: @Composable (() -> Unit)? = null,
) {
    OutlinedTextField(
        value = value,
        onValueChange = onValueChange,
        modifier = modifier.fillMaxWidth(),
        enabled = enabled,
        isError = isError,
        singleLine = singleLine,
        visualTransformation = visualTransformation,
        label = label?.let {
            { Text(it, fontSize = 14.sp, fontWeight = FontWeight.Medium) }
        },
        placeholder = placeholder?.let {
            { Text(it, fontSize = 16.sp) }
        },
        leadingIcon = leadingIcon,
        trailingIcon = trailingIcon,
        keyboardOptions = keyboardOptions,
        shape = RoundedCornerShape(2.dp),
        colors = OutlinedTextFieldDefaults.colors(
            focusedBorderColor = FinColors.LightBorder,
            unfocusedBorderColor = FinColors.LightBorder,
            disabledBorderColor = FinColors.LightBorder.copy(alpha = 0.5f),
            errorBorderColor = FinColors.Alert,
            focusedContainerColor = Color.White,
            unfocusedContainerColor = Color.White,
            cursorColor = FinColors.LightBorder,
            focusedLabelColor = FinColors.LightText,
        ),
        textStyle = MaterialTheme.typography.bodyLarge.copy(
            color = MaterialTheme.colorScheme.onSurface,
        ),
    )
}
