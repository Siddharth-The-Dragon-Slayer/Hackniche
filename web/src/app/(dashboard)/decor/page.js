'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { motion } from 'framer-motion';
import { fadeUp, staggerContainer } from '@/lib/motion-variants';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { Plus, Palette, Users, Sparkles, Edit3, Copy, Tag } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

const decorThemeVisuals = {
  Royal: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1400&q=80',
  Minimalist: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1400&q=80',
  Garden: 'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=1400&q=80',
  Traditional: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1400&q=80',
};

const decorThemeModels = {
  Royal: 'https://storage.googleapis.com/ar-answers-in-search-models/static/Tiger/model.glb',
  Minimalist: 'https://modelviewer.dev/shared-assets/models/Chair.glb',
  Garden: 'https://storage.googleapis.com/ar-answers-in-search-models/static/Lotus/model.glb',
  Traditional: 'https://storage.googleapis.com/ar-answers-in-search-models/static/Flamingo/model.glb',
};

export default function DecorPage() {
  const { userProfile } = useAuth();
  const [selectedDecor, setSelectedDecor] = useState(null);
  const [decorData, setDecorData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modelLoading, setModelLoading] = useState(false);

  useEffect(() => {
    fetchDecorData();
  }, [userProfile]);

  const fetchDecorData = async () => {
    try {
      const franchiseId = userProfile?.franchise_id || 'pfd';
      const response = await fetch(`/api/decor?franchise_id=${franchiseId}`);
      const result = await response.json();
      
      if (result.success) {
        // Add default colorPalette and tags if not present
        const enhancedData = result.data.map(item => ({
          ...item,
          colorPalette: item.colorPalette || 'Gold & Maroon',
          tags: item.tags || ['outdoor'],
        }));
        setDecorData(enhancedData);
      } else {
        console.error('Failed to fetch decor data:', result.error);
      }
    } catch (error) {
      console.error('Error fetching decor:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
      <Script
        type="module"
        src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"
        strategy="afterInteractive"
      />
      <Script
        type="module"
        src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"
        strategy="afterInteractive"
      />
      <motion.div variants={fadeUp} className="page-header" style={{ marginBottom: 24 }}>
        <div className="page-header-left">
          <h1>Decor Packages</h1>
          <p>{loading ? 'Loading...' : `${decorData.length} packages`}</p>
        </div>
        <div className="page-actions">
          <Link href="/decor/create" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}><Plus size={14} /> Create Package</Link>
        </div>
      </motion.div>
      <motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" style={{ perspective: 1400 }}>
        {loading ? (
          // Loading skeleton
          Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="card" style={{ padding: 24, height: 320 }}>
              <div style={{ background: 'var(--color-border)', borderRadius: 8, height: 220, marginBottom: 16, animation: 'pulse 2s infinite' }} />
              <div style={{ background: 'var(--color-border)', borderRadius: 4, height: 20, marginBottom: 8, width: '70%', animation: 'pulse 2s infinite' }} />
              <div style={{ background: 'var(--color-border)', borderRadius: 4, height: 16, width: '50%', animation: 'pulse 2s infinite' }} />
            </div>
          ))
        ) : decorData.length === 0 ? (
          <div style={{ gridColumn: 'span 3', textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>
            <Palette size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
            <h3>No decor packages yet</h3>
            <p>Create your first decor package to get started</p>
            <Link href="/decor/create" className="btn btn-primary" style={{ marginTop: 16, textDecoration: 'none' }}>
              <Plus size={16} /> Create Package
            </Link>
          </div>
        ) : (
          decorData.map((d, i) => (
            <motion.div
              key={d.id}
              variants={fadeUp}
              custom={i}
              className="card"
              onClick={() => setSelectedDecor(d)}
              onKeyDown={(e) => e.key === 'Enter' && setSelectedDecor(d)}
              role="button"
              tabIndex={0}
              aria-label={`Open 360 view for ${d.name}`}
              whileHover={{ y: -10, rotateX: 6, rotateY: -6, scale: 1.01 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              style={{
                overflow: 'hidden',
                transformStyle: 'preserve-3d',
                borderColor: 'var(--color-border-accent)',
                cursor: 'pointer',
              }}
            >
              <div style={{ position: 'relative', height: 220, overflow: 'hidden' }}>
                <img
                  src={d.imageUrl || decorThemeVisuals[d.theme] || decorThemeVisuals.Royal}
                  alt={`${d.name} decor preview`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.08)' }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'var(--gradient-hero)', opacity: 0.72 }} />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    padding: 18,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}
                >
                  <span className="badge badge-accent">{d.theme}</span>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      background: 'var(--color-accent-ghost)',
                      border: '1px solid var(--color-border-accent)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backdropFilter: 'blur(8px)',
                    }}
                  >
                    <Palette size={18} style={{ color: 'var(--color-accent)' }} />
                  </div>
                </div>
                <div
                  style={{
                    position: 'absolute',
                    left: 18,
                    bottom: 18,
                    transform: 'translateZ(30px)',
                    background: 'var(--color-bg-nav)',
                    border: '1px solid var(--color-border-accent)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '8px 12px',
                    boxShadow: 'var(--shadow-card)',
                  }}
                >
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 2 }}>Starting from</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-accent)', fontFamily: 'var(--font-mono)' }}>
                    ₹{d.price?.toLocaleString()}
                  </div>
                </div>
              </div>
              <div style={{ padding: 20, background: 'var(--color-bg-card)' }}>
                <h3
                  style={{
                    fontSize: 19,
                    fontWeight: 700,
                    color: 'var(--color-text-h)',
                    fontFamily: 'var(--font-display)',
                    marginBottom: 12,
                  }}
                >
                  {d.name}
                </h3>
                
                {/* Color Palette Section */}
                {d.colorPalette && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 6, 
                      marginBottom: 6,
                      fontSize: 12,
                      color: 'var(--color-text-muted)'
                    }}>
                      <Palette size={12} />
                      Color Palette
                    </div>
                    <div style={{
                      background: 'linear-gradient(90deg, #DAA520 0%, #8B0000 100%)',
                      height: 4,
                      borderRadius: 2,
                      marginBottom: 4
                    }} />
                    <span style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'var(--color-text-body)'
                    }}>
                      {d.colorPalette}
                    </span>
                  </div>
                )}
                
                {/* Tags Section */}
                {d.tags && d.tags.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 6, 
                      marginBottom: 6,
                      fontSize: 12,
                      color: 'var(--color-text-muted)'
                    }}>
                      <Tag size={12} />
                      Features
                    </div>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {d.tags.map((tag, tagIndex) => (
                        <span key={tagIndex} className="badge badge-ghost" style={{ fontSize: 11, padding: '2px 8px' }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Suitable For Section */}
                <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 8 }}>Best suitable for</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {(d.suitableFor || []).map(s => (
                    <span key={s} className="badge badge-neutral">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Enhanced 3D Model Viewer Modal */}
      <Modal
        open={!!selectedDecor}
        onClose={() => {
          setSelectedDecor(null);
          setModelLoading(false);
        }}
        title={selectedDecor ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>{selectedDecor.name}</h3>
              <p style={{ margin: 0, fontSize: 14, color: 'var(--color-text-muted)' }}>
                360° Interactive View • {selectedDecor.theme} Theme
              </p>
            </div>
          </div>
        ) : 'Decor 360° View'}
        size="xl"
        style={{ maxWidth: '90vw', maxHeight: '90vh' }}
      >
        {selectedDecor && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* 3D Model Viewer */}
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  borderRadius: 16,
                  overflow: 'hidden',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-bg-alt)',
                  position: 'relative',
                }}
              >
                {modelLoading && (
                  <div style={{
                    position: 'absolute', inset: 0, zIndex: 10,
                    background: 'rgba(255,255,255,0.9)',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    gap: 12
                  }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: '50%',
                      border: '4px solid var(--color-border)',
                      borderTop: '4px solid var(--color-primary)',
                      animation: 'spin 1s linear infinite'
                    }} />
                    <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: 14 }}>
                      Loading 3D model...
                    </p>
                  </div>
                )}
                
                <model-viewer
                  src={decorThemeModels[selectedDecor.theme] || decorThemeModels.Royal}
                  poster={selectedDecor.imageUrl || decorThemeVisuals[selectedDecor.theme] || decorThemeVisuals.Royal}
                  alt={`${selectedDecor.name} 3D decor model`}
                  camera-controls
                  auto-rotate
                  auto-rotate-delay="3000"
                  rotation-per-second="15deg"
                  shadow-intensity="1.2"
                  touch-action="pan-y"
                  interaction-prompt="auto"
                  onLoad={() => setModelLoading(false)}
                  onError={() => setModelLoading(false)}
                  style={{ 
                    width: '100%', 
                    height: '520px', 
                    background: 'linear-gradient(135deg, var(--color-bg-alt), var(--color-bg))',
                  }}
                />
                
                {/* Model Controls Overlay */}
                <div style={{
                  position: 'absolute', bottom: 16, right: 16,
                  background: 'rgba(255,255,255,0.9)', borderRadius: 8,
                  border: '1px solid var(--color-border)', padding: 12,
                  display: 'flex', gap: 8, alignItems: 'center'
                }}>
                  <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                    Drag • Zoom • Auto-rotate
                  </span>
                  <div style={{ width: 1, height: 16, background: 'var(--color-border)' }} />
                  <Button 
                    size="xs" 
                    variant="ghost" 
                    onClick={() => {
                      const viewer = document.querySelector('model-viewer');
                      if (viewer) viewer.resetTurntableRotation();
                    }}
                    style={{ fontSize: 11, padding: '4px 8px' }}
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Package Details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div>
                <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: 'var(--color-text-h)' }}>
                  Package Details
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {selectedDecor.description && (
                    <div>
                      <div className="label-small">Description</div>
                      <p style={{ fontSize: 14, color: 'var(--color-text-body)', margin: 0 }}>
                        {selectedDecor.description}
                      </p>
                    </div>
                  )}
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <div className="label-small">Theme</div>
                      <span className="badge badge-accent">{selectedDecor.theme}</span>
                    </div>
                    <div>
                      <div className="label-small">Status</div>
                      <span className={`badge ${selectedDecor.status === 'Active' ? 'badge-success' : 'badge-neutral'}`}>
                        {selectedDecor.status || 'Active'}
                      </span>
                    </div>
                  </div>

                  {selectedDecor.colorPalette && (
                    <div>
                      <div className="label-small">Color Palette</div>
                      <span className="badge badge-outline">{selectedDecor.colorPalette}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: 'var(--color-text-h)' }}>
                  Specifications
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <div className="label-small">Starting Price</div>
                    <span style={{ 
                      fontSize: 24, fontWeight: 700, color: 'var(--color-primary)',
                      fontFamily: 'var(--font-mono)'
                    }}>
                      ₹{selectedDecor.price?.toLocaleString()}
                    </span>
                  </div>

                  {(selectedDecor.minPax || selectedDecor.maxPax) && (
                    <div>
                      <div className="label-small">Guest Capacity</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Users size={16} style={{ color: 'var(--color-primary)' }} />
                        <span style={{ fontSize: 14, fontWeight: 500 }}>
                          {selectedDecor.minPax && selectedDecor.maxPax 
                            ? `${selectedDecor.minPax} - ${selectedDecor.maxPax} guests`
                            : selectedDecor.minPax 
                              ? `${selectedDecor.minPax}+ guests`
                              : `Up to ${selectedDecor.maxPax} guests`
                          }
                        </span>
                      </div>
                    </div>
                  )}

                  {selectedDecor.suitableFor && selectedDecor.suitableFor.length > 0 && (
                    <div>
                      <div className="label-small">Suitable For</div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {selectedDecor.suitableFor.map(event => (
                          <span key={event} className="badge badge-neutral">{event}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedDecor.tags && selectedDecor.tags.length > 0 && (
                    <div>
                      <div className="label-small">Features</div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {selectedDecor.tags.map((tag, index) => (
                          <span key={index} className="badge badge-ghost">{tag}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              paddingTop: 16, 
              borderTop: '1px solid var(--color-border)' 
            }}>
              <p style={{ 
                margin: 0, 
                color: 'var(--color-text-muted)', 
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}>
                <Sparkles size={14} />
                Drag to rotate • Scroll to zoom • Double-click to reset view
              </p>
              
              <div style={{ display: 'flex', gap: 12 }}>
                <Link href={`/decor/${selectedDecor.id}/edit`} style={{ textDecoration: 'none' }}>
                  <Button variant="outline">
                    <Edit3 size={16} /> Edit Package
                  </Button>
                </Link>
                <Button variant="outline" onClick={() => console.log('Duplicate functionality to be implemented')}>
                  <Copy size={16} /> Duplicate
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
}
