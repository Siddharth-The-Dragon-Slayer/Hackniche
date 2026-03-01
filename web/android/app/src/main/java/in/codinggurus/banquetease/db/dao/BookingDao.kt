package `in`.codinggurus.banquetease.db.dao

import androidx.room.*
import `in`.codinggurus.banquetease.db.entities.BookingEntity

@Dao
interface BookingDao {
    @Upsert
    suspend fun upsert(booking: BookingEntity)

    @Upsert
    suspend fun upsertAll(bookings: List<BookingEntity>)

    @Query("SELECT * FROM bookings WHERE branchId = :branchId ORDER BY eventDate DESC")
    suspend fun getByBranch(branchId: String): List<BookingEntity>

    @Query("SELECT * FROM bookings WHERE franchiseId = :franchiseId ORDER BY eventDate DESC")
    suspend fun getByFranchise(franchiseId: String): List<BookingEntity>

    @Query("SELECT * FROM bookings WHERE status = :status AND branchId = :branchId ORDER BY eventDate ASC")
    suspend fun getByStatus(status: String, branchId: String): List<BookingEntity>

    @Query("SELECT * FROM bookings WHERE id = :id")
    suspend fun getById(id: String): BookingEntity?

    @Query("SELECT * FROM bookings WHERE isSynced = 0")
    suspend fun getUnsynced(): List<BookingEntity>

    @Query("SELECT * FROM bookings ORDER BY updatedAt DESC")
    suspend fun getAll(): List<BookingEntity>

    @Query("DELETE FROM bookings WHERE id = :id")
    suspend fun deleteById(id: String)

    @Query("DELETE FROM bookings WHERE isSynced = 1")
    suspend fun deleteAllSynced()

    @Query("UPDATE bookings SET isSynced = 1 WHERE id = :id")
    suspend fun markSynced(id: String)

    @Query("SELECT COUNT(*) FROM bookings")
    suspend fun count(): Int
}
