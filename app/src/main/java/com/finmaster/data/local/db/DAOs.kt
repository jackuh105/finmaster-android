package com.finmaster.data.local.db

import androidx.room.*
import com.finmaster.data.local.entity.TransactionEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface TransactionDao {
    @Query("SELECT * FROM transactions WHERE user_id = :userId ORDER BY date DESC")
    fun getAll(userId: String): Flow<List<TransactionEntity>>

    @Query("SELECT * FROM transactions WHERE user_id = :userId ORDER BY date DESC LIMIT :limit")
    fun getRecent(userId: String, limit: Int = 5): Flow<List<TransactionEntity>>

    @Query("SELECT * FROM transactions WHERE id = :id")
    suspend fun getById(id: String): TransactionEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsert(entity: TransactionEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertAll(entities: List<TransactionEntity>)

    @Query("DELETE FROM transactions WHERE id = :id")
    suspend fun deleteById(id: String)

    @Query("DELETE FROM transactions WHERE user_id = :userId")
    suspend fun deleteAllForUser(userId: String)
}

@Dao
interface AccountDao {
    @Query("SELECT * FROM accounts WHERE user_id = :userId ORDER BY created_at ASC")
    fun getAll(userId: String): Flow<List<com.finmaster.data.local.entity.AccountEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertAll(entities: List<com.finmaster.data.local.entity.AccountEntity>)

    @Query("DELETE FROM accounts WHERE user_id = :userId")
    suspend fun deleteAllForUser(userId: String)
}

@Dao
interface CategoryDao {
    @Query("SELECT * FROM categories WHERE user_id = :userId ORDER BY created_at ASC")
    fun getAll(userId: String): Flow<List<com.finmaster.data.local.entity.CategoryEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertAll(entities: List<com.finmaster.data.local.entity.CategoryEntity>)

    @Query("DELETE FROM categories WHERE user_id = :userId")
    suspend fun deleteAllForUser(userId: String)
}

@Dao
interface ItemTagDao {
    @Query("SELECT * FROM item_tags WHERE user_id = :userId ORDER BY created_at ASC")
    fun getAll(userId: String): Flow<List<com.finmaster.data.local.entity.ItemTagEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsert(entity: com.finmaster.data.local.entity.ItemTagEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertAll(entities: List<com.finmaster.data.local.entity.ItemTagEntity>)
}

@Dao
interface UserSettingsDao {
    @Query("SELECT * FROM user_settings WHERE user_id = :userId")
    suspend fun get(userId: String): com.finmaster.data.local.entity.UserSettingsEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsert(entity: com.finmaster.data.local.entity.UserSettingsEntity)
}
