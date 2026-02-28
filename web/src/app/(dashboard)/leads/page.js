'use client';
import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { fadeUp, staggerContainer } from '@/lib/motion-variants';
import { leadData } from '@/lib/mock-data';
import { Plus, Search, Filter, Download } from 'lucide-react';

const statuses = ['All', 'New', 'Contacted', 'Site Visit Scheduled', 'Proposal Sent', 'Negotiation', 'Hot', 'Warm', 'Cold', 'Converted', 'Lost'];

export default function LeadsPage() {
  const [activeTab, setActiveTab] = useState('All');
  const filtered = activeTab === 'All' ? leadData : leadData.filter(l => l.status === activeTab);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--color-text-h)' }}>Leads</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14, marginTop: 4 }}>{leadData.length} total leads &middot; {leadData.filter(l => l.aiScore >= 70).length} hot</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-outline btn-sm"><Download size={14} /> Export</button>
          <Link href="/leads/create" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}><Plus size={14} /> New Lead</Link>
        </div>
      </div>

      {/* Search + Filter */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input className="input" placeholder="Search leads by name, phone, event type..." style={{ paddingLeft: 40 }} />
        </div>
        <button className="btn btn-outline btn-sm"><Filter size={14} /> Filter</button>
      </div>

      {/* Tabs */}
      <div className="tab-list">
        {statuses.map(s => (
          <div key={s} className={`tab-item ${activeTab === s ? 'active' : ''}`} onClick={() => setActiveTab(s)}>{s}</div>
        ))}
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead><tr><th>Client</th><th>Event</th><th>Date</th><th>Guests</th><th>Source</th><th>AI Score</th><th>Assigned</th><th>Status</th></tr></thead>
          <tbody>
            {filtered.map(l => (
              <tr key={l.id} style={{ cursor: 'pointer' }} onClick={() => {}}>
                <td><div style={{ fontWeight: 600, color: 'var(--color-text-h)' }}>{l.client}</div><div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{l.phone}</div></td>
                <td>{l.eventType}</td>
                <td>{l.preferredDate}</td>
                <td>{l.guests}</td>
                <td><span className="badge badge-neutral">{l.source}</span></td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: l.aiScore >= 70 ? 'var(--color-success)' : l.aiScore >= 40 ? 'var(--color-warning)' : 'var(--color-danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', fontFamily: 'var(--font-mono)' }}>{l.aiScore}</div>
                  </div>
                </td>
                <td>{l.assignedTo}</td>
                <td><span className={`badge ${l.status === 'Hot' ? 'badge-red' : l.status === 'Converted' ? 'badge-green' : l.status === 'Warm' ? 'badge-warning' : 'badge-primary'}`}>{l.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
