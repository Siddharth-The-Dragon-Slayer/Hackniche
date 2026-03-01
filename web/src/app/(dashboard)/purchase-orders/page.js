"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import DataTable from "@/components/ui/DataTable";
import Badge from "@/components/ui/Badge";
import { fadeUp, staggerContainer } from "@/lib/motion-variants";
import {
  Plus,
  Download,
  Search,
  RefreshCw,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  DollarSign,
  Loader2,
  ArrowUpDown,
  Filter,
  PackageCheck,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

const STATUS_V = {
  Delivered: "green",
  Pending: "accent",
  Ordered: "primary",
  Cancelled: "red",
  Received: "green",
};
const PAYMENT_V = {
  Paid: "green",
  Pending: "accent",
  "Partially Paid": "accent",
  Overdue: "red",
};

const fmt = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");

export default function PurchaseOrdersPage() {
  const { userProfile } = useAuth();
  const franchiseId = userProfile?.franchise_id || "pfd";

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All");

  const fetchOrders = useCallback(async () => {
    if (!userProfile) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/purchase-order?franchise_id=${franchiseId}`,
      );
      const result = await res.json();
      if (result.success) setData(result.data || []);
    } catch (err) {
      console.error("Error fetching POs:", err);
    } finally {
      setLoading(false);
    }
  }, [userProfile, franchiseId]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Stats
  const stats = {
    total: data.length,
    pending: data.filter(
      (o) => o.status === "Ordered" || o.status === "Pending",
    ).length,
    delivered: data.filter(
      (o) => o.status === "Delivered" || o.status === "Received",
    ).length,
    totalValue: data.reduce((s, o) => s + (o.totalAmount || 0), 0),
    unpaid: data.filter(
      (o) => o.paymentStatus === "Pending" || o.paymentStatus === "Overdue",
    ).length,
  };

  // Filter data
  const filteredData = data
    .filter((o) => {
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        if (
          !o.id?.toLowerCase().includes(term) &&
          !o.vendorName?.toLowerCase().includes(term)
        )
          return false;
      }
      if (statusFilter !== "All" && o.status !== statusFilter) return false;
      if (paymentFilter !== "All" && o.paymentStatus !== paymentFilter)
        return false;
      return true;
    })
    .sort(
      (a, b) =>
        new Date(b.created || b.orderDate) - new Date(a.created || a.orderDate),
    );

  // Update PO status
  const updateStatus = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      const res = await fetch("/api/purchase-order", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          franchise_id: franchiseId,
          id: orderId,
          status: newStatus,
        }),
      });
      const result = await res.json();
      if (result.success) {
        setData((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
        );
      }
    } catch (err) {
      alert(`Failed to update: ${err.message}`);
    } finally {
      setUpdating(null);
    }
  };

  // Receive stock — updates PO status and adds stock to inventory
  const receiveStock = async (order) => {
    if (
      !confirm(
        `Receive stock for PO ${order.id}?\nThis will mark the PO as Delivered and add ${order.items?.length || 0} items to inventory.`,
      )
    )
      return;
    setUpdating(order.id);
    try {
      // 1. Mark PO as Delivered
      await fetch("/api/purchase-order", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          franchise_id: franchiseId,
          id: order.id,
          status: "Delivered",
        }),
      });

      // 2. Add stock for each item
      for (const item of order.items || []) {
        if (!item.itemId) continue;
        await fetch("/api/kitchen-inventory", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            franchise_id: franchiseId,
            id: item.itemId,
            currentStock: (item.currentStockBefore || 0) + (item.quantity || 0),
          }),
        });
      }

      setData((prev) =>
        prev.map((o) =>
          o.id === order.id ? { ...o, status: "Delivered" } : o,
        ),
      );
      alert("Stock received and inventory updated!");
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setUpdating(null);
    }
  };

  const generateInvoicePDF = (order) => {
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice - ${order.id}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1a1a1a; }
          .header { display: flex; justify-content: space-between; margin-bottom: 40px; border-bottom: 3px solid #6366f1; padding-bottom: 20px; }
          .company-info h1 { color: #6366f1; font-size: 28px; margin-bottom: 5px; }
          .company-info p { font-size: 13px; color: #666; }
          .invoice-info { text-align: right; }
          .invoice-info h2 { font-size: 24px; color: #333; margin-bottom: 10px; }
          .invoice-info p { font-size: 13px; color: #666; margin: 3px 0; }
          .section { margin-bottom: 30px; }
          .section-title { font-size: 14px; font-weight: 700; color: #6366f1; text-transform: uppercase; margin-bottom: 12px; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
          .info-box { background: #f8f9fa; padding: 15px; border-radius: 6px; }
          .info-box label { font-size: 11px; color: #666; text-transform: uppercase; display: block; margin-bottom: 4px; }
          .info-box .value { font-size: 14px; font-weight: 600; color: #1a1a1a; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          thead { background: #6366f1; color: white; }
          th { padding: 12px; text-align: left; font-size: 12px; font-weight: 600; text-transform: uppercase; }
          th.right { text-align: right; }
          td { padding: 12px; border-bottom: 1px solid #e5e7eb; font-size: 13px; }
          td.right { text-align: right; font-family: 'Courier New', monospace; }
          .totals { margin-top: 30px; float: right; width: 350px; }
          .totals-row { display: flex; justify-content: space-between; padding: 10px 15px; font-size: 14px; }
          .totals-row.subtotal { background: #f8f9fa; }
          .totals-row.tax { background: #f1f3f5; color: #495057; }
          .totals-row.total { background: #6366f1; color: white; font-size: 18px; font-weight: 700; margin-top: 5px; border-radius: 6px; }
          .footer { margin-top: 60px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-info">
            <h1>BanquetEase</h1>
            <p>Premium Event Management</p>
          </div>
          <div class="invoice-info">
            <h2>PURCHASE ORDER</h2>
            <p><strong>PO:</strong> ${order.id}</p>
            <p><strong>Date:</strong> ${order.orderDate || "—"}</p>
            <p><strong>Status:</strong> ${order.status}</p>
          </div>
        </div>
        <div class="section">
          <div class="info-grid">
            <div class="info-box"><label>Vendor</label><div class="value">${order.vendorName}</div></div>
            <div class="info-box"><label>Payment</label><div class="value">${order.paymentStatus} · ${order.paymentTerms || "Net 30"}</div></div>
          </div>
        </div>
        <div class="section">
          <div class="section-title">Items</div>
          <table>
            <thead><tr><th>Item</th><th class="right">Qty</th><th class="right">Unit Price</th><th class="right">Total</th></tr></thead>
            <tbody>
              ${(order.items || []).map((item) => `<tr><td>${item.name}</td><td class="right">${item.quantity} ${item.unit}</td><td class="right">₹${(item.unitPrice || 0).toFixed(2)}</td><td class="right">₹${(item.total || 0).toFixed(2)}</td></tr>`).join("")}
            </tbody>
          </table>
        </div>
        <div class="totals">
          <div class="totals-row subtotal"><span>Subtotal</span><span>₹${(order.subtotal || 0).toFixed(2)}</span></div>
          ${order.cgst ? `<div class="totals-row tax"><span>CGST</span><span>₹${order.cgst.toFixed(2)}</span></div>` : ""}
          ${order.sgst ? `<div class="totals-row tax"><span>SGST</span><span>₹${order.sgst.toFixed(2)}</span></div>` : ""}
          ${order.igst ? `<div class="totals-row tax"><span>IGST</span><span>₹${order.igst.toFixed(2)}</span></div>` : ""}
          <div class="totals-row total"><span>Total</span><span>₹${(order.totalAmount || 0).toFixed(2)}</span></div>
        </div>
        <div style="clear:both"></div>
        <div class="footer"><p>Computer-generated document</p></div>
      </body></html>`;
    const w = window.open("", "_blank");
    w.document.write(invoiceHTML);
    w.document.close();
    w.onload = () => w.print();
  };

  const columns = [
    {
      key: "id",
      label: "PO #",
      render: (v) => (
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          {v}
        </span>
      ),
    },
    {
      key: "vendorName",
      label: "Supplier",
      render: (v, row) => (
        <div>
          <span
            style={{
              fontWeight: 600,
              color: "var(--color-text-h)",
              display: "block",
            }}
          >
            {v}
          </span>
          {row.branchId && (
            <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
              Branch: {row.branchId}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "items",
      label: "Items",
      render: (v) => {
        if (!Array.isArray(v)) return v;
        return (
          <div style={{ fontSize: 12 }}>
            <span style={{ fontWeight: 600 }}>
              {v.length} item{v.length !== 1 ? "s" : ""}
            </span>
            <div style={{ color: "var(--color-text-muted)", marginTop: 2 }}>
              {v
                .slice(0, 2)
                .map((i) => i.name)
                .join(", ")}
              {v.length > 2 && ` +${v.length - 2} more`}
            </div>
          </div>
        );
      },
    },
    {
      key: "totalAmount",
      label: "Total",
      render: (v) => (
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontWeight: 700,
            color: "var(--color-text-h)",
          }}
        >
          {fmt(v)}
        </span>
      ),
    },
    {
      key: "orderDate",
      label: "Ordered",
      render: (v) =>
        v ? (
          <span style={{ fontSize: 13 }}>
            {new Date(v).toLocaleDateString("en-GB")}
          </span>
        ) : (
          "—"
        ),
    },
    {
      key: "expectedDelivery",
      label: "Expected",
      render: (v) => {
        if (!v) return "—";
        const d = new Date(v);
        const isOverdue = d < new Date() && true;
        return (
          <span
            style={{
              fontSize: 13,
              color: isOverdue ? "#ef4444" : undefined,
              fontWeight: isOverdue ? 600 : 400,
            }}
          >
            {d.toLocaleDateString("en-GB")}
          </span>
        );
      },
    },
    {
      key: "paymentStatus",
      label: "Payment",
      render: (v) => <Badge variant={PAYMENT_V[v] || "neutral"}>{v}</Badge>,
    },
    {
      key: "status",
      label: "Status",
      render: (v) => <Badge variant={STATUS_V[v] || "neutral"}>{v}</Badge>,
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => (
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {(row.status === "Ordered" || row.status === "Pending") && (
            <button
              onClick={() => receiveStock(row)}
              disabled={updating === row.id}
              style={{
                background: "#10b981",
                color: "#fff",
                border: "none",
                padding: "5px 10px",
                borderRadius: 6,
                cursor: "pointer",
                fontSize: 11,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 4,
                opacity: updating === row.id ? 0.5 : 1,
              }}
            >
              <PackageCheck size={13} /> Receive
            </button>
          )}
          {row.status === "Delivered" && (
            <button
              onClick={() => generateInvoicePDF(row)}
              style={{
                background: "#6366f1",
                color: "#fff",
                border: "none",
                padding: "5px 10px",
                borderRadius: 6,
                cursor: "pointer",
                fontSize: 11,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Download size={13} /> Invoice
            </button>
          )}
          {row.status === "Ordered" && (
            <button
              onClick={() => updateStatus(row.id, "Cancelled")}
              disabled={updating === row.id}
              style={{
                background: "#fef2f2",
                color: "#ef4444",
                border: "1px solid #fecaca",
                padding: "5px 10px",
                borderRadius: 6,
                cursor: "pointer",
                fontSize: 11,
                fontWeight: 600,
                opacity: updating === row.id ? 0.5 : 1,
              }}
            >
              Cancel
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
      {/* Header */}
      <motion.div
        variants={fadeUp}
        className="page-header"
        style={{ marginBottom: 20 }}
      >
        <div className="page-header-left">
          <h1>Purchase Orders</h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: 14 }}>
            {loading
              ? "Loading..."
              : `${stats.total} orders · ${stats.pending} pending · ${fmt(stats.totalValue)} total value`}
          </p>
        </div>
        <div
          className="page-actions"
          style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
        >
          <button
            className="btn btn-ghost btn-sm"
            onClick={fetchOrders}
            disabled={loading}
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <Link
            href="/inventory"
            className="btn btn-outline btn-sm"
            style={{ textDecoration: "none" }}
          >
            <Package size={14} /> Raw Materials
          </Link>
          <Link
            href="/purchase-orders/create"
            className="btn btn-primary btn-sm"
            style={{ textDecoration: "none" }}
          >
            <Plus size={14} /> New Purchase Order
          </Link>
        </div>
      </motion.div>

      {/* Stats Cards */}
      {!loading && (
        <motion.div
          variants={fadeUp}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 14,
            marginBottom: 20,
          }}
        >
          <div
            className="card"
            style={{
              padding: "14px 18px",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: "rgba(99,102,241,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Package size={18} style={{ color: "#6366f1" }} />
            </div>
            <div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: "var(--color-text-h)",
                }}
              >
                {stats.total}
              </div>
              <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
                Total Orders
              </div>
            </div>
          </div>
          <div
            className="card"
            style={{
              padding: "14px 18px",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: "rgba(245,158,11,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Clock size={18} style={{ color: "#f59e0b" }} />
            </div>
            <div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: stats.pending > 0 ? "#f59e0b" : "var(--color-text-h)",
                }}
              >
                {stats.pending}
              </div>
              <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
                Pending Delivery
              </div>
            </div>
          </div>
          <div
            className="card"
            style={{
              padding: "14px 18px",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: "rgba(16,185,129,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CheckCircle2 size={18} style={{ color: "#10b981" }} />
            </div>
            <div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: "var(--color-text-h)",
                }}
              >
                {stats.delivered}
              </div>
              <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
                Delivered
              </div>
            </div>
          </div>
          <div
            className="card"
            style={{
              padding: "14px 18px",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: "rgba(99,102,241,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <DollarSign size={18} style={{ color: "#6366f1" }} />
            </div>
            <div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: "var(--color-text-h)",
                }}
              >
                {fmt(stats.totalValue)}
              </div>
              <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
                Total Value
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Pending orders alert */}
      {!loading && stats.unpaid > 0 && (
        <motion.div
          variants={fadeUp}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "12px 20px",
            borderRadius: 12,
            background: "rgba(245,158,11,0.06)",
            border: "1px solid rgba(245,158,11,0.15)",
            marginBottom: 20,
          }}
        >
          <AlertTriangle
            size={18}
            style={{ color: "#f59e0b", flexShrink: 0 }}
          />
          <span style={{ fontSize: 14, color: "var(--color-text-h)" }}>
            <strong>
              {stats.unpaid} order{stats.unpaid > 1 ? "s" : ""}
            </strong>{" "}
            have pending/overdue payment
          </span>
        </motion.div>
      )}

      {/* Filters */}
      <motion.div
        variants={fadeUp}
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 16,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <div style={{ position: "relative", flex: "1 1 220px", maxWidth: 300 }}>
          <Search
            size={14}
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--color-text-muted)",
            }}
          />
          <input
            className="input"
            placeholder="Search PO # or vendor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: 34 }}
          />
        </div>
        <select
          className="input"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ width: "auto", minWidth: 130 }}
        >
          <option value="All">All Status</option>
          <option value="Ordered">Ordered</option>
          <option value="Pending">Pending</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>
        <select
          className="input"
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          style={{ width: "auto", minWidth: 140 }}
        >
          <option value="All">All Payments</option>
          <option value="Paid">Paid</option>
          <option value="Pending">Pending</option>
          <option value="Overdue">Overdue</option>
        </select>
      </motion.div>

      {/* Table */}
      <motion.div variants={fadeUp}>
        {loading ? (
          <div className="card" style={{ padding: 60, textAlign: "center" }}>
            <Loader2
              size={24}
              style={{
                animation: "spin 1s linear infinite",
                color: "var(--color-text-muted)",
                marginBottom: 12,
              }}
            />
            <div style={{ fontSize: 14, color: "var(--color-text-muted)" }}>
              Loading purchase orders...
            </div>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredData}
            keyField="id"
            emptyMessage="No purchase orders found. Create your first PO to get started."
            mobileRender={(row) => (
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 8,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: 14,
                        color: "var(--color-text-h)",
                      }}
                    >
                      {row.vendorName}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--color-text-muted)",
                        fontFamily: "var(--font-mono)",
                        marginTop: 2,
                      }}
                    >
                      {row.id}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <Badge variant={STATUS_V[row.status] || "neutral"}>
                      {row.status}
                    </Badge>
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontWeight: 700,
                        marginTop: 4,
                        fontSize: 15,
                      }}
                    >
                      {fmt(row.totalAmount)}
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    fontSize: 12,
                    color: "var(--color-text-muted)",
                    marginBottom: 8,
                  }}
                >
                  <span>{row.items?.length || 0} items</span>
                  <span>
                    Ordered:{" "}
                    {row.orderDate
                      ? new Date(row.orderDate).toLocaleDateString("en-GB")
                      : "—"}
                  </span>
                  <span>
                    Expected:{" "}
                    {row.expectedDelivery
                      ? new Date(row.expectedDelivery).toLocaleDateString(
                          "en-GB",
                        )
                      : "—"}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Badge variant={PAYMENT_V[row.paymentStatus] || "neutral"}>
                    {row.paymentStatus}
                  </Badge>
                  {(row.status === "Ordered" || row.status === "Pending") && (
                    <button
                      onClick={() => receiveStock(row)}
                      disabled={updating === row.id}
                      style={{
                        background: "#10b981",
                        color: "#fff",
                        border: "none",
                        padding: "6px 12px",
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        flex: 1,
                        justifyContent: "center",
                      }}
                    >
                      <PackageCheck size={13} /> Receive Stock
                    </button>
                  )}
                  {row.status === "Delivered" && (
                    <button
                      onClick={() => generateInvoicePDF(row)}
                      style={{
                        background: "#6366f1",
                        color: "#fff",
                        border: "none",
                        padding: "6px 12px",
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        flex: 1,
                        justifyContent: "center",
                      }}
                    >
                      <Download size={13} /> Invoice
                    </button>
                  )}
                </div>
              </div>
            )}
          />
        )}
      </motion.div>
    </motion.div>
  );
}
