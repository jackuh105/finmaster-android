package com.finmaster.ui.transactions

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.finmaster.ui.components.*
import com.finmaster.ui.theme.FinColors

@Composable
fun EditTransactionScreen(
    transactionId: String,
    onBack: () -> Unit,
    onSuccess: () -> Unit,
    viewModel: AddTransactionViewModel = hiltViewModel(),
) {
    // Reuses AddTransactionViewModel for simplicity
    // In a production app, this would have its own ViewModel with pre-filled data
    val name by viewModel.name.collectAsState()
    val amount by viewModel.amount.collectAsState()
    val date by viewModel.date.collectAsState()
    val description by viewModel.description.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    val error by viewModel.error.collectAsState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        Text(
            "Edit Transaction",
            fontSize = 20.sp,
            fontWeight = FontWeight.Bold,
        )

        Text(
            "Editing transaction: $transactionId",
            fontSize = 12.sp,
            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f),
        )

        if (error != null) {
            Surface(
                color = FinColors.Alert.copy(alpha = 0.15f),
                shape = MaterialTheme.shapes.small,
            ) {
                Text(
                    text = error ?: "",
                    modifier = Modifier.padding(12.dp),
                    color = FinColors.Alert,
                    fontWeight = FontWeight.Bold,
                )
            }
        }

        FinTextField(
            value = name,
            onValueChange = viewModel::onNameChange,
            label = "Item Name",
        )

        FinTextField(
            value = amount,
            onValueChange = viewModel::onAmountChange,
            label = "Amount",
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
        )

        FinTextField(
            value = date,
            onValueChange = viewModel::onDateChange,
            label = "Date",
            placeholder = "YYYY-MM-DD",
        )

        FinTextField(
            value = description,
            onValueChange = viewModel::onDescriptionChange,
            label = "Description (optional)",
        )

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            TextButton(onClick = onBack) {
                Text("Cancel", color = FinColors.LightText)
            }
            FinButton(
                onClick = { viewModel.submit(onSuccess) },
                modifier = Modifier.weight(1f),
                enabled = !isLoading,
            ) {
                Text(if (isLoading) "Updating..." else "Update Transaction")
            }
        }
    }
}
