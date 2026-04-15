import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getCalendarById } from '../../services/calendar.service';
import { getImageUrl }      from '../../services/upload.service';
import { getMonthDays, isEventDate, getEventLabel, generateCalendarData } from '../../utils/calendarHelper';
import PrintControl         from '../../components/PrintControl';

/* ══ TEMPLATE 2 — CINEMA NOIR MONTHLY ══════════════════════
   Theme  : Dark Luxury Editorial (one month per page)
   Layout : Left: Image | Right: Calendar
   Print  : A4 Landscape
   Palette: Midnight black · Amber gold · Coral
═══════════════════════════════════════════════════════════ */

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const C = { dark:'#06101c', card:'#0f1c2e', amber:'#f59e0b', coral:'#fb7c5c', text:'#eef2ff', muted:'#7a8daa', sat:'#60a5fa', sun:'#f87171', border:'rgba(255,255,255,0.07)' };

const ZoomImg = ({ src }) => {
  const [scale,setScale]=useState(1); const [pos,setPos]=useState({x:50,y:50});
  const drag=useRef(false); const last=useRef({x:0,y:0}); const ref=useRef(null);
  const onDown=e=>{drag.current=true;last.current={x:e.clientX,y:e.clientY};e.preventDefault();};
  const onUp=()=>{drag.current=false;};
  const onMove=e=>{if(!drag.current||!ref.current)return;const r=ref.current.getBoundingClientRect();setPos(p=>({x:Math.min(100,Math.max(0,p.x+((e.clientX-last.current.x)/r.width)*100)),y:Math.min(100,Math.max(0,p.y+((e.clientY-last.current.y)/r.height)*100))}));last.current={x:e.clientX,y:e.clientY};};
  return (
    <div style={{ position:'relative', flex:'0 0 48%', overflow:'hidden' }}>
      <div ref={ref} onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp} style={{ height:'100%', minHeight:520, overflow:'hidden', cursor:'move', userSelect:'none', background:'#0f1c2e' }}>
        <img src={src} draggable={false} onError={e=>{e.target.style.opacity='.08';}} style={{ width:'100%',height:'100%',objectFit:'cover',objectPosition:`${pos.x}% ${pos.y}%`,transform:`scale(${scale})`,transformOrigin:`${pos.x}% ${pos.y}%`,transition:'transform .15s',display:'block' }}/>
        <div style={{ position:'absolute',inset:0,background:'linear-gradient(to right,transparent 70%,rgba(6,16,28,0.7))' }}/>
      </div>
      <div className="no-print" style={{ position:'absolute',top:12,right:12,display:'flex',flexDirection:'column',gap:5 }}>
        {[['bi bi-zoom-in',()=>setScale(s=>Math.min(3,s+.15))],['bi bi-zoom-out',()=>setScale(s=>Math.max(.5,s-.15))]].map(([ic,fn],i)=>(
          <button key={i} onClick={fn} style={{ width:32,height:32,borderRadius:8,border:'none',background:'rgba(6,16,28,0.85)',backdropFilter:'blur(8px)',color:C.amber,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16 }}><i className={ic}/></button>
        ))}
      </div>
    </div>
  );
};

