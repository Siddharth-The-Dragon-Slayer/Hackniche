package `in`.codinggurus.banquetease.db.entities

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(
    tableName = "branches",
    indices = [Index("franchiseId")]
)
data class BranchEntity(
    @PrimaryKey val id: String,
    val franchiseId: String = "",
    val name: String = "",
    val address: String = "",
    val phone: String = "",
    val data: String = "{}",
    val updatedAt: Long = System.currentTimeMillis(),
    val isSynced: Boolean = true
)
