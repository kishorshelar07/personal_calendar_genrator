import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getCalendarById } from '../../services/calendar.service';
import { getImageUrl }      from '../../services/upload.service';
import { getMonthDays, isEventDate, getEventLabel, generateCalendarData, splitIntoChunks } from '../../utils/calendarHelper';
import PrintControl         from '../../components/PrintControl';

/* ══ TEMPLATE 3 — AZURE CORPORATE QUARTERLY ════════════════
   Theme  : Modern Corporate Blue / Indigo
   Layout : 4 months per page with image
   Print  : A4 Portrait
   Palette: Royal blue · Indigo · Sky · White
═══════════════════════════════════════════════════════════ */

const DAYS=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const C={ primary:'#1e40af', indigo:'#4338ca', sky:'#0284c7', amber:'#d97706', bg:'#f0f4ff', text:'#0f172a', muted:'#64748b', dim:'#94a3b8', sat:'#1d4ed8', sun:'#dc2626', border:'#dde6f0' };

const ZoomImg3 = ({ src }) => {
  const [scale,setScale]=useState(1);const [pos,setPos]=useState({x:50,y:50});
  const drag=useRef(false);const last=useRef({x:0,y:0});const ref=useRef(null);
  const onDown=e=>{drag.current=true;last.current={x:e.clientX,y:e.clientY};e.preventDefault();};
  const onUp=()=>{drag.current=false;};
  const onMove=e=>{if(!drag.current||!ref.current)return;const r=ref.current.getBoundingClientRect();setPos(p=>({x:Math.min(100,Math.max(0,p.x+((e.clientX-last.current.x)/r.width)*100)),y:Math.min(100,Math.max(0,p.y+((e.clientY-last.current.y)/r.height)*100))}));last.current={x:e.clientX,y:e.clientY};};
  return (
    <div style={{ position:'relative', height:'5.2in' }}>
      <div ref={ref} onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp} style={{ height:'100%',overflow:'hidden',cursor:'move',userSelect:'none' }}>
        <img src={src} draggable={false} onError={e=>{e.target.style.opacity='.1';}} style={{ width:'100%',height:'100%',objectFit:'cover',objectPosition:`${pos.x}% ${pos.y}%`,transform:`scale(${scale})`,transformOrigin:`${pos.x}% ${pos.y}%`,display:'block' }}/>
        <div style={{ position:'absolute',bottom:0,left:0,right:0,height:80,background:`linear-gradient(transparent,rgba(30,64,175,0.65))` }}/>
      </div>
      <div className="no-print" style={{ position:'absolute',top:10,right:10,display:'flex',gap:5 }}>
        {[['+',()=>setScale(s=>Math.min(3,s+.15))],['-',()=>setScale(s=>Math.max(.5,s-.15))]].map(([l,f],i)=>(
          <button key={i} onClick={f} style={{ width:30,height:30,borderRadius:7,border:'none',background:'rgba(255,255,255,0.92)',backdropFilter:'blur(6px)',cursor:'pointer',fontWeight:700,fontSize:16,color:C.primary }}>{l}</button>
        ))}
      </div>
    </div>
  );
};