const MonthPage = ({ year, month, monthName, imgSrc, msg, header, dateCSV, detailCSV }) => {
  const days=getMonthDays(year,month); const weeks=[];
  for(let i=0;i<days.length;i+=7)weeks.push(days.slice(i,i+7));
  return (
    <div style={{ background:C.card, borderRadius:16, marginBottom:12, overflow:'hidden', boxShadow:'0 12px 48px rgba(0,0,0,0.6)', border:`1px solid ${C.border}`, display:'flex', flexDirection:'column', pageBreakAfter:'always', breakAfter:'page' }}>
      {/* Top bar */}
      <div style={{ height:56, background:C.dark, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 28px', borderBottom:`1px solid ${C.border}`, flexShrink:0 }}>
        <span style={{ fontFamily:'"Arquivo Black",Outfit,sans-serif', fontSize:15, color:C.amber, fontWeight:800, letterSpacing:'0.06em' }}>{header||'CalendarPro'}</span>
        <span style={{ fontFamily:'"Platypi",serif', fontSize:22, color:`${C.amber}55`, fontWeight:700 }}>{year}</span>
      </div>
      {/* Body */}
      <div style={{ display:'flex', flex:1, minHeight:560 }}>
        {imgSrc ? <ZoomImg src={imgSrc}/> : <div style={{ flex:'0 0 48%',background:'#0a1523',display:'flex',alignItems:'center',justifyContent:'center',color:'#1e2d3d',fontSize:52 }}><i className="bi bi-image"/></div>}
        {/* Calendar side */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', padding:'28px 24px 20px' }}>
          <div style={{ marginBottom:18 }}>
            <div style={{ fontFamily:'"Archivo Black",sans-serif', fontSize:48, color:C.text, lineHeight:1, letterSpacing:'-0.02em' }}>{monthName}</div>
            <div style={{ height:3, width:'100%', background:`linear-gradient(90deg,${C.amber},${C.coral},transparent)`, borderRadius:2, marginTop:8 }}/>
            {msg && <p style={{ fontFamily:'Outfit,sans-serif', fontSize:12, color:C.muted, margin:'10px 0 0', fontStyle:'italic', lineHeight:1.6 }}>{msg}</p>}
          </div>
          {/* Day headers */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', marginBottom:6 }}>
            {DAYS.map((d,i)=><div key={d} style={{ textAlign:'center', fontSize:10, fontWeight:700, fontFamily:'Outfit,sans-serif', color:i===5?C.sat:i===6?C.sun:C.muted, letterSpacing:'0.06em', padding:'3px 0' }}>{d}</div>)}
          </div>
          {/* Date rows */}
          <div style={{ flex:1, display:'flex', flexDirection:'column', gap:2 }}>
            {weeks.map((wk,wi)=>(
              <div key={wi} style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', flex:1 }}>
                {wk.map((cell,ci)=>{
                  const ev=cell.isCurrentMonth&&isEventDate(cell.date,dateCSV);
                  const lbl=ev?getEventLabel(cell.date,dateCSV,detailCSV):'';
                  return (
                    <div key={ci} style={{ display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'flex-start',paddingTop:5,borderRadius:7,background:ev?`${C.amber}14`:'transparent',border:ev?`1px solid ${C.amber}30`:'1px solid transparent' }}>
                      <span style={{ fontFamily:'Outfit,sans-serif', fontSize:ev?21:19, fontWeight:ev?700:400, color:!cell.isCurrentMonth?'#1a2a3d':ev?C.amber:ci===6?C.sun:ci===5?C.sat:C.text, lineHeight:1 }}>{cell.isCurrentMonth?cell.day:''}</span>
                      {ev&&<span style={{ fontSize:8,color:C.amber,fontFamily:'Outfit,sans-serif',marginTop:2,textAlign:'center',maxWidth:'100%',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',padding:'0 2px' }}>{lbl}</span>}
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

const Template2 = () => {
  const { id } = useParams();
  const [cal,setCal]=useState(null); const [loading,setLoading]=useState(true); const [error,setError]=useState(''); const [showTop,setShowTop]=useState(false);
  useEffect(()=>{getCalendarById(id).then(r=>setCal(r.data)).catch(()=>setError('Failed to load.')).finally(()=>setLoading(false));const h=()=>setShowTop(window.scrollY>300);window.addEventListener('scroll',h);return()=>window.removeEventListener('scroll',h);},[id]);
  if(loading)return<div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'60vh',background:C.dark}}><div style={{width:44,height:44,border:`3px solid ${C.amber}33`,borderTopColor:C.amber,borderRadius:'50%',animation:'spin .8s linear infinite'}}/><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>;
  if(error)return<div style={{margin:32,padding:20,borderRadius:12,background:'#1a0a0a',border:'1px solid #ef4444',color:'#f87171',fontFamily:'Outfit,sans-serif'}}>{error}</div>;
  const imgs=cal.uc_img_csv?.split(',').map(s=>s.trim()).filter(Boolean)||[];
  const months=generateCalendarData(cal.uc_start_date,cal.uc_end_date);
  return (
    <div style={{ background:'#030a14', minHeight:'100vh', padding:24 }}>
      <style>{`@media print{.no-print{display:none!important}body{margin:0;background:#000}}`}</style>
      <PrintControl defaultSize="A4 landscape" accentColor={C.amber} dark={true}/>
      {months.map(({year,month,monthName},idx)=>(
        <MonthPage key={`${year}-${month}`} year={year} month={month} monthName={monthName} imgSrc={imgs[idx]?getImageUrl(imgs[idx]):null} msg={cal.uc_msg} header={cal.uc_page_header} dateCSV={cal.uc_date_event_csv} detailCSV={cal.uc_event_details_csv}/>
      ))}
      {showTop&&<button className="no-print" onClick={()=>window.scrollTo({top:0,behavior:'smooth'})} style={{ position:'fixed',bottom:24,right:24,width:44,height:44,borderRadius:'50%',background:C.amber,color:'#030a14',border:'none',cursor:'pointer',fontSize:18,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:`0 4px 16px ${C.amber}66`,zIndex:99 }}><i className="bi bi-chevron-up"/></button>}
    </div>
  );
};
export default Template2;
