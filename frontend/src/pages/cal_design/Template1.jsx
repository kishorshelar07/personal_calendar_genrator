import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getCalendarById } from '../../services/calendar.service';
import { getImageUrl } from '../../services/upload.service';
import { getMonthDays, isEventDate, getEventLabel, generateCalendarData } from '../../utils/calendarHelper';

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

const MonthGrid = ({ year, month, monthName, dateCSV, detailCSV }) => {
  const days = getMonthDays(year, month);
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i+7));

  return (
    <div style={{ background:'rgba(255,255,255,0.92)', borderRadius:6, overflow:'hidden', border:'1px solid #ccc', breakInside:'avoid' }}>
      <div style={{ background:'mediumaquamarine', color:'#000', fontWeight:'bold', fontStyle:'italic', padding:'5px 8px', textAlign:'center', fontSize:13 }}>
        {monthName} {year}
      </div>
      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:11 }}>
        <thead>
          <tr>
            {DAYS.map((d,i) => (
              <th key={d} style={{ textAlign:'center', padding:'3px 1px', fontSize:10, fontWeight:700,
                color: i===5?'blue':i===6?'red':'#333', borderBottom:'1px solid #e5e7eb' }}>{d}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((wk,wi) => (
            <tr key={wi}>
              {wk.map((cell,ci) => {
                const ev = cell.isCurrentMonth && isEventDate(cell.date, dateCSV);
                return (
                  <td key={ci} style={{
                    textAlign:'center', padding:'2px 0', height:26, fontSize:11,
                    color: !cell.isCurrentMonth?'#ddd': ci===6?'red': ci===5?'blue':'#000',
                    background: ev?'rgba(107,114,128,0.3)':'transparent',
                    position:'relative'
                  }}>
                    {cell.isCurrentMonth ? cell.day : ''}
                    {ev && <span style={{ position:'absolute', top:1, right:1, fontSize:7, color:'red' }}>★</span>}
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
  const [cal, setCal]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getCalendarById(id).then(r => setCal(r.data)).catch(() => setError('Failed to load calendar.')).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="spinner"></div>;
  if (error)   return <div className="alert-error m-4">{error}</div>;

  const imgs    = cal.uc_img_csv ? cal.uc_img_csv.split(',').map(s=>s.trim()).filter(Boolean) : [];
  const months  = generateCalendarData(cal.uc_start_date, cal.uc_end_date);
  const dates   = cal.uc_date_event_csv?.split(',').map(s=>s.trim()).filter(Boolean) || [];
  const details = cal.uc_event_details_csv?.split(',').map(s=>s.trim()).filter(Boolean) || [];
  const year    = cal.uc_start_date ? new Date(cal.uc_start_date).getFullYear() : '';

  return (
    <div style={{ background:'#f0f0f0', minHeight:'100vh', padding:20 }}>
      <div className="hide-on-print" style={{ textAlign:'center', marginBottom:16 }}>
        <button className="btn-primary-custom" onClick={() => window.print()}>
          <i className="bi bi-printer me-2"></i>Print Calendar
        </button>
      </div>

      <div id="p1" style={{
        border:'2px solid #222', borderRadius:8, height:'17in', width:'12in',
        margin:'0 auto', padding:20, overflow:'hidden', display:'flex', flexDirection:'column',
        backgroundImage:`url('https://img.freepik.com/free-vector/green-leaf-shadow-frame-background_53876-116964.jpg')`,
        backgroundSize:'cover', backgroundPosition:'center'
      }}>
        {/* Top Row */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
          <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:28, fontWeight:800, margin:0 }}>{year}</h2>
          <p style={{ margin:0, fontWeight:'bold', fontStyle:'italic', fontSize:26, color:'#333' }}>{cal.uc_page_header}</p>
        </div>

        {/* Images */}
        <div style={{ display:'flex', gap:10, justifyContent:'center', marginBottom:12 }}>
          {[0,1,2].map(i => (
            imgs[i]
              ? <img key={i} src={getImageUrl(imgs[i])} alt="" style={{ height:280, width:250, objectFit:'cover', borderRadius:6, border:'2px solid #aaa' }} />
              : <div key={i} style={{ height:280, width:250, background:'rgba(255,255,255,0.4)', borderRadius:6, border:'2px dashed #ccc', display:'flex', alignItems:'center', justifyContent:'center', color:'#999', fontSize:13 }}>No Image</div>
          ))}
        </div>

        {/* Message */}
        <div style={{ textAlign:'center', fontSize:20, fontWeight:'bold', fontFamily:'"Archivo Black",sans-serif', textShadow:'3px 2px 2px rgba(128,117,23,.8)', marginBottom:10, color:'#333' }}>
          {cal.uc_msg}
        </div>

        {/* Calendar Grid */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, flex:1 }}>
          {months.slice(0,12).map(({ year:y, month:m, monthName }) => (
            <MonthGrid key={`${y}-${m}`} year={y} month={m} monthName={monthName}
              dateCSV={cal.uc_date_event_csv} detailCSV={cal.uc_event_details_csv} />
          ))}
        </div>

        {/* Footer */}
        <div style={{ marginTop:10, paddingTop:8, borderTop:'1px solid rgba(0,0,0,.15)' }}>
          {dates.length > 0 && (
            <div style={{ fontSize:12, marginBottom:6, display:'flex', flexWrap:'wrap', gap:12 }}>
              {dates.map((d,i) => (
                <span key={i} style={{ color:'#555' }}>
                  <strong>{d.replace(/\//g,'-')}</strong> — {details[i] || ''}
                </span>
              ))}
            </div>
          )}
          <p style={{ textAlign:'center', fontWeight:'bold', fontSize:16, margin:0, color:'#333' }}>
            {cal.uc_page_footer}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Template1;
