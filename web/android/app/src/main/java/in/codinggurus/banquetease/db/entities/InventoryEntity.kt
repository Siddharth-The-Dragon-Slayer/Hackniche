package `in`.codinggurus.banquetease.db.entities

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(
    tableName = "inventory",
    indices = [
        Index("branchId"),
        Index("franchiseId"),
        Index("category")
    ]
)
data class InventoryEntity(
    @PrimaryKey val id: String,
    val branchId: String = "",
    val franchiseId: String = "",
    val itemName: String = "",
    val category: String = "",
    val quantity: Double = 0.0,
    val unit: String = "",
    val data: String = "{}",
    val updatedAt: Long = System.currentTimeMillis(),
    val isSynced: Boolean = true
)
