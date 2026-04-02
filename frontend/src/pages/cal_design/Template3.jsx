import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getCalendarById } from '../../services/calendar.service';
import { getImageUrl } from '../../services/upload.service';
import { getMonthDays, isEventDate, getEventLabel, generateCalendarData, splitIntoChunks } from '../../utils/calendarHelper';

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

const ZoomImg3 = ({ src }) => {
  const [scale,setScale]=useState(1);
  const [pos,setPos]=useState({x:50,y:50});
  const drag=useRef(false); const last=useRef({x:0,y:0}); const ref=useRef(null);
  const onDown=e=>{drag.current=true;last.current={x:e.clientX,y:e.clientY};e.preventDefault();};
  const onUp=()=>{drag.current=false;};
  const onMove=e=>{
    if(!drag.current||!ref.current)return;
    const r=ref.current.getBoundingClientRect();
    setPos(p=>({x:Math.min(100,Math.max(0,p.x+((e.clientX-last.current.x)/r.width)*100)),y:Math.min(100,Math.max(0,p.y+((e.clientY-last.current.y)/r.height)*100))}));
    last.current={x:e.clientX,y:e.clientY};
  };
  return (
    <div style={{position:'relative'}}>
      <div ref={ref} onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
        style={{height:'5.5in',overflow:'hidden',cursor:'move',userSelect:'none',background:'#e5e7eb'}}>
        <img src={src} draggable={false} onError={e=>{e.target.style.opacity='.15';}}
          style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:`${pos.x}% ${pos.y}%`,transform:`scale(${scale})`,transformOrigin:`${pos.x}% ${pos.y}%`}}/>
      </div>
      <div className="hide-on-print" style={{position:'absolute',top:8,right:8,display:'flex',gap:4}}>
        {[['+',()=>setScale(s=>Math.min(3,s+.15))],['-',()=>setScale(s=>Math.max(.5,s-.15))]].map(([lbl,fn],i)=>(
          <button key={i} onClick={fn} style={{width:30,height:30,borderRadius:6,border:'none',background:'rgba(255,255,255,.9)',cursor:'pointer',fontWeight:700,fontSize:16,boxShadow:'0 1px 3px rgba(0,0,0,.2)'}}>
            {lbl}
          </button>
        ))}
      </div>
    </div>
  );
};

const SmallMonth = ({ year, month, monthName, dateCSV, detailCSV }) => {
  const days=getMonthDays(year,month);
  const weeks=[]; for(let i=0;i<days.length;i+=7)weeks.push(days.slice(i,i+7));
  return (
    <div style={{background:'rgba(255,255,255,.88)',borderRadius:6,overflow:'hidden',border:'1px solid #ccc'}}>
      <div style={{fontSize:22,fontWeight:'bold',textAlign:'center',background:'mediumaquamarine',padding:'4px 0',color:'#000'}}>
        {monthName} {year}
      </div>
      <table style={{width:'100%',borderCollapse:'collapse'}}>
        <thead>
          <tr>
            {DAYS.map((d,i)=>(
              <th key={d} style={{background:'paleturquoise',fontSize:16,textAlign:'center',padding:'2px 0',color:i===5?'blue':i===6?'red':'#000',fontWeight:'normal'}}>{d}</th>
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
                  <td key={ci} style={{textAlign:'center',fontSize:18,height:36,verticalAlign:'top',paddingTop:2,
                    color:!cell.isCurrentMonth?'#ddd':ci===6?'red':ci===5?'blue':'#000',
                    background:ev?'rgba(107,114,128,.25)':'transparent'}}>
                    {cell.isCurrentMonth?cell.day:''}
                    {ev&&<><i className="fas fa-birthday-cake" style={{fontSize:10,color:'red',display:'block'}}/><span style={{fontSize:9,color:'green'}}>{lbl}</span></>}
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

const PageBlock = ({ chunk, imgSrc, msg, header }) => {
  const year = chunk[0]?.year || '';
  return (
    <div style={{
      height:'15in', width:'100%', border:'5px solid #008080', borderRadius:10,
      background:'white', marginBottom:10, overflow:'hidden', display:'flex', flexDirection:'column',
      pageBreakAfter:'always', breakAfter:'page',
      backgroundImage:`url('https://img.freepik.com/premium-vector/abstract-template-with-plants-flowers-bauhaus-floral-background-with-geometric-shapes_868719-660.jpg')`,
      backgroundSize:'cover', backgroundPosition:'center'
    }}>
      {/* Header row */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 24px',background:'rgba(255,255,255,.88)'}}>
        <h2 style={{margin:0,fontSize:28,fontWeight:700}}>{header||'CalendarPro'}</h2>
        <h2 style={{margin:0,fontSize:28,fontWeight:700}}>{year}</h2>
      </div>

      {/* Image */}
      {imgSrc ? <ZoomImg3 src={imgSrc}/> : (
        <div style={{height:'5.5in',background:'rgba(240,240,240,.7)',display:'flex',alignItems:'center',justifyContent:'center',color:'#bbb',fontSize:16}}>No Image</div>
      )}

      {/* Message */}
      <div style={{textAlign:'center',fontSize:20,padding:'6px',background:'rgba(255,255,255,.8)',color:'#333',fontWeight:500}}>{msg}</div>

      {/* 4-month grid */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,padding:14,flex:1,background:'rgba(255,255,255,.7)'}}>
        {chunk.map(({year:y,month:m,monthName})=>(
          <SmallMonth key={`${y}-${m}`} year={y} month={m} monthName={monthName} dateCSV="" detailCSV="" />
        ))}
      </div>
    </div>
  );
};

const Template3 = () => {
  const { id } = useParams();
  const [cal,setCal]=useState(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');

  useEffect(()=>{
    getCalendarById(id).then(r=>setCal(r.data)).catch(()=>setError('Failed to load.')).finally(()=>setLoading(false));
  },[id]);

  if(loading)return <div className="spinner"></div>;
  if(error)  return <div className="alert-error m-4">{error}</div>;

  const imgs  = cal.uc_img_csv?cal.uc_img_csv.split(',').map(s=>s.trim()).filter(Boolean):[];
  const months= generateCalendarData(cal.uc_start_date, cal.uc_end_date);
  const pages = splitIntoChunks(months, 4);

  return (
    <div style={{background:'#f0f0f0',minHeight:'100vh',padding:20}}>
      <div className="hide-on-print" style={{textAlign:'center',marginBottom:16}}>
        <button className="btn-primary-custom" onClick={()=>window.print()}>
          <i className="bi bi-printer me-2"></i>Print Calendar
        </button>
      </div>
      {pages.map((chunk,i)=>(
        <PageBlock key={i} chunk={chunk}
          imgSrc={imgs[i]?getImageUrl(imgs[i]):null}
          msg={cal.uc_msg} header={cal.uc_page_header}/>
      ))}
    </div>
  );
};

export default Template3;
