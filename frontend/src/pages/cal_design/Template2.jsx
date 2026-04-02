import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getCalendarById } from '../../services/calendar.service';
import { getImageUrl } from '../../services/upload.service';
import { getMonthDays, isEventDate, getEventLabel, generateCalendarData } from '../../utils/calendarHelper';

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

const ZoomImg = ({ src }) => {
  const [scale, setScale] = useState(1);
  const [pos,   setPos]   = useState({ x:50, y:50 });
  const dragging = useRef(false);
  const last     = useRef({ x:0, y:0 });
  const ref      = useRef(null);

  const onDown  = e => { dragging.current=true; last.current={x:e.clientX,y:e.clientY}; e.preventDefault(); };
  const onUp    = () => { dragging.current=false; };
  const onMove  = e => {
    if (!dragging.current||!ref.current) return;
    const r=ref.current.getBoundingClientRect();
    const dx=((e.clientX-last.current.x)/r.width)*100;
    const dy=((e.clientY-last.current.y)/r.height)*100;
    setPos(p=>({x:Math.min(100,Math.max(0,p.x+dx)),y:Math.min(100,Math.max(0,p.y+dy))}));
    last.current={x:e.clientX,y:e.clientY};
  };

  return (
    <div style={{ position:'relative' }}>
      <div ref={ref} onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
        style={{ height:'8in', overflow:'hidden', cursor:'move', userSelect:'none', background:'#e5e7eb' }}>
        <img src={src} draggable={false} onError={e=>{e.target.style.opacity='.15';}}
          style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:`${pos.x}% ${pos.y}%`,
            transform:`scale(${scale})`, transformOrigin:`${pos.x}% ${pos.y}%`, transition:'transform .15s' }} />
      </div>
      <div className="hide-on-print" style={{ position:'absolute', top:8, right:8, display:'flex', flexDirection:'column', gap:4 }}>
        {[['bx bx-zoom-in',()=>setScale(s=>Math.min(3,s+.15))],['bx bx-zoom-out',()=>setScale(s=>Math.max(.5,s-.15))]].map(([ic,fn],i)=>(
          <button key={i} onClick={fn} style={{ width:32,height:32,borderRadius:6,border:'none',background:'rgba(255,255,255,.9)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,boxShadow:'0 1px 4px rgba(0,0,0,.2)' }}>
            <i className={ic}></i>
          </button>
        ))}
      </div>
    </div>
  );
};

const MonthPage = ({ year, month, monthName, imgSrc, msg, header, dateCSV, detailCSV }) => {
  const days = getMonthDays(year, month);
  const weeks = [];
  for (let i=0;i<days.length;i+=7) weeks.push(days.slice(i,i+7));

  return (
    <div style={{ border:'1px solid #ddd', borderRadius:12, background:'#fff', marginBottom:4, overflow:'hidden', pageBreakAfter:'always', breakAfter:'page' }}>
      {/* Year/Header bar */}
      <div style={{ height:60, background:'#4b5563', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 24px' }}>
        <span style={{ fontFamily:'"Platypi",serif', fontSize:36, color:'#fff', fontWeight:700 }}>{year}</span>
        <span style={{ fontFamily:'"Platypi",serif', fontSize:18, color:'#d1d5db' }}>{header}</span>
      </div>

      {/* Image */}
      {imgSrc ? <ZoomImg src={imgSrc} /> : (
        <div style={{ height:'8in', background:'#f3f4f6', display:'flex', alignItems:'center', justifyContent:'center', color:'#9ca3af', fontSize:16 }}>No Image</div>
      )}

      {/* Message */}
      <div style={{ textAlign:'center', fontSize:22, fontFamily:'"Moul",cursive', background:'#f3f4f6', padding:'8px 16px', textShadow:'2px 2px 4px skyblue' }}>{msg}</div>

      {/* Month name */}
      <div style={{ textAlign:'center', fontSize:42, fontFamily:'"Platypi",serif', background:'antiquewhite', padding:'4px 0' }}>{monthName}</div>

      {/* Calendar table */}
      <table style={{ width:'100%', borderCollapse:'collapse', height:500 }}>
        <thead>
          <tr>
            {DAYS.map((d,i)=>(
              <th key={d} style={{ fontSize:40, fontFamily:'"Racing Sans One",sans-serif', background:'cadetblue', textAlign:'center', padding:'4px 0',
                color:i===5?'#93c5fd':i===6?'#ef4444':'#fff', fontWeight:'normal' }}>{d}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((wk,wi)=>(
            <tr key={wi}>
              {wk.map((cell,ci)=>{
                const ev=cell.isCurrentMonth&&isEventDate(cell.date,dateCSV);
                const lbl=ev?getEventLabel(cell.date,dateCSV,detailCSV):'';
                return (
                  <td key={ci} style={{ textAlign:'center', fontSize:40, fontFamily:'"Jaro",sans-serif', verticalAlign:'top', paddingTop:4,
                    color:!cell.isCurrentMonth?'#e5e7eb':ci===6?'#ef4444':ci===5?'#93c5fd':'#111',
                    background:ev?'rgba(107,114,128,.25)':'transparent', borderBottom:'1px solid #f0f0f0' }}>
                    {cell.isCurrentMonth?cell.day:''}
                    {ev&&<><i className="fas fa-birthday-cake" style={{color:'#ef4444',fontSize:26,display:'block'}}/><small style={{fontSize:16,color:'#16a34a',fontFamily:'sans-serif'}}>{lbl}</small></>}
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

const Template2 = () => {
  const { id } = useParams();
  const [cal, setCal]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    getCalendarById(id).then(r=>setCal(r.data)).catch(()=>setError('Failed to load.')).finally(()=>setLoading(false));
    const h=()=>setShowTop(window.scrollY>300);
    window.addEventListener('scroll',h);
    return ()=>window.removeEventListener('scroll',h);
  },[id]);

  if (loading) return <div className="spinner"></div>;
  if (error)   return <div className="alert-error m-4">{error}</div>;

  const imgs   = cal.uc_img_csv?cal.uc_img_csv.split(',').map(s=>s.trim()).filter(Boolean):[];
  const months = generateCalendarData(cal.uc_start_date, cal.uc_end_date);

  return (
    <div style={{ background:'#f0f0f0', minHeight:'100vh', padding:20 }}>
      <div className="hide-on-print" style={{ textAlign:'center', marginBottom:16 }}>
        <button className="btn-primary-custom" onClick={()=>window.print()}>
          <i className="bi bi-printer me-2"></i>Print Calendar
        </button>
      </div>

      {months.map(({year,month,monthName},idx)=>(
        <MonthPage key={`${year}-${month}`} year={year} month={month} monthName={monthName}
          imgSrc={imgs[idx]?getImageUrl(imgs[idx]):null}
          msg={cal.uc_msg} header={cal.uc_page_header}
          dateCSV={cal.uc_date_event_csv} detailCSV={cal.uc_event_details_csv} />
      ))}

      {showTop&&(
        <button className="hide-on-print" onClick={()=>window.scrollTo({top:0,behavior:'smooth'})}
          style={{ position:'fixed',bottom:24,right:24,width:44,height:44,borderRadius:'50%',background:'#0f172a',color:'#fff',border:'none',cursor:'pointer',fontSize:18,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 2px 8px rgba(0,0,0,.3)',zIndex:99 }}>
          <i className="bi bi-chevron-up"></i>
        </button>
      )}
    </div>
  );
};

export default Template2;
