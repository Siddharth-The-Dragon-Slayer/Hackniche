'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { fadeUp, staggerContainer } from '@/lib/motion-variants';
import { useAuth } from '@/contexts/auth-context';
import Badge from '@/components/ui/Badge';
import { RefreshCw, Loader2, AlertCircle, ChevronLeft, ChevronRight, Calendar as CalIcon, Building2 } from 'lucide-react';

const STATUS_V = { confirmed:'green', in_progress:'primary', completed:'accent', cancelled:'red' };
const STATUS_L = { confirmed:'Confirmed', in_progress:'Running', completed:'Done', cancelled:'Cancelled' };
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export default function CalendarPage() {
  const router = useRouter();
  const { userProfile } = useAuth();
  const fid = userProfile?.franchise_id || 'pfd';
  const bid = userProfile?.branch_id    || 'pfd_b1';

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [curDate, setCurDate]   = useState(new Date());
  const [view, setView]         = useState('month'); // month | week

  const year  = curDate.getFullYear();
  const month = curDate.getMonth();

  const fetch_ = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const r = await fetch(`/api/bookings?franchise_id=${fid}&branch_id=${bid}`);
      const d = await r.json(); if (!r.ok) throw new Error(d.error);
      setBookings(d.bookings || []);
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  }, [fid, bid]);
  useEffect(() => { fetch_(); }, [fetch_]);

  // Build date → bookings map
  const dateMap = useMemo(() => {
    const m = {};
    bookings.forEach(b => {
      if (!b.event_date) return;
      const key = b.event_date.slice(0, 10); // YYYY-MM-DD
      if (!m[key]) m[key] = [];
      m[key].push(b);
    });
    return m;
  }, [bookings]);

  // Calendar grid
  const firstDay  = new Date(year, month, 1).getDay();
  const daysInMon = new Date(year, month + 1, 0).getDate();
  const today     = new Date().toISOString().slice(0, 10);

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMon; d++) cells.push(d);

  const prev = () => setCurDate(new Date(year, month - 1, 1));
  const next = () => setCurDate(new Date(year, month + 1, 1));
  const goToday = () => setCurDate(new Date());

  // Stats for this month
  const monthKey = `${year}-${String(month+1).padStart(2,'0')}`;
  const monthBookings = bookings.filter(b => b.event_date?.startsWith(monthKey));
  const confirmed = monthBookings.filter(b => b.status === 'confirmed').length;
  const running   = monthBookings.filter(b => b.status === 'in_progress').length;

  // Unique halls
  const halls = [...new Set(bookings.map(b => b.hall_name).filter(Boolean))];

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible">
      <motion.div variants={fadeUp} className="page-header" style={{marginBottom:24}}>
        <div className="page-header-left">
          <h1>Calendar</h1>
          <p style={{color:'var(--color-text-muted)',fontSize:14}}>
            {loading ? 'Loading…' : `${monthBookings.length} events in ${MONTHS[month]} · ${confirmed} confirmed · ${running} running`}
          </p>
        </div>
        <div className="page-actions">
          <button className="btn btn-outline btn-sm" onClick={fetch_} disabled={loading}><RefreshCw size={14}/>Refresh</button>
        </div>
      </motion.div>

      {/* KPIs */}
      <motion.div variants={fadeUp} className="kpi-row" style={{marginBottom:20}}>
        {[
          { label:'This Month',  val:monthBookings.length, icon:<CalIcon size={14}/> },
          { label:'Confirmed',   val:confirmed,            icon:<CalIcon size={14}/> },
          { label:'Running',     val:running,              icon:<CalIcon size={14}/> },
          { label:'Halls',       val:halls.length,         icon:<Building2 size={14}/> },
        ].map(k=>(
          <div key={k.label} className="card" style={{padding:'12px 16px'}}>
            <div style={{fontSize:10,color:'var(--color-text-muted)',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:3}}>{k.label}</div>
            <div style={{fontSize:14,fontWeight:600,color:'var(--color-text-h)',display:'flex',alignItems:'center',gap:6}}>{k.icon}{k.val}</div>
          </div>
        ))}
      </motion.div>

      {error && <motion.div variants={fadeUp} style={{background:'#fee2e2',border:'1px solid #fca5a5',borderRadius:8,padding:'12px 16px',marginBottom:16,color:'#991b1b',fontSize:13,display:'flex',alignItems:'center',gap:8}}><AlertCircle size={15}/>{error}</motion.div>}

      {/* Calendar Controls */}
      <motion.div variants={fadeUp} style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <button className="btn btn-ghost btn-sm" onClick={prev}><ChevronLeft size={16}/></button>
          <h2 style={{fontSize:18,fontWeight:700,margin:0,minWidth:200,textAlign:'center'}}>{MONTHS[month]} {year}</h2>
          <button className="btn btn-ghost btn-sm" onClick={next}><ChevronRight size={16}/></button>
        </div>
        <button className="btn btn-outline btn-sm" onClick={goToday}>Today</button>
      </motion.div>

      {/* Calendar Grid */}
      <motion.div variants={fadeUp} className="card" style={{padding:0,overflow:'hidden'}}>
        {/* Day headers */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(7, 1fr)',borderBottom:'1px solid var(--color-border)'}}>
          {DAYS.map(d=>(
            <div key={d} style={{padding:'10px 8px',textAlign:'center',fontSize:11,fontWeight:700,textTransform:'uppercase',color:'var(--color-text-muted)',letterSpacing:'0.05em',background:'var(--color-surface)'}}>{d}</div>
          ))}
        </div>

        {/* Cells */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(7, 1fr)'}}>
          {cells.map((day, idx) => {
            if (day === null) return <div key={`e${idx}`} style={{minHeight:90,background:'var(--color-surface)',borderBottom:'1px solid var(--color-border)',borderRight:'1px solid var(--color-border)'}} />;

            const dateKey = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
            const events = dateMap[dateKey] || [];
            const isToday = dateKey === today;
            const isPast = dateKey < today;

            return (
              <div key={dateKey} style={{
                minHeight: 90, padding: '4px 6px',
                borderBottom: '1px solid var(--color-border)', borderRight: '1px solid var(--color-border)',
                background: isToday ? 'var(--color-primary-ghost)' : 'var(--color-bg-card)',
                opacity: isPast ? 0.65 : 1,
                cursor: events.length > 0 ? 'pointer' : 'default',
              }}>
                <div style={{
                  fontSize: 12, fontWeight: isToday ? 800 : 500,
                  color: isToday ? 'var(--color-primary)' : 'var(--color-text-h)',
                  marginBottom: 3,
                  display: 'flex', alignItems: 'center', gap: 4,
                }}>
                  {isToday && <span style={{width:6,height:6,borderRadius:'50%',background:'var(--color-primary)',display:'inline-block'}}/>}
                  {day}
                </div>
                {events.slice(0, 3).map(ev => (
                  <div key={ev.id}
                    onClick={() => router.push(`/bookings/${ev.id}?franchise_id=${fid}&branch_id=${bid}`)}
                    style={{
                      fontSize: 10, padding: '2px 5px', borderRadius: 4, marginBottom: 2,
                      background: ev.status === 'cancelled' ? '#fee2e2' : ev.status === 'completed' ? '#dcfce7' : ev.status === 'in_progress' ? '#dbeafe' : '#f0fdf4',
                      color: ev.status === 'cancelled' ? '#991b1b' : ev.status === 'completed' ? '#15803d' : ev.status === 'in_progress' ? '#1e40af' : '#166534',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      cursor: 'pointer', fontWeight: 500,
                    }}
                    title={`${ev.customer_name} — ${ev.event_type} (${ev.hall_name||'No hall'})`}
                  >
                    {ev.event_type ? `${ev.event_type.slice(0,8)}` : ''} {ev.customer_name?.split(' ')[0]}
                    {ev.hall_name && <span style={{opacity:.7}}> · {ev.hall_name}</span>}
                  </div>
                ))}
                {events.length > 3 && <div style={{fontSize:10,color:'var(--color-text-muted)',fontWeight:600}}>+{events.length-3} more</div>}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Upcoming Events List */}
      <motion.div variants={fadeUp} style={{marginTop:24}}>
        <h3 style={{fontSize:15,fontWeight:700,marginBottom:12}}>Upcoming Events</h3>
        {(() => {
          const upcoming = bookings
            .filter(b => b.event_date >= today && ['confirmed','in_progress'].includes(b.status))
            .sort((a, b) => a.event_date.localeCompare(b.event_date))
            .slice(0, 10);
          if (upcoming.length === 0) return <div className="card" style={{padding:'32px 16px',textAlign:'center',color:'var(--color-text-muted)'}}><CalIcon size={28} style={{margin:'0 auto 8px',opacity:.3}}/><p style={{fontSize:13}}>No upcoming events.</p></div>;
          return (
            <div style={{display:'flex',flexDirection:'column',gap:6}}>
              {upcoming.map(ev => {
                const daysOut = Math.ceil((new Date(ev.event_date) - new Date(today)) / 86400000);
                return (
                  <div key={ev.id} className="card" style={{padding:'14px 18px',display:'flex',justifyContent:'space-between',alignItems:'center',cursor:'pointer',borderLeft:`3px solid ${daysOut<=3?'#dc2626':daysOut<=7?'#f59e0b':'var(--color-primary)'}`}}
                    onClick={()=>router.push(`/bookings/${ev.id}?franchise_id=${fid}&branch_id=${bid}`)}>
                    <div>
                      <div style={{fontWeight:600,fontSize:14,color:'var(--color-text-h)'}}>{ev.customer_name}</div>
                      <div style={{fontSize:12,color:'var(--color-text-muted)',display:'flex',gap:10,marginTop:3,flexWrap:'wrap'}}>
                        <span>🎉 {ev.event_type||'Event'}</span>
                        <span>📅 {new Date(ev.event_date).toLocaleDateString('en-IN',{day:'2-digit',month:'short',weekday:'short'})}</span>
                        {ev.hall_name&&<span>🏛️ {ev.hall_name}</span>}
                        <span>👥 {ev.expected_guest_count||'?'} guests</span>
                      </div>
                    </div>
                    <div style={{textAlign:'right'}}>
                      <Badge variant={STATUS_V[ev.status]||'neutral'}>{STATUS_L[ev.status]||ev.status}</Badge>
                      <div style={{fontSize:11,fontWeight:600,color:daysOut<=3?'#dc2626':daysOut<=7?'#f59e0b':'var(--color-text-muted)',marginTop:4}}>
                        {daysOut === 0 ? 'TODAY!' : daysOut === 1 ? 'Tomorrow' : `${daysOut} days`}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </motion.div>
    </motion.div>
  );
}
