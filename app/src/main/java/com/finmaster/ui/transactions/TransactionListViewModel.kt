package com.finmaster.ui.transactions

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.finmaster.data.repository.CategoryRepository
import com.finmaster.data.repository.TransactionRepository
import com.finmaster.data.repository.TransactionQueryOptions
import com.finmaster.domain.model.Category
import com.finmaster.domain.model.NetworkResult
import com.finmaster.domain.model.Transaction
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import java.time.YearMonth
import java.time.format.DateTimeFormatter
import javax.inject.Inject

@OptIn(kotlinx.coroutines.ExperimentalCoroutinesApi::class)
@HiltViewModel
class TransactionListViewModel @Inject constructor(
    private val transactionRepository: TransactionRepository,
    private val categoryRepository: CategoryRepository,
) : ViewModel() {

    private val _searchQuery = MutableStateFlow("")
    val searchQuery: StateFlow<String> = _searchQuery.asStateFlow()

    // Month selector state
    private val _selectedMonth = MutableStateFlow(YearMonth.now().format(DateTimeFormatter.ofPattern("yyyy-MM")))
    val selectedMonth: StateFlow<String> = _selectedMonth.asStateFlow()

    private val _availableMonths = MutableStateFlow<List<String>>(emptyList())
    val availableMonths: StateFlow<List<String>> = _availableMonths.asStateFlow()

    // Filter state — default to wide-open range so nothing is excluded
    private val _amountMin = MutableStateFlow(0.0)
    private val _amountMax = MutableStateFlow(999999.0)
    val amountRange: StateFlow<Pair<Double, Double>> = combine(_amountMin, _amountMax) { min, max -> min to max }
        .stateIn(viewModelScope, SharingStarted.Eagerly, 0.0 to 999999.0)

    private val _selectedCategoryFilters = MutableStateFlow<Set<String>>(emptySet())
    val selectedCategoryFilters: StateFlow<Set<String>> = _selectedCategoryFilters.asStateFlow()

    private val _isFilterOpen = MutableStateFlow(false)
    val isFilterOpen: StateFlow<Boolean> = _isFilterOpen.asStateFlow()

    // Categories for filter
    private val _categories = MutableStateFlow<List<Category>>(emptyList())
    val categories: StateFlow<List<Category>> = _categories.asStateFlow()

    // Data state
    val transactions: StateFlow<NetworkResult<List<Transaction>>> = combine(
        _searchQuery, _selectedMonth, _amountMin, _amountMax, _selectedCategoryFilters
    ) { query, month, minAmount, maxAmount, typeFilters ->
        val ym = YearMonth.parse(month, DateTimeFormatter.ofPattern("yyyy-MM"))
        val startDate = ym.atDay(1).format(DateTimeFormatter.ISO_LOCAL_DATE)
        val endDate = ym.atEndOfMonth().format(DateTimeFormatter.ISO_LOCAL_DATE)

        TransactionQueryOptions(
            limit = 50,
            offset = 0,
            startDate = startDate,
            endDate = endDate,
            minAmount = minAmount.takeIf { it > 0 },
            maxAmount = maxAmount.takeIf { it < 999999 },
            types = typeFilters.ifEmpty { null },
            query = query.ifEmpty { null },
        )
    }.flatMapLatest { options ->
        transactionRepository.getTransactions(options)
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), NetworkResult.Loading)

    init {
        loadCategories()
        loadAvailableMonths()
    }

    private fun loadCategories() {
        viewModelScope.launch {
            categoryRepository.getCategories().collect { result ->
                if (result is NetworkResult.Success) {
                    _categories.value = result.data
                }
            }
        }
    }

    private fun loadAvailableMonths() {
        viewModelScope.launch {
            try {
                val months = transactionRepository.getDistinctMonths()
                if (months.isNotEmpty()) {
                    _availableMonths.value = months
                    // Auto-select the most recent month if current selection isn't valid
                    if (_selectedMonth.value !in months) {
                        _selectedMonth.value = months.first()
                    }
                }
            } catch (_: Exception) {
                // Fall back to static months if fetch fails
                val generated = generateStaticMonths()
                _availableMonths.value = generated
            }
        }
    }

    private fun generateStaticMonths(): List<String> {
        val months = mutableListOf<String>()
        var current = YearMonth.now()
        for (i in 0 until 24) {
            months.add(current.format(DateTimeFormatter.ofPattern("yyyy-MM")))
            current = current.minusMonths(1)
        }
        return months
    }

    fun onSearchQueryChange(query: String) { _searchQuery.value = query }
    fun onMonthChange(month: String) { _selectedMonth.value = month }
    fun onAmountMinChange(min: Double) { _amountMin.value = min }
    fun onAmountMaxChange(max: Double) { _amountMax.value = max }
    fun onToggleFilter() { _isFilterOpen.value = !_isFilterOpen.value }
    fun onCloseFilter() { _isFilterOpen.value = false }

    fun onCategoryFilterToggle(categoryName: String) {
        val current = _selectedCategoryFilters.value.toMutableSet()
        if (current.contains(categoryName)) current.remove(categoryName)
        else current.add(categoryName)
        _selectedCategoryFilters.value = current
    }

    fun onClearCategoryFilters() { _selectedCategoryFilters.value = emptySet() }

    fun deleteTransaction(id: String) {
        viewModelScope.launch {
            transactionRepository.deleteTransaction(id)
        }
    }
}
