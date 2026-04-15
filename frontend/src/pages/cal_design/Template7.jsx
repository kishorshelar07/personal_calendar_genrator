import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getCalendarById } from '../../services/calendar.service';
import { getImageUrl }      from '../../services/upload.service';
import { getMonthDays, isEventDate, getEventLabel, generateCalendarData } from '../../utils/calendarHelper';
import PrintControl         from '../../components/PrintControl';

/* ══ TEMPLATE 7 — AURORA NIGHT MONTHLY ═════════════════════
   Theme  : Deep Space Aurora (neon on dark, one month per page)
   Layout : Full-page portrait — image top, large calendar below
   Print  : A4 Portrait
   Palette: Deep space black · Aurora teal · Violet · Neon pink
═══════════════════════════════════════════════════════════ */

const DAYS=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const C={ bg:'#080c1a', surface:'#0e1428', card:'#121932', teal:'#2dd4bf', violet:'#8b5cf6', pink:'#ec4899', text:'#e2e8f4', muted:'#64748b', dim:'#1e2d4a', sat:'#60a5fa', sun:'#f87171', border:'rgba(45,212,191,0.12)' };

const ZoomImg7 = ({ src }) => {
  const [scale,setScale]=useState(1);const [pos,setPos]=useState({x:50,y:50});
  const drag=useRef(false);const last=useRef({x:0,y:0});const ref=useRef(null);
  const onDown=e=>{drag.current=true;last.current={x:e.clientX,y:e.clientY};e.preventDefault();};
  const onUp=()=>{drag.current=false;};
  const onMove=e=>{if(!drag.current||!ref.current)return;const r=ref.current.getBoundingClientRect();setPos(p=>({x:Math.min(100,Math.max(0,p.x+((e.clientX-last.current.x)/r.width)*100)),y:Math.min(100,Math.max(0,p.y+((e.clientY-last.current.y)/r.height)*100))}));last.current={x:e.clientX,y:e.clientY};};
  return (
    <div style={{ position:'relative',height:'4.5in' }}>
      <div ref={ref} onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp} style={{ height:'100%',overflow:'hidden',cursor:'move',userSelect:'none',background:C.dim }}>
        <img src={src} draggable={false} onError={e=>{e.target.style.opacity='.06';}} style={{ width:'100%',height:'100%',objectFit:'cover',objectPosition:`${pos.x}% ${pos.y}%`,transform:`scale(${scale})`,transformOrigin:`${pos.x}% ${pos.y}%`,display:'block' }}/>
        <div style={{ position:'absolute',inset:0,background:'linear-gradient(to bottom,transparent 55%,rgba(8,12,26,0.85))' }}/>
        {/* Aurora overlay */}
        <div style={{ position:'absolute',inset:0,background:`linear-gradient(160deg,${C.teal}08 0%,transparent 40%,${C.violet}06 70%,transparent 100%)`,mixBlendMode:'screen' }}/>
      </div>
      <div className="no-print" style={{ position:'absolute',top:10,right:10,display:'flex',gap:5 }}>
        {[['+',()=>setScale(s=>Math.min(3,s+.15))],['-',()=>setScale(s=>Math.max(.5,s-.15))]].map(([l,f],i)=>(
          <button key={i} onClick={f} style={{ width:30,height:30,borderRadius:7,border:'none',background:'rgba(8,12,26,0.8)',backdropFilter:'blur(8px)',cursor:'pointer',fontWeight:700,fontSize:14,color:C.teal }}>{l}</button>
        ))}
      </div>
    </div>
  );
};

