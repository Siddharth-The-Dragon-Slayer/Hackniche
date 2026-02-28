'use client';
import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { UserPlus, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

export default function SignupPage() {
  const { signup } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      await signup({ name: form.name, email: form.email, phone: form.phone, password: form.password });
    } catch (err) {
      const msg = err.code === 'auth/email-already-in-use' ? 'An account already exists with this email'
        : err.code === 'auth/weak-password' ? 'Password is too weak. Use at least 8 characters.'
        : 'Signup failed. Please try again.';
      setError(msg);
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Left Brand Panel */}
      <div className="login-brand-panel" style={{
        flex: '0 0 45%', background: 'var(--gradient-hero)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        padding: '48px 40px', color: '#fff', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 20%, rgba(232,184,75,0.15) 0%, transparent 50%)', pointerEvents: 'none' }} />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ textAlign: 'center', zIndex: 1 }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(232,184,75,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 36, fontWeight: 700, color: '#E8B84B', border: '2px solid rgba(232,184,75,0.4)' }}>B</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 700, marginBottom: 12 }}>BanquetOS</h1>
          <p style={{ fontSize: 16, opacity: 0.8, lineHeight: 1.6, maxWidth: 360, margin: '0 auto' }}>Create your customer account to browse venues, track your bookings, and leave reviews.</p>
        </motion.div>
      </div>

      {/* Right Signup Form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', background: 'var(--color-bg)' }}>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }} style={{ width: '100%', maxWidth: 420 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--color-text-h)', marginBottom: 6 }}>Create Account</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14, marginBottom: 32 }}>Sign up as a Customer</p>

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 10, background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.2)', marginBottom: 20, fontSize: 14, color: 'var(--color-danger)' }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Full Name</label>
              <input className="input" type="text" placeholder="Your full name" value={form.name} onChange={handleChange('name')} required />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email Address</label>
              <input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange('email')} required />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Phone Number</label>
              <input className="input" type="tel" placeholder="+91-XXXXXXXXXX" value={form.phone} onChange={handleChange('phone')} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input className="input" type={showPwd ? 'text' : 'password'} placeholder="Min 8 characters" value={form.password} onChange={handleChange('password')} required style={{ paddingRight: 44 }} />
                <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: 4 }}>
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Confirm Password</label>
              <input className="input" type="password" placeholder="Re-enter password" value={form.confirm} onChange={handleChange('confirm')} required />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: 8, opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Creating account...' : <><UserPlus size={16} /> Create Account</>}
            </button>
          </form>

          <div style={{ textAlign: 'center', margin: '20px 0', fontSize: 14, color: 'var(--color-text-muted)' }}>
            Already have an account? <Link href="/login" style={{ color: 'var(--color-accent)', fontWeight: 600 }}>Sign In</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
