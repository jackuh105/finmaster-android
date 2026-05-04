package com.finmaster.ui.transactions

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.finmaster.domain.model.Category
import com.finmaster.domain.model.NetworkResult
import com.finmaster.domain.model.Transaction
import com.finmaster.ui.components.*
import com.finmaster.ui.theme.FinColors
import com.finmaster.util.CurrencyUtils

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TransactionListScreen(
    onAddTransaction: () -> Unit,
    onEditTransaction: (String) -> Unit,
    viewModel: TransactionListViewModel = hiltViewModel(),
) {
    val searchQuery by viewModel.searchQuery.collectAsState()
    val selectedMonth by viewModel.selectedMonth.collectAsState()
    val availableMonths by viewModel.availableMonths.collectAsState()
    val transactions by viewModel.transactions.collectAsState()
    val isFilterOpen by viewModel.isFilterOpen.collectAsState()

    var showDeleteDialog by remember { mutableStateOf<String?>(null) }

    Column(modifier = Modifier.fillMaxSize()) {
        // Top row: Search bar + Add button + Filter button
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            FinTextField(
                value = searchQuery,
                onValueChange = viewModel::onSearchQueryChange,
                modifier = Modifier.weight(1f),
                placeholder = "Search transactions...",
                leadingIcon = {
                    Icon(Icons.Filled.Search, contentDescription = null)
                },
            )
            Spacer(modifier = Modifier.width(8.dp))
            IconButton(onClick = viewModel::onToggleFilter) {
                Icon(
                    Icons.Filled.FilterList,
                    contentDescription = "Filter",
                    tint = if (isFilterOpen) FinColors.LightMain else MaterialTheme.colorScheme.onSurface,
                )
            }
            IconButton(onClick = onAddTransaction) {
                Icon(
                    Icons.Filled.Add,
                    contentDescription = "Add",
                    tint = FinColors.LightMain,
                )
            }
        }

        // Month selector
        var monthExpanded by remember { mutableStateOf(false) }
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 4.dp),
        ) {
            ExposedDropdownMenuBox(
                expanded = monthExpanded,
                onExpandedChange = { monthExpanded = it },
            ) {
                OutlinedTextField(
                    value = selectedMonth,
                    onValueChange = {},
                    readOnly = true,
                    trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = monthExpanded) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .menuAnchor(),
                    textStyle = MaterialTheme.typography.bodyLarge.copy(fontWeight = FontWeight.Bold),
                    shape = MaterialTheme.shapes.small,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = FinColors.LightBorder,
                        unfocusedBorderColor = FinColors.LightBorder,
                        focusedContainerColor = androidx.compose.ui.graphics.Color.White,
                        unfocusedContainerColor = androidx.compose.ui.graphics.Color.White,
                    ),
                )
                ExposedDropdownMenu(
                    expanded = monthExpanded,
                    onDismissRequest = { monthExpanded = false },
                ) {
                    availableMonths.forEach { month ->
                        DropdownMenuItem(
                            text = { Text(month) },
                            onClick = {
                                viewModel.onMonthChange(month)
                                monthExpanded = false
                            },
                        )
                    }
                }
            }
        }

        // Filter section (collapsible)
        if (isFilterOpen) {
            FilterSection(viewModel = viewModel)
        }

        // Transaction list
        when (val result = transactions) {
            is NetworkResult.Loading -> {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center,
                ) {
                    CircularProgressIndicator(color = FinColors.LightMain)
                }
            }
            is NetworkResult.Error -> {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center,
                ) {
                    Text("Error: ${result.message}", color = FinColors.Alert, fontSize = 14.sp)
                }
            }
            is NetworkResult.Success -> {
                val list = result.data
                if (list.isEmpty()) {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center,
                    ) {
                        Text("No transactions found for this month.", fontSize = 14.sp)
                    }
                } else {
                    LazyColumn(
                        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp),
                        verticalArrangement = Arrangement.spacedBy(6.dp),
                    ) {
                        items(list, key = { it.id }) { transaction ->
                            ExpandableTransactionItem(
                                transaction = transaction,
                                onEdit = { onEditTransaction(transaction.id) },
                                onDelete = { showDeleteDialog = transaction.id },
                            )
                        }
                    }
                }
            }
        }
    }

    // Delete confirmation dialog
    showDeleteDialog?.let { id ->
        FinDialog(
            open = true,
            onDismiss = { showDeleteDialog = null },
            title = "Are you sure?",
            description = "This action cannot be undone.",
            confirmButton = {
                FinButton(
                    onClick = {
                        viewModel.deleteTransaction(id)
                        showDeleteDialog = null
                    },
                ) {
                    Text("Delete")
                }
            },
            dismissButton = {
                TextButton(onClick = { showDeleteDialog = null }) {
                    Text("Cancel")
                }
            },
        )
    }
}

