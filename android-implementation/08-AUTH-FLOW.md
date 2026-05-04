# 08 - Authentication Flow

This document describes the authentication architecture, login/logout flow, session management, and how the Android app should integrate with Supabase Auth.

---

## Architecture Overview

```
┌─────────────┐     Email/Password     ┌──────────────────┐
│  Android    │ ──────────────────────> │  Supabase Auth   │
│  App        │ <────────────────────── │  (REST API)      │
│             │    JWT + Refresh Token  │                  │
│  (Supabase  │                         │  auth.users      │
│   Kotlin    │                         │  table           │
│   SDK)      │                         └──────────────────┘
│             │
│             │     JWT in Header       ┌──────────────────┐
│             │ ──────────────────────> │  FinMaster API   │
│             │ <────────────────────── │  (Next.js Route  │
│             │    JSON Response        │   Handlers)      │
└─────────────┘                         └──────────────────┘
```

Both the web app and Android app share the same Supabase Auth user pool. An account created on either platform works on the other.

---

## Supabase Auth SDK Setup (Android)

### Dependency

```kotlin
// build.gradle.kts
implementation("io.github.jan-tennert.supabase:gotrue-kt:2.x.x")
implementation("io.ktor:ktor-client-android:2.x.x")
```

### Initialization

```kotlin
// FinMasterApp.kt
@HiltAndroidApp
class FinMasterApp : Application() {
    lateinit var supabase: SupabaseClient
        private set

    override fun onCreate() {
        super.onCreate()
        supabase = createSupabaseClient(
            supabaseUrl = BuildConfig.SUPABASE_URL,
            supabaseKey = BuildConfig.SUPABASE_ANON_KEY
        ) {
            install(Auth) {
                // Automatically persist session
            }
        }
    }
}
```

### Session Manager

```kotlin
@Singleton
class SessionManager @Inject constructor(
    private val supabase: SupabaseClient
) {
    suspend fun getAccessToken(): String? {
        return supabase.auth.currentSessionOrNull()?.accessToken
    }

    fun observeSession(): Flow<SessionStatus> {
        return supabase.auth.sessionStatus
    }
}
```

---

## Authentication Flow

### Login Flow

```
User enters email + password
        │
        ▼
supabase.auth.signInWith(Email) {
    email = userEmail
    password = userPassword
}
        │
        ├── Success → Session stored by SDK
        │             │
        │             ▼
        │       Navigate to Dashboard
        │       (clear back stack)
        │
        └── Error → Show error message
                     (invalid credentials,
                      network error, etc.)
```

**Android ViewModel**:
```kotlin
@HiltViewModel
class LoginViewModel @Inject constructor(
    private val authRepository: AuthRepository
) : ViewModel() {

    private val _email = MutableStateFlow("")
    val email: StateFlow<String> = _email.asStateFlow()

    private val _password = MutableStateFlow("")
    val password: StateFlow<String> = _password.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    fun onEmailChange(value: String) { _email.value = value }
    fun onPasswordChange(value: String) { _password.value = value }

    fun login(onSuccess: () -> Unit) {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            when (val result = authRepository.login(_email.value, _password.value)) {
                is NetworkResult.Success -> onSuccess()
                is NetworkResult.Error -> _error.value = result.message
                is NetworkResult.Loading -> {}
            }
            _isLoading.value = false
        }
    }
}
```

### Logout Flow

```
User taps logout
        │
        ▼
supabase.auth.signOut()
        │
        ▼
Session cleared from local storage
        │
        ▼
Navigate to Login screen
(clear entire back stack)
```

**Android**:
```kotlin
fun logout() {
    viewModelScope.launch {
        authRepository.logout()
        // Navigation will automatically react to session status change
    }
}
```

### Auth State Observation

```kotlin
// In MainActivity or NavHost:
val sessionStatus by sessionManager.observeSession().collectAsState(initial = SessionStatus.Loading)

when (sessionStatus) {
    is SessionStatus.Authenticated -> {
        // Show main app with bottom navigation
        MainNavHost()
    }
    is SessionStatus.NotAuthenticated -> {
        // Show login screen
        LoginScreen()
    }
    is SessionStatus.Loading -> {
        // Show splash/loading
        SplashScreen()
    }
}
```

### Session Persistence

The Supabase Kotlin SDK automatically persists sessions using Android's secure storage:
- Access token and refresh token are stored
- On app restart, the SDK checks for existing session
- If refresh token is expired, user must re-login (sessionStatus becomes NotAuthenticated)

---

## Backend Changes Required

### Current State

The API v1 endpoints in `src/lib/api-auth.ts` only support API key authentication:

```typescript
// Current flow:
Authorization: Bearer <api_key_starting_with_fm_>
  → Look up key_hash in api_keys table
  → Return user_id + privileges
```

