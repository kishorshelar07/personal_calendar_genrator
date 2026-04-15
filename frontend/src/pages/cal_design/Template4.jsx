import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getCalendarById } from '../../services/calendar.service';
import { getImageUrl }      from '../../services/upload.service';
import { getMonthDays, isEventDate, getEventLabel, generateCalendarData } from '../../utils/calendarHelper';
import PrintControl         from '../../components/PrintControl';

/* ══ TEMPLATE 4 — ROSE ROYALE ANNUAL ══════════════════════
   Theme  : Luxury Rose Gold · Blush Pink · Glamour
   Layout : Annual 12-month grid on one page
   Print  : A3 Portrait
   Palette: Rose gold · Blush · Deep burgundy · Pearl
═══════════════════════════════════════════════════════════ */

const DAYS=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const C={ rose:'#9f1239', roseMid:'#be185d', roseLt:'#f472b6', gold:'#d4a017', goldLt:'#f0c93a', blush:'#fdf2f8', blushDk:'#fce7f3', pearl:'#fff9fc', text:'#3d0019', muted:'#9d607a', sat:'#7c3aed', sun:'#dc2626', border:'#f9a8d4' };

const MonthGrid4 = ({ year, month, monthName, dateCSV, detailCSV }) => {
  const days=getMonthDays(year,month);const weeks=[];for(let i=0;i<days.length;i+=7)weeks.push(days.slice(i,i+7));
  return (
    <div style={{ background:'rgba(255,255,255,0.94)',borderRadius:12,overflow:'hidden',boxShadow:'0 3px 16px rgba(159,18,57,0.12)',border:`1px solid ${C.border}`,breakInside:'avoid' }}>
      <div style={{ background:`linear-gradient(135deg,${C.rose},${C.roseMid})`,color:'#fff',textAlign:'center',padding:'8px 4px 6px',fontFamily:'"Platypi",serif',fontSize:11,fontWeight:700,letterSpacing:'0.07em',textTransform:'uppercase',position:'relative',overflow:'hidden' }}>
        <div style={{ position:'absolute',right:-10,top:-10,width:40,height:40,borderRadius:'50%',background:'rgba(255,255,255,0.1)' }}/>
        {monthName} <span style={{ fontSize:8,opacity:0.6,fontFamily:'Outfit,sans-serif',fontWeight:400 }}>{year}</span>
      </div>
      <div style={{ display:'grid',gridTemplateColumns:'repeat(7,1fr)',background:C.blushDk }}>
        {DAYS.map((d,i)=><div key={d} style={{ textAlign:'center',fontSize:7.5,fontWeight:700,padding:'2.5px 0',color:i===5?C.sat:i===6?C.sun:'#c4859d',fontFamily:'Outfit,sans-serif' }}>{d}</div>)}
      </div>
      <table style={{ width:'100%',borderCollapse:'collapse' }}>
        <tbody>
          {weeks.map((wk,wi)=>(
            <tr key={wi}>
              {wk.map((cell,ci)=>{const ev=cell.isCurrentMonth&&isEventDate(cell.date,dateCSV);const lbl=ev?getEventLabel(cell.date,dateCSV,detailCSV):'';return(
                <td key={ci} style={{ textAlign:'center',padding:'1.5px 0',height:19,fontSize:9.5,fontFamily:'Outfit,sans-serif',fontWeight:ev?700:400,color:!cell.isCurrentMonth?'#f3c6d9':ev?C.gold:ci===6?C.sun:ci===5?C.sat:C.text,background:ev?`${C.gold}18`:'transparent',position:'relative' }}>
                  {cell.isCurrentMonth?cell.day:''}
                  {ev&&<span style={{ position:'absolute',top:1,right:2,width:4,height:4,borderRadius:'50%',background:C.gold }} title={lbl}/>}
                </td>
              );})}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const Template4 = () => {
  const { id } = useParams();
  const [cal,setCal]=useState(null);const [loading,setLoading]=useState(true);const [error,setError]=useState('');
  useEffect(()=>{getCalendarById(id).then(r=>setCal(r.data)).catch(()=>setError('Failed.')).finally(()=>setLoading(false));},[id]);
  if(loading)return<div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'60vh',flexDirection:'column',gap:16}}><div style={{width:44,height:44,border:`3px solid ${C.roseLt}`,borderTopColor:C.rose,borderRadius:'50%',animation:'spin .8s linear infinite'}}/><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>;
  if(error)return<div style={{margin:32,padding:20,borderRadius:12,background:'#fef2f2',border:'1px solid #fecaca',color:'#dc2626',fontFamily:'Outfit,sans-serif'}}>{error}</div>;
  const imgs=cal.uc_img_csv?.split(',').map(s=>s.trim()).filter(Boolean)||[];
  const months=generateCalendarData(cal.uc_start_date,cal.uc_end_date);
  const dates=cal.uc_date_event_csv?.split(',').map(s=>s.trim()).filter(Boolean)||[];
  const details=cal.uc_event_details_csv?.split(',').map(s=>s.trim()).filter(Boolean)||[];
  const year=cal.uc_start_date?new Date(cal.uc_start_date).getFullYear():'';
  return (
    <div style={{ background:'#ffe4ef',minHeight:'100vh',padding:24 }}>
      <style>{`@media print{.no-print{display:none!important}body{margin:0}#t4{border-radius:0!important;box-shadow:none!important;margin:0!important;width:100%!important}}`}</style>
      <PrintControl defaultSize="A3 portrait" accentColor={C.rose} dark={false}/>
      <div id="t4" style={{ maxWidth:'32cm',margin:'0 auto',background:C.pearl,borderRadius:16,boxShadow:'0 24px 80px rgba(159,18,57,0.22)',overflow:'hidden',display:'flex',flexDirection:'column',border:`3px solid ${C.rose}` }}>
        {/* Decorative top border */}
        <div style={{ height:8,background:`linear-gradient(90deg,${C.rose},${C.roseLt},${C.gold},${C.roseLt},${C.rose})` }}/>

        {/* Header */}
        <div style={{ background:`linear-gradient(135deg,${C.rose},${C.roseMid})`,padding:'24px 36px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',position:'relative',overflow:'hidden' }}>
          <div style={{ position:'absolute',right:-40,top:-40,width:180,height:180,borderRadius:'50%',background:'rgba(255,255,255,0.06)' }}/>
          <div style={{ position:'absolute',left:180,bottom:-30,width:120,height:120,borderRadius:'50%',background:'rgba(255,255,255,0.04)' }}/>
          <div>
            <div style={{ fontFamily:'"Platypi",serif',fontSize:70,fontWeight:700,color:'#fff',lineHeight:1,textShadow:'0 4px 20px rgba(0,0,0,0.2)' }}>{year}</div>
            <div style={{ fontFamily:'Outfit,sans-serif',fontSize:11,color:`${C.roseLt}cc`,letterSpacing:'0.22em',textTransform:'uppercase',marginTop:4 }}>Annual Calendar</div>
          </div>
          <div style={{ textAlign:'right',maxWidth:360,position:'relative' }}>
            <div style={{ fontFamily:'"Archivo Black",sans-serif',fontSize:21,color:'#fff',lineHeight:1.35 }}>{cal.uc_page_header}</div>
            <div style={{ height:2,background:C.gold,marginTop:12,borderRadius:2 }}/>
          </div>
        </div>

        {/* Image strip 4 photos */}
        <div style={{ display:'flex',height:220,overflow:'hidden' }}>
          {[0,1,2,3].map(i=>imgs[i]
            ?<div key={i} style={{ flex:1,overflow:'hidden',position:'relative' }}><img src={getImageUrl(imgs[i])} alt="" style={{ width:'100%',height:'100%',objectFit:'cover' }}/>{i<3&&<div style={{ position:'absolute',right:0,top:0,width:2,height:'100%',background:`linear-gradient(${C.rose},${C.roseLt},${C.rose})` }}/>}</div>
            :<div key={i} style={{ flex:1,background:`linear-gradient(135deg,${C.roseMid}18,${C.blushDk})`,display:'flex',alignItems:'center',justifyContent:'center',color:'#d4a0b8',fontSize:28 }}><i className="bi bi-image"/></div>
          )}
          {cal.uc_msg&&<div style={{ position:'absolute',left:0,right:0,bottom:'calc(100% - 220px - 8px - 104px)',background:'linear-gradient(transparent,rgba(159,18,57,0.85))',padding:'26px 32px 12px',color:'#fff',fontFamily:'"Archivo Black",sans-serif',fontSize:15,textAlign:'center',pointerEvents:'none' }}>{cal.uc_msg}</div>}
        </div>

        {/* Gold accent */}
        <div style={{ height:5,background:`linear-gradient(90deg,transparent,${C.gold},${C.goldLt},${C.gold},transparent)` }}/>

        {/* 12-month grid */}
        <div style={{ flex:1,padding:'18px 24px',display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,background:`radial-gradient(ellipse at top right,${C.blushDk}60,transparent 60%)` }}>
          {months.slice(0,12).map(({year:y,month:m,monthName})=><MonthGrid4 key={`${y}-${m}`} year={y} month={m} monthName={monthName} dateCSV={cal.uc_date_event_csv} detailCSV={cal.uc_event_details_csv}/>)}
        </div>

        {/* Footer */}
        <div style={{ padding:'10px 24px 16px',borderTop:`1px solid ${C.blushDk}` }}>
          {dates.length>0&&<div style={{ display:'flex',flexWrap:'wrap',gap:'4px 18px',marginBottom:8 }}>
            {dates.map((d,i)=><span key={i} style={{ display:'inline-flex',alignItems:'center',gap:5,fontFamily:'Outfit,sans-serif',fontSize:10,color:C.muted }}><span style={{ width:5,height:5,borderRadius:'50%',background:C.gold,flexShrink:0 }}/><strong style={{ color:C.rose }}>{d.replace(/\//g,'-')}</strong>{details[i]?` — ${details[i]}`:''}</span>)}
          </div>}
          <div style={{ textAlign:'center',fontFamily:'"Platypi",serif',fontSize:14,color:C.rose,fontWeight:700,letterSpacing:'0.05em' }}>{cal.uc_page_footer}</div>
        </div>
        <div style={{ height:8,background:`linear-gradient(90deg,${C.rose},${C.roseLt},${C.gold},${C.roseLt},${C.rose})` }}/>
      </div>
    </div>
  );
};
export default Template4;
