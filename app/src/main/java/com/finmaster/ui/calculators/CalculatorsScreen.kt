package com.finmaster.ui.calculators

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.finmaster.domain.model.*
import com.finmaster.ui.components.*
import com.finmaster.ui.theme.FinColors
import com.finmaster.util.CurrencyUtils
import kotlin.math.pow

private enum class CalculatorTab(val label: String) {
    FixedDeposit("Fixed Deposit"),
    CompoundInterest("Compound Interest"),
    FreedomPoint("Freedom Point"),
    Mortgage("Mortgage"),
}

@Composable
fun CalculatorsScreen() {
    var selectedTab by remember { mutableStateOf(CalculatorTab.FixedDeposit) }

    Column(modifier = Modifier.fillMaxSize()) {
        // Tab selector
        ScrollableTabRow(
            selectedTabIndex = CalculatorTab.entries.indexOf(selectedTab),
            containerColor = MaterialTheme.colorScheme.background,
            contentColor = FinColors.LightMain,
            edgePadding = 16.dp,
        ) {
            CalculatorTab.entries.forEach { tab ->
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

        // Calculator content
        when (selectedTab) {
            CalculatorTab.FixedDeposit -> FixedDepositCalculator()
            CalculatorTab.CompoundInterest -> CompoundInterestCalculator()
            CalculatorTab.FreedomPoint -> FreedomPointCalculator()
            CalculatorTab.Mortgage -> MortgageCalculator()
        }
    }
}

@Composable
fun FixedDepositCalculator() {
    var principal by remember { mutableStateOf("10000") }
    var days by remember { mutableStateOf("365") }
    var result by remember { mutableStateOf<List<CurrencyResult>?>(null) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        FinTextField(
            value = principal,
            onValueChange = { principal = it },
            label = "Principal (MOP)",
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
        )
        FinTextField(
            value = days,
            onValueChange = { days = it },
            label = "Days",
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
        )

        FinButton(
            onClick = {
                val p = principal.toDoubleOrNull() ?: 0.0
                val d = days.toIntOrNull() ?: 365
                val currencies = listOf(
                    CurrencyRow("MOP", 1.0, 1.0, 2.0, true),
                    CurrencyRow("HKD", 0.97, 0.97, 3.0),
                    CurrencyRow("USD", 7.8, 7.78, 4.5),
                )
                result = currencies.map { c ->
                    val interest = (p * c.interestRate / 100 * d) / 365
                    val equivalent = interest * c.sellRate
                    val baseInterest = (p * 2.0 / 100 * d) / 365
                    CurrencyResult(c.currency, interest, equivalent, equivalent - baseInterest)
                }
            },
            modifier = Modifier.fillMaxWidth(),
        ) {
            Text("Calculate")
        }

        result?.let { results ->
            FinCard(
                header = { FinCardHeader("Results") }
            ) {
                results.forEach { r ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 4.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                    ) {
                        Text("${r.currency}:", fontWeight = FontWeight.Bold)
                        Text("${CurrencyUtils.formatShort(r.interest)} (diff: ${CurrencyUtils.formatShort(r.difference)})")
                    }
                }
            }
        }
    }
}

@Composable
fun CompoundInterestCalculator() {
    var monthlyDeposit by remember { mutableStateOf("1000") }
    var annualRate by remember { mutableStateOf("7") }
    var inflationRate by remember { mutableStateOf("2") }
    var years by remember { mutableStateOf("10") }
    var result by remember { mutableStateOf<List<CompoundInterestRow>?>(null) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        FinTextField(value = monthlyDeposit, onValueChange = { monthlyDeposit = it }, label = "Monthly Deposit", keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal))
        FinTextField(value = annualRate, onValueChange = { annualRate = it }, label = "Annual Return Rate (%)", keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal))
        FinTextField(value = inflationRate, onValueChange = { inflationRate = it }, label = "Inflation Rate (%)", keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal))
        FinTextField(value = years, onValueChange = { years = it }, label = "Years", keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number))

        FinButton(
            onClick = {
                val deposit = monthlyDeposit.toDoubleOrNull() ?: 0.0
                val rate = (annualRate.toDoubleOrNull() ?: 7.0) / 100
                val inflate = (inflationRate.toDoubleOrNull() ?: 2.0) / 100
                val yrs = years.toIntOrNull() ?: 10
                val rows = mutableListOf<CompoundInterestRow>()
                var total = 0.0
                var cumulativeInvested = 0.0
                for (y in 1..yrs) {
                    val annualInvested = deposit * 12
                    cumulativeInvested += annualInvested
                    total = (total + annualInvested) * (1 + rate)
                    val profit = total - cumulativeInvested
                    val pv = total / (1 + inflate).pow(y)
                    val roi = if (cumulativeInvested > 0) (profit / cumulativeInvested) * 100 else 0.0
                    rows.add(CompoundInterestRow(y, annualInvested, cumulativeInvested, profit, total, pv, roi))
                }
                result = rows
            },
            modifier = Modifier.fillMaxWidth(),
        ) {
            Text("Calculate")
        }

        result?.let { rows ->
            FinCard(header = { FinCardHeader("Yearly Breakdown") }) {
                rows.forEach { row ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 2.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                    ) {
                        Text("Year ${row.year}", fontSize = 12.sp)
                        Text(CurrencyUtils.formatShort(row.totalAmount), fontSize = 12.sp, fontWeight = FontWeight.Medium)
                    }
                }
            }
        }
    }
}

