package `in`.codinggurus.banquetease.db.entities

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

/**
 * Mirrors a Firestore /bookings document.
 * Key searchable fields are stored as typed columns; the full document
 * payload is kept as a JSON string in [data] for round-trip fidelity.
 */
@Entity(
    tableName = "bookings",
    indices = [
        Index("branchId"),
        Index("franchiseId"),
        Index("status"),
        Index("eventDate")
    ]
)
data class BookingEntity(
    @PrimaryKey val id: String,
    val branchId: String = "",
    val franchiseId: String = "",
    val guestName: String = "",
    val phone: String = "",
    val eventDate: String = "",       // ISO string
    val status: String = "pending",
    val hallName: String = "",
    val packageName: String = "",
    val totalAmount: Double = 0.0,
    val paidAmount: Double = 0.0,
    /** Full Firestore document as JSON – all fields preserved */
    val data: String = "{}",
    val updatedAt: Long = System.currentTimeMillis(),
    val isSynced: Boolean = true
)