const MonthPage7 = ({ year, month, monthName, imgSrc, msg, header, dateCSV, detailCSV }) => {
  const days=getMonthDays(year,month);const weeks=[];for(let i=0;i<days.length;i+=7)weeks.push(days.slice(i,i+7));
  const accentColor = [C.teal,C.violet,C.pink,C.teal,C.violet,C.pink,C.teal,C.violet,C.pink,C.teal,C.violet,C.pink][month] || C.teal;
  return (
    <div style={{ background:C.card,borderRadius:16,marginBottom:12,overflow:'hidden',boxShadow:`0 16px 60px rgba(0,0,0,0.7),0 0 0 1px ${accentColor}18`,pageBreakAfter:'always',breakAfter:'page',display:'flex',flexDirection:'column' }}>
      {/* Aurora top bar */}
      <div style={{ height:4,background:`linear-gradient(90deg,${C.teal},${C.violet},${C.pink},${C.violet},${C.teal})` }}/>

      {/* Header */}
      <div style={{ background:C.surface,padding:'14px 28px',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:`1px solid ${C.border}` }}>
        <span style={{ fontFamily:'Outfit,sans-serif',fontSize:12,fontWeight:700,color:accentColor,letterSpacing:'0.18em',textTransform:'uppercase' }}>{header||'CalendarPro'}</span>
        <span style={{ fontFamily:'"Archivo Black",sans-serif',fontSize:18,color:`${accentColor}55` }}>{year}</span>
      </div>

      {/* Image */}
      {imgSrc?<ZoomImg7 src={imgSrc}/>:<div style={{ height:'4.5in',background:C.dim,display:'flex',alignItems:'center',justifyContent:'center',color:`${C.teal}22`,fontSize:52 }}><i className="bi bi-image"/></div>}

      {/* Month name */}
      <div style={{ padding:'16px 28px 0',display:'flex',alignItems:'center',gap:14 }}>
        <div style={{ fontFamily:'"Archivo Black",sans-serif',fontSize:44,color:C.text,lineHeight:1,letterSpacing:'-0.02em' }}>{monthName}</div>
        <div style={{ flex:1,height:2,background:`linear-gradient(90deg,${accentColor},${accentColor}22,transparent)`,borderRadius:1 }}/>
        {msg&&<div style={{ fontFamily:'Outfit,sans-serif',fontSize:11,color:C.muted,fontStyle:'italic',maxWidth:180,textAlign:'right' }}>{msg}</div>}
      </div>

      {/* Calendar grid */}
      <div style={{ padding:'10px 28px 20px',flex:1 }}>
        {/* Day headers */}
        <div style={{ display:'grid',gridTemplateColumns:'repeat(7,1fr)',marginBottom:4,borderBottom:`1px solid ${C.border}`,paddingBottom:6 }}>
          {DAYS.map((d,i)=>(
            <div key={d} style={{ textAlign:'center',fontSize:10,fontWeight:700,fontFamily:'Outfit,sans-serif',color:i===5?C.sat:i===6?C.sun:`${accentColor}88`,letterSpacing:'0.08em' }}>{d}</div>
          ))}
        </div>
        {/* Week rows */}
        <div style={{ display:'flex',flexDirection:'column',gap:2 }}>
          {weeks.map((wk,wi)=>(
            <div key={wi} style={{ display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:2 }}>
              {wk.map((cell,ci)=>{
                const ev=cell.isCurrentMonth&&isEventDate(cell.date,dateCSV);
                const lbl=ev?getEventLabel(cell.date,dateCSV,detailCSV):'';
                return(
                  <div key={ci} style={{ display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'flex-start',padding:'5px 2px',borderRadius:8,background:ev?`${accentColor}16`:'transparent',border:ev?`1px solid ${accentColor}30`:'1px solid transparent',minHeight:42 }}>
                    <span style={{ fontFamily:'Outfit,sans-serif',fontSize:ev?22:20,fontWeight:ev?700:400,color:!cell.isCurrentMonth?C.dim:ev?accentColor:ci===6?C.sun:ci===5?C.sat:C.text,lineHeight:1 }}>{cell.isCurrentMonth?cell.day:''}</span>
                    {ev&&lbl&&<span style={{ fontSize:8,color:accentColor,marginTop:2,textAlign:'center',fontFamily:'Outfit,sans-serif',maxWidth:'100%',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{lbl}</span>}
                    {ev&&!lbl&&<span style={{ width:5,height:5,borderRadius:'50%',background:accentColor,marginTop:3,boxShadow:`0 0 6px ${accentColor}` }}/>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom aurora bar */}
      <div style={{ height:4,background:`linear-gradient(90deg,${C.teal},${C.violet},${C.pink},${C.violet},${C.teal})` }}/>
    </div>
  );
};

const Template7 = () => {
  const { id } = useParams();
  const [cal,setCal]=useState(null);const [loading,setLoading]=useState(true);const [error,setError]=useState('');const [showTop,setShowTop]=useState(false);
  useEffect(()=>{getCalendarById(id).then(r=>setCal(r.data)).catch(()=>setError('Failed.')).finally(()=>setLoading(false));const h=()=>setShowTop(window.scrollY>300);window.addEventListener('scroll',h);return()=>window.removeEventListener('scroll',h);},[id]);
  if(loading)return<div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'60vh',background:C.bg,flexDirection:'column',gap:16}}><div style={{width:44,height:44,border:`3px solid ${C.teal}33`,borderTopColor:C.teal,borderRadius:'50%',animation:'spin .8s linear infinite'}}/><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>;
  if(error)return<div style={{margin:32,padding:20,borderRadius:12,background:'#0f0a0a',border:'1px solid #ef4444',color:'#f87171',fontFamily:'Outfit,sans-serif'}}>{error}</div>;
  const imgs=cal.uc_img_csv?.split(',').map(s=>s.trim()).filter(Boolean)||[];
  const months=generateCalendarData(cal.uc_start_date,cal.uc_end_date);
  return (
    <div style={{ background:C.bg,minHeight:'100vh',padding:24 }}>
      <style>{`@media print{.no-print{display:none!important}body{margin:0;background:#000}}`}</style>
      <PrintControl defaultSize="A4 portrait" accentColor={C.teal} dark={true}/>
      {months.map(({year,month,monthName},idx)=>(
        <MonthPage7 key={`${year}-${month}`} year={year} month={month} monthName={monthName} imgSrc={imgs[idx]?getImageUrl(imgs[idx]):null} msg={cal.uc_msg} header={cal.uc_page_header} dateCSV={cal.uc_date_event_csv} detailCSV={cal.uc_event_details_csv}/>
      ))}
      {showTop&&<button className="no-print" onClick={()=>window.scrollTo({top:0,behavior:'smooth'})} style={{ position:'fixed',bottom:24,right:24,width:44,height:44,borderRadius:'50%',background:`linear-gradient(135deg,${C.teal},${C.violet})`,color:'#fff',border:'none',cursor:'pointer',fontSize:18,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:`0 4px 16px ${C.teal}44`,zIndex:99 }}><i className="bi bi-chevron-up"/></button>}
    </div>
  );
};
export default Template7;
