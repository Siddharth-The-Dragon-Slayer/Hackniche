'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { fadeUp, staggerContainer } from '@/lib/motion-variants';
import { useAuth } from '@/contexts/auth-context';
import DataTable from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import Tabs from '@/components/ui/Tabs';
import SearchRow from '@/components/ui/SearchRow';
import { Plus, Download, Phone, Calendar, Users, Building2, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';

// ── STATUS → Badge variant ─────────────────────────────────────────────────
const STATUS_VARIANT = {
  new:                  'primary',
  visited:              'accent',
  tasting_scheduled:    'warning',
  tasting_done:         'warning',
  menu_selected:        'green',
  advance_paid:         'green',
  decoration_scheduled: 'accent',
  paid:                 'green',
  in_progress:          'accent',
  completed:            'green',
  settlement_pending:   'warning',
  settlement_complete:  'green',
  feedback_pending:     'neutral',
  closed:               'green',
  lost:                 'red',
};

const STATUS_LABELS = {
  new: 'New', visited: 'Visited', tasting_scheduled: 'Tasting Sched.',
  tasting_done: 'Tasting Done', menu_selected: 'Menu Selected',
  advance_paid: 'Advance Paid', decoration_scheduled: 'Decor Sched.',
  paid: 'Fully Paid', in_progress: 'In Progress', completed: 'Completed',
  settlement_pending: 'Settlement', settlement_complete: 'Settled',
  feedback_pending: 'Feedback', closed: 'Closed', lost: 'Lost',
};

// ── TAB GROUPS ─────────────────────────────────────────────────────────────
const TAB_GROUPS = [
  { key: 'all',    label: 'All' },
  { key: 'new',    label: 'New' },
  { key: 'active', label: 'Active', statuses: ['visited','tasting_scheduled','tasting_done','menu_selected','advance_paid','decoration_scheduled'] },
  { key: 'paid',   label: 'Paid',   statuses: ['paid','in_progress'] },
  { key: 'done',   label: 'Done',   statuses: ['completed','settlement_pending','settlement_complete','feedback_pending','closed'] },
  { key: 'lost',   label: 'Lost' },
];

// ── TABLE COLUMNS ──────────────────────────────────────────────────────────
const columns = [
  {
    key: 'customer_name', label: 'Customer',
    render: (v, row) => (
      <div>
        <div style={{ fontWeight: 600, color: 'var(--color-text-h)' }}>{v}</div>
        {row.email && <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{row.email}</div>}
      </div>
    ),
  },
  {
    key: 'phone', label: 'Phone',
    render: v => (
      <a href={`tel:${v}`} style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-mono)', fontSize: 13 }}
         onClick={e => e.stopPropagation()}>
        {v}
      </a>
    ),
  },
  { key: 'event_type',           label: 'Event',      render: v => v || '—' },
  { key: 'event_date',           label: 'Event Date', render: v => v || '—' },
  { key: 'expected_guest_count', label: 'Guests',     render: v => v || '—' },
  {
    key: 'assigned_to_name', label: 'Assigned To',
    render: v => v
      ? <span style={{ fontSize: 13 }}>{v}</span>
      : <span style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>Unassigned</span>,
  },
  {
    key: 'status', label: 'Status',
    render: (v, row) => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-start' }}>
        <Badge variant={STATUS_VARIANT[v] || 'neutral'}>{STATUS_LABELS[v] || v}</Badge>
        {v === 'new' && (!row.budget_range || !row.hall_id) && (
          <span style={{ fontSize: 10, color: '#b45309', background: '#fef3c7', borderRadius: 8, padding: '1px 6px', fontWeight: 600 }}>
            ⚠ Incomplete
          </span>
        )}
      </div>
    ),
  },
];

const CAN_CREATE = ['receptionist','sales_executive','branch_manager','franchise_admin','super_admin'];

