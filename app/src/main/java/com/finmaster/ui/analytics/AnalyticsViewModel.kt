package com.finmaster.ui.analytics

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.finmaster.data.repository.AnalyticsRepository
import com.finmaster.domain.model.*
import com.finmaster.util.DateUtils
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class AnalyticsViewModel @Inject constructor(
    private val analyticsRepository: AnalyticsRepository,
) : ViewModel() {

    private val _startDate = MutableStateFlow(DateUtils.currentMonthStart())
    val startDate: StateFlow<String> = _startDate.asStateFlow()

    private val _endDate = MutableStateFlow(DateUtils.currentMonthEnd())
    val endDate: StateFlow<String> = _endDate.asStateFlow()

    private val _totalExpense = MutableStateFlow<NetworkResult<TotalExpenseData>>(NetworkResult.Loading)
    val totalExpense: StateFlow<NetworkResult<TotalExpenseData>> = _totalExpense.asStateFlow()

    private val _dailyExpenses = MutableStateFlow<NetworkResult<List<DailyExpense>>>(NetworkResult.Loading)
    val dailyExpenses: StateFlow<NetworkResult<List<DailyExpense>>> = _dailyExpenses.asStateFlow()

    private val _categoryExpenses = MutableStateFlow<NetworkResult<List<CategoryExpense>>>(NetworkResult.Loading)
    val categoryExpenses: StateFlow<NetworkResult<List<CategoryExpense>>> = _categoryExpenses.asStateFlow()

    fun onDateRangeChange(start: String, end: String) {
        _startDate.value = start
        _endDate.value = end
        loadData()
    }

    fun setPreset(days: Int) {
        val end = DateUtils.today()
        val start = DateUtils.daysAgo(days)
        onDateRangeChange(start, end)
    }

    fun loadData() {
        viewModelScope.launch {
            _totalExpense.value = analyticsRepository.getTotalExpense(_startDate.value, _endDate.value)
            _dailyExpenses.value = analyticsRepository.getDailyExpenses(_startDate.value, _endDate.value)
            _categoryExpenses.value = analyticsRepository.getCategoryExpenses(_startDate.value, _endDate.value)
        }
    }
}
