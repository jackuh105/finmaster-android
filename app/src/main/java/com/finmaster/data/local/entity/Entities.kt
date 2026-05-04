package com.finmaster.data.local.entity

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "transactions")
data class TransactionEntity(
    @PrimaryKey val id: String,
    @ColumnInfo(name = "user_id") val userId: String,
    val name: String,
    val description: String?,
    val amount: Double,
    val date: String,
    @ColumnInfo(name = "category_id") val categoryId: String?,
    @ColumnInfo(name = "account_id") val accountId: String?,
    @ColumnInfo(name = "category_name") val categoryName: String?,
    @ColumnInfo(name = "account_name") val accountName: String?,
    @ColumnInfo(name = "created_at") val createdAt: String,
) {
    fun toDomain() = com.finmaster.domain.model.Transaction(
        id = id,
        name = name,
        description = description,
        category = categoryName,
        account = accountName,
        amount = amount,
        date = date,
        categoryId = categoryId,
        accountId = accountId,
        createdAt = createdAt,
    )
}

@Entity(tableName = "accounts")
data class AccountEntity(
    @PrimaryKey val id: String,
    @ColumnInfo(name = "user_id") val userId: String,
    val name: String,
    @ColumnInfo(name = "is_preset") val isPreset: Boolean = false,
    @ColumnInfo(name = "created_at") val createdAt: String,
)

@Entity(tableName = "categories")
data class CategoryEntity(
    @PrimaryKey val id: String,
    @ColumnInfo(name = "user_id") val userId: String,
    val name: String,
    @ColumnInfo(name = "is_preset") val isPreset: Boolean = false,
    @ColumnInfo(name = "created_at") val createdAt: String,
)

@Entity(tableName = "item_tags")
data class ItemTagEntity(
    @PrimaryKey val id: String,
    @ColumnInfo(name = "user_id") val userId: String,
    val name: String,
    @ColumnInfo(name = "created_at") val createdAt: String,
)

@Entity(tableName = "user_settings")
data class UserSettingsEntity(
    @PrimaryKey @ColumnInfo(name = "user_id") val userId: String,
    val budget: Double?,
    @ColumnInfo(name = "default_category_id") val defaultCategoryId: String?,
    @ColumnInfo(name = "default_account_id") val defaultAccountId: String?,
    @ColumnInfo(name = "updated_at") val updatedAt: String?,
)