@Composable
fun FreedomPointCalculator() {
    var monthlyExpenses by remember { mutableStateOf("30000") }
    var annualRate by remember { mutableStateOf("5") }
    var result by remember { mutableStateOf<FreedomPointResult?>(null) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        FinTextField(value = monthlyExpenses, onValueChange = { monthlyExpenses = it }, label = "Monthly Expenses", keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal))
        FinTextField(value = annualRate, onValueChange = { annualRate = it }, label = "Annual Return Rate (%)", keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal))

        FinButton(
            onClick = {
                val expenses = monthlyExpenses.toDoubleOrNull() ?: 0.0
                val rate = (annualRate.toDoubleOrNull() ?: 5.0) / 100
                val monthlyRate = (1 + rate).pow(1.0 / 12) - 1
                val freedomPoint = if (monthlyRate > 0) expenses / monthlyRate else 0.0
                result = FreedomPointResult(monthlyRate * 100, freedomPoint)
            },
            modifier = Modifier.fillMaxWidth(),
        ) {
            Text("Calculate")
        }

        result?.let { r ->
            FinCard(header = { FinCardHeader("Results") }) {
                Text("Monthly Return Rate: ${CurrencyUtils.formatPercentage(r.monthlyReturnRate)}")
                Spacer(modifier = Modifier.height(8.dp))
                Text("Freedom Point Asset: ${CurrencyUtils.format(r.freedomPointAsset)}", fontWeight = FontWeight.Bold)
            }
        }
    }
}

@Composable
fun MortgageCalculator() {
    var totalPrice by remember { mutableStateOf("5000000") }
    var downPaymentRatio by remember { mutableStateOf("20") }
    var interestRate by remember { mutableStateOf("3.5") }
    var loanTerm by remember { mutableStateOf("30") }
    var result by remember { mutableStateOf<Pair<MortgageResult, List<MortgageYearRow>>?>(null) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        FinTextField(value = totalPrice, onValueChange = { totalPrice = it }, label = "Total Price", keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal))
        FinTextField(value = downPaymentRatio, onValueChange = { downPaymentRatio = it }, label = "Down Payment (%)", keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal))
        FinTextField(value = interestRate, onValueChange = { interestRate = it }, label = "Interest Rate (%)", keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal))
        FinTextField(value = loanTerm, onValueChange = { loanTerm = it }, label = "Loan Term (years)", keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number))

        FinButton(
            onClick = {
                val price = totalPrice.toDoubleOrNull() ?: 0.0
                val dp = (downPaymentRatio.toDoubleOrNull() ?: 20.0) / 100
                val rate = (interestRate.toDoubleOrNull() ?: 3.5) / 100
                val years = loanTerm.toIntOrNull() ?: 30
                val loanAmount = price * (1 - dp)
                val monthlyRate = rate / 12
                val months = years * 12
                val monthlyPayment = if (monthlyRate > 0) {
                    loanAmount * monthlyRate * (1 + monthlyRate).pow(months) / ((1 + monthlyRate).pow(months) - 1)
                } else {
                    loanAmount / months
                }
                val totalPaid = monthlyPayment * months
                val totalInterest = totalPaid - loanAmount

                val yearlyRows = mutableListOf<MortgageYearRow>()
                var balance = loanAmount
                for (y in 1..years) {
                    var yearPrincipal = 0.0
                    var yearInterest = 0.0
                    for (m in 1..12) {
                        if (balance <= 0) break
                        val intPayment = balance * monthlyRate
                        val priPayment = monthlyPayment - intPayment
                        yearPrincipal += priPayment
                        yearInterest += intPayment
                        balance -= priPayment
                    }
                    val totalYearPaid = yearPrincipal + yearInterest
                    yearlyRows.add(
                        MortgageYearRow(
                            y, yearPrincipal, yearInterest,
                            maxOf(balance, 0.0), totalYearPaid,
                            if (totalYearPaid > 0) (yearPrincipal / totalYearPaid) * 100 else 0.0,
                            if (totalYearPaid > 0) (yearInterest / totalYearPaid) * 100 else 0.0,
                        )
                    )
                }

                result = MortgageResult(loanAmount, monthlyPayment, totalInterest) to yearlyRows
            },
            modifier = Modifier.fillMaxWidth(),
        ) {
            Text("Calculate")
        }

        result?.let { (mortgage, rows) ->
            FinCard(header = { FinCardHeader("Results") }) {
                Text("Loan Amount: ${CurrencyUtils.format(mortgage.loanAmount)}")
                Text("Monthly Payment: ${CurrencyUtils.formatShort(mortgage.monthlyPayment)}")
                Text("Total Interest: ${CurrencyUtils.format(mortgage.totalInterest)}", color = FinColors.Alert)
            }
            Spacer(modifier = Modifier.height(8.dp))
            FinCard(header = { FinCardHeader("Yearly Amortization") }) {
                rows.take(5).forEach { row ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 2.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                    ) {
                        Text("Year ${row.year}", fontSize = 12.sp)
                        Text(CurrencyUtils.formatShort(row.totalPaid), fontSize = 12.sp, fontWeight = FontWeight.Medium)
                    }
                }
                if (rows.size > 5) {
                    Text("... and ${rows.size - 5} more years", fontSize = 12.sp)
                }
            }
        }
    }
}
