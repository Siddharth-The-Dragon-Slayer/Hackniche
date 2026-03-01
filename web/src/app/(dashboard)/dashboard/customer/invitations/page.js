'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Video, Image as ImageIcon, Sparkles, Play, Download,
  Loader2, CheckCircle2, AlertCircle, ChevronDown, ChevronUp,
  RefreshCcw, Heart, Star, Briefcase, Cake, Ring, ArrowRight
} from 'lucide-react';
import { fadeUp, staggerContainer } from '@/lib/motion-variants';

// ── event config ─────────────────────────────────────────────────────────────
const EVENT_TYPES = [
  {
    key: 'wedding',
    label: 'Wedding',
    icon: '💍',
    color: '#D4AF37',
    colorBg: 'rgba(212,175,55,0.08)',
    desc: 'Cinematic ivory & rose gold luxury',
    fields: [
      { key: 'bride', label: "Bride's Name", placeholder: 'Priya Mehta', required: true },
      { key: 'groom', label: "Groom's Name", placeholder: 'Arjun Kapoor', required: true },
      { key: 'weddingDate', label: 'Wedding Date', placeholder: 'Sunday, April 27, 2026', required: true },
      { key: 'ceremonyTime', label: 'Ceremony Time', placeholder: '11:00 AM', required: true },
      { key: 'receptionTime', label: 'Reception Time', placeholder: '7:00 PM', required: true },
      { key: 'venueName', label: 'Venue Name', placeholder: 'The Royal Orchid Palace', required: true },
      { key: 'venueAddress', label: 'Venue Address', placeholder: 'Outer Ring Road, Bengaluru', required: true },
      { key: 'rsvpContact', label: 'RSVP Contact', placeholder: '+91 98765 43210', required: true },
      { key: 'rsvpDate', label: 'RSVP By Date', placeholder: 'April 15, 2026', required: false },
    ],
  },
  {
    key: 'birthday',
    label: 'Birthday',
    icon: '🎂',
    color: '#FFD700',
    colorBg: 'rgba(255,215,0,0.08)',
    desc: 'Vibrant dark violet & gold',
    fields: [
      { key: 'guestName', label: "Celebrant's Name", placeholder: 'Rahul Sharma', required: true },
      { key: 'age', label: 'Age (optional)', placeholder: '30', required: false },
      { key: 'hostName', label: 'Hosted By', placeholder: 'The Sharma Family', required: true },
      { key: 'eventDate', label: 'Event Date', placeholder: 'Saturday, March 15, 2026', required: true },
      { key: 'eventTime', label: 'Event Time', placeholder: '7:00 PM', required: true },
      { key: 'venueName', label: 'Venue', placeholder: 'Grand Celebration Hall', required: true },
      { key: 'venueAddress', label: 'Venue Address', placeholder: '12, MG Road, Bengaluru', required: true },
      { key: 'rsvpContact', label: 'RSVP Contact', placeholder: '+91 98765 43210', required: true },
      { key: 'rsvpDate', label: 'RSVP By', placeholder: 'March 10, 2026', required: false },
    ],
  },
  {
    key: 'anniversary',
    label: 'Anniversary',
    icon: '🌹',
    color: '#DC934A',
    colorBg: 'rgba(220,147,74,0.08)',
    desc: 'Heritage rose gold & bronze',
    fields: [
      { key: 'coupleName', label: 'Couple Name', placeholder: 'Ramesh & Sunita', required: true },
      { key: 'years', label: 'Years Together', placeholder: '25', required: true },
      { key: 'yearsLabel', label: 'Milestone Label', placeholder: 'Silver Jubilee', required: false },
      { key: 'hostName', label: 'Hosted By', placeholder: 'The Kapoor Children', required: true },
      { key: 'eventDate', label: 'Event Date', placeholder: 'Friday, May 8, 2026', required: true },
      { key: 'eventTime', label: 'Event Time', placeholder: '6:30 PM', required: true },
      { key: 'venueName', label: 'Venue', placeholder: 'Taj Falaknuma Palace', required: true },
      { key: 'venueAddress', label: 'Venue Address', placeholder: 'Engine Bowli, Hyderabad', required: true },
      { key: 'rsvpContact', label: 'RSVP Contact', placeholder: '+91 98765 43210', required: true },
      { key: 'rsvpDate', label: 'RSVP By', placeholder: 'April 30, 2026', required: false },
    ],
  },
  {
    key: 'corporate',
    label: 'Corporate',
    icon: '🏢',
    color: '#60a5fa',
    colorBg: 'rgba(96,165,250,0.08)',
    desc: 'Sleek midnight navy & silver',
    fields: [
      { key: 'eventTitle', label: 'Event Title', placeholder: 'Annual Leadership Summit', required: true },
      { key: 'companyName', label: 'Company Name', placeholder: 'Nexus Technologies', required: true },
      { key: 'speakerName', label: 'Speaker / Guest', placeholder: 'Dr. Anita Sharma', required: false },
      { key: 'theme', label: 'Theme / Tagline', placeholder: 'Innovate Beyond Boundaries', required: false },
      { key: 'eventDate', label: 'Event Date', placeholder: 'Wednesday, June 10, 2026', required: true },
      { key: 'eventTime', label: 'Event Time', placeholder: '9:00 AM', required: true },
      { key: 'venueName', label: 'Venue', placeholder: 'Hyderabad International Convention Centre', required: true },
      { key: 'venueAddress', label: 'Venue Address', placeholder: 'HITEC City, Hyderabad', required: true },
      { key: 'registrationLink', label: 'Registration Link', placeholder: 'nexus.com/register', required: false },
      { key: 'contactEmail', label: 'Contact Email', placeholder: 'events@nexus.com', required: true },
    ],
  },
  {
    key: 'engagement',
    label: 'Engagement',
    icon: '💎',
    color: '#f9a8d4',
    colorBg: 'rgba(249,168,212,0.08)',
    desc: 'Jewel rose, blush & champagne',
    fields: [
      { key: 'partner1', label: 'Partner 1 Name', placeholder: 'Aisha Khan', required: true },
      { key: 'partner2', label: 'Partner 2 Name', placeholder: 'Rohan Verma', required: true },
      { key: 'hostFamily1', label: 'Host Family 1', placeholder: 'The Khan Family', required: false },
      { key: 'hostFamily2', label: 'Host Family 2', placeholder: 'The Verma Family', required: false },
      { key: 'eventDate', label: 'Event Date', placeholder: 'Saturday, July 11, 2026', required: true },
      { key: 'eventTime', label: 'Event Time', placeholder: '5:00 PM', required: true },
      { key: 'venueName', label: 'Venue', placeholder: 'The ITC Windsor', required: true },
      { key: 'venueAddress', label: 'Venue Address', placeholder: 'Golf Course Road, Bengaluru', required: true },
      { key: 'rsvpContact', label: 'RSVP Contact', placeholder: '+91 98765 43210', required: true },
      { key: 'rsvpDate', label: 'RSVP By', placeholder: 'July 1, 2026', required: false },
    ],
  },
];



