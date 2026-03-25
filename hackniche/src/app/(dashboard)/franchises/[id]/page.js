'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Building2, Edit, MapPin, Phone, Mail, TrendingUp, Users, Calendar} from 'lucide-react';

const TABS = ['Overview', 'Branches', 'Staff', 'Reports', 'Settings'];

const mockFranchise = {
  id: 'PFD', name: 'Prasad Food Divine', city: 'Hyderabad', region: 'South India',
  status: 'Active', gstNumber: '36ABCDE9999F1Z5', primaryColor: '#7B1C1C',
  adminName: 'Prasad Reddy', adminEmail: 'prasad@pfd.com', adminPhone: '+91-9876543200',
  totalBranches: 3, activeStaff: 47, totalBookings: 312, revenue: '₹48.5L',
  logoUrl: null,
};

const mockBranches = [
  { id: 'PFD-BH', name: 'Banjara Hills', city: 'Hyderabad', halls: 4, staff: 18, status: 'Active' },
  { id: 'PFD-JS', name: 'Jubilee Hills', city: 'Hyderabad', halls: 3, staff: 15, status: 'Active' },
  { id: 'PFD-SP', name: 'Secunderabad', city: 'Hyderabad', halls: 2, staff: 14, status: 'Active' },
];

export default function FranchiseDetailPage({ params }) {
  const [tab, setTab] = useState('Overview');
  const f = mockFranchise;

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div className="page-header-left">
          <Link href="/franchises" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 8, textDecoration: 'none' }}>
            <ArrowLeft size={14} /> Back to Franchises
          </Link>
          <h1>{f.name}</h1>
          <p style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <MapPin size={14} /> {f.city} &bull; Code: {f.id}
            <span style={{ background: '#dcfce7', color: '#15803d', borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>{f.status}</span>
          </p>
        </div>
        <div className="page-actions">
          <Link href={`/franchises/${params?.id}/edit`} className="btn btn-ghost"><Edit size={15} /> Edit</Link>
        </div>
      </div>

      {/* KPI Row */}
      <div className="kpi-row" style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Branches', val: f.totalBranches, icon: <Building2 size={18} /> },
          { label: 'Active Staff', val: f.activeStaff, icon: <Users size={18} /> },
          { label: 'Total Bookings', val: f.totalBookings, icon: <Calendar size={18} /> },
          { label: 'Revenue (YTD)', val: f.revenue, icon: <TrendingUp size={18} /> },
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

      {/* Tab Panels */}
      {tab === 'Overview' && (
        <div className="detail-row">
          <div className="detail-main">
            <div className="card" style={{ padding: 24 }}>
              <div className="form-section-title">Franchise Details</div>
              <div className="info-grid">
                <div className="info-item"><span className="form-label">Admin Name</span><span>{f.adminName}</span></div>
                <div className="info-item"><span className="form-label">Admin Email</span><span><a href={`mailto:${f.adminEmail}`}>{f.adminEmail}</a></span></div>
                <div className="info-item"><span className="form-label">Admin Phone</span><span>{f.adminPhone}</span></div>
                <div className="info-item"><span className="form-label">GST Number</span><span>{f.gstNumber}</span></div>
                <div className="info-item"><span className="form-label">Region</span><span>{f.region}</span></div>
                <div className="info-item"><span className="form-label">Primary Color</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 16, height: 16, borderRadius: 4, background: f.primaryColor, display: 'inline-block', border: '1px solid var(--color-border)' }} />
                    {f.primaryColor}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="detail-aside">
            <div className="card" style={{ padding: 24 }}>
              <div className="form-section-title">Quick Actions</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Link href="/branches/create" className="btn btn-primary" style={{ textAlign: 'center' }}>+ Add Branch</Link>
                <Link href="/staff/create" className="btn btn-ghost" style={{ textAlign: 'center' }}>+ Add Staff</Link>
                <Link href="/analytics" className="btn btn-ghost" style={{ textAlign: 'center' }}>View Reports</Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'Branches' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)' }}>
            <div style={{ fontWeight: 600 }}>All Branches</div>
            <Link href="/branches/create" className="btn btn-primary" style={{ fontSize: 12 }}>+ Add Branch</Link>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--color-surface-2)', fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                <th style={{ padding: '10px 16px', textAlign: 'left' }}>Branch</th>
                <th style={{ padding: '10px 16px', textAlign: 'left' }}>City</th>
                <th style={{ padding: '10px 16px', textAlign: 'left' }}>Halls</th>
                <th style={{ padding: '10px 16px', textAlign: 'left' }}>Staff</th>
                <th style={{ padding: '10px 16px', textAlign: 'left' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {mockBranches.map(b => (
                <tr key={b.id} style={{ borderTop: '1px solid var(--color-border)', fontSize: 14 }}>
                  <td style={{ padding: '12px 16px' }}>
                    <Link href={`/branches/${b.id}`} style={{ fontWeight: 600, color: 'var(--color-primary)', textDecoration: 'none' }}>{b.name}</Link>
                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{b.id}</div>
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--color-text-body)' }}>{b.city}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--color-text-body)' }}>{b.halls}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--color-text-body)' }}>{b.staff}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ background: '#dcfce7', color: '#15803d', borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>{b.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'Staff' && (
        <div className="card" style={{ padding: 24, textAlign: 'center', color: 'var(--color-text-muted)' }}>
          <Users size={36} style={{ margin: '0 auto 12px' }} />
          <p>Staff roster across all branches</p>
          <Link href="/staff" className="btn btn-primary" style={{ marginTop: 12 }}>Manage Staff</Link>
        </div>
      )}

      {tab === 'Reports' && (
        <div className="card" style={{ padding: 24, textAlign: 'center', color: 'var(--color-text-muted)' }}>
          <TrendingUp size={36} style={{ margin: '0 auto 12px' }} />
          <p>Franchise-level revenue, booking, and conversion reports</p>
          <Link href="/analytics" className="btn btn-primary" style={{ marginTop: 12 }}>View Analytics</Link>
        </div>
      )}

      {tab === 'Settings' && (
        <div style={{ maxWidth: 720 }}>
          <Link href="/settings/franchise" className="btn btn-primary">Open Franchise Settings</Link>
        </div>
      )}
    </div>
  );
}
