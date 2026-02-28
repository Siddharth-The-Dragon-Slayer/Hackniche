'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { bookingData } from '@/lib/mock-data';
import DataTable from '@/components/ui/DataTable';
import Tabs from '@/components/ui/Tabs';
import SearchRow from '@/components/ui/SearchRow';
import Badge from '@/components/ui/Badge';
import { staggerContainer, fadeUp } from '@/lib/motion-variants';
import { Plus, Download, CalendarDays } from 'lucide-react';

const STATUSES = ['All', 'Confirmed', 'Tentative', 'Completed', 'Cancelled'];

const STATUS_VARIANT = {
  Confirmed: 'green',
  Completed: 'primary',
  Tentative: 'accent',
  Cancelled: 'red',
};

const columns = [
  { key: 'id',        label: 'ID',      render: v => <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{v}</span> },
  { key: 'client',    label: 'Client',  render: v => <span style={{ fontWeight: 600, color: 'var(--color-text-h)' }}>{v}</span> },
  { key: 'eventType', label: 'Event'  },
  { key: 'hall',      label: 'Hall'   },
  { key: 'date',      label: 'Date'   },
  { key: 'guests',    label: 'Guests' },
  { key: 'total',     label: 'Total',   render: v => <span style={{ fontFamily: 'var(--font-mono)' }}>₹{(v/1000).toFixed(0)}K</span> },
  { key: 'balance',   label: 'Balance', render: (v) => <span style={{ fontFamily: 'var(--font-mono)', color: v > 0 ? 'var(--color-danger)' : 'var(--color-success)', fontWeight: 600 }}>₹{(v/1000).toFixed(0)}K</span> },
  { key: 'status',    label: 'Status',  render: v => <Badge variant={STATUS_VARIANT[v] || 'neutral'}>{v}</Badge> },
];

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = bookingData
    .filter(b => activeTab === 'All' || b.status === activeTab)
    .filter(b => !search || b.client.toLowerCase().includes(search.toLowerCase()) || b.id.toLowerCase().includes(search.toLowerCase()));

  const tabs = STATUSES.map(s => ({
    key: s, label: s,
    count: s === 'All' ? bookingData.length : bookingData.filter(b => b.status === s).length,
  }));

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
      {/* Page Header */}
      <motion.div variants={fadeUp} className="page-header" style={{ marginBottom: 24 }}>
        <div className="page-header-left">
          <h1>Bookings</h1>
          <p>{bookingData.length} total bookings</p>
        </div>
        <div className="page-actions">
          <Link href="/calendar" className="btn btn-outline btn-sm" style={{ textDecoration: 'none' }}>
            <CalendarDays size={14} /> Calendar
          </Link>
          <button className="btn btn-outline btn-sm"><Download size={14} /> Export</button>
          <Link href="/bookings/create" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>
            <Plus size={14} /> New Booking
          </Link>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div variants={fadeUp}>
        <SearchRow
          placeholder="Search bookings by client or ID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ marginBottom: 0 }}
        />
      </motion.div>

      {/* Tabs */}
      <motion.div variants={fadeUp}>
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      </motion.div>

      {/* Table (desktop) + Cards (mobile) */}
      <motion.div variants={fadeUp}>
        <DataTable
          columns={columns}
          data={filtered}
          keyField="id"
          emptyMessage="No bookings match your filter"
          mobileRender={(row) => (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-h)' }}>{row.client}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>
                    {row.eventType} · {row.hall}
                  </div>
                </div>
                <Badge variant={STATUS_VARIANT[row.status] || 'neutral'}>{row.status}</Badge>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px', fontSize: 12, color: 'var(--color-text-muted)' }}>
                <span>📅 {row.date}</span>
                <span>👥 {row.guests} guests</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>₹{(row.total/1000).toFixed(0)}K</span>
                {row.balance > 0 && <span style={{ color: 'var(--color-danger)', fontFamily: 'var(--font-mono)' }}>Due: ₹{(row.balance/1000).toFixed(0)}K</span>}
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>{row.id}</div>
            </div>
          )}
        />
      </motion.div>
    </motion.div>
  );
}
