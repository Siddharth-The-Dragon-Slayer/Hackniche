'use client';
import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      const msg = err.code === 'auth/invalid-credential' ? 'Invalid email or password'
        : err.code === 'auth/user-not-found' ? 'No account found with this email'
        : err.code === 'auth/wrong-password' ? 'Incorrect password'
        : err.code === 'auth/too-many-requests' ? 'Too many attempts. Try again later.'
        : 'Login failed. Please try again.';
      setError(msg);
    }
    setLoading(false);
  };

  const demoAccounts = [
    { label: 'Super Admin', email: 'superadmin@banquetease.com' },
    { label: 'Franchise Admin', email: 'franchise@banquetease.com' },
    { label: 'Branch Manager', email: 'manager@banquetease.com' },
    { label: 'Sales Executive', email: 'sales@banquetease.com' },
    { label: 'Kitchen Manager', email: 'kitchen@banquetease.com' },
    { label: 'Accountant', email: 'accountant@banquetease.com' },
    { label: 'Ops Staff', email: 'ops@banquetease.com' },
    { label: 'Receptionist', email: 'reception@banquetease.com' },
    { label: 'Customer', email: 'customer@banquetease.com' },
  ];

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
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 700, marginBottom: 12, letterSpacing: '-0.5px' }}>BanquetOS</h1>
          <p style={{ fontSize: 16, opacity: 0.8, lineHeight: 1.6, maxWidth: 360, margin: '0 auto' }}>Professional banquet management platform. Manage leads, bookings, events, billing, and more with AI-powered insights.</p>
          <div style={{ display: 'flex', gap: 32, marginTop: 40, justifyContent: 'center' }}>
            {[['500+', 'Events'], ['₹18Cr+', 'Revenue'], ['3', 'Franchises']].map(([val, lbl]) => (
              <div key={lbl}><div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#E8B84B' }}>{val}</div><div style={{ fontSize: 12, opacity: 0.6, marginTop: 4 }}>{lbl}</div></div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right Login Form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', background: 'var(--color-bg)' }}>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }} style={{ width: '100%', maxWidth: 420 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--color-text-h)', marginBottom: 6 }}>Welcome Back</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14, marginBottom: 32 }}>Sign in to continue to BanquetOS</p>

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 10, background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.2)', marginBottom: 20, fontSize: 14, color: 'var(--color-danger)' }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email Address</label>
              <input className="input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input className="input" type={showPwd ? 'text' : 'password'} placeholder="Min 8 characters" value={password} onChange={e => setPassword(e.target.value)} required style={{ paddingRight: 44 }} />
                <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: 4 }}>
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: 8, opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Signing in...' : <><LogIn size={16} /> Sign In</>}
            </button>
          </form>

          <div style={{ textAlign: 'center', margin: '20px 0', fontSize: 14, color: 'var(--color-text-muted)' }}>
            Don&apos;t have an account? <Link href="/signup" style={{ color: 'var(--color-accent)', fontWeight: 600 }}>Sign up as Customer</Link>
          </div>

          {/* Demo Accounts */}
          <div style={{ marginTop: 28, padding: 20, borderRadius: 14, background: 'var(--color-primary-ghost)', border: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12 }}>Quick Login — Dev Accounts</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {demoAccounts.map(acc => (
                <button key={acc.email} onClick={() => { setEmail(acc.email); setPassword('Admin@123'); }} className="btn btn-outline btn-sm" style={{ fontSize: 11, padding: '5px 10px' }}>{acc.label}</button>
              ))}
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 8 }}>Password: <code style={{ fontFamily: 'var(--font-mono)', background: 'var(--color-accent-ghost)', padding: '2px 6px', borderRadius: 4 }}>Admin@123</code></div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
