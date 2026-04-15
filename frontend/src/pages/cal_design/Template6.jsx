import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getCalendarById } from '../../services/calendar.service';
import { getImageUrl }      from '../../services/upload.service';
import { getMonthDays, isEventDate, getEventLabel, generateCalendarData, splitIntoChunks } from '../../utils/calendarHelper';
import PrintControl         from '../../components/PrintControl';

/* ══ TEMPLATE 6 — TERRACOTTA VINTAGE QUARTERLY ═════════════
   Theme  : Earthy Boho / Vintage Terracotta
   Layout : 3 months per page with image
   Print  : A4 Landscape
   Palette: Terracotta · Burnt sienna · Sage · Parchment
═══════════════════════════════════════════════════════════ */

const DAYS=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const C={ terra:'#c2410c', terraMid:'#ea580c', terraLt:'#fb923c', sage:'#4d7c5f', parchment:'#fdf3e7', parchDk:'#f5e1c0', ink:'#2c1a0e', muted:'#8b6a4f', sat:'#1d4ed8', sun:'#c2410c', border:'#e8c99a' };

const ZoomImg6 = ({ src }) => {
  const [scale,setScale]=useState(1);const [pos,setPos]=useState({x:50,y:50});
  const drag=useRef(false);const last=useRef({x:0,y:0});const ref=useRef(null);
  const onDown=e=>{drag.current=true;last.current={x:e.clientX,y:e.clientY};e.preventDefault();};
  const onUp=()=>{drag.current=false;};
  const onMove=e=>{if(!drag.current||!ref.current)return;const r=ref.current.getBoundingClientRect();setPos(p=>({x:Math.min(100,Math.max(0,p.x+((e.clientX-last.current.x)/r.width)*100)),y:Math.min(100,Math.max(0,p.y+((e.clientY-last.current.y)/r.height)*100))}));last.current={x:e.clientX,y:e.clientY};};
  return (
    <div style={{ position:'relative',height:'100%' }}>
      <div ref={ref} onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp} style={{ height:'100%',minHeight:380,overflow:'hidden',cursor:'move',userSelect:'none',background:C.parchDk }}>
        <img src={src} draggable={false} onError={e=>{e.target.style.opacity='.1';}} style={{ width:'100%',height:'100%',objectFit:'cover',objectPosition:`${pos.x}% ${pos.y}%`,transform:`scale(${scale})`,transformOrigin:`${pos.x}% ${pos.y}%`,display:'block' }}/>
        <div style={{ position:'absolute',inset:0,background:'linear-gradient(135deg,rgba(194,65,12,0.08),transparent)' }}/>
      </div>
      <div className="no-print" style={{ position:'absolute',top:8,right:8,display:'flex',gap:4 }}>
        {[['+',()=>setScale(s=>Math.min(3,s+.15))],['-',()=>setScale(s=>Math.max(.5,s-.15))]].map(([l,f],i)=>(
          <button key={i} onClick={f} style={{ width:28,height:28,borderRadius:6,border:`1px solid ${C.border}`,background:C.parchment,cursor:'pointer',fontWeight:700,fontSize:14,color:C.terra }}>{l}</button>
        ))}
      </div>
    </div>
  );
};

