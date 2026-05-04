package com.finmaster

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import com.finmaster.data.local.datastore.SessionManager
import com.finmaster.ui.navigation.FinMasterNavHost
import com.finmaster.ui.theme.FinMasterTheme
import com.finmaster.ui.theme.GridBackground
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject

@AndroidEntryPoint
class MainActivity : ComponentActivity() {

    @Inject
    lateinit var sessionManager: SessionManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            val isAuthenticated by sessionManager.isAuthenticated.collectAsState(initial = false)
            FinMasterAppContent(isAuthenticated = isAuthenticated)
        }
    }
}

@Composable
fun FinMasterAppContent(isAuthenticated: Boolean) {
    FinMasterTheme {
        Box(modifier = Modifier.fillMaxSize()) {
            GridBackground()
            FinMasterNavHost(isAuthenticated = isAuthenticated)
        }
    }
}
