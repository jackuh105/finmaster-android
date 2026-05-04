package com.finmaster.ui.settings

import android.content.Context
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.finmaster.ui.components.*
import com.finmaster.ui.theme.FinColors

private enum class SettingsTab(val label: String) {
    General("General"),
    Categories("Categories"),
    Accounts("Accounts"),
}

@Composable
fun SettingsScreen() {
    var selectedTab by remember { mutableStateOf(SettingsTab.General) }

    Column(modifier = Modifier.fillMaxSize()) {
        ScrollableTabRow(
            selectedTabIndex = SettingsTab.entries.indexOf(selectedTab),
            containerColor = MaterialTheme.colorScheme.background,
            contentColor = FinColors.LightMain,
            edgePadding = 16.dp,
        ) {
            SettingsTab.entries.forEach { tab ->
                Tab(
                    selected = selectedTab == tab,
                    onClick = { selectedTab = tab },
                    text = {
                        Text(
                            tab.label,
                            fontWeight = if (selectedTab == tab) FontWeight.Bold else FontWeight.Medium,
                        )
                    },
                )
            }
        }

        when (selectedTab) {
            SettingsTab.General -> GeneralSettings()
            SettingsTab.Categories -> CategoriesSettings()
            SettingsTab.Accounts -> AccountsSettings()
        }
    }
}

@Composable
private fun GeneralSettings() {
    var budget by remember { mutableStateOf("") }
    var message by remember { mutableStateOf<String?>(null) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        FinCard(header = { FinCardHeader("Monthly Budget") }) {
            FinTextField(
                value = budget,
                onValueChange = { budget = it },
                label = "Budget Amount",
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
            )
            Spacer(modifier = Modifier.height(12.dp))
            FinButton(
                onClick = { message = "Budget updated" },
                modifier = Modifier.fillMaxWidth(),
            ) {
                Text("Update Budget")
            }
        }

        message?.let {
            Surface(
                color = FinColors.Success.copy(alpha = 0.15f),
                shape = MaterialTheme.shapes.small,
            ) {
                Text(
                    text = it,
                    modifier = Modifier.padding(12.dp),
                    color = FinColors.Success,
                    fontWeight = FontWeight.Bold,
                )
            }
        }
    }
}

@Composable
private fun CategoriesSettings() {
    var categories by remember { mutableStateOf<List<String>>(emptyList()) }
    var newCategoryName by remember { mutableStateOf("") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            FinTextField(
                value = newCategoryName,
                onValueChange = { newCategoryName = it },
                modifier = Modifier.weight(1f),
                placeholder = "New category name",
            )
            FinButton(
                onClick = {
                    if (newCategoryName.isNotBlank()) {
                        categories = categories + newCategoryName
                        newCategoryName = ""
                    }
                },
            ) {
                Text("Add")
            }
        }

        FinCard(header = { FinCardHeader("Categories") }) {
            if (categories.isEmpty()) {
                Text("No categories. Add your first one above.", fontSize = 14.sp)
            } else {
                categories.forEachIndexed { index, category ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 4.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                    ) {
                        Text(category)
                        TextButton(
                            onClick = {
                                categories = categories.toMutableList().also { it.removeAt(index) }
                            },
                        ) {
                            Text("Delete", color = FinColors.Alert)
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun AccountsSettings() {
    var accounts by remember { mutableStateOf<List<String>>(emptyList()) }
    var newAccountName by remember { mutableStateOf("") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            FinTextField(
                value = newAccountName,
                onValueChange = { newAccountName = it },
                modifier = Modifier.weight(1f),
                placeholder = "New account name",
            )
            FinButton(
                onClick = {
                    if (newAccountName.isNotBlank()) {
                        accounts = accounts + newAccountName
                        newAccountName = ""
                    }
                },
            ) {
                Text("Add")
            }
        }

        FinCard(header = { FinCardHeader("Accounts") }) {
            if (accounts.isEmpty()) {
                Text("No accounts. Add your first one above.", fontSize = 14.sp)
            } else {
                accounts.forEachIndexed { index, account ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 4.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                    ) {
                        Text(account)
                        TextButton(
                            onClick = {
                                accounts = accounts.toMutableList().also { it.removeAt(index) }
                            },
                        ) {
                            Text("Delete", color = FinColors.Alert)
                        }
                    }
                }
            }
        }
    }
}
