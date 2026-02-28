'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus, Star } from 'lucide-react';
import { fadeUp, staggerContainer } from '@/lib/motion-variants';
import { useAuth } from '@/contexts/auth-context';

export default function VendorsPage() {
  const { userProfile } = useAuth();
  const [vendorData, setVendorData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const franchiseId = userProfile?.franchise_id || 'pfd';
        console.log('Fetching vendors for franchise:', franchiseId);
        const response = await fetch(`/api/kitchen-vendor?franchise_id=${franchiseId}`);
        const result = await response.json();
        console.log('Vendor API response:', result);
        
        if (result.success) {
          console.log('Setting vendor data:', result.data);
          setVendorData(result.data);
        } else {
          console.error('API error:', result.error);
        }
      } catch (error) {
        console.error('Error fetching vendors:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userProfile) {
      fetchVendors();
    }
  }, [userProfile]);

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
      <motion.div variants={fadeUp} className="page-header" style={{ marginBottom: 24 }}>
        <div className="page-header-left">
          <h1>Vendors</h1>
          <p>{loading ? 'Loading...' : `${vendorData.length} registered vendors`}</p>
        </div>
        <div className="page-actions">
          <Link href="/vendors/create" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}><Plus size={14} /> Add Vendor</Link>
        </div>
      </motion.div>

    
      {loading ? (
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>Loading vendors...</div>
        </div>
      ) : vendorData.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>No vendors found. Add your first vendor to get started.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '24px' }}>
          {vendorData.map((v, i) => (
            <div key={v.id} className="card" style={{ padding: 24, background: 'white', border: '1px solid #e0e0e0', borderRadius: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: '#000', margin: 0 }}>{v.name}</h3>
                  <span style={{ marginTop: 4, display: 'inline-block', padding: '4px 8px', background: '#3b82f6', color: 'white', borderRadius: 4, fontSize: 12 }}>{v.category}</span>
                </div>
                <span style={{ padding: '4px 8px', borderRadius: 4, background: v.status === 'Active' ? '#22c55e' : '#gray', color: 'white', fontSize: 12, height: 'fit-content' }}>{v.status}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#666', textTransform: 'uppercase', marginBottom: 4 }}>Contact</div>
                  <div style={{ fontSize: 14, color: '#000' }}>{v.contactName || v.name}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#666', textTransform: 'uppercase', marginBottom: 4 }}>Phone</div>
                  <div style={{ fontSize: 14, color: '#000' }}>{v.phone}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#666', textTransform: 'uppercase', marginBottom: 4 }}>Rate/Event</div>
                  <div style={{ fontSize: 14, fontFamily: 'monospace', color: '#000' }}>{v.baseRate > 0 ? `₹${v.baseRate.toLocaleString()}` : 'Variable'}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#666', textTransform: 'uppercase', marginBottom: 4 }}>Rating</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Star size={14} fill="#fbbf24" color="#fbbf24" />
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#000' }}>{v.rating || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
