package com.finmaster.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.finmaster.ui.theme.FinColors

@Composable
fun FinDialog(
    open: Boolean,
    onDismiss: () -> Unit,
    title: String,
    description: String? = null,
    confirmButton: @Composable (() -> Unit)? = null,
    dismissButton: @Composable (() -> Unit)? = null,
    content: @Composable (() -> Unit)? = null,
) {
    if (open) {
        AlertDialog(
            onDismissRequest = onDismiss,
            title = {
                Column {
                    Text(title)
                    if (description != null) {
                        Text(
                            text = description,
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f),
                        )
                    }
                }
            },
            text = content?.let { { it() } },
            confirmButton = {
                confirmButton?.invoke()
            },
            dismissButton = {
                dismissButton?.invoke()
            },
            containerColor = MaterialTheme.colorScheme.surface,
            shape = MaterialTheme.shapes.small,
            tonalElevation = 0.dp,
        )
    }
}
