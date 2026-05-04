package com.finmaster.ui.transactions

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.finmaster.data.remote.dto.CreateTransactionRequest
import com.finmaster.data.repository.TransactionRepository
import com.finmaster.domain.model.NetworkResult
import com.finmaster.util.DateUtils
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class AddTransactionViewModel @Inject constructor(
    private val transactionRepository: TransactionRepository,
) : ViewModel() {

    private val _name = MutableStateFlow("")
    val name: StateFlow<String> = _name.asStateFlow()

    private val _amount = MutableStateFlow("")
    val amount: StateFlow<String> = _amount.asStateFlow()

    private val _date = MutableStateFlow(DateUtils.today())
    val date: StateFlow<String> = _date.asStateFlow()

    private val _description = MutableStateFlow("")
    val description: StateFlow<String> = _description.asStateFlow()

    private val _categoryId = MutableStateFlow<String?>(null)
    val categoryId: StateFlow<String?> = _categoryId.asStateFlow()

    private val _accountId = MutableStateFlow<String?>(null)
    val accountId: StateFlow<String?> = _accountId.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    fun onNameChange(value: String) { _name.value = value }
    fun onAmountChange(value: String) { _amount.value = value }
    fun onDateChange(value: String) { _date.value = value }
    fun onDescriptionChange(value: String) { _description.value = value }
    fun onCategoryIdChange(value: String?) { _categoryId.value = value }
    fun onAccountIdChange(value: String?) { _accountId.value = value }

    fun submit(onSuccess: () -> Unit) {
        val amountDouble = _amount.value.toDoubleOrNull()
        if (amountDouble == null || amountDouble <= 0) {
            _error.value = "Please enter a valid amount"
            return
        }
        if (_name.value.isBlank()) {
            _error.value = "Please enter a name"
            return
        }

        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            val result = transactionRepository.addTransaction(
                CreateTransactionRequest(
                    name = _name.value,
                    amount = amountDouble,
                    date = _date.value,
                    description = _description.value.ifEmpty { null },
                    categoryId = _categoryId.value,
                    accountId = _accountId.value,
                ),
            )
            when (result) {
                is NetworkResult.Success -> onSuccess()
                is NetworkResult.Error -> _error.value = result.message
                is NetworkResult.Loading -> {}
            }
            _isLoading.value = false
        }
    }
}
