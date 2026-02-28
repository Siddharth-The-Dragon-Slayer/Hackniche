'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Edit, Phone, Mail, Calendar, Brain, Star, RefreshCw, MessageSquare, FileText, Image, StickyNote, Clock } from 'lucide-react';

const TABS = ['Overview', 'Activity', 'Follow-ups', 'Proposal', 'Decor Preview', 'Notes', 'AI Panel'];

const mock = {
  id: 'LD-0043', clientName: 'Suresh Menon', phone: '+91-9876501234', email: 'suresh@gmail.com',
  eventType: 'Wedding', eventDate: '2025-11-22', guestCount: 450, venue: 'Grand Ballroom',
  branch: 'Banjara Hills Branch', status: 'Qualified', priority: 'High',
  source: 'Website', assignedTo: 'Ramesh Kumar', createdAt: '2025-06-10',
  budgetMin: 800000, budgetMax: 1200000, budgetFlexibility: 'Flexible',
  clientType: 'Individual', notes: 'Prefers South Indian cuisine. Interested in floral decor.',
  aiScore: 82, aiRisk: ['Budget gap vs. room capacity', 'Follow-up overdue by 2 days'],
  followUps: [
    { id: 1, date: '2025-06-12', type: 'Phone Call', status: 'Done', notes: 'Discussed venue options' },
    { id: 2, date: '2025-06-18', type: 'Site Visit', status: 'Scheduled', notes: '' },
    { id: 3, date: '2025-06-25', type: 'Proposal Review', status: 'Pending', notes: '' },
  ],
  timeline: [
    { time: '2025-06-10 10:30', action: 'Lead created via website form', user: 'System' },
    { time: '2025-06-10 11:00', action: 'Assigned to Ramesh Kumar', user: 'Manager' },
    { time: '2025-06-12 14:00', action: 'Phone call completed — interested in Grand Ballroom', user: 'Ramesh Kumar' },
    { time: '2025-06-14 09:00', action: 'Status updated: New → Qualified', user: 'Ramesh Kumar' },
  ],
};

const STATUS_COLORS = { Qualified: { bg: '#dbeafe', color: '#1d4ed8' }, New: { bg: '#f0fdf4', color: '#15803d' }, 'Follow-up': { bg: '#fef9c3', color: '#854d0e' }, Lost: { bg: '#fee2e2', color: '#991b1b' }, Booked: { bg: '#f3e8ff', color: '#7e22ce' } };
const FU_STATUS = { Done: { bg: '#dcfce7', color: '#15803d' }, Scheduled: { bg: '#dbeafe', color: '#1d4ed8' }, Pending: { bg: '#fef9c3', color: '#854d0e' } };

