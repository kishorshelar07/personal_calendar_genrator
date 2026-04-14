import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getCalendarById } from '../../services/calendar.service';
import { getImageUrl } from '../../services/upload.service';
import { getMonthDays, isEventDate, getEventLabel, generateCalendarData } from '../../utils/calendarHelper';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const C = {
  green:     '#1b4332',
  greenMid:  '#2d6a4f',
  greenLight:'#52b788',
  cream:     '#fdf8f0',
  creamDark: '#f0e9d6',
  gold:      '#c9a227',
  goldLight: '#e8c96b',
  text:      '#1c1c1c',
  textMuted: '#6b7280',
  sat:       '#1d4ed8',
  sun:       '#dc2626',
};

const MonthGrid = ({ year, month, monthName, dateCSV, detailCSV }) => {
  const days  = getMonthDays(year, month);
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));

  return (
    <div style={{
      background: 'rgba(255,255,255,0.92)',
      borderRadius: 10,
      overflow: 'hidden',
      boxShadow: '0 2px 12px rgba(27,67,50,0.10)',
      border: `1px solid #52b78833`,
      breakInside: 'avoid',
    }}>
      <div style={{
        background: `linear-gradient(135deg, ${C.green} 0%, ${C.greenMid} 100%)`,
        color: '#fff',
        textAlign: 'center',
        padding: '6px 4px 5px',
        fontSize: 11,
        fontFamily: '"Platypi", serif',
        fontWeight: 700,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
      }}>
        {monthName}
        <span style={{ fontSize: 8, opacity: 0.65, marginLeft: 5, fontFamily: 'Outfit,sans-serif', fontWeight: 400 }}>{year}</span>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', background: C.creamDark }}>
        {DAYS.map((d, i) => (
          <div key={d} style={{
            textAlign:'center', fontSize:8, fontWeight:700,
            padding:'3px 0', color: i===5?C.sat:i===6?C.sun:'#6b7280',
            fontFamily:'Outfit,sans-serif',
          }}>{d}</div>
        ))}
      </div>

      <table style={{ width:'100%', borderCollapse:'collapse' }}>
        <tbody>
          {weeks.map((wk, wi) => (
            <tr key={wi}>
              {wk.map((cell, ci) => {
                const ev  = cell.isCurrentMonth && isEventDate(cell.date, dateCSV);
                const lbl = ev ? getEventLabel(cell.date, dateCSV, detailCSV) : '';
                return (
                  <td key={ci} style={{
                    textAlign: 'center',
                    padding: '2px 0',
                    height: 21,
                    fontSize: 10,
                    fontFamily: 'Outfit,sans-serif',
                    fontWeight: ev ? 700 : 400,
                    color: !cell.isCurrentMonth ? '#e5e7eb'
                          : ev               ? C.gold
                          : ci===6           ? C.sun
                          : ci===5           ? C.sat
                          : C.text,
                    background: ev ? `${C.gold}1a` : 'transparent',
                    position: 'relative',
                  }}>
                    {cell.isCurrentMonth ? cell.day : ''}
                    {ev && (
                      <span style={{
                        position:'absolute', top:1, right:2,
                        width:5, height:5, borderRadius:'50%',
                        background: C.gold,
                      }} title={lbl} />
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

const Template1 = () => {
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
      <div style={{ width:44, height:44, border:`3px solid #52b788`, borderTopColor:'#1b4332', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
      <span style={{ color:'#6b7280', fontFamily:'Outfit,sans-serif', fontSize:14 }}>Loading your calendar…</span>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (error) return (
    <div style={{ margin:32, padding:20, borderRadius:12, background:'#fef2f2', border:'1px solid #fecaca', color:'#dc2626', fontFamily:'Outfit,sans-serif' }}>
      <strong>Error:</strong> {error}
    </div>
  );

  const imgs    = cal.uc_img_csv ? cal.uc_img_csv.split(',').map(s => s.trim()).filter(Boolean) : [];
  const months  = generateCalendarData(cal.uc_start_date, cal.uc_end_date);
  const dates   = cal.uc_date_event_csv?.split(',').map(s => s.trim()).filter(Boolean) || [];
  const details = cal.uc_event_details_csv?.split(',').map(s => s.trim()).filter(Boolean) || [];
  const year    = cal.uc_start_date ? new Date(cal.uc_start_date).getFullYear() : '';

  return (
    <div style={{ background:'#dde8e3', minHeight:'100vh', padding:24 }}>
      <style>{`
        @media print {
          .no-print { display:none !important; }
          body, html { margin:0; padding:0; }
          #t1-page { box-shadow:none !important; border-radius:0 !important; width:100% !important; margin:0 !important; }
        }
      `}</style>

      <div className="no-print" style={{ textAlign:'center', marginBottom:24 }}>
        <button
          onClick={() => window.print()}
          style={{
            background: C.green, color:'#fff', border:'none',
            padding:'11px 28px', borderRadius:10,
            fontFamily:'Outfit,sans-serif', fontSize:14, fontWeight:600,
            cursor:'pointer', display:'inline-flex', alignItems:'center', gap:8,
            boxShadow:`0 4px 20px ${C.green}55`,
          }}
        >
          <i className="bi bi-printer" /> Print Calendar
        </button>
      </div>

      <div id="t1-page" style={{
        width: '12in', minHeight: '17in',
        margin: '0 auto',
        background: C.cream,
        borderRadius: 16,
        boxShadow: '0 24px 80px rgba(27,67,50,0.22)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        border: `3px solid ${C.green}`,
      }}>

        {/* Top rainbow stripe */}
        <div style={{ height:7, background:`linear-gradient(90deg, ${C.green}, ${C.greenLight}, ${C.gold}, ${C.greenLight}, ${C.green})` }} />

        {/* Header */}
        <div style={{
          background: `linear-gradient(135deg, ${C.green} 0%, ${C.greenMid} 55%, ${C.greenLight}88 100%)`,
          padding: '22px 36px 18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <div style={{ fontFamily:'"Platypi",serif', fontSize:76, fontWeight:700, color:'#fff', lineHeight:1, textShadow:'0 4px 20px rgba(0,0,0,0.25)' }}>{year}</div>
            <div style={{ fontFamily:'Outfit,sans-serif', fontSize:11, color:`${C.greenLight}cc`, letterSpacing:'0.2em', textTransform:'uppercase', marginTop:4 }}>Annual Wall Calendar</div>
          </div>
          <div style={{ textAlign:'right', maxWidth:380 }}>
            <div style={{ fontFamily:'"Archivo Black",sans-serif', fontSize:22, color:'#fff', lineHeight:1.35 }}>{cal.uc_page_header}</div>
            <div style={{ height:2, background:C.gold, marginTop:12, borderRadius:2 }} />
          </div>
        </div>

        {/* Images strip */}
        <div style={{ display:'flex', height:260, overflow:'hidden' }}>
          {[0,1,2].map(i => (
            imgs[i]
              ? <div key={i} style={{ flex:1, overflow:'hidden', position:'relative' }}>
                  <img src={getImageUrl(imgs[i])} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  {i < 2 && <div style={{ position:'absolute', right:0, top:0, width:3, height:'100%', background:C.cream }} />}
                </div>
              : <div key={i} style={{ flex:1, background:`linear-gradient(135deg,${C.greenMid}18,${C.creamDark})`, display:'flex', alignItems:'center', justifyContent:'center', color:'#aaa', fontSize:30 }}>
                  <i className="bi bi-image" />
                </div>
          ))}

          {cal.uc_msg && (
            <div style={{
              position:'absolute', left:'3px', right:'3px',
              bottom: 'calc(17in - 260px - 7px - 80px)',
              background:'linear-gradient(transparent,rgba(27,67,50,0.88))',
              padding:'30px 32px 12px',
              color:'#fff', fontFamily:'"Archivo Black",sans-serif',
              fontSize:16, textAlign:'center', letterSpacing:'0.03em',
              pointerEvents:'none',
            }}>
              {cal.uc_msg}
            </div>
          )}
        </div>

        {/* Gold separator */}
        <div style={{ height:4, background:`linear-gradient(90deg,transparent,${C.gold},${C.goldLight},${C.gold},transparent)` }} />

        {/* 12-month grid */}
        <div style={{
          flex:1, padding:'20px 26px',
          display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10,
        }}>
          {months.slice(0,12).map(({ year:y, month:m, monthName }) => (
            <MonthGrid
              key={`${y}-${m}`} year={y} month={m} monthName={monthName}
              dateCSV={cal.uc_date_event_csv}
              detailCSV={cal.uc_event_details_csv}
            />
          ))}
        </div>

        {/* Footer */}
        <div style={{ padding:'12px 28px 18px', borderTop:`1px solid ${C.creamDark}` }}>
          {dates.length > 0 && (
            <div style={{ display:'flex', flexWrap:'wrap', gap:'5px 22px', marginBottom:10 }}>
              {dates.map((d, i) => (
                <span key={i} style={{ display:'inline-flex', alignItems:'center', gap:5, fontFamily:'Outfit,sans-serif', fontSize:11, color:'#6b7280' }}>
                  <span style={{ width:6, height:6, borderRadius:'50%', background:C.gold, flexShrink:0 }} />
                  <strong style={{ color:C.green }}>{d.replace(/\//g,'-')}</strong>
                  {details[i] ? ` — ${details[i]}` : ''}
                </span>
              ))}
            </div>
          )}
          <div style={{ textAlign:'center', fontFamily:'"Platypi",serif', fontSize:15, color:C.green, fontWeight:700, letterSpacing:'0.04em' }}>
            {cal.uc_page_footer}
          </div>
        </div>

        {/* Bottom stripe */}
        <div style={{ height:7, background:`linear-gradient(90deg,${C.green},${C.greenLight},${C.gold},${C.greenLight},${C.green})` }} />
      </div>
    </div>
  );
};

export default Template1;
