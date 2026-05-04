package com.finmaster.data.local.db

import androidx.room.Database
import androidx.room.RoomDatabase
import com.finmaster.data.local.entity.*

@Database(
    entities = [
        TransactionEntity::class,
        AccountEntity::class,
        CategoryEntity::class,
        ItemTagEntity::class,
        UserSettingsEntity::class,
    ],
    version = 1,
    exportSchema = false,
)
abstract class FinMasterDatabase : RoomDatabase() {
    abstract fun transactionDao(): TransactionDao
    abstract fun accountDao(): AccountDao
    abstract fun categoryDao(): CategoryDao
    abstract fun itemTagDao(): ItemTagDao
    abstract fun userSettingsDao(): UserSettingsDao
}
