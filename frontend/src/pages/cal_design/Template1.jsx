import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getCalendarById }    from '../../services/calendar.service';
import { getImageUrl }         from '../../services/upload.service';
import { getMonthDays, isEventDate, getEventLabel, generateCalendarData } from '../../utils/calendarHelper';
import PrintControl            from '../../components/PrintControl';

/* ══ TEMPLATE 1 — BOTANICA ANNUAL ══════════════════════════
   Theme  : Luxury Forest Botanical
   Layout : 12-month grid on one page
   Print  : Best on A3 Landscape
   Palette: Deep green · Warm gold · Cream
═══════════════════════════════════════════════════════════ */

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const C = {
  green:'#1a3c2e', greenMid:'#2d6a4f', greenLight:'#52b788',
  cream:'#fdf8f0', creamDk:'#f0e9d6', gold:'#c9a227', goldLt:'#e8c96b',
  text:'#1c1c1c', muted:'#6b7280', sat:'#1d4ed8', sun:'#dc2626',
};

const MonthGrid = ({ year, month, monthName, dateCSV, detailCSV }) => {
  const days = getMonthDays(year, month);
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i+7));
  return (
    <div style={{ background:'rgba(255,255,255,0.93)', borderRadius:10, overflow:'hidden', boxShadow:'0 2px 14px rgba(27,67,50,0.12)', border:`1px solid ${C.greenLight}33`, breakInside:'avoid' }}>
      <div style={{ background:`linear-gradient(135deg,${C.green},${C.greenMid})`, color:'#fff', textAlign:'center', padding:'7px 4px 5px', fontFamily:'"Platypi",serif', fontSize:11, fontWeight:700, letterSpacing:'0.07em', textTransform:'uppercase' }}>
        {monthName} <span style={{ fontSize:8, opacity:0.6, fontFamily:'Outfit,sans-serif', fontWeight:400 }}>{year}</span>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', background:C.creamDk }}>
        {DAYS.map((d,i) => <div key={d} style={{ textAlign:'center', fontSize:7.5, fontWeight:700, padding:'2.5px 0', color:i===5?C.sat:i===6?C.sun:'#8b9eb0', fontFamily:'Outfit,sans-serif' }}>{d}</div>)}
      </div>
      <table style={{ width:'100%', borderCollapse:'collapse' }}>
        <tbody>
          {weeks.map((wk,wi) => (
            <tr key={wi}>
              {wk.map((cell,ci) => {
                const ev  = cell.isCurrentMonth && isEventDate(cell.date, dateCSV);
                const lbl = ev ? getEventLabel(cell.date, dateCSV, detailCSV) : '';
                return (
                  <td key={ci} style={{ textAlign:'center', padding:'1.5px 0', height:19, fontSize:9.5, fontFamily:'Outfit,sans-serif', fontWeight:ev?700:400, color:!cell.isCurrentMonth?'#e5e7eb':ev?C.gold:ci===6?C.sun:ci===5?C.sat:C.text, background:ev?`${C.gold}15`:'transparent', position:'relative' }}>
                    {cell.isCurrentMonth ? cell.day : ''}
                    {ev && <span style={{ position:'absolute', top:1, right:2, width:4, height:4, borderRadius:'50%', background:C.gold }} title={lbl} />}
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

  useEffect(() => { getCalendarById(id).then(r=>setCal(r.data)).catch(()=>setError('Failed to load.')).finally(()=>setLoading(false)); }, [id]);

  if (loading) return <div style={{ display:'flex',alignItems:'center',justifyContent:'center',minHeight:'60vh',flexDirection:'column',gap:16 }}><div style={{ width:44,height:44,border:`3px solid ${C.greenLight}`,borderTopColor:C.green,borderRadius:'50%',animation:'spin .8s linear infinite' }}/><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>;
  if (error)   return <div style={{ margin:32,padding:20,borderRadius:12,background:'#fef2f2',border:'1px solid #fecaca',color:'#dc2626',fontFamily:'Outfit,sans-serif' }}>{error}</div>;

  const imgs    = cal.uc_img_csv?.split(',').map(s=>s.trim()).filter(Boolean) || [];
  const months  = generateCalendarData(cal.uc_start_date, cal.uc_end_date);
  const dates   = cal.uc_date_event_csv?.split(',').map(s=>s.trim()).filter(Boolean) || [];
  const details = cal.uc_event_details_csv?.split(',').map(s=>s.trim()).filter(Boolean) || [];
  const year    = cal.uc_start_date ? new Date(cal.uc_start_date).getFullYear() : '';

  return (
    <div style={{ background:'#dde8e3', minHeight:'100vh', padding:24 }}>
      <style>{`.no-print{} @media print{.no-print{display:none!important} body{margin:0} #t1{border-radius:0!important;box-shadow:none!important;margin:0!important;width:100%!important}}`}</style>
      <PrintControl defaultSize="A3 landscape" accentColor={C.greenMid} dark={false} />

      <div id="t1" style={{ maxWidth:'42cm', margin:'0 auto', background:C.cream, borderRadius:16, boxShadow:'0 24px 80px rgba(27,67,50,0.22)', overflow:'hidden', display:'flex', flexDirection:'column', border:`3px solid ${C.green}` }}>
        <div style={{ height:7, background:`linear-gradient(90deg,${C.green},${C.greenLight},${C.gold},${C.greenLight},${C.green})` }}/>

        {/* Header */}
        <div style={{ background:`linear-gradient(135deg,${C.green},${C.greenMid} 55%,${C.greenLight}88)`, padding:'22px 36px 18px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ fontFamily:'"Platypi",serif', fontSize:74, fontWeight:700, color:'#fff', lineHeight:1, textShadow:'0 4px 20px rgba(0,0,0,0.25)' }}>{year}</div>
            <div style={{ fontFamily:'Outfit,sans-serif', fontSize:11, color:`${C.greenLight}cc`, letterSpacing:'0.2em', textTransform:'uppercase', marginTop:4 }}>Annual Wall Calendar</div>
          </div>
          <div style={{ textAlign:'right', maxWidth:380 }}>
            <div style={{ fontFamily:'"Archivo Black",sans-serif', fontSize:22, color:'#fff', lineHeight:1.35 }}>{cal.uc_page_header}</div>
            <div style={{ height:2, background:C.gold, marginTop:12, borderRadius:2 }}/>
          </div>
        </div>

        {/* Image strip */}
        <div style={{ display:'flex', height:240, overflow:'hidden', position:'relative' }}>
          {[0,1,2].map(i => imgs[i]
            ? <div key={i} style={{ flex:1, overflow:'hidden', position:'relative' }}><img src={getImageUrl(imgs[i])} alt="" style={{ width:'100%',height:'100%',objectFit:'cover' }}/>{i<2&&<div style={{ position:'absolute',right:0,top:0,width:3,height:'100%',background:C.cream }}/>}</div>
            : <div key={i} style={{ flex:1, background:`linear-gradient(135deg,${C.greenMid}18,${C.creamDk})`, display:'flex',alignItems:'center',justifyContent:'center',color:'#bbb',fontSize:30 }}><i className="bi bi-image"/></div>
          )}
          {cal.uc_msg && <div style={{ position:'absolute',bottom:0,left:0,right:0,background:'linear-gradient(transparent,rgba(27,67,50,0.88))',padding:'28px 32px 12px',color:'#fff',fontFamily:'"Archivo Black",sans-serif',fontSize:16,textAlign:'center' }}>{cal.uc_msg}</div>}
        </div>

        <div style={{ height:4, background:`linear-gradient(90deg,transparent,${C.gold},${C.goldLt},${C.gold},transparent)` }}/>

        {/* 12-month grid */}
        <div style={{ flex:1, padding:'18px 24px', display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 }}>
          {months.slice(0,12).map(({year:y,month:m,monthName}) => (
            <MonthGrid key={`${y}-${m}`} year={y} month={m} monthName={monthName} dateCSV={cal.uc_date_event_csv} detailCSV={cal.uc_event_details_csv}/>
          ))}
        </div>

        {/* Footer */}
        <div style={{ padding:'10px 24px 16px', borderTop:`1px solid ${C.creamDk}` }}>
          {dates.length>0 && (
            <div style={{ display:'flex',flexWrap:'wrap',gap:'4px 20px',marginBottom:8 }}>
              {dates.map((d,i) => <span key={i} style={{ display:'inline-flex',alignItems:'center',gap:5,fontFamily:'Outfit,sans-serif',fontSize:10,color:'#6b7280' }}><span style={{ width:5,height:5,borderRadius:'50%',background:C.gold,flexShrink:0 }}/><strong style={{ color:C.green }}>{d.replace(/\//g,'-')}</strong>{details[i]?` — ${details[i]}`:''}</span>)}
            </div>
          )}
          <div style={{ textAlign:'center',fontFamily:'"Platypi",serif',fontSize:14,color:C.green,fontWeight:700,letterSpacing:'0.04em' }}>{cal.uc_page_footer}</div>
        </div>
        <div style={{ height:7, background:`linear-gradient(90deg,${C.green},${C.greenLight},${C.gold},${C.greenLight},${C.green})` }}/>
      </div>
    </div>
  );
};
export default Template1;
