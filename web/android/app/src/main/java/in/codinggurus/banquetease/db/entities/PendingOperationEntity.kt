package `in`.codinggurus.banquetease.db.entities

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

/**
 * Stores mutations (CREATE / UPDATE / DELETE) made while offline.
 * The sync manager drains this queue when the network comes back.
 */
@Entity(
    tableName = "pending_operations",
    indices = [Index("collection"), Index("status")]
)
data class PendingOperationEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    /** Firestore collection name, e.g. "bookings", "leads" */
    val collection: String,
    /** Firestore document ID (empty string for new docs using ADD) */
    val docId: String = "",
    /** CREATE | UPDATE | DELETE */
    val operation: String,
    /** Full document payload as JSON string */
    val payload: String = "{}",
    val createdAt: Long = System.currentTimeMillis(),
    val retryCount: Int = 0,
    /** pending | syncing | failed | done */
    val status: String = "pending"
)
