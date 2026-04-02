import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getCalendars, deleteCalendar } from '../../services/calendar.service';
import { getImageUrl } from '../../services/upload.service';

const TYPE_LABEL = { template_1:'1 Page', template_2:'12 Page', template_3:'3 Page' };
const TYPE_ROUTE = { template_1:'template1', template_2:'template2', template_3:'template3' };

const AdminCalendars = () => {
  const navigate = useNavigate();
  const [calendars, setCalendars] = useState([]);
  const [filtered,  setFiltered]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await getCalendars();
      setCalendars(res.data);
      setFiltered(res.data);
    } catch { toast.error('Failed to load calendars.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  useEffect(() => {
    if (!search.trim()) { setFiltered(calendars); return; }
    const q = search.toLowerCase();
    setFiltered(calendars.filter(c =>
      c.usr_id?.includes(q) || c.uc_msg?.toLowerCase().includes(q)
    ));
  }, [search, calendars]);

  const handleDelete = async id => {
    if (!window.confirm('Delete this calendar permanently?')) return;
    try { await deleteCalendar(id); toast.success('Calendar deleted.'); fetch(); }
    catch (e) { toast.error(e.response?.data?.message || 'Delete failed.'); }
  };

  const handleGenerate = cal => {
    navigate(`/cal-design/${TYPE_ROUTE[cal.uc_calendar_type] || 'template1'}/${cal._id}`);
  };

  const fmt = d => d ? new Date(d).toLocaleDateString('en-IN') : '—';
  const imgs = csv => csv ? csv.split(',').map(s => s.trim()).filter(Boolean) : [];

  return (
    <div>
      <div className="admin-banner" style={{ marginBottom: 20 }}>
        <i className="bx bx-layout admin-banner-icon"></i>
        <div>
          <div className="admin-banner-title">All Calendars</div>
          <div className="admin-banner-sub">View and manage every calendar across all users</div>
        </div>
      </div>

      <div className="section-header">
        <span style={{ color:'var(--text-2)', fontSize:14 }}>
          {filtered.length} calendar{filtered.length !== 1 ? 's' : ''} found
        </span>
        <div className="search-bar" style={{ width: 280 }}>
          <input
            placeholder="Search by user ID or message…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button><i className="bi bi-search"></i></button>
        </div>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>User ID</th>
                <th>Message</th>
                <th>Type</th>
                <th>Date Range</th>
                <th>Events</th>
                <th>Images</th>
                <th>Header / Footer</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} style={{ textAlign:'center', padding:40 }}>
                  <div className="spinner" style={{ margin:'0 auto' }}></div>
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={9}>
                  <div className="empty-state">
                    <i className="bx bx-calendar-x"></i>
                    <p>No calendars found.</p>
                  </div>
                </td></tr>
              ) : filtered.map((cal, i) => {
                const images = imgs(cal.uc_img_csv);
                return (
                  <tr key={cal._id}>
                    <td style={{ color:'var(--text-3)', fontSize:12 }}>{i+1}</td>
                    <td>
                      <span style={{ fontFamily:'monospace', fontSize:13, background:'#f0f9ff', color:'#0369a1', padding:'2px 8px', borderRadius:6 }}>
                        {cal.usr_id}
                      </span>
                    </td>
                    <td style={{ maxWidth:140 }}>
                      <span style={{ fontWeight:500 }}>{cal.uc_msg || <span style={{ color:'var(--text-3)' }}>—</span>}</span>
                    </td>
                    <td>
                      <span className={`badge-${cal.uc_calendar_type==='template_1'?'t1':cal.uc_calendar_type==='template_2'?'t2':'t3'}`}>
                        {TYPE_LABEL[cal.uc_calendar_type]}
                      </span>
                    </td>
                    <td style={{ fontSize:12, whiteSpace:'nowrap', color:'var(--text-2)' }}>
                      {fmt(cal.uc_start_date)}<br/>{fmt(cal.uc_end_date)}
                    </td>
                    <td style={{ fontSize:12, color:'var(--text-2)', maxWidth:120 }}>
                      {cal.uc_event_details_csv
                        ? cal.uc_event_details_csv.split(',').slice(0,2).join(', ') + (cal.uc_event_details_csv.split(',').length > 2 ? '…' : '')
                        : '—'}
                    </td>
                    <td>
                      <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
                        {images.slice(0,3).map(fn => (
                          <img key={fn} src={getImageUrl(fn)} alt="" className="thumb"
                            onError={e => { e.target.style.opacity='0.2'; }} />
                        ))}
                        {images.length > 3 && (
                          <div style={{ width:52, height:52, background:'var(--bg)', borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, color:'var(--text-3)', border:'1px solid var(--border)' }}>
                            +{images.length - 3}
                          </div>
                        )}
                        {images.length === 0 && <span style={{ fontSize:12, color:'var(--text-3)' }}>No images</span>}
                      </div>
                    </td>
                    <td style={{ fontSize:12, maxWidth:130, color:'var(--text-2)' }}>
                      {cal.uc_page_header && <div>H: {cal.uc_page_header}</div>}
                      {cal.uc_page_footer && <div>F: {cal.uc_page_footer}</div>}
                      {!cal.uc_page_header && !cal.uc_page_footer && '—'}
                    </td>
                    <td>
                      <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
                        <div style={{ display:'flex', gap:5 }}>
                          <button className="btn-icon delete" onClick={() => handleDelete(cal._id)} title="Delete">
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                        <button className="gen-btn" onClick={() => handleGenerate(cal)}>
                          <i className="bi bi-eye"></i> View
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminCalendars;
