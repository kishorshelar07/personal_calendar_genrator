import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getCalendarById } from '../../services/calendar.service';
import { getImageUrl }      from '../../services/upload.service';
import { getMonthDays, isEventDate, getEventLabel, generateCalendarData } from '../../utils/calendarHelper';
import PrintControl         from '../../components/PrintControl';

/* ══ TEMPLATE 5 — NORDIC MINIMAL MONTHLY ═══════════════════
   Theme  : Ultra-Minimal Scandinavian (B&W + single red accent)
   Layout : Full page per month — large number dates
   Print  : A4 Portrait
   Palette: Pure white · Charcoal black · Signal red · Cool gray
═══════════════════════════════════════════════════════════ */

const DAYS_FULL=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const DAYS_SH  =['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const C={ ink:'#111111', gray:'#6b7280', grayLt:'#d1d5db', grayUltraLt:'#f9fafb', red:'#e11d48', bg:'#f9fafb', white:'#ffffff' };

const ZoomImg5 = ({ src }) => {
  const [scale,setScale]=useState(1);const [pos,setPos]=useState({x:50,y:50});
  const drag=useRef(false);const last=useRef({x:0,y:0});const ref=useRef(null);
  const onDown=e=>{drag.current=true;last.current={x:e.clientX,y:e.clientY};e.preventDefault();};
  const onUp=()=>{drag.current=false;};
  const onMove=e=>{if(!drag.current||!ref.current)return;const r=ref.current.getBoundingClientRect();setPos(p=>({x:Math.min(100,Math.max(0,p.x+((e.clientX-last.current.x)/r.width)*100)),y:Math.min(100,Math.max(0,p.y+((e.clientY-last.current.y)/r.height)*100))}));last.current={x:e.clientX,y:e.clientY};};
  return (
    <div style={{ position:'relative',height:'5in' }}>
      <div ref={ref} onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp} style={{ height:'100%',overflow:'hidden',cursor:'move',userSelect:'none',background:'#e5e7eb' }}>
        <img src={src} draggable={false} onError={e=>{e.target.style.opacity='.08';}} style={{ width:'100%',height:'100%',objectFit:'cover',objectPosition:`${pos.x}% ${pos.y}%`,transform:`scale(${scale})`,transformOrigin:`${pos.x}% ${pos.y}%`,display:'block' }}/>
      </div>
      <div className="no-print" style={{ position:'absolute',bottom:10,right:10,display:'flex',gap:5 }}>
        {[['+',()=>setScale(s=>Math.min(3,s+.15))],['-',()=>setScale(s=>Math.max(.5,s-.15))]].map(([l,f],i)=>(
          <button key={i} onClick={f} style={{ width:28,height:28,borderRadius:5,border:`1px solid ${C.grayLt}`,background:C.white,cursor:'pointer',fontWeight:700,fontSize:14,color:C.ink }}>{l}</button>
        ))}
      </div>
    </div>
  );
};