const SmallMonth = ({ year, month, monthName, dateCSV, detailCSV }) => {
  const days=getMonthDays(year,month);const weeks=[];for(let i=0;i<days.length;i+=7)weeks.push(days.slice(i,i+7));
  return (
    <div style={{ background:'#fff',borderRadius:12,overflow:'hidden',boxShadow:'0 2px 16px rgba(30,64,175,0.09)',border:`1px solid ${C.border}`,breakInside:'avoid' }}>
      <div style={{ background:`linear-gradient(135deg,${C.primary},${C.indigo})`,color:'#fff',textAlign:'center',padding:'10px 8px 8px',position:'relative',overflow:'hidden' }}>
        <div style={{ position:'absolute',right:-16,top:-16,width:60,height:60,borderRadius:'50%',background:'rgba(255,255,255,0.08)' }}/>
        <div style={{ fontFamily:'"Syne",sans-serif',fontSize:16,fontWeight:700,letterSpacing:'0.04em' }}>{monthName}</div>
        <div style={{ fontSize:10,opacity:0.6,fontFamily:'Outfit,sans-serif' }}>{year}</div>
      </div>
      <div style={{ display:'grid',gridTemplateColumns:'repeat(7,1fr)',background:'#eef2ff',borderBottom:`1px solid ${C.border}` }}>
        {DAYS.map((d,i)=><div key={d} style={{ textAlign:'center',fontSize:8,fontWeight:700,fontFamily:'Outfit,sans-serif',color:i===5?C.sat:i===6?C.sun:C.dim,padding:'3px 0',letterSpacing:'0.03em' }}>{d}</div>)}
      </div>
      <table style={{ width:'100%',borderCollapse:'collapse' }}>
        <tbody>
          {weeks.map((wk,wi)=>(
            <tr key={wi}>
              {wk.map((cell,ci)=>{const ev=cell.isCurrentMonth&&isEventDate(cell.date,dateCSV);const lbl=ev?getEventLabel(cell.date,dateCSV,detailCSV):'';return(
                <td key={ci} style={{ textAlign:'center',padding:'2px 0',height:26,fontSize:12,fontFamily:'Outfit,sans-serif',fontWeight:ev?700:400,color:!cell.isCurrentMonth?'#e2e8f0':ev?C.primary:ci===6?C.sun:ci===5?C.sat:C.text,background:ev?`${C.primary}0f`:'transparent',position:'relative',borderRadius:ev?4:0 }}>
                  {cell.isCurrentMonth?cell.day:''}
                  {ev&&<><span style={{ display:'block',fontSize:8,color:C.amber,marginTop:-1 }}>★</span></>}
                </td>
              );})}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const PageBlock = ({ chunk, imgSrc, msg, header, dateCSV, detailCSV, pageNum, total }) => {
  const year=chunk[0]?.year||'';
  return (
    <div style={{ background:'#fff',borderRadius:16,marginBottom:12,overflow:'hidden',boxShadow:'0 8px 40px rgba(30,64,175,0.13)',border:`1px solid ${C.border}`,display:'flex',flexDirection:'column',pageBreakAfter:'always',breakAfter:'page' }}>
      <div style={{ background:`linear-gradient(135deg,${C.primary},${C.indigo})`,padding:'16px 28px',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0 }}>
        <div style={{ display:'flex',alignItems:'center',gap:12 }}>
          <div style={{ width:36,height:36,borderRadius:9,background:'rgba(255,255,255,0.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,color:'#fff' }}><i className="bi bi-calendar3"/></div>
          <div>
            <div style={{ fontFamily:'"Syne",sans-serif',fontSize:17,fontWeight:800,color:'#fff',letterSpacing:'0.02em' }}>{header||'CalendarPro'}</div>
            <div style={{ fontSize:10,color:'rgba(255,255,255,0.6)',fontFamily:'Outfit,sans-serif',letterSpacing:'0.1em' }}>QUARTERLY PLANNER · Page {pageNum}/{total}</div>
          </div>
        </div>
        <div style={{ fontFamily:'"Archivo Black",sans-serif',fontSize:38,color:'rgba(255,255,255,0.14)',lineHeight:1 }}>{year}</div>
      </div>
      {imgSrc?<ZoomImg3 src={imgSrc}/>:<div style={{ height:'5.2in',background:`linear-gradient(135deg,#eff6ff,#e0e7ff)`,display:'flex',alignItems:'center',justifyContent:'center',color:'#bfdbfe',fontSize:56 }}><i className="bi bi-image"/></div>}
      {msg&&<div style={{ background:`${C.primary}08`,borderTop:`1px solid ${C.border}`,borderBottom:`1px solid ${C.border}`,padding:'9px 24px',textAlign:'center',fontFamily:'"Syne",sans-serif',fontSize:13,color:C.primary,fontWeight:600 }}>{msg}</div>}
      <div style={{ flex:1,display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,padding:'18px 22px',background:`linear-gradient(135deg,${C.bg},#eef2ff)` }}>
        {chunk.map(({year:y,month:m,monthName})=><SmallMonth key={`${y}-${m}`} year={y} month={m} monthName={monthName} dateCSV={dateCSV} detailCSV={detailCSV}/>)}
        {chunk.length<4&&Array.from({length:4-chunk.length}).map((_,i)=><div key={i} style={{ borderRadius:12,border:`1px dashed ${C.border}`,display:'flex',alignItems:'center',justifyContent:'center',color:C.dim,fontSize:13,fontFamily:'Outfit,sans-serif' }}>—</div>)}
      </div>
    </div>
  );
};

const Template3 = () => {
  const { id } = useParams();
  const [cal,setCal]=useState(null);const [loading,setLoading]=useState(true);const [error,setError]=useState('');
  useEffect(()=>{getCalendarById(id).then(r=>setCal(r.data)).catch(()=>setError('Failed to load.')).finally(()=>setLoading(false));},[id]);
  if(loading)return<div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'60vh',flexDirection:'column',gap:16}}><div style={{width:44,height:44,border:`3px solid #bfdbfe`,borderTopColor:C.primary,borderRadius:'50%',animation:'spin .8s linear infinite'}}/><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>;
  if(error)return<div style={{margin:32,padding:20,borderRadius:12,background:'#fef2f2',border:'1px solid #fecaca',color:'#dc2626',fontFamily:'Outfit,sans-serif'}}>{error}</div>;
  const imgs=cal.uc_img_csv?.split(',').map(s=>s.trim()).filter(Boolean)||[];
  const months=generateCalendarData(cal.uc_start_date,cal.uc_end_date);
  const pages=splitIntoChunks(months,4);
  return (
    <div style={{ background:C.bg,minHeight:'100vh',padding:24 }}>
      <style>{`@media print{.no-print{display:none!important}body{margin:0}}`}</style>
      <PrintControl defaultSize="A4 portrait" accentColor={C.primary} dark={false}/>
      {pages.map((chunk,i)=><PageBlock key={i} chunk={chunk} imgSrc={imgs[i]?getImageUrl(imgs[i]):null} msg={cal.uc_msg} header={cal.uc_page_header} dateCSV={cal.uc_date_event_csv} detailCSV={cal.uc_event_details_csv} pageNum={i+1} total={pages.length}/>)}
    </div>
  );
};
export default Template3;
