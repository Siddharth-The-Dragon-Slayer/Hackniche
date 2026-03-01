package `in`.codinggurus.banquetease.db.entities

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(
    tableName = "leads",
    indices = [
        Index("branchId"),
        Index("franchiseId"),
        Index("status")
    ]
)
data class LeadEntity(
    @PrimaryKey val id: String,
    val branchId: String = "",
    val franchiseId: String = "",
    val name: String = "",
    val phone: String = "",
    val email: String = "",
    val status: String = "new",
    val source: String = "",
    val createdAt: Long = System.currentTimeMillis(),
    val data: String = "{}",
    val updatedAt: Long = System.currentTimeMillis(),
    val isSynced: Boolean = true
)