const MonthPage5 = ({ year, month, monthName, imgSrc, msg, header, dateCSV, detailCSV }) => {
  const days=getMonthDays(year,month);const weeks=[];for(let i=0;i<days.length;i+=7)weeks.push(days.slice(i,i+7));
  return (
    <div style={{ background:C.white,borderRadius:0,marginBottom:12,overflow:'hidden',boxShadow:'0 1px 40px rgba(0,0,0,0.12)',pageBreakAfter:'always',breakAfter:'page',minHeight:'11in',display:'flex',flexDirection:'column',borderTop:`4px solid ${C.ink}` }}>
      {/* Top: Header row */}
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'18px 32px 16px',borderBottom:`1px solid ${C.grayLt}` }}>
        <span style={{ fontFamily:'Outfit,sans-serif',fontSize:11,fontWeight:700,color:C.gray,letterSpacing:'0.22em',textTransform:'uppercase' }}>{header||'CalendarPro'}</span>
        <span style={{ fontFamily:'Outfit,sans-serif',fontSize:11,color:C.grayLt,letterSpacing:'0.1em' }}>{year}</span>
      </div>

      {/* Image */}
      {imgSrc?<ZoomImg5 src={imgSrc}/>:<div style={{ height:'5in',background:C.grayUltraLt,display:'flex',alignItems:'center',justifyContent:'center',color:C.grayLt,fontSize:52 }}><i className="bi bi-image"/></div>}

      {/* Month name + divider */}
      <div style={{ padding:'20px 32px 0',display:'flex',alignItems:'baseline',gap:16 }}>
        <div style={{ fontFamily:'"Archivo Black",sans-serif',fontSize:52,color:C.ink,lineHeight:1,letterSpacing:'-0.03em' }}>{monthName}</div>
        <div style={{ flex:1,height:2,background:C.ink,marginBottom:8 }}/>
        {msg&&<div style={{ fontFamily:'Outfit,sans-serif',fontSize:11,color:C.gray,fontStyle:'italic',maxWidth:200,textAlign:'right',lineHeight:1.5 }}>{msg}</div>}
      </div>

      {/* Calendar grid */}
      <div style={{ flex:1,padding:'0 32px 20px' }}>
        {/* Day column headers */}
        <div style={{ display:'grid',gridTemplateColumns:'repeat(7,1fr)',borderBottom:`2px solid ${C.ink}`,marginBottom:0 }}>
          {DAYS_SH.map((d,i)=>(
            <div key={d} style={{ textAlign:'center',padding:'6px 0',fontFamily:'Outfit,sans-serif',fontSize:10,fontWeight:700,color:i===5||i===6?C.red:C.gray,letterSpacing:'0.1em',textTransform:'uppercase' }}>{d}</div>
          ))}
        </div>
        {/* Date rows */}
        {weeks.map((wk,wi)=>(
          <div key={wi} style={{ display:'grid',gridTemplateColumns:'repeat(7,1fr)',borderBottom:`1px solid ${C.grayLt}` }}>
            {wk.map((cell,ci)=>{
              const ev=cell.isCurrentMonth&&isEventDate(cell.date,dateCSV);
              const lbl=ev?getEventLabel(cell.date,dateCSV,detailCSV):'';
              const isSun=ci===6;const isSat=ci===5;
              return(
                <div key={ci} style={{ padding:'8px 10px',minHeight:52,display:'flex',flexDirection:'column',borderRight:ci<6?`1px solid ${C.grayLt}`:'none',background:ev?`${C.red}07`:'transparent' }}>
                  <span style={{ fontFamily:'"Archivo Black",sans-serif',fontSize:24,fontWeight:ev?700:400,color:!cell.isCurrentMonth?C.grayLt:ev?C.red:isSun||isSat?C.red:C.ink,lineHeight:1 }}>{cell.isCurrentMonth?cell.day:''}</span>
                  {ev&&lbl&&<span style={{ fontFamily:'Outfit,sans-serif',fontSize:9,color:C.red,marginTop:3,lineHeight:1.3 }}>{lbl}</span>}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

const Template5 = () => {
  const { id } = useParams();
  const [cal,setCal]=useState(null);const [loading,setLoading]=useState(true);const [error,setError]=useState('');const [showTop,setShowTop]=useState(false);
  useEffect(()=>{getCalendarById(id).then(r=>setCal(r.data)).catch(()=>setError('Failed.')).finally(()=>setLoading(false));const h=()=>setShowTop(window.scrollY>300);window.addEventListener('scroll',h);return()=>window.removeEventListener('scroll',h);},[id]);
  if(loading)return<div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'60vh',flexDirection:'column',gap:16}}><div style={{width:44,height:44,border:`3px solid ${C.grayLt}`,borderTopColor:C.ink,borderRadius:'50%',animation:'spin .8s linear infinite'}}/><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>;
  if(error)return<div style={{margin:32,padding:20,borderRadius:12,background:'#fef2f2',border:'1px solid #fecaca',color:'#dc2626',fontFamily:'Outfit,sans-serif'}}>{error}</div>;
  const imgs=cal.uc_img_csv?.split(',').map(s=>s.trim()).filter(Boolean)||[];
  const months=generateCalendarData(cal.uc_start_date,cal.uc_end_date);
  return (
    <div style={{ background:C.bg,minHeight:'100vh',padding:24 }}>
      <style>{`@media print{.no-print{display:none!important}body{margin:0}}`}</style>
      <PrintControl defaultSize="A4 portrait" accentColor={C.ink} dark={false}/>
      {months.map(({year,month,monthName},idx)=>(
        <MonthPage5 key={`${year}-${month}`} year={year} month={month} monthName={monthName} imgSrc={imgs[idx]?getImageUrl(imgs[idx]):null} msg={cal.uc_msg} header={cal.uc_page_header} dateCSV={cal.uc_date_event_csv} detailCSV={cal.uc_event_details_csv}/>
      ))}
      {showTop&&<button className="no-print" onClick={()=>window.scrollTo({top:0,behavior:'smooth'})} style={{ position:'fixed',bottom:24,right:24,width:44,height:44,borderRadius:'50%',background:C.ink,color:'#fff',border:'none',cursor:'pointer',fontSize:18,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 4px 16px rgba(0,0,0,0.3)',zIndex:99 }}><i className="bi bi-chevron-up"/></button>}
    </div>
  );
};
export default Template5;
