package com.finmaster.data.repository

import com.finmaster.domain.model.NetworkResult
import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.gotrue.auth
import io.github.jan.supabase.gotrue.providers.builtin.Email
import javax.inject.Inject
import javax.inject.Singleton

interface AuthRepository {
    suspend fun login(email: String, password: String): NetworkResult<Unit>
    suspend fun logout()
    suspend fun resetPassword(email: String): NetworkResult<Unit>
}

@Singleton
class AuthRepositoryImpl @Inject constructor(
    private val supabaseClient: SupabaseClient,
) : AuthRepository {

    override suspend fun login(email: String, password: String): NetworkResult<Unit> {
        if (email.isBlank() || password.isBlank()) {
            return NetworkResult.Error("Email and password are required")
        }
        return try {
            supabaseClient.auth.signInWith(Email) {
                this.email = email
                this.password = password
            }
            NetworkResult.Success(Unit)
        } catch (e: Exception) {
            val message = e.message ?: "Login failed"
            val friendlyMessage = when {
                message.contains("Invalid login credentials", ignoreCase = true) ->
                    "Invalid email or password. Please try again."
                message.contains("Email not confirmed", ignoreCase = true) ->
                    "Please verify your email before logging in."
                message.contains("network", ignoreCase = true) ||
                message.contains("timeout", ignoreCase = true) ||
                message.contains("unable to resolve", ignoreCase = true) ->
                    "Network error. Please check your internet connection."
                message.contains("ConnectException", ignoreCase = true) ||
                message.contains("UnknownHostException", ignoreCase = true) ->
                    "Unable to connect to server. Please check the Supabase URL in local.properties."
                else -> message
            }
            NetworkResult.Error(friendlyMessage)
        }
    }

    override suspend fun logout() {
        try {
            supabaseClient.auth.signOut()
        } catch (_: Exception) {
            // Best-effort logout
        }
    }

    override suspend fun resetPassword(email: String): NetworkResult<Unit> {
        if (email.isBlank()) {
            return NetworkResult.Error("Email is required")
        }
        return try {
            supabaseClient.auth.resetPasswordForEmail(email)
            NetworkResult.Success(Unit)
        } catch (e: Exception) {
            NetworkResult.Error(e.message ?: "Failed to send reset email")
        }
    }
}
