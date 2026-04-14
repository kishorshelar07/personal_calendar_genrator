import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getCalendarById } from '../../services/calendar.service';
import { getImageUrl } from '../../services/upload.service';
import { getMonthDays, isEventDate, getEventLabel, generateCalendarData } from '../../utils/calendarHelper';

const DAYS  = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTH_NUMS = ['01','02','03','04','05','06','07','08','09','10','11','12'];

const C = {
  dark:     '#0c1220',
  darkCard: '#111827',
  slate:    '#1e2d3d',
  accent:   '#f59e0b',  // amber gold
  accentAlt:'#fb923c',  // warm orange
  text:     '#f1f5f9',
  textSub:  '#94a3b8',
  sat:      '#60a5fa',
  sun:      '#f87171',
  white:    '#ffffff',
  border:   'rgba(255,255,255,0.08)',
};

/* ─── Draggable / Zoomable Image ─────────────────────────── */
const ZoomImg = ({ src }) => {
  const [scale, setScale] = useState(1);
  const [pos, setPos]     = useState({ x:50, y:50 });
  const dragging = useRef(false);
  const last     = useRef({ x:0, y:0 });
  const ref      = useRef(null);

  const onDown = e => { dragging.current = true; last.current = { x:e.clientX, y:e.clientY }; e.preventDefault(); };
  const onUp   = ()  => { dragging.current = false; };
  const onMove = e  => {
    if (!dragging.current || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setPos(p => ({
      x: Math.min(100, Math.max(0, p.x + ((e.clientX - last.current.x) / r.width  ) * 100)),
      y: Math.min(100, Math.max(0, p.y + ((e.clientY - last.current.y) / r.height ) * 100)),
    }));
    last.current = { x:e.clientX, y:e.clientY };
  };

  return (
    <div style={{ position:'relative', flex:'0 0 52%' }}>
      <div ref={ref}
        onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
        style={{ height:'100%', minHeight:480, overflow:'hidden', cursor:'move', userSelect:'none', background:'#1e293b' }}>
        <img src={src} draggable={false}
          onError={e => { e.target.style.opacity='.1'; }}
          style={{
            width:'100%', height:'100%', objectFit:'cover',
            objectPosition:`${pos.x}% ${pos.y}%`,
            transform:`scale(${scale})`,
            transformOrigin:`${pos.x}% ${pos.y}%`,
            transition:'transform .15s',
            display:'block',
          }}
        />
      </div>
      <div className="no-print" style={{ position:'absolute', top:12, right:12, display:'flex', flexDirection:'column', gap:5 }}>
        {[['bi bi-zoom-in', () => setScale(s => Math.min(3, s+.15))], ['bi bi-zoom-out', () => setScale(s => Math.max(.5, s-.15))]].map(([ic, fn], i) => (
          <button key={i} onClick={fn} style={{
            width:34, height:34, borderRadius:8, border:'none',
            background:'rgba(12,18,32,0.82)', backdropFilter:'blur(8px)',
            color:'#f1f5f9', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:17, boxShadow:'0 2px 8px rgba(0,0,0,0.4)',
          }}><i className={ic} /></button>
        ))}
      </div>
    </div>
  );
};

/* ─── Month Page ─────────────────────────────────────────── */
const MonthPage = ({ year, month, monthName, monthIdx, imgSrc, msg, header, dateCSV, detailCSV }) => {
  const days  = getMonthDays(year, month);
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));

  const mn = MONTH_NUMS[month] || String(month+1).padStart(2,'0');

  return (
    <div style={{
      background: C.darkCard,
      borderRadius: 16,
      marginBottom: 12,
      overflow: 'hidden',
      boxShadow: '0 8px 40px rgba(0,0,0,0.45)',
      pageBreakAfter: 'always',
      breakAfter: 'page',
      display: 'flex',
      flexDirection: 'column',
      minHeight: '15in',
      border: `1px solid ${C.border}`,
    }}>
      {/* Top bar */}
      <div style={{
        height: 64,
        background: C.dark,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        borderBottom: `1px solid ${C.border}`,
        flexShrink: 0,
      }}>
        <span style={{ fontFamily:'"Syne",sans-serif', fontSize:28, color:C.accent, fontWeight:800 }}>{header || 'CalendarPro'}</span>
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          <span style={{ fontFamily:'Outfit,sans-serif', fontSize:13, color:C.textSub, letterSpacing:'0.15em', textTransform:'uppercase' }}>Year</span>
          <span style={{ fontFamily:'"Archivo Black",sans-serif', fontSize:24, color:C.text }}>{year}</span>
        </div>
      </div>

      {/* Main area: image + calendar side-by-side */}
      <div style={{ display:'flex', flex:1, minHeight:0 }}>
        {/* Left: Image */}
        {imgSrc
          ? <ZoomImg src={imgSrc} />
          : <div style={{ flex:'0 0 52%', background:'#1e293b', display:'flex', alignItems:'center', justifyContent:'center', color:'#334155', fontSize:48 }}>
              <i className="bi bi-image" />
            </div>
        }

        {/* Right: Calendar */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', padding:'28px 28px 20px', overflow:'hidden' }}>
          {/* Month name + number */}
          <div style={{ marginBottom:20 }}>
            <div style={{
              fontFamily:'"Archivo Black",sans-serif',
              fontSize:52,
              color: C.text,
              lineHeight:1,
              letterSpacing:'-0.02em',
            }}>{monthName}</div>
            <div style={{
              display:'flex', alignItems:'center', gap:12, marginTop:6,
            }}>
              <div style={{ height:3, flex:1, background:`linear-gradient(90deg,${C.accent},${C.accentAlt},transparent)`, borderRadius:2 }} />
              <span style={{ fontFamily:'"Archivo Black",sans-serif', fontSize:36, color:`${C.accent}55`, letterSpacing:'-0.02em' }}>{mn}</span>
            </div>
            {msg && (
              <p style={{
                fontFamily:'Outfit,sans-serif', fontSize:13,
                color:C.textSub, margin:'10px 0 0',
                fontStyle:'italic', lineHeight:1.5,
              }}>{msg}</p>
            )}
          </div>

          {/* Day headers */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', marginBottom:4 }}>
            {DAYS.map((d, i) => (
              <div key={d} style={{
                textAlign:'center', fontSize:11, fontWeight:700,
                fontFamily:'Outfit,sans-serif',
                color: i===5?C.sat:i===6?C.sun:C.textSub,
                padding:'4px 0',
                letterSpacing:'0.06em',
              }}>{d}</div>
            ))}
          </div>

          {/* Calendar rows */}
          <div style={{ flex:1, display:'flex', flexDirection:'column', gap:2 }}>
            {weeks.map((wk, wi) => (
              <div key={wi} style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', flex:1 }}>
                {wk.map((cell, ci) => {
                  const ev  = cell.isCurrentMonth && isEventDate(cell.date, dateCSV);
                  const lbl = ev ? getEventLabel(cell.date, dateCSV, detailCSV) : '';
                  return (
                    <div key={ci} style={{
                      display:'flex', flexDirection:'column',
                      alignItems:'center', justifyContent:'flex-start',
                      paddingTop:6,
                      borderRadius:8,
                      background: ev ? `${C.accent}15` : 'transparent',
                      border: ev ? `1px solid ${C.accent}33` : '1px solid transparent',
                      transition:'background .15s',
                    }}>
                      <span style={{
                        fontFamily:'"Arquivo Black",Outfit,sans-serif',
                        fontSize: ev ? 22 : 20,
                        fontWeight: ev ? 700 : 400,
                        color: !cell.isCurrentMonth ? '#1e293b'
                              : ev               ? C.accent
                              : ci===6           ? C.sun
                              : ci===5           ? C.sat
                              : C.text,
                        lineHeight:1,
                      }}>
                        {cell.isCurrentMonth ? cell.day : ''}
                      </span>
                      {ev && (
                        <span style={{
                          fontSize:9, color:C.accent,
                          fontFamily:'Outfit,sans-serif',
                          marginTop:2, textAlign:'center',
                          lineHeight:1.2,
                          maxWidth:'100%',
                          overflow:'hidden',
                          textOverflow:'ellipsis',
                          whiteSpace:'nowrap',
                          padding:'0 2px',
                        }}>{lbl}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Main Template ───────────────────────────────────────── */
const Template2 = () => {
  const { id } = useParams();
  const [cal, setCal]         = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    getCalendarById(id)
      .then(r => setCal(r.data))
      .catch(() => setError('Failed to load calendar.'))
      .finally(() => setLoading(false));

    const h = () => setShowTop(window.scrollY > 300);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, [id]);

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh', flexDirection:'column', gap:16, background:'#0c1220' }}>
      <div style={{ width:44, height:44, border:`3px solid #f59e0b44`, borderTopColor:'#f59e0b', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
      <span style={{ color:'#94a3b8', fontFamily:'Outfit,sans-serif', fontSize:14 }}>Loading your calendar…</span>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (error) return (
    <div style={{ margin:32, padding:20, borderRadius:12, background:'#1e1e1e', border:'1px solid #ef4444', color:'#f87171', fontFamily:'Outfit,sans-serif' }}>
      <strong>Error:</strong> {error}
    </div>
  );

  const imgs   = cal.uc_img_csv ? cal.uc_img_csv.split(',').map(s=>s.trim()).filter(Boolean) : [];
  const months = generateCalendarData(cal.uc_start_date, cal.uc_end_date);

  return (
    <div style={{ background:'#070d18', minHeight:'100vh', padding:24 }}>
      <style>{`
        @media print {
          .no-print { display:none !important; }
          body,html { margin:0; padding:0; background:#000; }
        }
      `}</style>

      <div className="no-print" style={{ textAlign:'center', marginBottom:24 }}>
        <button
          onClick={() => window.print()}
          style={{
            background: C.accent, color:'#0c1220', border:'none',
            padding:'11px 28px', borderRadius:10,
            fontFamily:'Outfit,sans-serif', fontSize:14, fontWeight:700,
            cursor:'pointer', display:'inline-flex', alignItems:'center', gap:8,
            boxShadow:`0 4px 20px ${C.accent}55`,
          }}
        >
          <i className="bi bi-printer" /> Print Calendar
        </button>
      </div>

      {months.map(({ year, month, monthName }, idx) => (
        <MonthPage
          key={`${year}-${month}`}
          year={year} month={month} monthName={monthName} monthIdx={idx}
          imgSrc={imgs[idx] ? getImageUrl(imgs[idx]) : null}
          msg={cal.uc_msg}
          header={cal.uc_page_header}
          dateCSV={cal.uc_date_event_csv}
          detailCSV={cal.uc_event_details_csv}
        />
      ))}

      {showTop && (
        <button className="no-print"
          onClick={() => window.scrollTo({ top:0, behavior:'smooth' })}
          style={{
            position:'fixed', bottom:24, right:24,
            width:44, height:44, borderRadius:'50%',
            background: C.accent, color:'#0c1220',
            border:'none', cursor:'pointer', fontSize:18,
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:`0 4px 16px ${C.accent}66`, zIndex:99,
          }}
        >
          <i className="bi bi-chevron-up" />
        </button>
      )}
    </div>
  );
};

export default Template2;
