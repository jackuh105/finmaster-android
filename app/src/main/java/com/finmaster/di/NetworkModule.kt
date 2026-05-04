package com.finmaster.di

import com.finmaster.data.local.datastore.SessionManager
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {
    // Networking is handled by the Supabase Kotlin SDK internally.
    // This module is retained for any future custom HTTP needs.
}
