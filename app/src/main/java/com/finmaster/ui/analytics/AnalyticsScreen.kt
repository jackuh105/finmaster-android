package com.finmaster.ui.analytics

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.finmaster.domain.model.NetworkResult
import com.finmaster.ui.components.*
import com.finmaster.ui.theme.FinColors
import com.finmaster.util.CurrencyUtils

@Composable
fun AnalyticsScreen(
    viewModel: AnalyticsViewModel = hiltViewModel(),
) {
    val totalExpense by viewModel.totalExpense.collectAsState()
    val dailyExpenses by viewModel.dailyExpenses.collectAsState()
    val categoryExpenses by viewModel.categoryExpenses.collectAsState()

    LaunchedEffect(Unit) { viewModel.loadData() }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        // Filter presets
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                listOf(7 to "7 Days", 30 to "30 Days", 90 to "90 Days", 0 to "This Month").forEach { (days, label) ->
                    FinBadge(
                        text = label,
                        onClick = {
                            if (days == 0) {
                                viewModel.onDateRangeChange(
                                    com.finmaster.util.DateUtils.currentMonthStart(),
                                    com.finmaster.util.DateUtils.currentMonthEnd(),
                                )
                            } else {
                                viewModel.setPreset(days)
                            }
                        },
                    )
                }
            }
        }

        // Stats Cards
        item {
            when (val result = totalExpense) {
                is NetworkResult.Success -> {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(12.dp),
                    ) {
                        StatsCard(
                            modifier = Modifier.weight(1f),
                            title = "Total Expense",
                            value = CurrencyUtils.formatShort(result.data.totalExpense),
                        )
                        StatsCard(
                            modifier = Modifier.weight(1f),
                            title = "Transactions",
                            value = result.data.transactionCount.toString(),
                        )
                    }
                }
                is NetworkResult.Loading -> {
                    Text("Loading...", fontSize = 14.sp)
                }
                is NetworkResult.Error -> {
                    Text("Error loading analytics", color = FinColors.Alert)
                }
            }
        }

        // Category Breakdown
        item {
            FinCard(
                header = { FinCardHeader("Expenses by Category") }
            ) {
                when (val result = categoryExpenses) {
                    is NetworkResult.Success -> {
                        if (result.data.isEmpty()) {
                            Text("No data for selected period", fontSize = 14.sp)
                        } else {
                            result.data.forEach { cat ->
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(vertical = 4.dp),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                ) {
                                    Text(cat.category, fontWeight = FontWeight.Medium)
                                    Text(CurrencyUtils.formatShort(cat.amount), color = FinColors.Alert)
                                }
                            }
                        }
                    }
                    is NetworkResult.Loading -> Text("Loading...", fontSize = 14.sp)
                    is NetworkResult.Error -> Text("Error", color = FinColors.Alert)
                }
            }
        }

        // Daily Breakdown
        item {
            FinCard(
                header = { FinCardHeader("Daily Expense Trend") }
            ) {
                when (val result = dailyExpenses) {
                    is NetworkResult.Success -> {
                        if (result.data.isEmpty()) {
                            Text("No data for selected period", fontSize = 14.sp)
                        } else {
                            result.data.forEach { daily ->
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(vertical = 4.dp),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                ) {
                                    Text(daily.date, fontSize = 12.sp)
                                    Text(CurrencyUtils.formatShort(daily.amount), fontWeight = FontWeight.Medium)
                                }
                            }
                        }
                    }
                    is NetworkResult.Loading -> Text("Loading...", fontSize = 14.sp)
                    is NetworkResult.Error -> Text("Error", color = FinColors.Alert)
                }
            }
        }
    }
}

@Composable
fun StatsCard(
    modifier: Modifier = Modifier,
    title: String,
    value: String,
) {
    FinCard(modifier = modifier) {
        Text(
            title,
            fontSize = 12.sp,
            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f),
        )
        Spacer(modifier = Modifier.height(4.dp))
        Text(
            value,
            fontSize = 20.sp,
            fontWeight = FontWeight.Bold,
            color = FinColors.LightMain,
        )
    }
}