const TABS = ['🎬 Video Invitation', '🖼️ Invitation Poster'];

// ── helpers ──────────────────────────────────────────────────────────────────
const Field = ({ f, value, onChange }) => (
  <div>
    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 5 }}>
      {f.label}{f.required && <span style={{ color: 'var(--color-danger)', marginLeft: 2 }}>*</span>}
    </label>
    <input
      className="input"
      placeholder={f.placeholder}
      value={value || ''}
      onChange={e => onChange(f.key, e.target.value)}
      required={f.required}
      style={{ width: '100%', boxSizing: 'border-box' }}
    />
  </div>
);

// ── main page ─────────────────────────────────────────────────────────────────
export default function InvitationsPage() {
  const [activeTab, setActiveTab] = useState(0);

  // ── video invitation state ─────────────────────────────────────────────────
  const [selectedEventType, setSelectedEventType] = useState(null);
  const [formValues, setFormValues] = useState({});
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoResult, setVideoResult] = useState(null);
  const [videoError, setVideoError] = useState(null);

  // ── invitation poster state ─────────────────────────────────────────────────
  const [posterEventType, setPosterEventType] = useState('wedding');
  const [posterFormValues, setPosterFormValues] = useState(() => {
    const weddingConf = EVENT_TYPES.find(e => e.key === 'wedding');
    const defs = {};
    (weddingConf?.fields || []).forEach(f => { if (f.placeholder) defs[f.key] = f.placeholder; });
    return defs;
  });
  const [posterLoading, setPosterLoading] = useState(false);
  const [posterImageBase64, setPosterImageBase64] = useState(null);
  const [posterError, setPosterError] = useState(null);

  const handleFieldChange = (key, val) => setFormValues(prev => ({ ...prev, [key]: val }));

  const handleEventTypeSelect = (key) => {
    setSelectedEventType(key);
    // Pre-fill form with placeholder values so user doesn't have to fill everything
    const eventConfig = EVENT_TYPES.find(e => e.key === key);
    const defaults = {};
    (eventConfig?.fields || []).forEach(f => {
      if (f.placeholder) defaults[f.key] = f.placeholder;
    });
    setFormValues(defaults);
    setVideoResult(null);
    setVideoError(null);
  };

  const handleVideoSubmit = async (e) => {
    e.preventDefault();
    setVideoLoading(true);
    setVideoError(null);
    setVideoResult(null);
    try {
      const res = await fetch('/api/ai/json2video-invitation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_type: selectedEventType, variables: formValues }),
      });
      const data = await res.json();
      if (data.success) {
        setVideoResult(data);
      } else {
        setVideoError(data.error || data.message || 'Failed to generate video. Please try again.');
      }
    } catch (err) {
      setVideoError('Network error. Please check your connection and try again.');
    } finally {
      setVideoLoading(false);
    }
  };

  const handlePosterEventTypeSelect = (key) => {
    setPosterEventType(key);
    const conf = EVENT_TYPES.find(e => e.key === key);
    const defs = {};
    (conf?.fields || []).forEach(f => { if (f.placeholder) defs[f.key] = f.placeholder; });
    setPosterFormValues(defs);
    setPosterImageBase64(null);
    setPosterError(null);
  };

  const handlePosterFieldChange = (key, val) => setPosterFormValues(prev => ({ ...prev, [key]: val }));

  const handleGeneratePoster = async () => {
    setPosterLoading(true);
    setPosterError(null);
    try {
      const res = await fetch('/api/ai/generate-poster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventType: posterEventType, formValues: posterFormValues }),
      });
      const data = await res.json();
      if (data.success && data.imageBase64) {
        setPosterImageBase64(data.imageBase64);
      } else {
        setPosterError(data.error || 'Failed to generate poster. Please try again.');
      }
    } catch (err) {
      setPosterError('Generation failed: ' + (err.message || 'Network error'));
    } finally {
      setPosterLoading(false);
    }
  };

  const eventConf = EVENT_TYPES.find(e => e.key === selectedEventType);

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
      {/* Header */}
      <motion.div variants={fadeUp} style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span className="badge badge-accent" style={{ fontSize: 11 }}>AI Creative Studio</span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--color-text-h)', marginBottom: 6 }}>
              Create Your Invitations
            </h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>
              Generate cinematic video invitations or AI-designed posters for your special event.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginTop: 24, borderBottom: '1px solid var(--color-border)' }}>
          {TABS.map((t, i) => (
            <button
              key={t}
              onClick={() => setActiveTab(i)}
              style={{
                padding: '10px 20px',
                fontSize: 14,
                fontWeight: 600,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: activeTab === i ? 'var(--color-primary)' : 'var(--color-text-muted)',
                borderBottom: activeTab === i ? '3px solid var(--color-primary)' : '3px solid transparent',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {/* ── TAB 0: VIDEO INVITATION ────────────────────────────────────── */}
        {activeTab === 0 && (
          <motion.div key="video" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>

            {!selectedEventType ? (
              /* Event Type Selection */
              <div>
                <p style={{ fontSize: 15, color: 'var(--color-text-body)', marginBottom: 20 }}>
                  Choose your event type to get started with a cinematic video invitation:
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                  {EVENT_TYPES.map(et => (
                    <motion.button
                      key={et.key}
                      variants={fadeUp}
                      onClick={() => handleEventTypeSelect(et.key)}
                      style={{
                        padding: 24,
                        borderRadius: 20,
                        border: '1.5px solid var(--color-border)',
                        background: et.colorBg,
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                      whileHover={{ scale: 1.03, borderColor: et.color }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div style={{ fontSize: 36, marginBottom: 10 }}>{et.icon}</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-h)', marginBottom: 4 }}>{et.label}</div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{et.desc}</div>
                      <ArrowRight size={14} style={{ position: 'absolute', bottom: 16, right: 16, color: et.color }} />
                    </motion.button>
                  ))}
                </div>
              </div>
            ) : !videoResult ? (
              /* Form */
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: 24, alignItems: 'start' }}>
                <div className="card" style={{ padding: 28 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                    <button
                      onClick={() => setSelectedEventType(null)}
                      className="btn btn-outline btn-sm"
                      style={{ padding: '6px 14px' }}
                    >
                      ← Back
                    </button>
                    <div>
                      <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Creating</div>
                      <div style={{ fontWeight: 700, color: 'var(--color-text-h)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        {eventConf?.icon} {eventConf?.label} Video Invitation
                      </div>
                    </div>
                  </div>

                  {videoError && (
                    <div style={{ padding: '10px 16px', background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.2)', color: 'var(--color-danger)', borderRadius: 12, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                      <AlertCircle size={15} /> {videoError}
                    </div>
                  )}

                  <form onSubmit={handleVideoSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16, marginBottom: 24 }}>
                      {(eventConf?.fields || []).map(f => (
                        <Field key={f.key} f={f} value={formValues[f.key]} onChange={handleFieldChange} />
                      ))}
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={videoLoading} style={{ width: '100%', padding: '14px', justifyContent: 'center', gap: 8, fontSize: 15 }}>
                      {videoLoading ? (
                        <><Loader2 size={16} className="animate-spin" /> Rendering Video (this may take 1–3 min)…</>
                      ) : (
                        <><Video size={16} /> Generate Video Invitation</>
                      )}
                    </button>
                  </form>
                </div>

                {/* Preview / Info Panel */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div className="card" style={{ padding: 24, background: 'var(--gradient-hero)', border: 'none' }}>
                    <div style={{ color: '#fff' }}>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>{eventConf?.icon}</div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
                        {eventConf?.label} Template
                      </div>
                      <p style={{ fontSize: 13, opacity: 0.85, lineHeight: 1.6 }}>
                        Your video will feature 4 cinematic scenes with AI voiceover, animated text, and custom music — ready to share.
                      </p>
                    </div>
                  </div>
                  {[
                    { icon: '🎙️', label: 'AI Voiceover', desc: 'Neural voice narration' },
                    { icon: '🎵', label: 'Background Music', desc: 'Elegant ambient score' },
                    { icon: '✨', label: 'Animated Text', desc: 'Cinematic reveals' },
                    { icon: '🎞️', label: '4 Scenes', desc: 'Full HD 1920×1080' },
                  ].map(feat => (
                    <div key={feat.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'var(--color-bg-alt)', borderRadius: 14, border: '1px solid var(--color-border)' }}>
                      <span style={{ fontSize: 22 }}>{feat.icon}</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-h)' }}>{feat.label}</div>
                        <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{feat.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Result */
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center' }}>
                <div style={{ width: '100%', maxWidth: 640 }} className="card">
                  <div style={{ padding: 32, textAlign: 'center' }}>
                    <CheckCircle2 size={56} style={{ color: 'var(--color-success)', marginBottom: 16 }} />
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--color-text-h)', marginBottom: 8 }}>
                      Your Video is Ready!
                    </h2>
                    <p style={{ color: 'var(--color-text-muted)', marginBottom: 24, fontSize: 14 }}>
                      Your {eventConf?.label.toLowerCase()} invitation has been rendered successfully.
                    </p>
                    {videoResult.movieUrl && (
                      <div style={{ marginBottom: 24 }}>
                        <video
                          src={videoResult.movieUrl}
                          controls
                          style={{ width: '100%', borderRadius: 16, background: '#000', maxHeight: 360 }}
                        />
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                      {videoResult.movieUrl && (
                        <a href={videoResult.movieUrl} download className="btn btn-primary" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Download size={15} /> Download Video
                        </a>
                      )}
                      <button className="btn btn-outline" onClick={() => { setVideoResult(null); setFormValues({}); }}>
                        <RefreshCcw size={15} /> Create Another
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ── TAB 1: INVITATION POSTER ──────────────────────────────── */}
        {activeTab === 1 && (
          <motion.div key="poster" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 24, alignItems: 'start' }}>

              {/* Left — Controls */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div className="card" style={{ padding: 28 }}>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--color-text-h)', marginBottom: 4 }}>
                    Invitation Poster
                  </h2>
                  <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 20 }}>
                    Choose your event type, fill in the details, and generate a beautiful printed invitation card.
                  </p>

                  {/* Event type selector */}
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 10 }}>
                      Event Type
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {EVENT_TYPES.map(et => (
                        <button
                          key={et.key}
                          onClick={() => handlePosterEventTypeSelect(et.key)}
                          style={{
                            padding: '6px 14px',
                            borderRadius: 20,
                            border: `1.5px solid ${posterEventType === et.key ? et.color : 'var(--color-border)'}`,
                            background: posterEventType === et.key ? et.colorBg : 'transparent',
                            color: posterEventType === et.key ? et.color : 'var(--color-text-muted)',
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                          }}
                        >
                          {et.icon} {et.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Form fields */}
                  {(() => {
                    const pConf = EVENT_TYPES.find(e => e.key === posterEventType);
                    return (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12, marginBottom: 20 }}>
                        {(pConf?.fields || []).map(f => (
                          <Field key={f.key} f={f} value={posterFormValues[f.key]} onChange={handlePosterFieldChange} />
                        ))}
                      </div>
                    );
                  })()}

                  {posterError && (
                    <div style={{ padding: '10px 14px', background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.2)', color: 'var(--color-danger)', borderRadius: 10, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                      <AlertCircle size={15} /> {posterError}
                    </div>
                  )}

                  <button
                    className="btn btn-primary"
                    onClick={handleGeneratePoster}
                    disabled={posterLoading}
                    style={{ width: '100%', padding: '13px', justifyContent: 'center', gap: 8, fontSize: 15 }}
                  >
                    {posterLoading ? (
                      <><Loader2 size={16} className="animate-spin" /> Generating poster…</>
                    ) : (
                      <><Sparkles size={16} /> Generate Invitation Poster</>
                    )}
                  </button>
                </div>
              </div>

              {/* Right — Poster Output */}
              <div className="card" style={{ padding: 28, minHeight: 480, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: posterImageBase64 ? 'flex-start' : 'center' }}>
                {!posterImageBase64 && !posterLoading && (
                  <div style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    <div style={{ fontSize: 64, marginBottom: 16, opacity: 0.25 }}>
                      {EVENT_TYPES.find(e => e.key === posterEventType)?.icon || '🖼️'}
                    </div>
                    <p style={{ fontSize: 14, fontWeight: 600 }}>Your poster will appear here</p>
                    <p style={{ fontSize: 12, marginTop: 4 }}>Fill in the details and click Generate</p>
                  </div>
                )}
                {posterLoading && (
                  <div style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      style={{ width: 56, height: 56, borderRadius: '50%', border: '3px solid var(--color-primary-ghost)', borderTopColor: 'var(--color-primary)', margin: '0 auto 16px' }}
                    />
                    <p style={{ fontSize: 14, fontWeight: 600 }}>Rendering your invitation card…</p>
                    <p style={{ fontSize: 12, marginTop: 4 }}>This usually takes 5–10 seconds.</p>
                  </div>
                )}
                {posterImageBase64 && !posterLoading && (
                  <>
                    <img
                      src={posterImageBase64}
                      alt="Invitation Poster"
                      style={{ width: '100%', borderRadius: 12, display: 'block', marginBottom: 16 }}
                    />
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                      <a
                        href={posterImageBase64}
                        download={`${posterEventType}-invitation.png`}
                        className="btn btn-primary btn-sm"
                        style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}
                      >
                        <Download size={13} /> Download Poster
                      </a>
                      <button className="btn btn-outline btn-sm" onClick={handleGeneratePoster} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <RefreshCcw size={13} /> Regenerate
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </motion.div>
  );
}
