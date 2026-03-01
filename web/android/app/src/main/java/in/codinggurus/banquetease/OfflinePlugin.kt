package `in`.codinggurus.banquetease

import android.util.Log
import com.getcapacitor.*
import com.getcapacitor.annotation.CapacitorPlugin
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import `in`.codinggurus.banquetease.db.AppDatabase
import `in`.codinggurus.banquetease.db.entities.*
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import org.json.JSONArray
import org.json.JSONObject

/**
 * OfflineDBPlugin
 *
 * Bridges Android Room DB to JavaScript via Capacitor.
 * Exposed as `window.Capacitor.Plugins.OfflineDB` on the JS side.
 *
 * All methods run on IO dispatcher and resolve/reject the Capacitor call
 * on the main thread.
 */
@CapacitorPlugin(name = "OfflineDB")
class OfflinePlugin : Plugin() {

    private lateinit var db: AppDatabase
    private val gson = Gson()
    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())

    override fun load() {
        db = AppDatabase.getInstance(context)
        Log.d("OfflineDB", "Room DB initialised: banquetease_offline.db")
    }

    // ─────────────────────────── BOOKINGS ────────────────────────────────

    @PluginMethod
    fun upsertBooking(call: PluginCall) {
        val data = call.getObject("data") ?: return call.reject("data is required")
        scope.launch {
            try {
                val json = data.toString()
                val map: Map<String, Any?> = gson.fromJson(json, object : TypeToken<Map<String, Any?>>() {}.type)
                val entity = BookingEntity(
                    id = map["id"] as? String ?: return@launch call.reject("id missing"),
                    branchId = map["branch_id"] as? String ?: map["branchId"] as? String ?: "",
                    franchiseId = map["franchise_id"] as? String ?: map["franchiseId"] as? String ?: "",
                    guestName = map["guest_name"] as? String ?: map["guestName"] as? String ?: "",
                    phone = map["phone"] as? String ?: "",
                    eventDate = map["event_date"] as? String ?: map["eventDate"] as? String ?: "",
                    status = map["status"] as? String ?: "pending",
                    hallName = map["hall_name"] as? String ?: map["hallName"] as? String ?: "",
                    packageName = map["package_name"] as? String ?: map["packageName"] as? String ?: "",
                    totalAmount = (map["total_amount"] as? Number ?: map["totalAmount"] as? Number)?.toDouble() ?: 0.0,
                    paidAmount = (map["paid_amount"] as? Number ?: map["paidAmount"] as? Number)?.toDouble() ?: 0.0,
                    data = json,
                    isSynced = (map["isSynced"] as? Boolean) ?: true
                )
                db.bookingDao().upsert(entity)
                call.resolve()
            } catch (e: Exception) {
                call.reject("upsertBooking failed: ${e.message}")
            }
        }
    }

    @PluginMethod
    fun upsertBookings(call: PluginCall) {
        val arr = call.getArray("items") ?: return call.reject("items array required")
        scope.launch {
            try {
                val entities = mutableListOf<BookingEntity>()
                for (i in 0 until arr.length()) {
                    val o = arr.getJSONObject(i)
                    val json = o.toString()
                    val map: Map<String, Any?> = gson.fromJson(json, object : TypeToken<Map<String, Any?>>() {}.type)
                    entities.add(BookingEntity(
                        id = map["id"] as? String ?: continue,
                        branchId = map["branch_id"] as? String ?: map["branchId"] as? String ?: "",
                        franchiseId = map["franchise_id"] as? String ?: map["franchiseId"] as? String ?: "",
                        guestName = map["guest_name"] as? String ?: map["guestName"] as? String ?: "",
                        phone = map["phone"] as? String ?: "",
                        eventDate = map["event_date"] as? String ?: map["eventDate"] as? String ?: "",
                        status = map["status"] as? String ?: "pending",
                        hallName = map["hall_name"] as? String ?: map["hallName"] as? String ?: "",
                        packageName = map["package_name"] as? String ?: map["packageName"] as? String ?: "",
                        totalAmount = (map["total_amount"] as? Number ?: map["totalAmount"] as? Number)?.toDouble() ?: 0.0,
                        paidAmount = (map["paid_amount"] as? Number ?: map["paidAmount"] as? Number)?.toDouble() ?: 0.0,
                        data = json,
                        isSynced = true
                    ))
                }
                db.bookingDao().upsertAll(entities)
                call.resolve(JSObject().put("inserted", entities.size))
            } catch (e: Exception) {
                call.reject("upsertBookings failed: ${e.message}")
            }
        }
    }

    @PluginMethod
    fun getBookings(call: PluginCall) {
        val branchId = call.getString("branchId")
        val franchiseId = call.getString("franchiseId")
        scope.launch {
            try {
                val rows = when {
                    !branchId.isNullOrEmpty() -> db.bookingDao().getByBranch(branchId)
                    !franchiseId.isNullOrEmpty() -> db.bookingDao().getByFranchise(franchiseId)
                    else -> db.bookingDao().getAll()
                }
                call.resolve(JSObject().put("items", entitiesToJSArray(rows) { it.data }))
            } catch (e: Exception) {
                call.reject("getBookings failed: ${e.message}")
            }
        }
    }

    @PluginMethod
    fun getBookingById(call: PluginCall) {
        val id = call.getString("id") ?: return call.reject("id required")
        scope.launch {
            try {
                val row = db.bookingDao().getById(id)
                if (row == null) call.resolve(JSObject().put("item", null))
                else call.resolve(JSObject().put("item", JSObject(row.data)))
            } catch (e: Exception) {
                call.reject("getBookingById failed: ${e.message}")
            }
        }
    }

    @PluginMethod
    fun deleteBooking(call: PluginCall) {
        val id = call.getString("id") ?: return call.reject("id required")
        scope.launch {
            try { db.bookingDao().deleteById(id); call.resolve() }
            catch (e: Exception) { call.reject(e.message) }
        }
    }

    // ─────────────────────────── LEADS ───────────────────────────────────

    @PluginMethod
    fun upsertLead(call: PluginCall) {
        val data = call.getObject("data") ?: return call.reject("data is required")
        scope.launch {
            try {
                val json = data.toString()
                val map: Map<String, Any?> = gson.fromJson(json, object : TypeToken<Map<String, Any?>>() {}.type)
                db.leadDao().upsert(LeadEntity(
                    id = map["id"] as? String ?: return@launch call.reject("id missing"),
                    branchId = map["branch_id"] as? String ?: map["branchId"] as? String ?: "",
                    franchiseId = map["franchise_id"] as? String ?: map["franchiseId"] as? String ?: "",
                    name = map["name"] as? String ?: "",
                    phone = map["phone"] as? String ?: "",
                    email = map["email"] as? String ?: "",
                    status = map["status"] as? String ?: "new",
                    source = map["source"] as? String ?: "",
                    data = json,
                    isSynced = (map["isSynced"] as? Boolean) ?: true
                ))
                call.resolve()
            } catch (e: Exception) { call.reject("upsertLead failed: ${e.message}") }
        }
    }

    @PluginMethod
    fun upsertLeads(call: PluginCall) {
        val arr = call.getArray("items") ?: return call.reject("items array required")
        scope.launch {
            try {
                val entities = (0 until arr.length()).mapNotNull { i ->
                    val o = arr.getJSONObject(i); val json = o.toString()
                    val map: Map<String, Any?> = gson.fromJson(json, object : TypeToken<Map<String, Any?>>() {}.type)
                    val id = map["id"] as? String ?: return@mapNotNull null
                    LeadEntity(id = id, branchId = map["branch_id"] as? String ?: map["branchId"] as? String ?: "",
                        franchiseId = map["franchise_id"] as? String ?: map["franchiseId"] as? String ?: "",
                        name = map["name"] as? String ?: "", phone = map["phone"] as? String ?: "",
                        email = map["email"] as? String ?: "", status = map["status"] as? String ?: "new",
                        source = map["source"] as? String ?: "", data = json, isSynced = true)
                }
                db.leadDao().upsertAll(entities)
                call.resolve(JSObject().put("inserted", entities.size))
            } catch (e: Exception) { call.reject("upsertLeads failed: ${e.message}") }
        }
    }

    @PluginMethod
    fun getLeads(call: PluginCall) {
        val branchId = call.getString("branchId")
        val franchiseId = call.getString("franchiseId")
        scope.launch {
            try {
                val rows = when {
                    !branchId.isNullOrEmpty() -> db.leadDao().getByBranch(branchId)
                    !franchiseId.isNullOrEmpty() -> db.leadDao().getByFranchise(franchiseId)
                    else -> db.leadDao().getAll()
                }
                call.resolve(JSObject().put("items", entitiesToJSArray(rows) { it.data }))
            } catch (e: Exception) { call.reject("getLeads failed: ${e.message}") }
        }
    }

    @PluginMethod
    fun deleteLead(call: PluginCall) {
        val id = call.getString("id") ?: return call.reject("id required")
        scope.launch {
            try { db.leadDao().deleteById(id); call.resolve() }
            catch (e: Exception) { call.reject(e.message) }
        }
    }

    // ─────────────────────────── BRANCHES ────────────────────────────────

    @PluginMethod
    fun upsertBranch(call: PluginCall) {
        val data = call.getObject("data") ?: return call.reject("data is required")
        scope.launch {
            try {
                val json = data.toString()
                val map: Map<String, Any?> = gson.fromJson(json, object : TypeToken<Map<String, Any?>>() {}.type)
                db.branchDao().upsert(BranchEntity(
                    id = map["id"] as? String ?: return@launch call.reject("id missing"),
                    franchiseId = map["franchise_id"] as? String ?: map["franchiseId"] as? String ?: "",
                    name = map["name"] as? String ?: "",
                    address = map["address"] as? String ?: "",
                    phone = map["phone"] as? String ?: "",
                    data = json
                ))
                call.resolve()
            } catch (e: Exception) { call.reject("upsertBranch failed: ${e.message}") }
        }
    }

    @PluginMethod
    fun upsertBranches(call: PluginCall) {
        val arr = call.getArray("items") ?: return call.reject("items array required")
        scope.launch {
            try {
                val entities = (0 until arr.length()).mapNotNull { i ->
                    val o = arr.getJSONObject(i); val json = o.toString()
                    val map: Map<String, Any?> = gson.fromJson(json, object : TypeToken<Map<String, Any?>>() {}.type)
                    val id = map["id"] as? String ?: return@mapNotNull null
                    BranchEntity(id = id, franchiseId = map["franchise_id"] as? String ?: map["franchiseId"] as? String ?: "",
                        name = map["name"] as? String ?: "", address = map["address"] as? String ?: "",
                        phone = map["phone"] as? String ?: "", data = json)
                }
                db.branchDao().upsertAll(entities)
                call.resolve(JSObject().put("inserted", entities.size))
            } catch (e: Exception) { call.reject("upsertBranches failed: ${e.message}") }
        }
    }

    @PluginMethod
    fun getBranches(call: PluginCall) {
        val franchiseId = call.getString("franchiseId")
        scope.launch {
            try {
                val rows = if (!franchiseId.isNullOrEmpty()) db.branchDao().getByFranchise(franchiseId)
                           else db.branchDao().getAll()
                call.resolve(JSObject().put("items", entitiesToJSArray(rows) { it.data }))
            } catch (e: Exception) { call.reject("getBranches failed: ${e.message}") }
        }
    }

    // ─────────────────────────── INVENTORY ───────────────────────────────

    @PluginMethod
    fun upsertInventoryItem(call: PluginCall) {
        val data = call.getObject("data") ?: return call.reject("data is required")
        scope.launch {
            try {
                val json = data.toString()
                val map: Map<String, Any?> = gson.fromJson(json, object : TypeToken<Map<String, Any?>>() {}.type)
                db.inventoryDao().upsert(InventoryEntity(
                    id = map["id"] as? String ?: return@launch call.reject("id missing"),
                    branchId = map["branch_id"] as? String ?: map["branchId"] as? String ?: "",
                    franchiseId = map["franchise_id"] as? String ?: map["franchiseId"] as? String ?: "",
                    itemName = map["item_name"] as? String ?: map["itemName"] as? String ?: map["name"] as? String ?: "",
                    category = map["category"] as? String ?: "",
                    quantity = (map["quantity"] as? Number)?.toDouble() ?: 0.0,
                    unit = map["unit"] as? String ?: "",
                    data = json,
                    isSynced = (map["isSynced"] as? Boolean) ?: true
                ))
                call.resolve()
            } catch (e: Exception) { call.reject("upsertInventoryItem failed: ${e.message}") }
        }
    }

    @PluginMethod
    fun upsertInventoryItems(call: PluginCall) {
        val arr = call.getArray("items") ?: return call.reject("items array required")
        scope.launch {
            try {
                val entities = (0 until arr.length()).mapNotNull { i ->
                    val o = arr.getJSONObject(i); val json = o.toString()
                    val map: Map<String, Any?> = gson.fromJson(json, object : TypeToken<Map<String, Any?>>() {}.type)
                    val id = map["id"] as? String ?: return@mapNotNull null
                    InventoryEntity(id = id, branchId = map["branch_id"] as? String ?: map["branchId"] as? String ?: "",
                        franchiseId = map["franchise_id"] as? String ?: map["franchiseId"] as? String ?: "",
                        itemName = map["item_name"] as? String ?: map["name"] as? String ?: "",
                        category = map["category"] as? String ?: "",
                        quantity = (map["quantity"] as? Number)?.toDouble() ?: 0.0,
                        unit = map["unit"] as? String ?: "", data = json, isSynced = true)
                }
                db.inventoryDao().upsertAll(entities)
                call.resolve(JSObject().put("inserted", entities.size))
            } catch (e: Exception) { call.reject("upsertInventoryItems failed: ${e.message}") }
        }
    }

    @PluginMethod
    fun getInventory(call: PluginCall) {
        val branchId = call.getString("branchId")
        scope.launch {
            try {
                val rows = if (!branchId.isNullOrEmpty()) db.inventoryDao().getByBranch(branchId)
                           else db.inventoryDao().getAll()
                call.resolve(JSObject().put("items", entitiesToJSArray(rows) { it.data }))
            } catch (e: Exception) { call.reject("getInventory failed: ${e.message}") }
        }
    }

    // ─────────────────────────── PENDING OPS ─────────────────────────────

    @PluginMethod
    fun enqueuePendingOp(call: PluginCall) {
        val collection = call.getString("collection") ?: return call.reject("collection required")
        val operation  = call.getString("operation") ?: return call.reject("operation required (CREATE|UPDATE|DELETE)")
        val docId      = call.getString("docId") ?: ""
        val payload    = call.getObject("payload")?.toString() ?: "{}"
        scope.launch {
            try {
                val id = db.pendingOperationDao().insert(PendingOperationEntity(
                    collection = collection, docId = docId,
                    operation = operation, payload = payload
                ))
                call.resolve(JSObject().put("id", id))
            } catch (e: Exception) { call.reject("enqueuePendingOp failed: ${e.message}") }
        }
    }

    @PluginMethod
    fun getPendingOps(call: PluginCall) {
        scope.launch {
            try {
                val rows = db.pendingOperationDao().getPending()
                val arr = JSONArray()
                rows.forEach { r ->
                    arr.put(JSONObject().apply {
                        put("id", r.id); put("collection", r.collection)
                        put("docId", r.docId); put("operation", r.operation)
                        put("payload", JSONObject(r.payload))
                        put("createdAt", r.createdAt); put("retryCount", r.retryCount)
                        put("status", r.status)
                    })
                }
                call.resolve(JSObject().put("items", arr))
            } catch (e: Exception) { call.reject("getPendingOps failed: ${e.message}") }
        }
    }

    @PluginMethod
    fun pendingCount(call: PluginCall) {
        scope.launch {
            try {
                val n = db.pendingOperationDao().pendingCount()
                call.resolve(JSObject().put("count", n))
            } catch (e: Exception) { call.reject(e.message) }
        }
    }

    @PluginMethod
    fun updatePendingOpStatus(call: PluginCall) {
        val id = call.getLong("id") ?: return call.reject("id required")
        val status = call.getString("status") ?: return call.reject("status required")
        scope.launch {
            try { db.pendingOperationDao().updateStatus(id, status); call.resolve() }
            catch (e: Exception) { call.reject(e.message) }
        }
    }

    @PluginMethod
    fun deletePendingOp(call: PluginCall) {
        val id = call.getLong("id") ?: return call.reject("id required")
        scope.launch {
            try { db.pendingOperationDao().deleteById(id); call.resolve() }
            catch (e: Exception) { call.reject(e.message) }
        }
    }

    @PluginMethod
    fun clearCompletedOps(call: PluginCall) {
        scope.launch {
            try { db.pendingOperationDao().clearCompleted(); call.resolve() }
            catch (e: Exception) { call.reject(e.message) }
        }
    }

    // ─────────────────────────── HELPERS ─────────────────────────────────

    private fun <T> entitiesToJSArray(rows: List<T>, dataFn: (T) -> String): JSONArray {
        val arr = JSONArray()
        rows.forEach { arr.put(JSONObject(dataFn(it))) }
        return arr
    }

    /** Convenience: get a Long from PluginCall (Capacitor uses Int by default for JS numbers) */
    private fun PluginCall.getLong(key: String): Long? {
        return this.data?.opt(key)?.let {
            when (it) {
                is Long -> it
                is Int -> it.toLong()
                is Double -> it.toLong()
                else -> null
            }
        }
    }
}
