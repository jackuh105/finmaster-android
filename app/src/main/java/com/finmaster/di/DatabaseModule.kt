package com.finmaster.di

import android.content.Context
import androidx.room.Room
import com.finmaster.data.local.db.*
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {

    @Provides
    @Singleton
    fun provideDatabase(@ApplicationContext context: Context): FinMasterDatabase {
        return Room.databaseBuilder(
            context,
            FinMasterDatabase::class.java,
            "finmaster.db"
        ).build()
    }

    @Provides
    @Singleton
    fun provideTransactionDao(db: FinMasterDatabase): TransactionDao = db.transactionDao()

    @Provides
    @Singleton
    fun provideAccountDao(db: FinMasterDatabase): AccountDao = db.accountDao()

    @Provides
    @Singleton
    fun provideCategoryDao(db: FinMasterDatabase): CategoryDao = db.categoryDao()

    @Provides
    @Singleton
    fun provideItemTagDao(db: FinMasterDatabase): ItemTagDao = db.itemTagDao()

    @Provides
    @Singleton
    fun provideUserSettingsDao(db: FinMasterDatabase): UserSettingsDao = db.userSettingsDao()
}
