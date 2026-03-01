package `in`.codinggurus.banquetease.db.dao

import androidx.room.*
import `in`.codinggurus.banquetease.db.entities.PendingOperationEntity

@Dao
interface PendingOperationDao {
    @Insert
    suspend fun insert(op: PendingOperationEntity): Long

    @Query("SELECT * FROM pending_operations WHERE status = 'pending' ORDER BY createdAt ASC")
    suspend fun getPending(): List<PendingOperationEntity>

    @Query("SELECT COUNT(*) FROM pending_operations WHERE status = 'pending'")
    suspend fun pendingCount(): Int

    @Query("UPDATE pending_operations SET status = :status WHERE id = :id")
    suspend fun updateStatus(id: Long, status: String)

    @Query("UPDATE pending_operations SET retryCount = retryCount + 1, status = 'pending' WHERE id = :id")
    suspend fun incrementRetry(id: Long)

    @Query("DELETE FROM pending_operations WHERE id = :id")
    suspend fun deleteById(id: Long)

    @Query("DELETE FROM pending_operations WHERE status = 'done'")
    suspend fun clearCompleted()

    @Query("SELECT * FROM pending_operations ORDER BY createdAt DESC")
    suspend fun getAll(): List<PendingOperationEntity>
}
