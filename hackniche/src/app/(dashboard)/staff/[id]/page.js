'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Edit, Phone, Mail, MapPin, Calendar, Star, Clock } from 'lucide-react';

const TABS = ['Overview', 'Schedule', 'Attendance', 'Payroll', 'Documents'];

const mock = {
  id: 'EMP-001', name: 'Ramesh Kumar', role: 'Event Coordinator', department: 'Operations',
  branch: 'Banjara Hills Branch', accessLevel: 'Supervisor', status: 'Active',
  email: 'ramesh@pfd.com', phone: '+91-9876500001', gender: 'Male', dob: '1990-05-15',
  address: 'Flat 202, Banjara Hills, Hyderabad', joiningDate: '2022-03-01', salary: '₹42,000/mo',
  emergencyName: 'Suresh Kumar', emergencyPhone: '+91-9876500002', emergencyRelation: 'Brother',
  totalEvents: 34, avgRating: 4.7, attendancePct: 96,
};

export default function StaffDetailPage({ params }) {
  const [tab, setTab] = useState('Overview');
  const s = mock;

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div className="page-header-left">
          <Link href="/staff" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 8, textDecoration: 'none' }}>
            <ArrowLeft size={14} /> Back to Staff
          </Link>
          <h1>{s.name}</h1>
          <p style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {s.role} &bull; {s.branch}
            <span style={{ background: '#dcfce7', color: '#15803d', borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>{s.status}</span>
          </p>
        </div>
        <div className="page-actions">
          <Link href={`/staff/${params?.id}/edit`} className="btn btn-ghost"><Edit size={15} /> Edit</Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="kpi-row" style={{ marginBottom: 24 }}>
        {[
          { label: 'Events Handled', val: s.totalEvents, icon: <Calendar size={18} /> },
          { label: 'Avg. Rating', val: `${s.avgRating} ★`, icon: <Star size={18} /> },
          { label: 'Attendance', val: `${s.attendancePct}%`, icon: <Clock size={18} /> },
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
              <div className="form-section-title">Personal Information</div>
              <div className="info-grid">
                <div className="info-item"><span className="form-label">Employee ID</span><span>{s.id}</span></div>
                <div className="info-item"><span className="form-label">Department</span><span>{s.department}</span></div>
                <div className="info-item"><span className="form-label">Access Level</span><span>{s.accessLevel}</span></div>
                <div className="info-item"><span className="form-label">Email</span><span><a href={`mailto:${s.email}`}>{s.email}</a></span></div>
                <div className="info-item"><span className="form-label">Phone</span><span>{s.phone}</span></div>
                <div className="info-item"><span className="form-label">Gender</span><span>{s.gender}</span></div>
                <div className="info-item"><span className="form-label">Date of Birth</span><span>{s.dob}</span></div>
                <div className="info-item"><span className="form-label">Joining Date</span><span>{s.joiningDate}</span></div>
                <div className="info-item"><span className="form-label">Salary</span><span>{s.salary}</span></div>
                <div className="info-item form-span-2"><span className="form-label">Address</span><span>{s.address}</span></div>
              </div>
            </div>
            <div className="card" style={{ padding: 24, marginTop: 16 }}>
              <div className="form-section-title">Emergency Contact</div>
              <div className="info-grid">
                <div className="info-item"><span className="form-label">Name</span><span>{s.emergencyName}</span></div>
                <div className="info-item"><span className="form-label">Relation</span><span>{s.emergencyRelation}</span></div>
                <div className="info-item"><span className="form-label">Phone</span><span>{s.emergencyPhone}</span></div>
              </div>
            </div>
          </div>
          <div className="detail-aside">
            <div className="card" style={{ padding: 24 }}>
              <div className="form-section-title">Actions</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button className="btn btn-ghost" style={{ width: '100%' }}>Reset Password</button>
                <button className="btn btn-ghost" style={{ width: '100%' }}>View Payslips</button>
                <button className="btn btn-ghost" style={{ width: '100%', color: '#dc2626' }}>Deactivate Account</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {['Schedule', 'Attendance', 'Payroll', 'Documents'].includes(tab) && (
        <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)' }}>
          <p style={{ fontSize: 15 }}>{tab} records for {s.name}</p>
          <p style={{ fontSize: 13, marginTop: 8 }}>Content will appear here as records are added.</p>
        </div>
      )}
    </div>
  );
}
