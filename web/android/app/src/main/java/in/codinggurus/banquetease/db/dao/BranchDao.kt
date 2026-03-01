package `in`.codinggurus.banquetease.db.dao

import androidx.room.*
import `in`.codinggurus.banquetease.db.entities.BranchEntity

@Dao
interface BranchDao {
    @Upsert
    suspend fun upsert(branch: BranchEntity)

    @Upsert
    suspend fun upsertAll(branches: List<BranchEntity>)

    @Query("SELECT * FROM branches WHERE franchiseId = :franchiseId ORDER BY name ASC")
    suspend fun getByFranchise(franchiseId: String): List<BranchEntity>

    @Query("SELECT * FROM branches ORDER BY name ASC")
    suspend fun getAll(): List<BranchEntity>

    @Query("SELECT * FROM branches WHERE id = :id")
    suspend fun getById(id: String): BranchEntity?

    @Query("DELETE FROM branches WHERE id = :id")
    suspend fun deleteById(id: String)

    @Query("SELECT COUNT(*) FROM branches")
    suspend fun count(): Int
}