export default function LeadDetailPage({ params }) {
  const [tab, setTab] = useState('Overview');
  const [aiRescoring, setAiRescoring] = useState(false);
  const l = mock;
  const sc = STATUS_COLORS[l.status] || {};

  function rescore() {
    setAiRescoring(true);
    setTimeout(() => setAiRescoring(false), 1500);
  }

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div className="page-header-left">
          <Link href="/leads" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 8, textDecoration: 'none' }}>
            <ArrowLeft size={14} /> Back to Leads
          </Link>
          <h1>{l.clientName}</h1>
          <p style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {l.eventType} &bull; {l.eventDate} &bull; {l.branch}
            <span style={{ background: sc.bg, color: sc.color, borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>{l.status}</span>
            <span style={{ background: '#fef3c7', color: '#92400e', borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>{l.priority}</span>
          </p>
        </div>
        <div className="page-actions">
          <Link href={`/leads/${params?.id}/edit`} className="btn btn-ghost"><Edit size={15} /> Edit</Link>
          <Link href="/bookings/create" className="btn btn-primary">Convert to Booking</Link>
        </div>
      </div>

      {/* KPI Row */}
      <div className="kpi-row" style={{ marginBottom: 24 }}>
        {[
          { label: 'Guest Count', val: l.guestCount },
          { label: 'Budget Range', val: `₹${(l.budgetMin/100000).toFixed(1)}L – ₹${(l.budgetMax/100000).toFixed(1)}L` },
          { label: 'AI Score', val: `${l.aiScore}/100`, highlight: true },
          { label: 'Assigned To', val: l.assignedTo },
        ].map(k => (
          <div key={k.label} className="card" style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: k.highlight ? 'var(--color-primary)' : 'var(--color-text-h)' }}>{k.val}</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--color-border)', marginBottom: 24, overflowX: 'auto' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: '10px 16px', fontSize: 13, fontWeight: tab === t ? 700 : 400, background: 'none', border: 'none', cursor: 'pointer', borderBottom: tab === t ? '2px solid var(--color-primary)' : '2px solid transparent', color: tab === t ? 'var(--color-primary)' : 'var(--color-text-muted)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6 }}>
            {t === 'AI Panel' && <Brain size={14} />} {t}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === 'Overview' && (
        <div className="detail-row">
          <div className="detail-main">
            <div className="card" style={{ padding: 24 }}>
              <div className="form-section-title">Client & Event Details</div>
              <div className="info-grid">
                <div className="info-item"><span className="form-label">Client Name</span><span>{l.clientName}</span></div>
                <div className="info-item"><span className="form-label">Client Type</span><span>{l.clientType}</span></div>
                <div className="info-item"><span className="form-label">Phone</span><span><a href={`tel:${l.phone}`}>{l.phone}</a></span></div>
                <div className="info-item"><span className="form-label">Email</span><span><a href={`mailto:${l.email}`}>{l.email}</a></span></div>
                <div className="info-item"><span className="form-label">Event Type</span><span>{l.eventType}</span></div>
                <div className="info-item"><span className="form-label">Event Date</span><span>{l.eventDate}</span></div>
                <div className="info-item"><span className="form-label">Guest Count</span><span>{l.guestCount}</span></div>
                <div className="info-item"><span className="form-label">Preferred Venue</span><span>{l.venue}</span></div>
                <div className="info-item"><span className="form-label">Lead Source</span><span>{l.source}</span></div>
                <div className="info-item"><span className="form-label">Budget Flexibility</span><span>{l.budgetFlexibility}</span></div>
                <div className="info-item"><span className="form-label">Created</span><span>{l.createdAt}</span></div>
                <div className="info-item form-span-2"><span className="form-label">Notes</span><span>{l.notes}</span></div>
              </div>
            </div>
          </div>
          <div className="detail-aside">
            <div className="card" style={{ padding: 24 }}>
              <div className="form-section-title">Quick Actions</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button className="btn btn-primary" style={{ width: '100%' }}><Phone size={14} /> Log Call</button>
                <button className="btn btn-ghost" style={{ width: '100%' }}><Calendar size={14} /> Schedule Follow-up</button>
                <button className="btn btn-ghost" style={{ width: '100%' }}><FileText size={14} /> Generate Proposal</button>
                <button className="btn btn-ghost" style={{ width: '100%' }}><Mail size={14} /> Send Email</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activity Tab */}
      {tab === 'Activity' && (
        <div className="card" style={{ padding: 24 }}>
          <div className="form-section-title">Activity Timeline</div>
          <div className="timeline">
            {l.timeline.map((item, i) => (
              <div key={i} className="timeline-item">
                <div className="timeline-dot" />
                <div>
                  <div style={{ fontSize: 14, color: 'var(--color-text-body)' }}>{item.action}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 3 }}>{item.time} &bull; by {item.user}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Follow-ups Tab */}
      {tab === 'Follow-ups' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <button className="btn btn-primary"><Calendar size={14} /> Add Follow-up</button>
          </div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--color-surface-2)', fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                  <th style={{ padding: '10px 16px', textAlign: 'left' }}>Date</th>
                  <th style={{ padding: '10px 16px', textAlign: 'left' }}>Type</th>
                  <th style={{ padding: '10px 16px', textAlign: 'left' }}>Status</th>
                  <th style={{ padding: '10px 16px', textAlign: 'left' }}>Notes</th>
                </tr>
              </thead>
              <tbody>
                {l.followUps.map(f => {
                  const fs = FU_STATUS[f.status] || {};
                  return (
                    <tr key={f.id} style={{ borderTop: '1px solid var(--color-border)', fontSize: 14 }}>
                      <td style={{ padding: '12px 16px', color: 'var(--color-text-body)' }}>{f.date}</td>
                      <td style={{ padding: '12px 16px', color: 'var(--color-text-body)' }}>{f.type}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ background: fs.bg, color: fs.color, borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>{f.status}</span>
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--color-text-muted)', fontSize: 13 }}>{f.notes || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Proposal Tab */}
      {tab === 'Proposal' && (
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div className="form-section-title" style={{ margin: 0 }}>Proposal</div>
            <button className="btn btn-primary"><FileText size={14} /> Generate AI Proposal</button>
          </div>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>No proposal generated yet. Click "Generate AI Proposal" to create a personalised proposal based on this lead's data.</p>
        </div>
      )}

      {/* Decor Preview Tab */}
      {tab === 'Decor Preview' && (
        <div className="card" style={{ padding: 24, textAlign: 'center', color: 'var(--color-text-muted)' }}>
          <Image size={40} style={{ margin: '0 auto 12px' }} />
          <p>AI-generated decor inspiration images will appear here.</p>
          <button className="btn btn-primary" style={{ marginTop: 12 }}><Image size={14} /> Generate Decor Preview</button>
        </div>
      )}

      {/* Notes Tab */}
      {tab === 'Notes' && (
        <div className="card" style={{ padding: 24 }}>
          <div className="form-section-title">Internal Notes</div>
          <textarea className="input" rows={6} defaultValue={l.notes} placeholder="Add internal notes..." style={{ width: '100%', resize: 'vertical' }} />
          <div className="form-actions" style={{ marginTop: 12 }}>
            <button className="btn btn-primary">Save Notes</button>
          </div>
        </div>
      )}

      {/* AI Panel Tab */}
      {tab === 'AI Panel' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Score Card */}
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div className="form-section-title" style={{ marginBottom: 4 }}>Lead Score</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ fontSize: 48, fontWeight: 800, color: l.aiScore >= 70 ? '#16a34a' : l.aiScore >= 40 ? '#d97706' : '#dc2626', lineHeight: 1 }}>{l.aiScore}</div>
                  <div>
                    <div style={{ fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 4 }}>out of 100</div>
                    <div style={{ background: l.aiScore >= 70 ? '#dcfce7' : l.aiScore >= 40 ? '#fef9c3' : '#fee2e2', color: l.aiScore >= 70 ? '#15803d' : l.aiScore >= 40 ? '#854d0e' : '#991b1b', borderRadius: 20, padding: '3px 12px', fontSize: 12, fontWeight: 700, display: 'inline-block' }}>
                      {l.aiScore >= 70 ? 'High Intent' : l.aiScore >= 40 ? 'Medium Intent' : 'Low Intent'}
                    </div>
                  </div>
                </div>
              </div>
              <button className="btn btn-ghost" onClick={rescore} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <RefreshCw size={14} style={{ animation: aiRescoring ? 'spin 1s linear infinite' : 'none' }} />
                {aiRescoring ? 'Rescoring...' : 'Re-Score Lead'}
              </button>
            </div>
            {/* Progress bar */}
            <div className="progress-bar-wrap" style={{ marginTop: 16 }}>
              <div className="progress-bar-fill" style={{ width: `${l.aiScore}%`, background: l.aiScore >= 70 ? 'var(--color-success)' : l.aiScore >= 40 ? 'var(--color-warning, #f59e0b)' : 'var(--color-danger, #ef4444)' }} />
            </div>
          </div>

          {/* Risk Factors */}
          <div className="card" style={{ padding: 24 }}>
            <div className="form-section-title">Risk Factors</div>
            {l.aiRisk.length === 0
              ? <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>No risk factors detected.</p>
              : l.aiRisk.map((r, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 0', borderBottom: i < l.aiRisk.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', flexShrink: 0, marginTop: 5 }} />
                    <span style={{ fontSize: 14, color: 'var(--color-text-body)' }}>{r}</span>
                  </div>
                ))
            }
          </div>

          {/* AI Follow-up Suggestions */}
          <div className="card" style={{ padding: 24 }}>
            <div className="form-section-title">AI Follow-up Suggestions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                'Schedule a site visit within the next 3 days to maintain momentum',
                'Send a personalised wedding decor PDF showcasing floral themes',
                'Offer a 5% early-booking discount to close before the weekend',
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '10px 0', borderBottom: i < 2 ? '1px solid var(--color-border)' : 'none' }}>
                  <Brain size={16} style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: 2 }} />
                  <span style={{ fontSize: 14, color: 'var(--color-text-body)' }}>{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
