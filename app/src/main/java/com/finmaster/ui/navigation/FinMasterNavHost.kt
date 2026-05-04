package com.finmaster.ui.navigation

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.List
import androidx.compose.material.icons.automirrored.outlined.List
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.*
import androidx.navigation.navArgument
import com.finmaster.ui.analytics.AnalyticsScreen
import com.finmaster.ui.auth.*
import com.finmaster.ui.calculators.CalculatorsScreen
import com.finmaster.ui.dashboard.*
import com.finmaster.ui.settings.SettingsScreen
import com.finmaster.ui.theme.FinColors
import com.finmaster.ui.transactions.*

sealed class Screen(val route: String) {
    data object Login : Screen("login")
    data object ResetPassword : Screen("reset_password")
    data object Dashboard : Screen("dashboard")
    data object TransactionList : Screen("transaction_list")
    data object AddTransaction : Screen("add_transaction")
    data object EditTransaction : Screen("edit_transaction/{id}") {
        fun createRoute(id: String) = "edit_transaction/$id"
    }
    data object Analytics : Screen("analytics")
    data object Calculators : Screen("calculators")
    data object Settings : Screen("settings")
}

data class BottomNavItem(
    val screen: Screen,
    val label: String,
    val selectedIcon: ImageVector,
    val unselectedIcon: ImageVector,
)

val bottomNavItems = listOf(
    BottomNavItem(Screen.Dashboard, "Dashboard", Icons.Filled.Home, Icons.Outlined.Home),
    BottomNavItem(Screen.TransactionList, "Transactions", Icons.AutoMirrored.Filled.List, Icons.AutoMirrored.Outlined.List),
    BottomNavItem(Screen.Analytics, "Analytics", Icons.Filled.BarChart, Icons.Outlined.BarChart),
    BottomNavItem(Screen.Calculators, "Tools", Icons.Filled.Calculate, Icons.Outlined.Calculate),
    BottomNavItem(Screen.Settings, "Settings", Icons.Filled.Settings, Icons.Outlined.Settings),
)

@Composable
fun FinMasterNavHost(
    isAuthenticated: Boolean,
    navController: NavHostController = rememberNavController(),
) {
    // React to auth state changes
    LaunchedEffect(isAuthenticated) {
        if (isAuthenticated) {
            navController.navigate(Screen.Dashboard.route) {
                popUpTo(0) { inclusive = true }
            }
        } else {
            navController.navigate(Screen.Login.route) {
                popUpTo(0) { inclusive = true }
            }
        }
    }

    NavHost(
        navController = navController,
        startDestination = if (isAuthenticated) Screen.Dashboard.route else Screen.Login.route,
    ) {
        composable(Screen.Login.route) {
            LoginScreen(
                onLoginSuccess = {
                    // Auth state change handled by LaunchedEffect above
                },
                onResetPassword = { navController.navigate(Screen.ResetPassword.route) },
            )
        }
        composable(Screen.ResetPassword.route) {
            ResetPasswordScreen(
                onBack = { navController.popBackStack() },
            )
        }
        composable(Screen.Dashboard.route) {
            MainScaffold(navController = navController, currentRoute = Screen.Dashboard.route) {
                DashboardScreen(
                    onAddTransaction = { navController.navigate(Screen.AddTransaction.route) },
                    onViewAllTransactions = { navController.navigate(Screen.TransactionList.route) },
                )
            }
        }
        composable(Screen.TransactionList.route) {
            MainScaffold(navController = navController, currentRoute = Screen.TransactionList.route) {
                TransactionListScreen(
                    onAddTransaction = { navController.navigate(Screen.AddTransaction.route) },
                    onEditTransaction = { id -> navController.navigate(Screen.EditTransaction.createRoute(id)) },
                )
            }
        }
        composable(Screen.AddTransaction.route) {
            MainScaffold(navController = navController, currentRoute = Screen.AddTransaction.route) {
                AddTransactionScreen(
                    onBack = { navController.popBackStack() },
                    onSuccess = { navController.popBackStack() },
                )
            }
        }
        composable(
            Screen.EditTransaction.route,
            arguments = listOf(navArgument("id") { type = NavType.StringType }),
        ) { backStackEntry ->
            val id = backStackEntry.arguments?.getString("id") ?: return@composable
            EditTransactionScreen(
                transactionId = id,
                onBack = { navController.popBackStack() },
                onSuccess = { navController.popBackStack() },
            )
        }
        composable(Screen.Analytics.route) {
            MainScaffold(navController = navController, currentRoute = Screen.Analytics.route) {
                AnalyticsScreen()
            }
        }
        composable(Screen.Calculators.route) {
            MainScaffold(navController = navController, currentRoute = Screen.Calculators.route) {
                CalculatorsScreen()
            }
        }
        composable(Screen.Settings.route) {
            MainScaffold(navController = navController, currentRoute = Screen.Settings.route) {
                SettingsScreen()
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainScaffold(
    navController: NavHostController,
    currentRoute: String,
    content: @Composable (PaddingValues) -> Unit,
) {
    val showBottomBar = currentRoute in bottomNavItems.map { it.screen.route }
    val loginViewModel: com.finmaster.ui.auth.LoginViewModel = hiltViewModel()

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        "Finance Master",
                        fontWeight = FontWeight.Bold,
                        fontSize = 18.sp,
                    )
                },
                actions = {
                    IconButton(onClick = {
                        loginViewModel.logout()
                    }) {
                        Icon(Icons.Filled.Logout, contentDescription = "Logout")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.background,
                    titleContentColor = MaterialTheme.colorScheme.onBackground,
                ),
            )
        },
        bottomBar = {
            if (showBottomBar) {
                NavigationBar(
                    containerColor = MaterialTheme.colorScheme.surface,
                ) {
                    bottomNavItems.forEach { item ->
                        NavigationBarItem(
                            selected = currentRoute == item.screen.route,
                            onClick = {
                                if (currentRoute != item.screen.route) {
                                    navController.navigate(item.screen.route) {
                                        popUpTo(Screen.Dashboard.route) { saveState = true }
                                        launchSingleTop = true
                                        restoreState = true
                                    }
                                }
                            },
                            icon = {
                                Icon(
                                    if (currentRoute == item.screen.route) item.selectedIcon else item.unselectedIcon,
                                    contentDescription = item.label,
                                )
                            },
                            label = { Text(item.label) },
                            colors = NavigationBarItemDefaults.colors(
                                selectedIconColor = FinColors.LightMain,
                                selectedTextColor = FinColors.LightMain,
                                indicatorColor = FinColors.LightMain.copy(alpha = 0.1f),
                            ),
                        )
                    }
                }
            }
        },
    ) { padding ->
        Box(modifier = Modifier.padding(padding)) {
            content(padding)
        }
    }
}
