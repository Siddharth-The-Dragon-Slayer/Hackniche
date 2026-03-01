package `in`.codinggurus.banquetease.db.dao

import androidx.room.*
import `in`.codinggurus.banquetease.db.entities.InventoryEntity

@Dao
interface InventoryDao {
    @Upsert
    suspend fun upsert(item: InventoryEntity)

    @Upsert
    suspend fun upsertAll(items: List<InventoryEntity>)

    @Query("SELECT * FROM inventory WHERE branchId = :branchId ORDER BY itemName ASC")
    suspend fun getByBranch(branchId: String): List<InventoryEntity>

    @Query("SELECT * FROM inventory WHERE franchiseId = :franchiseId AND category = :category ORDER BY itemName ASC")
    suspend fun getByCategory(franchiseId: String, category: String): List<InventoryEntity>

    @Query("SELECT * FROM inventory WHERE id = :id")
    suspend fun getById(id: String): InventoryEntity?

    @Query("SELECT * FROM inventory WHERE isSynced = 0")
    suspend fun getUnsynced(): List<InventoryEntity>

    @Query("SELECT * FROM inventory ORDER BY updatedAt DESC")
    suspend fun getAll(): List<InventoryEntity>

    @Query("DELETE FROM inventory WHERE id = :id")
    suspend fun deleteById(id: String)

    @Query("UPDATE inventory SET quantity = :qty, isSynced = 0, updatedAt = :ts WHERE id = :id")
    suspend fun updateQuantity(id: String, qty: Double, ts: Long = System.currentTimeMillis())

    @Query("UPDATE inventory SET isSynced = 1 WHERE id = :id")
    suspend fun markSynced(id: String)
}