### Required Change

The API must also accept Supabase JWT tokens:

```typescript
Authorization: Bearer <supabase_access_token>
  → Validate JWT with supabase.auth.getUser(token)
  → Return user_id + full privileges
```

The JWT contains the user's UUID in the `sub` claim. This can be used directly for RLS-compatible queries or bypassing RLS with the admin client.

**Implementation**:

```typescript
// Add to src/lib/api-auth.ts:

import { createServerClient } from "@/lib/supabase/server";

export async function authenticateJWT(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  
  const token = authHeader.substring(7);
  if (token.startsWith("fm_")) return null; // Let API key handler deal with this
  
  try {
    const supabase = await createServerClient();
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) return null;
    
    return {
      userId: user.id,
      privileges: {
        read: true,
        create: true,
        update: true,
        delete: true,
      },
    };
  } catch {
    return null;
  }
}

// Then update authenticateApiKey to be one of two auth methods:
export async function authenticateRequest(req: NextRequest) {
  return await authenticateApiKey(req) || await authenticateJWT(req);
}
```

All API route files would then call `authenticateRequest()` instead of `authenticateApiKey()`.

---

## Password Reset Flow

### Web Flow
```
User clicks "Forgot password" on login page
  → Navigates to /auth/reset-password
  → Enters email, clicks "Send Reset Link"
  → Server action calls supabase.auth.resetPasswordForEmail(email)
  → Shows success/error message
  → User checks email, clicks reset link
  → Navigates to Supabase-hosted reset page or custom page
  → Sets new password
  → Redirects to login
```

### Android Flow
```
Login screen has "Forgot password?" link
  → Opens ResetPasswordScreen
  → Email input + "Send Reset Link" button
  → Calls supabase.auth.resetPasswordForEmail(email)
  → Shows confirmation or error
  → User checks email on device
  → Deep link or manual navigation to app
  → App handles password reset callback
```

**Android**:
```kotlin
fun resetPassword(email: String) {
    viewModelScope.launch {
        when (val result = authRepository.resetPassword(email)) {
            is NetworkResult.Success -> _resetSent.value = true
            is NetworkResult.Error -> _error.value = result.message
        }
    }
}
```

---

## AuthInterceptor for Retrofit

Every API call to the FinMaster API needs the JWT token in the Authorization header:

```kotlin
@Singleton
class AuthInterceptor @Inject constructor(
    private val sessionManager: SessionManager
) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val token = runBlocking { sessionManager.getAccessToken() }
        val request = chain.request().newBuilder().apply {
            token?.let { addHeader("Authorization", "Bearer $it") }
        }.build()
        return chain.proceed(request)
    }
}
```

### Handling Token Expiry

If a 401 response is received:
1. Try to refresh the session: `supabase.auth.refreshCurrentSession()`
2. If refresh succeeds, retry the original request with new token
3. If refresh fails, clear session, redirect to login

```kotlin
@Singleton
class TokenAuthenticator @Inject constructor(
    private val sessionManager: SessionManager
) : Authenticator {
    override fun authenticate(route: Route?, response: Response): Request? {
        if (response.code == 401) {
            val newToken = runBlocking { sessionManager.refreshAndGetToken() }
            return newToken?.let {
                response.request.newBuilder()
                    .header("Authorization", "Bearer $it")
                    .build()
            }
        }
        return null
    }
}
```

---

## Auth Repository Implementation

```kotlin
interface AuthRepository {
    suspend fun login(email: String, password: String): NetworkResult<Unit>
    suspend fun logout()
    suspend fun resetPassword(email: String): NetworkResult<Unit>
    fun observeSession(): Flow<SessionStatus>
}

@Singleton
class AuthRepositoryImpl @Inject constructor(
    private val supabase: SupabaseClient
) : AuthRepository {

    override suspend fun login(email: String, password: String): NetworkResult<Unit> {
        return try {
            supabase.auth.signInWith(Email) {
                this.email = email
                this.password = password
            }
            NetworkResult.Success(Unit)
        } catch (e: Exception) {
            NetworkResult.Error(e.message ?: "Login failed")
        }
    }

    override suspend fun logout() {
        supabase.auth.signOut()
    }

    override suspend fun resetPassword(email: String): NetworkResult<Unit> {
        return try {
            // Note: Supabase Kotlin SDK reset password API
            // This redirects to a URL; for mobile, use a custom redirect
            supabase.auth.resetPasswordForEmail(email)
            NetworkResult.Success(Unit)
        } catch (e: Exception) {
            NetworkResult.Error(e.message ?: "Failed to send reset email")
        }
    }

    override fun observeSession(): Flow<SessionStatus> {
        return supabase.auth.sessionStatus
    }
}
```
