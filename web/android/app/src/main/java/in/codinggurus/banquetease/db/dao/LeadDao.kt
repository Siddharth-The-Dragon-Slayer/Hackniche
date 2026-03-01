package `in`.codinggurus.banquetease.db.dao

import androidx.room.*
import `in`.codinggurus.banquetease.db.entities.LeadEntity

@Dao
interface LeadDao {
    @Upsert
    suspend fun upsert(lead: LeadEntity)

    @Upsert
    suspend fun upsertAll(leads: List<LeadEntity>)

    @Query("SELECT * FROM leads WHERE branchId = :branchId ORDER BY createdAt DESC")
    suspend fun getByBranch(branchId: String): List<LeadEntity>

    @Query("SELECT * FROM leads WHERE franchiseId = :franchiseId ORDER BY createdAt DESC")
    suspend fun getByFranchise(franchiseId: String): List<LeadEntity>

    @Query("SELECT * FROM leads WHERE status = :status AND branchId = :branchId")
    suspend fun getByStatus(status: String, branchId: String): List<LeadEntity>

    @Query("SELECT * FROM leads WHERE id = :id")
    suspend fun getById(id: String): LeadEntity?

    @Query("SELECT * FROM leads WHERE isSynced = 0")
    suspend fun getUnsynced(): List<LeadEntity>

    @Query("SELECT * FROM leads ORDER BY updatedAt DESC")
    suspend fun getAll(): List<LeadEntity>

    @Query("DELETE FROM leads WHERE id = :id")
    suspend fun deleteById(id: String)

    @Query("UPDATE leads SET isSynced = 1 WHERE id = :id")
    suspend fun markSynced(id: String)
}