const SmallMonth6 = ({ year, month, monthName, dateCSV, detailCSV }) => {
  const days=getMonthDays(year,month);const weeks=[];for(let i=0;i<days.length;i+=7)weeks.push(days.slice(i,i+7));
  return (
    <div style={{ background:'rgba(253,243,231,0.92)',borderRadius:10,overflow:'hidden',border:`1px solid ${C.border}`,boxShadow:'0 2px 12px rgba(194,65,12,0.1)',breakInside:'avoid' }}>
      <div style={{ background:`linear-gradient(135deg,${C.terra},${C.terraMid})`,color:'#fff',textAlign:'center',padding:'8px 4px 6px',fontFamily:'"Platypi",serif',fontSize:13,fontWeight:700,letterSpacing:'0.05em' }}>
        {monthName} <span style={{ fontSize:9,opacity:0.65,fontFamily:'Outfit,sans-serif',fontWeight:400 }}>{year}</span>
      </div>
      <div style={{ display:'grid',gridTemplateColumns:'repeat(7,1fr)',background:C.parchDk,borderBottom:`1px solid ${C.border}` }}>
        {DAYS.map((d,i)=><div key={d} style={{ textAlign:'center',fontSize:8,fontWeight:700,padding:'3px 0',color:i===5?C.sat:i===6?C.sun:'#b08060',fontFamily:'Outfit,sans-serif' }}>{d}</div>)}
      </div>
      <table style={{ width:'100%',borderCollapse:'collapse' }}>
        <tbody>
          {weeks.map((wk,wi)=>(
            <tr key={wi}>
              {wk.map((cell,ci)=>{const ev=cell.isCurrentMonth&&isEventDate(cell.date,dateCSV);const lbl=ev?getEventLabel(cell.date,dateCSV,detailCSV):'';return(
                <td key={ci} style={{ textAlign:'center',padding:'3px 0',height:24,fontSize:11,fontFamily:'Outfit,sans-serif',fontWeight:ev?700:400,color:!cell.isCurrentMonth?'#e8cba8':ev?C.terra:ci===6?C.sun:ci===5?C.sat:C.ink,background:ev?`${C.terra}12`:'transparent',position:'relative' }}>
                  {cell.isCurrentMonth?cell.day:''}
                  {ev&&<span style={{ position:'absolute',top:1,right:2,width:5,height:5,borderRadius:'50%',background:C.terraLt }} title={lbl}/>}
                </td>
              );})}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const PageBlock6 = ({ chunk, imgSrc, msg, header, dateCSV, detailCSV, pageNum, total }) => {
  const year=chunk[0]?.year||'';
  return (
    <div style={{ background:C.parchment,borderRadius:14,marginBottom:12,overflow:'hidden',boxShadow:'0 8px 40px rgba(194,65,12,0.16)',border:`2px solid ${C.terra}`,display:'flex',flexDirection:'column',pageBreakAfter:'always',breakAfter:'page' }}>
      {/* Decorative top band */}
      <div style={{ height:6,background:`repeating-linear-gradient(90deg,${C.terra} 0,${C.terra} 20px,${C.terraLt} 20px,${C.terraLt} 40px,${C.sage} 40px,${C.sage} 60px,${C.terraLt} 60px,${C.terraLt} 80px)` }}/>

      {/* Header */}
      <div style={{ background:`linear-gradient(135deg,${C.terra} 0%,${C.terraMid} 100%)`,padding:'14px 28px',display:'flex',alignItems:'center',justifyContent:'space-between' }}>
        <div style={{ display:'flex',alignItems:'center',gap:10 }}>
          <div style={{ fontFamily:'"Platypi",serif',fontSize:20,fontWeight:700,color:'#fff' }}>{header||'CalendarPro'}</div>
          <span style={{ fontFamily:'Outfit,sans-serif',fontSize:10,color:'rgba(255,255,255,0.6)',letterSpacing:'0.15em',textTransform:'uppercase' }}>· Quarterly · Page {pageNum}/{total}</span>
        </div>
        <div style={{ fontFamily:'"Archivo Black",sans-serif',fontSize:32,color:'rgba(255,255,255,0.18)',lineHeight:1 }}>{year}</div>
      </div>

      {/* Main body: landscape layout */}
      <div style={{ display:'flex',flex:1,gap:0 }}>
        {/* Left: image */}
        <div style={{ flex:'0 0 38%',borderRight:`2px solid ${C.border}` }}>
          {imgSrc?<ZoomImg6 src={imgSrc}/>:<div style={{ height:'100%',minHeight:380,background:C.parchDk,display:'flex',alignItems:'center',justifyContent:'center',color:C.border,fontSize:48 }}><i className="bi bi-image"/></div>}
        </div>

        {/* Right: 3 months + message */}
        <div style={{ flex:1,padding:'20px 20px 16px',display:'flex',flexDirection:'column' }}>
          {msg&&<div style={{ fontFamily:'"Platypi",serif',fontSize:14,color:C.muted,fontStyle:'italic',marginBottom:14,textAlign:'center',letterSpacing:'0.02em' }}>"{msg}"</div>}
          <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,flex:1 }}>
            {chunk.slice(0,3).map(({year:y,month:m,monthName})=><SmallMonth6 key={`${y}-${m}`} year={y} month={m} monthName={monthName} dateCSV={dateCSV} detailCSV={detailCSV}/>)}
            {chunk.length<3&&Array.from({length:3-chunk.length}).map((_,i)=><div key={i} style={{ borderRadius:10,border:`1px dashed ${C.border}` }}/>)}
          </div>
        </div>
      </div>
      <div style={{ height:6,background:`repeating-linear-gradient(90deg,${C.terra} 0,${C.terra} 20px,${C.terraLt} 20px,${C.terraLt} 40px,${C.sage} 40px,${C.sage} 60px,${C.terraLt} 60px,${C.terraLt} 80px)` }}/>
    </div>
  );
};

const Template6 = () => {
  const { id } = useParams();
  const [cal,setCal]=useState(null);const [loading,setLoading]=useState(true);const [error,setError]=useState('');
  useEffect(()=>{getCalendarById(id).then(r=>setCal(r.data)).catch(()=>setError('Failed.')).finally(()=>setLoading(false));},[id]);
  if(loading)return<div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'60vh',flexDirection:'column',gap:16}}><div style={{width:44,height:44,border:`3px solid ${C.terraLt}`,borderTopColor:C.terra,borderRadius:'50%',animation:'spin .8s linear infinite'}}/><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>;
  if(error)return<div style={{margin:32,padding:20,borderRadius:12,background:'#fef2f2',border:'1px solid #fecaca',color:'#dc2626',fontFamily:'Outfit,sans-serif'}}>{error}</div>;
  const imgs=cal.uc_img_csv?.split(',').map(s=>s.trim()).filter(Boolean)||[];
  const months=generateCalendarData(cal.uc_start_date,cal.uc_end_date);
  const pages=splitIntoChunks(months,3);
  return (
    <div style={{ background:'#f5e8d4',minHeight:'100vh',padding:24 }}>
      <style>{`@media print{.no-print{display:none!important}body{margin:0}}`}</style>
      <PrintControl defaultSize="A4 landscape" accentColor={C.terra} dark={false}/>
      {pages.map((chunk,i)=><PageBlock6 key={i} chunk={chunk} imgSrc={imgs[i]?getImageUrl(imgs[i]):null} msg={cal.uc_msg} header={cal.uc_page_header} dateCSV={cal.uc_date_event_csv} detailCSV={cal.uc_event_details_csv} pageNum={i+1} total={pages.length}/>)}
    </div>
  );
};
export default Template6;
