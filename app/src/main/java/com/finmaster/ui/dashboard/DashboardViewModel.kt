package com.finmaster.ui.dashboard

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.finmaster.data.repository.AnalyticsRepository
import com.finmaster.data.repository.BudgetRepository
import com.finmaster.data.repository.TransactionRepository
import com.finmaster.domain.model.*
import com.finmaster.util.DateUtils
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class DashboardViewModel @Inject constructor(
    private val transactionRepository: TransactionRepository,
    private val budgetRepository: BudgetRepository,
    private val analyticsRepository: AnalyticsRepository,
) : ViewModel() {

    private val _budgetUsage = MutableStateFlow<NetworkResult<BudgetUsage>>(NetworkResult.Loading)
    val budgetUsage: StateFlow<NetworkResult<BudgetUsage>> = _budgetUsage.asStateFlow()

    private val _categoryStats = MutableStateFlow<NetworkResult<List<CategoryExpense>>>(NetworkResult.Loading)
    val categoryStats: StateFlow<NetworkResult<List<CategoryExpense>>> = _categoryStats.asStateFlow()

    val recentTransactions: StateFlow<List<Transaction>> = transactionRepository
        .getRecentTransactions(5)
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    fun loadDashboard() {
        viewModelScope.launch {
            // Load budget usage for current month
            _budgetUsage.value = budgetRepository.getBudgetUsage()

            // Load category stats for current month pie chart
            val startDate = DateUtils.currentMonthStart()
            val endDate = DateUtils.today()
            _categoryStats.value = analyticsRepository.getCategoryExpenses(startDate, endDate)
        }
    }

    fun refresh() {
        loadDashboard()
    }
}