@Composable
private fun FilterSection(viewModel: TransactionListViewModel) {
    val amountRange by viewModel.amountRange.collectAsState()
    val selectedCategoryFilters by viewModel.selectedCategoryFilters.collectAsState()
    val categories by viewModel.categories.collectAsState()

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .heightIn(max = 300.dp)
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 16.dp, vertical = 4.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        // Amount filter
        FinCard(header = { FinCardHeader("Amount Range") }) {
            var minText by remember(amountRange) { mutableStateOf(amountRange.first.toInt().toString()) }
            var maxText by remember(amountRange) { mutableStateOf(amountRange.second.toInt().toString()) }

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                FinTextField(
                    value = minText,
                    onValueChange = {
                        minText = it
                        viewModel.onAmountMinChange(it.toDoubleOrNull() ?: 0.0)
                    },
                    modifier = Modifier.weight(1f),
                    placeholder = "Min",
                )
                Text("~", fontSize = 14.sp)
                FinTextField(
                    value = maxText,
                    onValueChange = {
                        maxText = it
                        viewModel.onAmountMaxChange(it.toDoubleOrNull() ?: 999999.0)
                    },
                    modifier = Modifier.weight(1f),
                    placeholder = "Max",
                )
            }
        }

        // Category filter
        FinCard(
            header = {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                ) {
                    FinCardTitle("Categories")
                    if (selectedCategoryFilters.isNotEmpty()) {
                        TextButton(onClick = viewModel::onClearCategoryFilters) {
                            Text("Clear", color = FinColors.LightMain, fontSize = 12.sp)
                        }
                    }
                }
            }
        ) {
            if (categories.isEmpty()) {
                Text("No categories available", fontSize = 14.sp)
            } else {
                categories.forEach { category ->
                    FinCheckbox(
                        checked = selectedCategoryFilters.contains(category.name),
                        onCheckedChange = { viewModel.onCategoryFilterToggle(category.name) },
                        label = category.name,
                    )
                }
            }
            if (selectedCategoryFilters.isNotEmpty()) {
                Text(
                    "${selectedCategoryFilters.size} selected",
                    fontSize = 12.sp,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f),
                )
            }
        }
    }
}

@Composable
private fun ExpandableTransactionItem(
    transaction: Transaction,
    onEdit: () -> Unit,
    onDelete: () -> Unit,
) {
    var expanded by remember { mutableStateOf(false) }

    FinCard {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .clickable { expanded = !expanded },
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    // Date badge
                    Surface(
                        shape = MaterialTheme.shapes.small,
                        color = FinColors.LightMain,
                    ) {
                        Text(
                            transaction.date,
                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp),
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Medium,
                        )
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        transaction.name,
                        fontWeight = FontWeight.Medium,
                        maxLines = 1,
                        fontSize = 14.sp,
                    )
                }
                if (expanded && transaction.description != null) {
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        transaction.description,
                        fontSize = 12.sp,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f),
                    )
                }
            }
            Column(horizontalAlignment = Alignment.End) {
                Text(
                    CurrencyUtils.formatShort(transaction.amount),
                    color = FinColors.Alert,
                    fontWeight = FontWeight.Medium,
                    fontSize = 14.sp,
                )
                if (transaction.category != null && !expanded) {
                    Text(
                        transaction.category,
                        fontSize = 11.sp,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f),
                    )
                }
            }
        }

        // Expanded details
        if (expanded) {
            HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp))
            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                if (transaction.category != null) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                    ) {
                        Text("Category", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f))
                        Text(transaction.category, fontSize = 12.sp, fontWeight = FontWeight.Medium)
                    }
                }
                if (transaction.account != null) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                    ) {
                        Text("Account", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f))
                        Text(transaction.account, fontSize = 12.sp, fontWeight = FontWeight.Medium)
                    }
                }
                if (transaction.description != null) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                    ) {
                        Text("Description", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f))
                        Text(transaction.description, fontSize = 12.sp, fontWeight = FontWeight.Medium)
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.End,
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    TextButton(onClick = onEdit) {
                        Icon(Icons.Filled.Edit, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Edit", color = FinColors.LightMain, fontSize = 13.sp)
                    }
                    TextButton(onClick = onDelete) {
                        Icon(Icons.Filled.Delete, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Delete", color = FinColors.Alert, fontSize = 13.sp)
                    }
                }
            }
        }
    }
}