export default function LeadsPage() {
  const router = useRouter();
  const { userProfile } = useAuth();
  const franchise_id = userProfile?.franchise_id || 'pfd';
  const branch_id    = userProfile?.branch_id    || 'pfd_b1';
  const role         = userProfile?.role         || 'guest';

  const [leads, setLeads]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [search, setSearch]       = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const fetchLeads = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res  = await fetch(`/api/leads?franchise_id=${franchise_id}&branch_id=${branch_id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch');
      setLeads(data.leads || []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [franchise_id, branch_id]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  // Filter by tab
  const tabFiltered = leads.filter(l => {
    const grp = TAB_GROUPS.find(g => g.key === activeTab);
    if (activeTab === 'all') return true;
    if (grp?.statuses) return grp.statuses.includes(l.status);
    return l.status === activeTab;
  });

  // Filter by search
  const filtered = tabFiltered.filter(l => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      l.customer_name?.toLowerCase().includes(q) ||
      l.phone?.includes(q) ||
      l.event_type?.toLowerCase().includes(q) ||
      l.hall_name?.toLowerCase().includes(q) ||
      l.assigned_to_name?.toLowerCase().includes(q)
    );
  });

  // Tab counts
  const tabs = TAB_GROUPS.map(g => ({
    key: g.key, label: g.label,
    count: g.key === 'all'
      ? leads.length
      : g.statuses
        ? leads.filter(l => g.statuses.includes(l.status)).length
        : leads.filter(l => l.status === g.key).length,
  }));

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
      {/* Page Header */}
      <motion.div variants={fadeUp} className="page-header" style={{ marginBottom: 24 }}>
        <div className="page-header-left">
          <h1>Leads</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>
            {loading
              ? 'Loading…'
              : `${leads.length} total · ${leads.filter(l => l.status === 'new').length} new · ${leads.filter(l => l.status === 'closed').length} closed`}
          </p>
        </div>
        <div className="page-actions">
          <button className="btn btn-outline btn-sm" onClick={fetchLeads} disabled={loading}>
            {loading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <RefreshCw size={14} />}
            Refresh
          </button>
          <button className="btn btn-outline btn-sm"><Download size={14} /> Export</button>
          {CAN_CREATE.includes(role) && (
            <Link href="/leads/create" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>
              <Plus size={14} /> New Lead
            </Link>
          )}
        </div>
      </motion.div>

      {/* Error */}
      {error && (
        <motion.div variants={fadeUp} style={{
          background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8,
          padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center',
          gap: 8, color: '#991b1b', fontSize: 13,
        }}>
          <AlertCircle size={15} /> {error}
          <button onClick={fetchLeads} style={{ marginLeft: 'auto', fontSize: 12, textDecoration: 'underline', background: 'none', border: 'none', color: '#991b1b', cursor: 'pointer' }}>
            Retry
          </button>
        </motion.div>
      )}

      {/* Search */}
      <motion.div variants={fadeUp}>
        <SearchRow
          placeholder="Search by name, phone, event type, hall…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ marginBottom: 0 }}
        />
      </motion.div>

      {/* Tabs */}
      <motion.div variants={fadeUp}>
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      </motion.div>

      {/* Table */}
      <motion.div variants={fadeUp}>
        <DataTable
          columns={columns}
          data={filtered}
          keyField="id"
          loading={loading}
          emptyMessage={search ? 'No leads match your search.' : 'No leads yet. Create the first one!'}
          onRowClick={row => router.push(`/leads/${row.id}?franchise_id=${franchise_id}&branch_id=${branch_id}`)}
          mobileRender={row => {
            const needsCompletion = row.status === 'new' && (!row.budget_range || !row.hall_id);
            return (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-h)' }}>{row.customer_name}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Phone size={11} /> {row.phone}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                    <Badge variant={STATUS_VARIANT[row.status] || 'neutral'}>
                      {STATUS_LABELS[row.status] || row.status}
                    </Badge>
                    {needsCompletion && (
                      <span style={{ fontSize: 10, color: '#b45309', background: '#fef3c7', borderRadius: 8, padding: '1px 6px', fontWeight: 600 }}>
                        ⚠ Incomplete
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px', fontSize: 12, color: 'var(--color-text-muted)' }}>
                  <span>🎉 {row.event_type}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Calendar size={11} /> {row.event_date || '—'}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Users size={11} /> {row.expected_guest_count} guests</span>
                  {row.hall_name && <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Building2 size={11} /> {row.hall_name}</span>}
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 6 }}>
                  {row.assigned_to_name ? `Assigned: ${row.assigned_to_name}` : 'Unassigned'}
                  {row.budget_range && ` · ₹${row.budget_range}`}
                </div>
              </div>
            );
          }}
        />
      </motion.div>
    </motion.div>
  );
}