import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getUserStats } from '../../services/user.service';
import { getCalendarStats } from '../../services/calendar.service';

const StatCard = ({ icon, value, label, color, sub }) => (
  <div className="stat-card">
    <div className="stat-icon" style={{ background:`${color}18`, color }}>
      <i className={icon}></i>
    </div>
    <div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {sub && <div style={{ fontSize:11, color:'var(--text-3)', marginTop:2 }}>{sub}</div>}
    </div>
  </div>
);

const AdminDashboard = () => {
  const [uStats, setUStats] = useState(null);
  const [cStats, setCStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getUserStats(), getCalendarStats()])
      .then(([u, c]) => { setUStats(u.data); setCStats(c.data); })
      .finally(() => setLoading(false));
  }, []);

  const typeMap = { template_1:'1 Page', template_2:'12 Page', template_3:'3 Page' };

  return (
    <div>
      {/* Admin Banner */}
      <div className="admin-banner">
        <div className="admin-banner-icon"><i className="bx bx-shield-quarter"></i></div>
        <div>
          <div className="admin-banner-title">Admin Control Panel</div>
          <div className="admin-banner-sub">Full system overview — manage users, calendars, and more</div>
        </div>
      </div>

      {loading ? <div className="spinner" /> : (
        <>
          {/* User Stats */}
          <h3 style={{ fontFamily:'Syne,sans-serif', fontSize:15, fontWeight:700, marginBottom:14, color:'var(--text-2)' }}>
            <i className="bx bx-group me-2"></i>User Statistics
          </h3>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:14, marginBottom:28 }}>
            <StatCard icon="bx bx-group"       value={uStats?.total}    label="Total Users"    color="#3b82f6" />
            <StatCard icon="bx bx-check-circle" value={uStats?.active}   label="Active Users"   color="#22c55e" sub="Can login" />
            <StatCard icon="bx bx-x-circle"     value={uStats?.inactive} label="Inactive Users" color="#ef4444" sub="Pending activation" />
            <StatCard icon="bx bx-shield"       value={uStats?.admins}   label="Admins"         color="#8b5cf6" />
          </div>

          {/* Calendar Stats */}
          <h3 style={{ fontFamily:'Syne,sans-serif', fontSize:15, fontWeight:700, marginBottom:14, color:'var(--text-2)' }}>
            <i className="bx bx-calendar me-2"></i>Calendar Statistics
          </h3>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:14, marginBottom:28 }}>
            <StatCard icon="bx bx-calendar-alt" value={cStats?.total} label="Total Calendars" color="#f97316" />
            {cStats?.byType?.map(t => (
              <StatCard key={t._id}
                icon="bx bx-layer"
                value={t.count}
                label={typeMap[t._id] || t._id}
                color={t._id==='template_1'?'#22c55e':t._id==='template_2'?'#3b82f6':'#8b5cf6'}
              />
            ))}
          </div>

          {/* Recent Activity */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
            {/* Recent Users */}
            <div className="card">
              <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:15 }}>Recent Registrations</span>
                <Link to="/admin/users" style={{ fontSize:12, color:'var(--purple)' }}>View all →</Link>
              </div>
              {uStats?.recentUsers?.map(u => (
                <div key={u.usr_id} style={{ padding:'11px 20px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width:32, height:32, borderRadius:'50%', background:'#ede9fe', color:'#6d28d9', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:13 }}>
                      {u.usr_name[0].toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight:500, fontSize:13 }}>{u.usr_name}</div>
                      <div style={{ fontSize:11, color:'var(--text-3)' }}>{u.usr_id}</div>
                    </div>
                  </div>
                  <span className={u.usr_status === 1 ? 'badge-active' : 'badge-inactive'}>
                    {u.usr_status === 1 ? 'Active' : 'Inactive'}
                  </span>
                </div>
              ))}
            </div>

            {/* Recent Calendars */}
            <div className="card">
              <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:15 }}>Recent Calendars</span>
                <Link to="/admin/calendars" style={{ fontSize:12, color:'var(--purple)' }}>View all →</Link>
              </div>
              {cStats?.recent?.map(c => (
                <div key={c._id} style={{ padding:'11px 20px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div>
                    <div style={{ fontWeight:500, fontSize:13 }}>{c.uc_msg || 'Untitled'}</div>
                    <div style={{ fontSize:11, color:'var(--text-3)' }}>{c.usr_id}</div>
                  </div>
                  <span className={`badge-${c.uc_calendar_type==='template_1'?'t1':c.uc_calendar_type==='template_2'?'t2':'t3'}`}>
                    {typeMap[c.uc_calendar_type]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
