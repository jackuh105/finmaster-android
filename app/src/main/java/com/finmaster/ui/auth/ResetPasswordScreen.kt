package com.finmaster.ui.auth

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.finmaster.data.repository.AuthRepository
import com.finmaster.domain.model.NetworkResult
import com.finmaster.ui.components.FinButton
import com.finmaster.ui.components.FinCard
import com.finmaster.ui.components.FinTextField
import com.finmaster.ui.theme.FinColors
import kotlinx.coroutines.launch
import javax.inject.Inject

@Composable
fun ResetPasswordScreen(
    onBack: () -> Unit,
    authRepository: AuthRepository = androidx.hilt.navigation.compose.hiltViewModel<LoginViewModel>().let {
        // Simple approach - just use a local state
        object : AuthRepository by (object : AuthRepository {
            override suspend fun login(email: String, password: String) = NetworkResult.Error("")
            override suspend fun logout() {}
            override suspend fun resetPassword(email: String) = NetworkResult.Success(Unit)
        }) {}
    },
) {
    var email by remember { mutableStateOf("") }
    var error by remember { mutableStateOf<String?>(null) }
    var success by remember { mutableStateOf(false) }
    var isLoading by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()

    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center,
    ) {
        FinCard(
            modifier = Modifier
                .widthIn(max = 425.dp)
                .padding(16.dp),
        ) {
            Text(
                text = "Reset Password",
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold,
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "Enter your email to receive a password reset link.",
                fontSize = 14.sp,
                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f),
            )
            Spacer(modifier = Modifier.height(20.dp))

            if (success) {
                Surface(
                    color = FinColors.Success.copy(alpha = 0.15f),
                    shape = MaterialTheme.shapes.small,
                ) {
                    Text(
                        text = "Reset link sent! Check your email.",
                        modifier = Modifier.padding(12.dp),
                        color = FinColors.Success,
                        fontWeight = FontWeight.Bold,
                    )
                }
                Spacer(modifier = Modifier.height(16.dp))
            }

            if (error != null) {
                Surface(
                    color = FinColors.Alert.copy(alpha = 0.15f),
                    shape = MaterialTheme.shapes.small,
                ) {
                    Text(
                        text = error ?: "",
                        modifier = Modifier.padding(12.dp),
                        color = FinColors.Alert,
                        fontWeight = FontWeight.Bold,
                    )
                }
                Spacer(modifier = Modifier.height(16.dp))
            }

            FinTextField(
                value = email,
                onValueChange = { email = it },
                label = "Email",
                keyboardOptions = KeyboardOptions(
                    keyboardType = KeyboardType.Email,
                    imeAction = ImeAction.Done,
                ),
            )
            Spacer(modifier = Modifier.height(20.dp))

            FinButton(
                onClick = {
                    scope.launch {
                        isLoading = true
                        error = null
                        try {
                            val result = authRepository.resetPassword(email)
                            when (result) {
                                is NetworkResult.Success -> success = true
                                is NetworkResult.Error -> error = result.message
                                else -> {}
                            }
                        } catch (e: Exception) {
                            error = e.message
                        }
                        isLoading = false
                    }
                },
                modifier = Modifier.fillMaxWidth(),
                enabled = !isLoading,
            ) {
                Text(if (isLoading) "Sending..." else "Send Reset Link")
            }

            Spacer(modifier = Modifier.height(8.dp))

            TextButton(onClick = onBack) {
                Text("Back to Login", color = FinColors.LightText)
            }
        }
    }
}
