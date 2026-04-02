import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getUsers }     from '../../services/user.service';
import { getCalendars } from '../../services/calendar.service';
import { useAuth } from '../../context/AuthContext';

const StatCard = ({ icon, value, label, color }) => (
  <div className="stat-card">
    <div className="stat-icon" style={{ background: `${color}18`, color }}>
      <i className={icon}></i>
    </div>
    <div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [calendars, setCalendars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCalendars()
      .then(r => setCalendars(r.data))
      .finally(() => setLoading(false));
  }, []);

  const typeLabel = { template_1:'1 Page', template_2:'12 Page', template_3:'3 Page' };

  return (
    <div>
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
        borderRadius: 'var(--radius)', padding: '28px 32px',
        color: '#fff', marginBottom: 28, display: 'flex',
        alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div>
          <div style={{ fontSize:13, opacity:.8, marginBottom:4 }}>
            {new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
          </div>
          <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:26, fontWeight:700, margin:0 }}>
            Welcome back, {user?.usr_name?.split(' ')[0]}! 👋
          </h2>
          <p style={{ opacity:.8, marginTop:6, marginBottom:0, fontSize:14 }}>
            Manage and generate your personal calendars
          </p>
        </div>
        <i className="bx bx-calendar-star" style={{ fontSize:64, opacity:.2 }}></i>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:16, marginBottom:28 }}>
        <StatCard icon="bx bx-calendar-alt" value={loading ? '…' : calendars.length} label="My Calendars" color="#3b82f6" />
        <StatCard icon="bx bx-layer" value={loading ? '…' : calendars.filter(c=>c.uc_calendar_type==='template_1').length} label="1-Page Calendars" color="#22c55e" />
        <StatCard icon="bx bx-book-open" value={loading ? '…' : calendars.filter(c=>c.uc_calendar_type==='template_2').length} label="12-Page Calendars" color="#f97316" />
        <StatCard icon="bx bx-spreadsheet" value={loading ? '…' : calendars.filter(c=>c.uc_calendar_type==='template_3').length} label="3-Page Calendars" color="#8b5cf6" />
      </div>

      {/* Recent Calendars */}
      <div className="card">
        <div style={{ padding:'20px 24px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <h3 style={{ fontFamily:'Syne,sans-serif', fontSize:16, fontWeight:700, margin:0 }}>Recent Calendars</h3>
          <Link to="/calendars" style={{ fontSize:13, color:'var(--blue)', fontWeight:500 }}>View all →</Link>
        </div>
        <div style={{ padding: '8px 0' }}>
          {loading ? (
            <div className="spinner" />
          ) : calendars.length === 0 ? (
            <div className="empty-state">
              <i className="bx bx-calendar-x"></i>
              <p>No calendars yet. <Link to="/calendars">Create one!</Link></p>
            </div>
          ) : calendars.slice(0, 5).map(cal => (
            <div key={cal._id} style={{
              display:'flex', alignItems:'center', justifyContent:'space-between',
              padding:'12px 24px', borderBottom:'1px solid var(--border)'
            }}>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:36, height:36, borderRadius:8, background:'#f0f9ff', color:'var(--blue)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>
                  <i className="bx bx-calendar"></i>
                </div>
                <div>
                  <div style={{ fontWeight:500, fontSize:14 }}>{cal.uc_msg || 'Untitled Calendar'}</div>
                  <div style={{ fontSize:12, color:'var(--text-3)', marginTop:2 }}>
                    {cal.uc_start_date ? new Date(cal.uc_start_date).toLocaleDateString('en-IN') : '—'}
                    {' → '}
                    {cal.uc_end_date ? new Date(cal.uc_end_date).toLocaleDateString('en-IN') : '—'}
                  </div>
                </div>
              </div>
              <span className={`badge-${cal.uc_calendar_type === 'template_1' ? 't1' : cal.uc_calendar_type === 'template_2' ? 't2' : 't3'}`}>
                {typeLabel[cal.uc_calendar_type] || cal.uc_calendar_type}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
