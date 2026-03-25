'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Edit, MapPin, Phone, Mail, Users, Calendar, DoorOpen, TrendingUp } from 'lucide-react';

const TABS = ['Overview', 'Halls', 'Staff', 'Reports', 'Settings'];

const mockBranch = {
  id: 'PFD-BH', name: 'Banjara Hills Branch', city: 'Hyderabad', state: 'Telangana',
  address: 'Road No. 12, Banjara Hills', phone: '+91-40-12345678', email: 'bh@pfd.com',
  status: 'Active', gstNumber: '36ABCDE9999F1Z5', openingTime: '08:00', closingTime: '23:00',
  totalHalls: 4, activeStaff: 18, upcomingBookings: 23, revenueMonth: '₹8.4L',
  managerName: 'Kiran Sharma', managerEmail: 'kiran@pfd.com', managerPhone: '+91-9988776655',
  defaultTaxPct: 10, defaultAdvancePct: 30,
};

const mockHalls = [
  { id: 'H1', name: 'Grand Ballroom', capacity: 500, status: 'Available', floor: 'Ground' },
  { id: 'H2', name: 'Royal Suite', capacity: 200, status: 'Booked', floor: '1st' },
  { id: 'H3', name: 'Garden Lawn', capacity: 300, status: 'Available', floor: 'Outdoor' },
  { id: 'H4', name: 'Boardroom', capacity: 50, status: 'Available', floor: '2nd' },
];

const STATUS_STYLE = { Available: { bg: '#dcfce7', color: '#15803d' }, Booked: { bg: '#fef9c3', color: '#854d0e' }, Maintenance: { bg: '#fee2e2', color: '#991b1b' } };

export default function BranchDetailPage({ params }) {
  const [tab, setTab] = useState('Overview');
  const b = mockBranch;

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div className="page-header-left">
          <Link href="/branches" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 8, textDecoration: 'none' }}>
            <ArrowLeft size={14} /> Back to Branches
          </Link>
          <h1>{b.name}</h1>
          <p style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <MapPin size={14} /> {b.address}, {b.city}
            <span style={{ background: '#dcfce7', color: '#15803d', borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>{b.status}</span>
          </p>
        </div>
        <div className="page-actions">
          <Link href={`/branches/${params?.id}/edit`} className="btn btn-ghost"><Edit size={15} /> Edit</Link>
        </div>
      </div>

      {/* KPI Row */}
      <div className="kpi-row" style={{ marginBottom: 24 }}>
        {[
          { label: 'Halls', val: b.totalHalls, icon: <DoorOpen size={18} /> },
          { label: 'Active Staff', val: b.activeStaff, icon: <Users size={18} /> },
          { label: 'Upcoming Bookings', val: b.upcomingBookings, icon: <Calendar size={18} /> },
          { label: 'Revenue (Month)', val: b.revenueMonth, icon: <TrendingUp size={18} /> },
        ].map(k => (
          <div key={k.label} className="card" style={{ padding: '18px 22px', display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ color: 'var(--color-primary)', opacity: 0.7 }}>{k.icon}</div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text-h)' }}>{k.val}</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--color-border)', marginBottom: 24, overflowX: 'auto' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: '10px 18px', fontSize: 13, fontWeight: tab === t ? 700 : 400, background: 'none', border: 'none', cursor: 'pointer', borderBottom: tab === t ? '2px solid var(--color-primary)' : '2px solid transparent', color: tab === t ? 'var(--color-primary)' : 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'Overview' && (
        <div className="detail-row">
          <div className="detail-main">
            <div className="card" style={{ padding: 24 }}>
              <div className="form-section-title">Branch Details</div>
              <div className="info-grid">
                <div className="info-item"><span className="form-label">Branch Code</span><span>{b.id}</span></div>
                <div className="info-item"><span className="form-label">Manager</span><span>{b.managerName}</span></div>
                <div className="info-item"><span className="form-label">Manager Email</span><span><a href={`mailto:${b.managerEmail}`}>{b.managerEmail}</a></span></div>
                <div className="info-item"><span className="form-label">Manager Phone</span><span>{b.managerPhone}</span></div>
                <div className="info-item"><span className="form-label">Branch Phone</span><span>{b.phone}</span></div>
                <div className="info-item"><span className="form-label">Branch Email</span><span>{b.email}</span></div>
                <div className="info-item"><span className="form-label">GST Number</span><span>{b.gstNumber}</span></div>
                <div className="info-item"><span className="form-label">Operating Hours</span><span>{b.openingTime} – {b.closingTime}</span></div>
                <div className="info-item"><span className="form-label">Default Tax %</span><span>{b.defaultTaxPct}%</span></div>
                <div className="info-item"><span className="form-label">Default Advance %</span><span>{b.defaultAdvancePct}%</span></div>
              </div>
            </div>
          </div>
          <div className="detail-aside">
            <div className="card" style={{ padding: 24 }}>
              <div className="form-section-title">Quick Actions</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Link href="/bookings/create" className="btn btn-primary" style={{ textAlign: 'center' }}>+ New Booking</Link>
                <Link href="/leads/create" className="btn btn-ghost" style={{ textAlign: 'center' }}>+ Add Lead</Link>
                <Link href="/staff/create" className="btn btn-ghost" style={{ textAlign: 'center' }}>+ Add Staff</Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'Halls' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--color-border)', fontWeight: 600 }}>Hall Inventory ({mockHalls.length})</div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--color-surface-2)', fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                <th style={{ padding: '10px 16px', textAlign: 'left' }}>Hall Name</th>
                <th style={{ padding: '10px 16px', textAlign: 'left' }}>Capacity</th>
                <th style={{ padding: '10px 16px', textAlign: 'left' }}>Floor</th>
                <th style={{ padding: '10px 16px', textAlign: 'left' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {mockHalls.map(h => {
                const s = STATUS_STYLE[h.status] || {};
                return (
                  <tr key={h.id} style={{ borderTop: '1px solid var(--color-border)', fontSize: 14 }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-text-h)' }}>{h.name}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--color-text-body)' }}>{h.capacity} pax</td>
                    <td style={{ padding: '12px 16px', color: 'var(--color-text-body)' }}>{h.floor}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ background: s.bg, color: s.color, borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>{h.status}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'Staff' && (
        <div className="card" style={{ padding: 24, textAlign: 'center', color: 'var(--color-text-muted)' }}>
          <Users size={36} style={{ margin: '0 auto 12px' }} />
          <p>Staff assigned to this branch</p>
          <Link href="/staff" className="btn btn-primary" style={{ marginTop: 12 }}>Manage Staff</Link>
        </div>
      )}

      {tab === 'Reports' && (
        <div className="card" style={{ padding: 24, textAlign: 'center', color: 'var(--color-text-muted)' }}>
          <TrendingUp size={36} style={{ margin: '0 auto 12px' }} />
          <p>Branch performance reports and analytics</p>
          <Link href="/analytics" className="btn btn-primary" style={{ marginTop: 12 }}>View Analytics</Link>
        </div>
      )}

      {tab === 'Settings' && (
        <div style={{ maxWidth: 720 }}>
          <Link href="/settings/branch" className="btn btn-primary">Open Branch Settings</Link>
        </div>
      )}
    </div>
  );
}
