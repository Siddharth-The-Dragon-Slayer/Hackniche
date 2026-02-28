'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import DataTable from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import { fadeUp, staggerContainer } from '@/lib/motion-variants';
import { Plus, Download } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

const STATUS_V = { Delivered: 'green', Pending: 'accent', Ordered: 'primary', Cancelled: 'red' };

export default function PurchaseOrdersPage() {
  const generateInvoicePDF = (order) => {
    // Create invoice HTML content
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
          .section-title { font-size: 14px; font-weight: 700; color: #6366f1; text-transform: uppercase; margin-bottom: 12px; letter-spacing: 0.5px; }
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
          tbody tr:hover { background: #f9fafb; }
          .totals { margin-top: 30px; float: right; width: 350px; }
          .totals-row { display: flex; justify-content: space-between; padding: 10px 15px; font-size: 14px; }
          .totals-row.subtotal { background: #f8f9fa; }
          .totals-row.tax { background: #f1f3f5; color: #495057; }
          .totals-row.total { background: #6366f1; color: white; font-size: 18px; font-weight: 700; margin-top: 5px; border-radius: 6px; }
          .footer { margin-top: 60px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; font-size: 12px; color: #666; }
          .badge { display: inline-block; padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: 600; }
          .badge-green { background: #d1fae5; color: #065f46; }
          .badge-red { background: #fee2e2; color: #991b1b; }
          .badge-yellow { background: #fef3c7; color: #92400e; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-info">
            <h1>BanquetEase</h1>
            <p>Premium Event Management</p>
            <p>contact@banquetease.com | +91 XXX XXX XXXX</p>
          </div>
          <div class="invoice-info">
            <h2>INVOICE</h2>
            <p><strong>PO Number:</strong> ${order.id}</p>
            <p><strong>Date:</strong> ${order.orderDate || new Date().toLocaleDateString('en-IN')}</p>
            <p><strong>Status:</strong> <span class="badge badge-green">${order.status}</span></p>
          </div>
        </div>

        <div class="section">
          <div class="info-grid">
            <div class="info-box">
              <label>Vendor Details</label>
              <div class="value">${order.vendorName}</div>
              ${order.deliveryAddress ? `<p style="font-size: 12px; color: #666; margin-top: 5px;">${order.deliveryAddress}</p>` : ''}
            </div>
            <div class="info-box">
              <label>Payment Information</label>
              <div class="value">
                <span class="badge ${order.paymentStatus === 'Paid' ? 'badge-green' : order.paymentStatus === 'Pending' ? 'badge-yellow' : 'badge-red'}">${order.paymentStatus}</span>
              </div>
              <p style="font-size: 12px; color: #666; margin-top: 5px;">Terms: ${order.paymentTerms || 'Net 30'}</p>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Order Items</div>
          <table>
            <thead>
              <tr>
                <th>Item Name</th>
                <th>SKU</th>
                <th class="right">Quantity</th>
                <th class="right">Unit Price</th>
                <th class="right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.sku || '-'}</td>
                  <td class="right">${item.quantity} ${item.unit}</td>
                  <td class="right">₹${item.unitPrice.toFixed(2)}</td>
                  <td class="right">₹${item.total.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="totals">
          <div class="totals-row subtotal">
            <span>Subtotal</span>
            <span>₹${order.subtotal.toFixed(2)}</span>
          </div>
          ${order.cgst ? `
            <div class="totals-row tax">
              <span>CGST (${(order.cgstRate * 100).toFixed(2)}%)</span>
              <span>₹${order.cgst.toFixed(2)}</span>
            </div>
            <div class="totals-row tax">
              <span>SGST (${(order.sgstRate * 100).toFixed(2)}%)</span>
              <span>₹${order.sgst.toFixed(2)}</span>
            </div>
          ` : ''}
          ${order.igst ? `
            <div class="totals-row tax">
              <span>IGST (${(order.igstRate * 100).toFixed(2)}%)</span>
              <span>₹${order.igst.toFixed(2)}</span>
            </div>
          ` : ''}
          <div class="totals-row total">
            <span>Grand Total</span>
            <span>₹${order.totalAmount.toFixed(2)}</span>
          </div>
        </div>

        <div style="clear: both;"></div>

        ${order.notes ? `
          <div class="section" style="margin-top: 40px;">
            <div class="section-title">Notes</div>
            <p style="font-size: 13px; color: #666; line-height: 1.6;">${order.notes}</p>
          </div>
        ` : ''}

        <div class="footer">
          <p>Thank you for your business!</p>
          <p style="margin-top: 10px;">This is a computer-generated invoice. No signature required.</p>
        </div>
      </body>
      </html>
    `;

    // Open print window
    const printWindow = window.open('', '_blank');
    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
    
    // Wait for content to load, then trigger print
    printWindow.onload = function() {
      printWindow.print();
    };
  };

  const columns = [
    { key: 'id',       label: 'PO #',      render: v => <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{v}</span> },
    { key: 'vendorName',   label: 'Vendor',    render: v => <span style={{ fontWeight: 600, color: 'var(--color-text-h)' }}>{v}</span> },
    { key: 'items',    label: 'Items',     render: v => Array.isArray(v) ? v.length + ' items' : v },
    { key: 'totalAmount',    label: 'Total',     render: v => <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>₹{(v/1000).toFixed(1)}K</span> },
    { key: 'orderDate',label: 'Ordered' },
    { key: 'expectedDelivery', label: 'Expected' },
    { key: 'paymentStatus', label: 'Payment', render: v => <Badge variant={v === 'Paid' ? 'green' : v === 'Pending' ? 'accent' : 'red'}>{v}</Badge> },
    { key: 'status',   label: 'Status',    render: v => <Badge variant={STATUS_V[v] || 'neutral'}>{v}</Badge> },
    { 
      key: 'actions',   
      label: 'Actions',    
      render: (_, row) => {
        if (row.status === 'Delivered') {
          return (
            <button 
              onClick={() => generateInvoicePDF(row)}
              style={{ 
                background: '#6366f1', 
                color: 'white', 
                border: 'none', 
                padding: '6px 12px', 
                borderRadius: '6px', 
                cursor: 'pointer', 
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontWeight: 500
              }}
              title="Download Invoice"
            >
              <Download size={14} /> Invoice
            </button>
          );
        }
        return <span style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>-</span>;
      }
    },
  ];
  const { userProfile } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPurchaseOrders = async () => {
      try {
        const franchiseId = userProfile?.franchise_id || 'pfd';
        const response = await fetch(`/api/purchase-order?franchise_id=${franchiseId}`);
        const result = await response.json();
        
        if (result.success) {
          setData(result.data);
        }
      } catch (error) {
        console.error('Error fetching purchase orders:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userProfile) {
      fetchPurchaseOrders();
    }
  }, [userProfile]);

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
      <motion.div variants={fadeUp} className="page-header" style={{ marginBottom: 24 }}>
        <div className="page-header-left">
          <h1>Purchase Orders</h1>
          <p>{data.length} purchase orders</p>
        </div>
        <div className="page-actions">
          <Link href="/purchase-orders/create" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}><Plus size={14} /> New PO</Link>
        </div>
      </motion.div>
      <motion.div variants={fadeUp}>
        <DataTable columns={columns} data={data} keyField="id" emptyMessage="No purchase orders found"
          mobileRender={(row) => (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-text-h)' }}>{row.vendor}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>{row.id}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <Badge variant={STATUS_V[row.status] || 'neutral'}>{row.status}</Badge>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, marginTop: 4 }}>₹{(row.total/1000).toFixed(0)}K</div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)', display: 'flex', gap: 12 }}>
                <span>Ordered: {row.orderDate}</span>
                <span>Expected: {row.expectedDelivery}</span>
              </div>
            </div>
          )}
        />
      </motion.div>
    </motion.div>
  );
}
