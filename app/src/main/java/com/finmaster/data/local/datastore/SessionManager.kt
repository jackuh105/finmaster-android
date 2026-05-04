package com.finmaster.data.local.datastore

import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.gotrue.SessionStatus
import io.github.jan.supabase.gotrue.auth
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class SessionManager @Inject constructor(
    private val supabaseClient: SupabaseClient,
) {
    val isAuthenticated: Flow<Boolean> = supabaseClient.auth.sessionStatus.map {
        it is SessionStatus.Authenticated
    }

    suspend fun getAccessToken(): String? {
        return try {
            supabaseClient.auth.currentSessionOrNull()?.accessToken
        } catch (e: Exception) {
            null
        }
    }
}
