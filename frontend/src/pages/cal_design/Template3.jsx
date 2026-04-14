import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getCalendarById } from '../../services/calendar.service';
import { getImageUrl } from '../../services/upload.service';
import { getMonthDays, isEventDate, getEventLabel, generateCalendarData, splitIntoChunks } from '../../utils/calendarHelper';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const C = {
  primary:   '#2563eb',
  primaryDk: '#1d4ed8',
  indigo:    '#4f46e5',
  sky:       '#0ea5e9',
  amber:     '#f59e0b',
  bg:        '#f8faff',
  surface:   '#ffffff',
  border:    '#e2e8f0',
  text:      '#0f172a',
  textSub:   '#64748b',
  textMuted: '#94a3b8',
  sat:       '#2563eb',
  sun:       '#dc2626',
};

/* ─── Zoomable Image ─────────────────────────────────────── */
const ZoomImg3 = ({ src }) => {
  const [scale, setScale] = useState(1);
  const [pos, setPos]     = useState({ x:50, y:50 });
  const drag = useRef(false);
  const last = useRef({ x:0, y:0 });
  const ref  = useRef(null);

  const onDown = e => { drag.current=true; last.current={x:e.clientX,y:e.clientY}; e.preventDefault(); };
  const onUp   = ()  => { drag.current=false; };
  const onMove = e  => {
    if (!drag.current || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setPos(p => ({
      x: Math.min(100, Math.max(0, p.x + ((e.clientX-last.current.x)/r.width)*100)),
      y: Math.min(100, Math.max(0, p.y + ((e.clientY-last.current.y)/r.height)*100)),
    }));
    last.current={x:e.clientX,y:e.clientY};
  };

  return (
    <div style={{ position:'relative', height:'5.5in' }}>
      <div ref={ref}
        onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
        style={{ height:'100%', overflow:'hidden', cursor:'move', userSelect:'none', background:'#e2e8f0' }}>
        <img src={src} draggable={false}
          onError={e => { e.target.style.opacity='.12'; }}
          style={{
            width:'100%', height:'100%', objectFit:'cover',
            objectPosition:`${pos.x}% ${pos.y}%`,
            transform:`scale(${scale})`,
            transformOrigin:`${pos.x}% ${pos.y}%`,
            transition:'transform .15s',
            display:'block',
          }}
        />
        {/* Blue gradient overlay at bottom */}
        <div style={{ position:'absolute', bottom:0, left:0, right:0, height:90, background:'linear-gradient(transparent, rgba(37,99,235,0.6))' }} />
      </div>
      <div className="no-print" style={{ position:'absolute', top:10, right:10, display:'flex', gap:5 }}>
        {[['+', () => setScale(s=>Math.min(3,s+.15))],['-', () => setScale(s=>Math.max(.5,s-.15))]].map(([lbl,fn],i)=>(
          <button key={i} onClick={fn} style={{
            width:30, height:30, borderRadius:7, border:'none',
            background:'rgba(255,255,255,0.92)', backdropFilter:'blur(6px)',
            cursor:'pointer', fontWeight:700, fontSize:16,
            color:C.primary, boxShadow:'0 2px 8px rgba(0,0,0,0.15)',
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>{lbl}</button>
        ))}
      </div>
    </div>
  );
};

/* ─── Small Month Grid ───────────────────────────────────── */
const SmallMonth = ({ year, month, monthName, dateCSV, detailCSV }) => {
  const days  = getMonthDays(year, month);
  const weeks = [];
  for (let i=0; i<days.length; i+=7) weeks.push(days.slice(i,i+7));

  return (
    <div style={{
      background: C.surface,
      borderRadius: 12,
      overflow: 'hidden',
      boxShadow: '0 2px 16px rgba(37,99,235,0.08)',
      border: `1px solid ${C.border}`,
    }}>
      {/* Month header */}
      <div style={{
        background: `linear-gradient(135deg, ${C.primary} 0%, ${C.indigo} 100%)`,
        color: '#fff',
        textAlign: 'center',
        padding: '10px 8px 8px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative circle */}
        <div style={{ position:'absolute', right:-20, top:-20, width:70, height:70, borderRadius:'50%', background:'rgba(255,255,255,0.07)' }} />
        <div style={{
          fontFamily:'"Syne",sans-serif',
          fontSize:18, fontWeight:700,
          letterSpacing:'0.04em',
          position:'relative',
        }}>{monthName}</div>
        <div style={{ fontSize:11, opacity:0.65, fontFamily:'Outfit,sans-serif', position:'relative' }}>{year}</div>
      </div>

      {/* Day labels */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', background:'#f1f5f9', borderBottom:`1px solid ${C.border}` }}>
        {DAYS.map((d, i) => (
          <div key={d} style={{
            textAlign:'center', fontSize:9, fontWeight:700,
            fontFamily:'Outfit,sans-serif',
            color: i===5?C.sat:i===6?C.sun:C.textMuted,
            padding:'4px 0', letterSpacing:'0.04em',
          }}>{d}</div>
        ))}
      </div>

      {/* Dates */}
      <table style={{ width:'100%', borderCollapse:'collapse' }}>
        <tbody>
          {weeks.map((wk, wi) => (
            <tr key={wi}>
              {wk.map((cell, ci) => {
                const ev  = cell.isCurrentMonth && isEventDate(cell.date, dateCSV);
                const lbl = ev ? getEventLabel(cell.date, dateCSV, detailCSV) : '';
                return (
                  <td key={ci} style={{
                    textAlign:'center',
                    padding:'3px 0',
                    height:28,
                    fontSize:13,
                    fontFamily:'Outfit,sans-serif',
                    fontWeight: ev ? 700 : 400,
                    color: !cell.isCurrentMonth ? '#e2e8f0'
                          : ev               ? C.primary
                          : ci===6           ? C.sun
                          : ci===5           ? C.sat
                          : C.text,
                    background: ev ? `${C.primary}10` : 'transparent',
                    position:'relative',
                    borderRadius: ev ? 4 : 0,
                  }}>
                    {cell.isCurrentMonth ? cell.day : ''}
                    {ev && (
                      <>
                        <span style={{ display:'block', fontSize:8, color:C.amber, marginTop:0 }}>★</span>
                        {lbl && <span style={{ position:'absolute', bottom:'100%', left:'50%', transform:'translateX(-50%)', background:C.primary, color:'#fff', fontSize:8, padding:'2px 4px', borderRadius:4, whiteSpace:'nowrap', zIndex:10, pointerEvents:'none', display:'none' }}>{lbl}</span>}
                      </>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/* ─── Page Block (image + 4-month grid) ─────────────────── */
const PageBlock = ({ chunk, imgSrc, msg, header, dateCSV, detailCSV, pageNum, totalPages }) => {
  const year = chunk[0]?.year || '';

  return (
    <div style={{
      width: '100%',
      minHeight: '15in',
      background: C.surface,
      borderRadius: 16,
      marginBottom: 12,
      overflow: 'hidden',
      boxShadow: '0 8px 40px rgba(37,99,235,0.12)',
      border: `1px solid ${C.border}`,
      display: 'flex',
      flexDirection: 'column',
      pageBreakAfter: 'always',
      breakAfter: 'page',
    }}>
      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, ${C.primary} 0%, ${C.indigo} 100%)`,
        padding: '18px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:40, height:40, borderRadius:10, background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, color:'#fff' }}>
            <i className="bi bi-calendar3" />
          </div>
          <div>
            <div style={{ fontFamily:'"Syne",sans-serif', fontSize:18, fontWeight:800, color:'#fff', letterSpacing:'0.02em' }}>{header || 'CalendarPro'}</div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.65)', fontFamily:'Outfit,sans-serif', letterSpacing:'0.1em' }}>QUARTERLY PLANNER</div>
          </div>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontFamily:'"Archivo Black",sans-serif', fontSize:40, color:'rgba(255,255,255,0.15)', lineHeight:1 }}>{year}</div>
          <div style={{ fontFamily:'Outfit,sans-serif', fontSize:12, color:'rgba(255,255,255,0.6)', marginTop:-4 }}>Page {pageNum} of {totalPages}</div>
        </div>
      </div>

      {/* Image */}
      {imgSrc
        ? <ZoomImg3 src={imgSrc} />
        : <div style={{ height:'5.5in', background:'linear-gradient(135deg,#eff6ff,#e0e7ff)', display:'flex', alignItems:'center', justifyContent:'center', color:'#bfdbfe', fontSize:56 }}>
            <i className="bi bi-image" />
          </div>
      }

      {/* Message strip */}
      {msg && (
        <div style={{
          background:`linear-gradient(135deg,${C.primary}08,${C.indigo}08)`,
          borderTop:`1px solid ${C.border}`,
          borderBottom:`1px solid ${C.border}`,
          padding:'10px 28px',
          textAlign:'center',
          fontFamily:'"Syne",sans-serif',
          fontSize:14,
          color:C.primary,
          fontWeight:600,
          letterSpacing:'0.03em',
        }}>
          {msg}
        </div>
      )}

      {/* 2×2 Month grid */}
      <div style={{
        flex:1,
        display:'grid',
        gridTemplateColumns:'1fr 1fr',
        gap:16,
        padding:'20px 24px 20px',
        background:`linear-gradient(135deg,${C.bg} 0%,#eef2ff 100%)`,
      }}>
        {chunk.map(({ year:y, month:m, monthName }) => (
          <SmallMonth
            key={`${y}-${m}`}
            year={y} month={m} monthName={monthName}
            dateCSV={dateCSV}        // ← BUG FIX: was empty string ""
            detailCSV={detailCSV}    // ← BUG FIX: was empty string ""
          />
        ))}
        {/* Fill empty slots if chunk < 4 */}
        {chunk.length < 4 && Array.from({ length: 4-chunk.length }).map((_, i) => (
          <div key={`empty-${i}`} style={{
            borderRadius:12, border:`1px dashed ${C.border}`,
            display:'flex', alignItems:'center', justifyContent:'center',
            color:C.textMuted, fontSize:13, fontFamily:'Outfit,sans-serif',
          }}>—</div>
        ))}
      </div>
    </div>
  );
};

/* ─── Main Template ───────────────────────────────────────── */
const Template3 = () => {
  const { id } = useParams();
  const [cal, setCal]         = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    getCalendarById(id)
      .then(r => setCal(r.data))
      .catch(() => setError('Failed to load calendar.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh', flexDirection:'column', gap:16 }}>
      <div style={{ width:44, height:44, border:`3px solid #bfdbfe`, borderTopColor:C.primary, borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
      <span style={{ color:C.textSub, fontFamily:'Outfit,sans-serif', fontSize:14 }}>Loading your calendar…</span>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (error) return (
    <div style={{ margin:32, padding:20, borderRadius:12, background:'#fef2f2', border:'1px solid #fecaca', color:'#dc2626', fontFamily:'Outfit,sans-serif' }}>
      <strong>Error:</strong> {error}
    </div>
  );

  const imgs   = cal.uc_img_csv ? cal.uc_img_csv.split(',').map(s=>s.trim()).filter(Boolean) : [];
  const months = generateCalendarData(cal.uc_start_date, cal.uc_end_date);
  const pages  = splitIntoChunks(months, 4);

  return (
    <div style={{ background:C.bg, minHeight:'100vh', padding:24 }}>
      <style>{`
        @media print {
          .no-print { display:none !important; }
          body,html { margin:0; padding:0; }
        }
      `}</style>

      <div className="no-print" style={{ textAlign:'center', marginBottom:24 }}>
        <button
          onClick={() => window.print()}
          style={{
            background: C.primary, color:'#fff', border:'none',
            padding:'11px 28px', borderRadius:10,
            fontFamily:'Outfit,sans-serif', fontSize:14, fontWeight:600,
            cursor:'pointer', display:'inline-flex', alignItems:'center', gap:8,
            boxShadow:`0 4px 20px ${C.primary}44`,
          }}
        >
          <i className="bi bi-printer" /> Print Calendar
        </button>
      </div>

      {pages.map((chunk, i) => (
        <PageBlock
          key={i}
          chunk={chunk}
          imgSrc={imgs[i] ? getImageUrl(imgs[i]) : null}
          msg={cal.uc_msg}
          header={cal.uc_page_header}
          dateCSV={cal.uc_date_event_csv}
          detailCSV={cal.uc_event_details_csv}
          pageNum={i+1}
          totalPages={pages.length}
        />
      ))}
    </div>
  );
};

export default Template3;
