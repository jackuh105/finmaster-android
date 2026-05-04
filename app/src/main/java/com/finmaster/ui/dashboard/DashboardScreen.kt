package com.finmaster.ui.dashboard

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.finmaster.domain.model.CategoryExpense
import com.finmaster.domain.model.NetworkResult
import com.finmaster.ui.components.*
import com.finmaster.ui.theme.FinColors
import com.finmaster.util.CurrencyUtils

@Composable
fun DashboardScreen(
    onAddTransaction: () -> Unit,
    onViewAllTransactions: () -> Unit,
    viewModel: DashboardViewModel = hiltViewModel(),
) {
    val budgetUsage by viewModel.budgetUsage.collectAsState()
    val categoryStats by viewModel.categoryStats.collectAsState()
    val recentTransactions by viewModel.recentTransactions.collectAsState()

    LaunchedEffect(Unit) { viewModel.loadDashboard() }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        // Budget Widget
        item {
            FinCard(header = { FinCardHeader("Budget") }) {
                when (val result = budgetUsage) {
                    is NetworkResult.Success -> {
                        val usage = result.data
                        Text(
                            "Spent: ${CurrencyUtils.formatShort(usage.spent)} / ${CurrencyUtils.formatShort(usage.budget)}",
                            fontSize = 14.sp,
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        FinProgressBar(value = usage.percentage.toFloat())
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            "Remaining: ${CurrencyUtils.formatShort(usage.remaining)} (${String.format("%.0f", 100 - usage.percentage)}%)",
                            fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f),
                        )
                    }
                    is NetworkResult.Loading -> CircularProgressIndicator(
                        modifier = Modifier.size(24.dp),
                        color = FinColors.LightMain,
                    )
                    is NetworkResult.Error -> {
                        FinCard(
                            variant = FinCardVariant.Inner,
                            modifier = Modifier.fillMaxWidth(),
                        ) {
                            Text(
                                "No Budget Set",
                                fontWeight = FontWeight.Bold,
                                fontSize = 16.sp,
                            )
                            Text(
                                "Please set a budget to start tracking your spending.",
                                fontSize = 14.sp,
                                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f),
                            )
                        }
                    }
                }
            }
        }

        // Quick Actions
        item {
            FinCard {
                Text("Quick Actions", fontWeight = FontWeight.Bold, fontSize = 18.sp)
                Spacer(modifier = Modifier.height(12.dp))
                FinButton(
                    onClick = onAddTransaction,
                    modifier = Modifier.fillMaxWidth(),
                ) {
                    Text("Add New Transaction")
                }
            }
        }

        // Recent Transactions
        item {
            FinCard {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                ) {
                    Text("Recent Transaction", fontWeight = FontWeight.Bold, fontSize = 18.sp)
                    TextButton(onClick = onViewAllTransactions) {
                        Text("More", color = FinColors.LightMain)
                    }
                }
                if (recentTransactions.isEmpty()) {
                    Spacer(modifier = Modifier.height(8.dp))
                    Text("No transactions yet.", fontSize = 14.sp)
                } else {
                    recentTransactions.forEach { transaction ->
                        Spacer(modifier = Modifier.height(8.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    transaction.name,
                                    fontWeight = FontWeight.Medium,
                                    maxLines = 1,
                                )
                                Text(
                                    transaction.date,
                                    fontSize = 12.sp,
                                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f),
                                )
                            }
                            Text(
                                CurrencyUtils.formatShort(transaction.amount),
                                color = FinColors.Alert,
                                fontWeight = FontWeight.Medium,
                            )
                        }
                    }
                }
            }
        }

        // Spending Pie Chart
        item {
            FinCard(
                header = {
                    Column {
                        Text(
                            "Expenses by category",
                            fontWeight = FontWeight.Bold,
                            fontSize = 18.sp,
                        )
                        Text(
                            "Current month",
                            fontSize = 14.sp,
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f),
                        )
                    }
                }
            ) {
                when (val result = categoryStats) {
                    is NetworkResult.Success -> {
                        if (result.data.isEmpty()) {
                            Text(
                                "No expenses this month yet.",
                                fontSize = 14.sp,
                                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f),
                            )
                        } else {
                            val pieSlices = result.data.map { stat ->
                                PieSlice(
                                    label = stat.category,
                                    value = stat.amount,
                                    color = FinColors.ChartColors[0],
                                )
                            }
                            SpendingPieChart(slices = pieSlices)
                        }
                    }
                    is NetworkResult.Loading -> Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(150.dp),
                        contentAlignment = androidx.compose.ui.Alignment.Center,
                    ) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(24.dp),
                            color = FinColors.LightMain,
                        )
                    }
                    is NetworkResult.Error -> Text(
                        "Could not load chart data",
                        fontSize = 14.sp,
                        color = FinColors.Alert,
                    )
                }
            }
        }
    }
}
