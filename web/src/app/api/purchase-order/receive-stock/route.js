// Receive Stock API — triggered when a Purchase Order is delivered
// Updates inventory stock levels based on PO items and marks PO as delivered

import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { cache } from "@/lib/cache";
import {
  buildStockReceivedEmail,
  sendInventoryEmail,
} from "@/lib/inventory-emails";

// POST — receive stock for a purchase order
export async function POST(request) {
  try {
    const body = await request.json();
    const { franchise_id, po_id, received_items, received_by } = body;

    if (!franchise_id || !po_id) {
      return NextResponse.json(
        {
          success: false,
          error: "Required: franchise_id, po_id",
        },
        { status: 400 },
      );
    }

    const db = getAdminDb();

    // 1. Fetch the purchase order
    const poDocRef = db.collection("purchase-order").doc(franchise_id);
    const poDoc = await poDocRef.get();

    if (!poDoc.exists) {
      return NextResponse.json(
        {
          success: false,
          error: "No purchase orders found for this franchise",
        },
        { status: 404 },
      );
    }

    const poData = poDoc.data();
    const orders = poData.orders || [];
    const orderIndex = orders.findIndex((o) => o.id === po_id);

    if (orderIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: `Purchase order ${po_id} not found`,
        },
        { status: 404 },
      );
    }

    const order = orders[orderIndex];

    if (order.status === "Delivered" || order.status === "Received") {
      return NextResponse.json(
        {
          success: false,
          error: "This purchase order has already been received",
        },
        { status: 400 },
      );
    }

    // 2. Update inventory stock for each item
    const invDocRef = db.collection("kitchen-inventory").doc(franchise_id);
    const invDoc = await invDocRef.get();

    const stockUpdates = [];
    const notFound = [];

    if (invDoc.exists) {
      const invData = invDoc.data();
      const items = invData.items || [];

      const poItems = received_items || order.items || [];

      for (const poItem of poItems) {
        const receivedQty = poItem.receivedQuantity || poItem.quantity || 0;

        // Try to match by itemId first, then by name
        let invIdx = -1;
        if (poItem.itemId) {
          invIdx = items.findIndex((i) => i.id === poItem.itemId);
        }
        if (invIdx === -1 && poItem.name) {
          invIdx = items.findIndex(
            (i) => i.name.toLowerCase() === poItem.name.toLowerCase(),
          );
        }

        if (invIdx !== -1) {
          const oldStock = items[invIdx].currentStock || 0;
          const newStock = oldStock + receivedQty;

          items[invIdx] = {
            ...items[invIdx],
            currentStock: newStock,
            status:
              newStock <= items[invIdx].minStock ? "low-stock" : "in-stock",
            lastRestocked: new Date().toISOString().split("T")[0],
            updated: new Date().toISOString(),
          };

          stockUpdates.push({
            itemId: items[invIdx].id,
            name: items[invIdx].name,
            previousStock: oldStock,
            receivedQty,
            newStock,
            unit: items[invIdx].unit,
          });
        } else {
          notFound.push({
            name: poItem.name || poItem.itemId,
            quantity: receivedQty,
            reason: "Item not found in inventory — add it manually",
          });
        }
      }

      // Save updated inventory
      await invDocRef.update({
        items,
        lastUpdated: new Date().toISOString(),
      });
    }

    // 3. Mark PO as Delivered
    orders[orderIndex] = {
      ...orders[orderIndex],
      status: "Delivered",
      deliveredDate: new Date().toISOString().split("T")[0],
      receivedBy: received_by || "system",
      stockUpdates,
      notFoundItems: notFound,
      updated: new Date().toISOString(),
    };

    await poDocRef.update({
      orders,
      lastUpdated: new Date().toISOString(),
    });

    // Invalidate analytics cache
    cache.del(`inv_analytics:${franchise_id}`);

    // Email notification (fire-and-forget)
    const notifyEmail = body.notify_email;
    if (notifyEmail) {
      const recvHtml = buildStockReceivedEmail({
        poId: po_id,
        stockUpdates,
        vendorName: order.vendorName,
      });
      sendInventoryEmail(
        notifyEmail,
        `Stock Received — PO ${po_id}`,
        recvHtml,
      ).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      message: `Stock received for PO ${po_id}: ${stockUpdates.length} items updated`,
      data: {
        po_id,
        status: "Delivered",
        stockUpdates,
        notFoundItems: notFound,
        totalItemsReceived: stockUpdates.length,
        totalItemsNotFound: notFound.length,
      },
    });
  } catch (error) {
    console.error("Receive stock error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to receive stock",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
