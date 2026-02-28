'use client';
import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { fadeUp, staggerContainer } from '@/lib/motion-variants';
import { leadData } from '@/lib/mock-data';
import DataTable from '@/components/ui/DataTable';
import Tabs from '@/components/ui/Tabs';
import SearchRow from '@/components/ui/SearchRow';
import Badge from '@/components/ui/Badge';
import { Plus, Download, Filter } from 'lucide-react';

const STATUSES = ['All', 'New', 'Hot', 'Warm', 'Cold', 'Contacted', 'Proposal Sent', 'Converted', 'Lost'];

const STATUS_VARIANT = { Hot: 'red', Warm: 'accent', Cold: 'neutral', Converted: 'green', Lost: 'neutral', New: 'primary' };
const AI_COLOR = s => s >= 70 ? 'var(--color-success)' : s >= 40 ? 'var(--color-warning)' : 'var(--color-danger)';

const columns = [
  { key: 'client',  label: 'Client',    render: (v, row) => <div><div style={{ fontWeight: 600, color: 'var(--color-text-h)' }}>{v}</div><div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{row.phone}</div></div> },
  { key: 'eventType', label: 'Event' },
  { key: 'preferredDate', label: 'Date' },
  { key: 'guests', label: 'Guests' },
  { key: 'source', label: 'Source', render: v => <Badge variant="neutral">{v}</Badge> },
  { key: 'aiScore', label: 'AI Score', render: v => <div style={{ width: 32, height: 32, borderRadius: '50%', background: AI_COLOR(v), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', fontFamily: 'var(--font-mono)' }}>{v}</div> },
  { key: 'assignedTo', label: 'Assigned' },
  { key: 'status', label: 'Status', render: v => <Badge variant={STATUS_VARIANT[v] || 'primary'}>{v}</Badge> },
];

export default function LeadsPage() {
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = leadData
    .filter(l => activeTab === 'All' || l.status === activeTab)
    .filter(l => !search || l.client.toLowerCase().includes(search.toLowerCase()) || (l.phone || '').includes(search));

  const tabs = STATUSES.map(s => ({
    key: s, label: s,
    count: s === 'All' ? leadData.length : leadData.filter(l => l.status === s).length,
  }));

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
      <motion.div variants={fadeUp} className="page-header" style={{ marginBottom: 24 }}>
        <div className="page-header-left">
          <h1>Leads</h1>
          <p>{leadData.length} total · {leadData.filter(l => l.aiScore >= 70).length} hot</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-outline btn-sm"><Filter size={14} /> Filter</button>
          <button className="btn btn-outline btn-sm"><Download size={14} /> Export</button>
          <Link href="/leads/create" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}><Plus size={14} /> New Lead</Link>
        </div>
      </motion.div>

      <motion.div variants={fadeUp}>
        <SearchRow placeholder="Search by name or phone..." value={search} onChange={e => setSearch(e.target.value)} style={{ marginBottom: 0 }} />
      </motion.div>

      <motion.div variants={fadeUp}>
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      </motion.div>

      <motion.div variants={fadeUp}>
        <DataTable
          columns={columns}
          data={filtered}
          keyField="id"
          emptyMessage="No leads match your search"
          mobileRender={(row) => (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-text-h)' }}>{row.client}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>{row.phone} · {row.eventType}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: AI_COLOR(row.aiScore), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff' }}>{row.aiScore}</div>
                  <Badge variant={STATUS_VARIANT[row.status] || 'primary'}>{row.status}</Badge>
                </div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <span>📅 {row.preferredDate}</span>
                <span>👥 {row.guests} guests</span>
                <span>via {row.source}</span>
              </div>
            </div>
          )}
        />
      </motion.div>
    </motion.div>
  );
}
