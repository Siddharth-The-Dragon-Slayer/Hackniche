'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';

const ROLES = ['Branch Manager', 'Sales Executive', 'Event Coordinator', 'Chef', 'Waiter', 'Cleaning Staff', 'Security', 'Driver', 'Accountant', 'Decorator'];
const BRANCHES = ['Banjara Hills Branch', 'Jubilee Hills Branch', 'Secunderabad Branch'];
const DEPARTMENTS = ['Operations', 'Sales', 'Catering', 'Decoration', 'Finance', 'Support'];

export default function CreateStaffPage() {
  const router = useRouter();
  const [staffType, setStaffType] = useState('permanent');
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', gender: '',
    dob: '', address: '', emergencyName: '', emergencyPhone: '', emergencyRelation: '',
    role: '', department: '', branchId: '', salary: '', joiningDate: '',
    employeeId: '', accessLevel: 'Staff',
    // Temporary only
    contractStartDate: '', contractEndDate: '', contractValue: '', agencyName: '', accessExpiry: '',
    // Notifications
    notifyEmail: true, notifyWhatsApp: false,
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div>
      <div className="page-header" style={{ marginBottom: 32 }}>
        <div className="page-header-left">
          <Link href="/staff" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 8, textDecoration: 'none' }}>
            <ArrowLeft size={14} /> Back to Staff
          </Link>
          <h1>Add Staff Member</h1>
          <p>Create a new permanent or temporary staff account</p>
        </div>
      </div>

      {/* Staff Type Toggle */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 24, borderRadius: 10, overflow: 'hidden', border: '1px solid var(--color-border)', width: 'fit-content' }}>
        {['permanent', 'temporary'].map(t => (
          <button key={t} onClick={() => setStaffType(t)}
            style={{ padding: '9px 24px', fontSize: 13, fontWeight: 600, background: staffType === t ? 'var(--color-primary)' : 'transparent', color: staffType === t ? '#fff' : 'var(--color-text-muted)', border: 'none', cursor: 'pointer', textTransform: 'capitalize' }}>
            {t}
          </button>
        ))}
      </div>

      <form style={{ display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 900 }}>
        {/* Section 1 — Personal Details */}
        <div className="card" style={{ padding: 28 }}>
          <div className="form-section-title">Personal Details</div>
          <div className="form-grid">
            <div>
              <label className="form-label">First Name *</label>
              <input className="input" placeholder="First name" value={form.firstName} onChange={e => set('firstName', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Last Name *</label>
              <input className="input" placeholder="Last name" value={form.lastName} onChange={e => set('lastName', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Email Address *</label>
              <input className="input" type="email" placeholder="staff@branch.com" value={form.email} onChange={e => set('email', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Phone *</label>
              <input className="input" type="tel" placeholder="+91-XXXXXXXXXX" value={form.phone} onChange={e => set('phone', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Gender</label>
              <select className="input" value={form.gender} onChange={e => set('gender', e.target.value)}>
                <option value="">Select</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="form-label">Date of Birth</label>
              <input className="input" type="date" value={form.dob} onChange={e => set('dob', e.target.value)} />
            </div>
            <div className="form-span-2">
              <label className="form-label">Residential Address</label>
              <textarea className="input" rows={2} placeholder="Full address" value={form.address} onChange={e => set('address', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Section 2 — Role & Branch */}
        <div className="card" style={{ padding: 28 }}>
          <div className="form-section-title">Role & Assignment</div>
          <div className="form-grid">
            <div>
              <label className="form-label">Role *</label>
              <select className="input" value={form.role} onChange={e => set('role', e.target.value)}>
                <option value="">Select role</option>
                {ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Department</label>
              <select className="input" value={form.department} onChange={e => set('department', e.target.value)}>
                <option value="">Select department</option>
                {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Branch *</label>
              <select className="input" value={form.branchId} onChange={e => set('branchId', e.target.value)}>
                <option value="">Select branch</option>
                {BRANCHES.map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Access Level</label>
              <select className="input" value={form.accessLevel} onChange={e => set('accessLevel', e.target.value)}>
                <option>Staff</option>
                <option>Supervisor</option>
                <option>Manager</option>
                <option>Admin</option>
              </select>
            </div>
            <div>
              <label className="form-label">Employee ID</label>
              <input className="input" placeholder="Auto-generated if blank" value={form.employeeId} onChange={e => set('employeeId', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Joining Date</label>
              <input className="input" type="date" value={form.joiningDate} onChange={e => set('joiningDate', e.target.value)} />
            </div>
            <div>
              <label className="form-label">{staffType === 'permanent' ? 'Monthly Salary (₹)' : 'Daily Rate (₹)'}</label>
              <input className="input" type="number" placeholder="0.00" value={form.salary} onChange={e => set('salary', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Section 2b — Temporary Only Fields */}
        {staffType === 'temporary' && (
          <div className="card" style={{ padding: 28 }}>
            <div className="form-section-title">Contract Details (Temporary Staff)</div>
            <div className="form-grid">
              <div>
                <label className="form-label">Contract Start Date *</label>
                <input className="input" type="date" value={form.contractStartDate} onChange={e => set('contractStartDate', e.target.value)} />
              </div>
              <div>
                <label className="form-label">Contract End Date *</label>
                <input className="input" type="date" value={form.contractEndDate} onChange={e => set('contractEndDate', e.target.value)} />
              </div>
              <div>
                <label className="form-label">Contract Value (₹)</label>
                <input className="input" type="number" placeholder="Total contract amount" value={form.contractValue} onChange={e => set('contractValue', e.target.value)} />
              </div>
              <div>
                <label className="form-label">Agency / Vendor</label>
                <input className="input" placeholder="Agency name if applicable" value={form.agencyName} onChange={e => set('agencyName', e.target.value)} />
              </div>
              <div>
                <label className="form-label">System Access Expiry *</label>
                <input className="input" type="date" value={form.accessExpiry} onChange={e => set('accessExpiry', e.target.value)} />
                <span className="form-hint">User login will be auto-disabled after this date</span>
              </div>
            </div>
          </div>
        )}

        {/* Section 3 — Emergency Contact */}
        <div className="card" style={{ padding: 28 }}>
          <div className="form-section-title">Emergency Contact</div>
          <div className="form-grid">
            <div>
              <label className="form-label">Contact Name *</label>
              <input className="input" placeholder="Full name" value={form.emergencyName} onChange={e => set('emergencyName', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Relation</label>
              <select className="input" value={form.emergencyRelation} onChange={e => set('emergencyRelation', e.target.value)}>
                <option value="">Select</option>
                <option>Spouse</option>
                <option>Parent</option>
                <option>Sibling</option>
                <option>Friend</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="form-label">Contact Phone *</label>
              <input className="input" type="tel" placeholder="+91-XXXXXXXXXX" value={form.emergencyPhone} onChange={e => set('emergencyPhone', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Section 4 — Notification Preferences */}
        <div className="card" style={{ padding: 28 }}>
          <div className="form-section-title">Notification Preferences</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              ['notifyEmail', 'Email notifications (shift schedules, payslips)'],
              ['notifyWhatsApp', 'WhatsApp notifications'],
            ].map(([key, label]) => (
              <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, cursor: 'pointer' }}>
                <input type="checkbox" checked={form[key]} onChange={e => set(key, e.target.checked)} style={{ accentColor: 'var(--color-accent)' }} />
                {label}
              </label>
            ))}
          </div>
        </div>

        <div className="form-actions">
          <Link href="/staff" className="btn btn-ghost">Cancel</Link>
          <button type="button" className="btn btn-primary" onClick={() => router.push('/staff')}>
            <Save size={16} /> Create Staff Member
          </button>
        </div>
      </form>
    </div>
  );
}
