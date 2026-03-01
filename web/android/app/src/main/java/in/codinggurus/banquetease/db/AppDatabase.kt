package `in`.codinggurus.banquetease.db

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import `in`.codinggurus.banquetease.db.dao.*
import `in`.codinggurus.banquetease.db.entities.*

@Database(
    entities = [
        BookingEntity::class,
        LeadEntity::class,
        BranchEntity::class,
        InventoryEntity::class,
        PendingOperationEntity::class
    ],
    version = 1,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun bookingDao(): BookingDao
    abstract fun leadDao(): LeadDao
    abstract fun branchDao(): BranchDao
    abstract fun inventoryDao(): InventoryDao
    abstract fun pendingOperationDao(): PendingOperationDao

    companion object {
        @Volatile private var INSTANCE: AppDatabase? = null

        fun getInstance(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                INSTANCE ?: Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "banquetease_offline.db"
                )
                    .fallbackToDestructiveMigration()
                    .build()
                    .also { INSTANCE = it }
            }
        }
    }
}
