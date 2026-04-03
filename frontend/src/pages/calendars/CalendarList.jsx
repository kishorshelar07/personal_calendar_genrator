import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getCalendars, addCalendar, updateCalendar, deleteCalendar } from '../../services/calendar.service';
import { uploadImages, deleteImage, getImageUrl } from '../../services/upload.service';
import { useAuth } from '../../context/AuthContext';

const TYPE_LABEL = { template_1:'1 Page', template_2:'12 Page', template_3:'3 Page' };
const TYPE_ROUTE = { template_1:'template1', template_2:'template2', template_3:'template3' };

const EMPTY_FORM = {
  usr_id:'', uc_msg:'', uc_date_event_csv:'', uc_event_details_csv:'',
  uc_num_page:1, uc_start_date:'', uc_end_date:'',
  uc_calendar_type:'template_1', uc_page_header:'', uc_page_footer:'', uc_remarks:''
};

// ── Reusable field components defined OUTSIDE any other component
// so React doesn't re-create them on parent re-render (focus bug fix)
const FormLabel = ({ children }) => (
  <label className="form-label">{children}</label>
);

const FormInput = ({ value, onChange, ...rest }) => (
  <input className="form-control-custom" value={value} onChange={onChange} {...rest} />
);

const FormSelect = ({ value, onChange, children, ...rest }) => (
  <select className="form-control-custom" value={value} onChange={onChange} {...rest}>
    {children}
  </select>
);

// ─────────────────────────────────────────────────────────────
// Calendar Add / Edit Modal
// ─────────────────────────────────────────────────────────────
const CalModal = ({ mode, data, userId, onSave, onClose }) => {
  const isEdit = mode === 'edit';
  const [form, setForm]       = useState({ ...EMPTY_FORM, usr_id: userId });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [newDate, setNewDate] = useState('');

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    if (isEdit && data) {
      setForm({
        ...EMPTY_FORM, ...data,
        uc_start_date: data.uc_start_date?.substring(0,10) || '',
        uc_end_date:   data.uc_end_date?.substring(0,10)   || '',
      });
    } else {
      setForm({ ...EMPTY_FORM, usr_id: userId });
    }
  }, [mode, data]);

  const addDate = () => {
    if (!newDate) return;
    const formatted = newDate.replace(/-/g, '/');
    const existing = form.uc_date_event_csv
      ? form.uc_date_event_csv.split(',').map(d => d.trim()).filter(Boolean)
      : [];
    if (!existing.includes(formatted)) {
      setForm(f => ({ ...f, uc_date_event_csv: [...existing, formatted].join(', ') }));
    }
    setNewDate('');
  };

  const handleSubmit = async e => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      isEdit ? await updateCalendar(data._id, form) : await addCalendar(form);
      toast.success(`Calendar ${isEdit ? 'updated' : 'created'}!`);
      onSave();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed.');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 700 }}>
        <div className="modal-header">
          <span className="modal-title">
            <i className="bx bx-calendar-plus" style={{ color:'var(--blue)' }}></i>
            {isEdit ? 'Edit Calendar' : 'Create New Calendar'}
          </span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="alert-error"><i className="bi bi-exclamation-circle me-2"/>{error}</div>}

            <div className="form-row">
              <div className="form-group">
                <FormLabel>User ID</FormLabel>
                <FormInput value={form.usr_id} onChange={set('usr_id')} disabled />
              </div>
              <div className="form-group">
                <FormLabel>Message / Title</FormLabel>
                <FormInput
                  value={form.uc_msg}
                  onChange={set('uc_msg')}
                  placeholder="e.g. Family Calendar 2025"
                  maxLength={100}
                />
              </div>
            </div>

            <div className="form-group">
              <FormLabel>Event Dates — pick a date then click Add</FormLabel>
              <div style={{ display:'flex', gap:8, marginBottom:6 }}>
                <input
                  type="date"
                  className="form-control-custom"
                  style={{ flex:1 }}
                  value={newDate}
                  onChange={e => setNewDate(e.target.value)}
                />
                <button type="button" className="btn-primary-custom" onClick={addDate}>
                  + Add
                </button>
              </div>
              <FormInput
                value={form.uc_date_event_csv}
                onChange={set('uc_date_event_csv')}
                placeholder="2025/01/01, 2025/08/15 …"
              />
            </div>

            <div className="form-group">
              <FormLabel>Event Labels (comma-separated, same order as dates)</FormLabel>
              <FormInput
                value={form.uc_event_details_csv}
                onChange={set('uc_event_details_csv')}
                placeholder="New Year, Independence Day …"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <FormLabel>Start Date</FormLabel>
                <FormInput type="date" value={form.uc_start_date} onChange={set('uc_start_date')} />
              </div>
              <div className="form-group">
                <FormLabel>End Date</FormLabel>
                <FormInput type="date" value={form.uc_end_date} onChange={set('uc_end_date')} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <FormLabel>Calendar Type</FormLabel>
                <FormSelect value={form.uc_calendar_type} onChange={set('uc_calendar_type')}>
                  <option value="template_1">Template 1 — 1 Page (all months)</option>
                  <option value="template_2">Template 2 — 12 Pages (one/month)</option>
                  <option value="template_3">Template 3 — 3 Pages (4 months/page)</option>
                </FormSelect>
              </div>
              <div className="form-group">
                <FormLabel>Number of Pages</FormLabel>
                <FormSelect value={form.uc_num_page} onChange={set('uc_num_page')}>
                  <option value={1}>1</option>
                  <option value={3}>3</option>
                  <option value={12}>12</option>
                </FormSelect>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <FormLabel>Page Header</FormLabel>
                <FormInput
                  value={form.uc_page_header}
                  onChange={set('uc_page_header')}
                  placeholder="Header text"
                  maxLength={100}
                />
              </div>
              <div className="form-group">
                <FormLabel>Page Footer</FormLabel>
                <FormInput
                  value={form.uc_page_footer}
                  onChange={set('uc_page_footer')}
                  placeholder="Footer text"
                  maxLength={100}
                />
              </div>
            </div>

            <div className="form-group">
              <FormLabel>Remarks</FormLabel>
              <FormInput
                value={form.uc_remarks}
                onChange={set('uc_remarks')}
                placeholder="Internal notes"
                maxLength={100}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button" onClick={onClose}
              style={{ padding:'9px 20px', borderRadius:8, border:'1px solid var(--border)', background:'none', cursor:'pointer', fontFamily:'Outfit,sans-serif', fontSize:14 }}
            >
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary-custom">
              {loading ? 'Saving…' : isEdit ? 'Update Calendar' : 'Create Calendar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Image Manager Modal
// ─────────────────────────────────────────────────────────────
const ImgModal = ({ calendar, onClose, onRefresh }) => {
  const [images, setImages]     = useState(
    calendar?.uc_img_csv ? calendar.uc_img_csv.split(',').map(s=>s.trim()).filter(Boolean) : []
  );
  const [files,     setFiles]     = useState([]);
  const [previews,  setPreviews]  = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error,     setError]     = useState('');
  const fileRef = useRef(null);

  const handleSelect = e => {
    const selected = Array.from(e.target.files);
    const rem = 24 - images.length;
    if (selected.length > rem) { setError(`Only ${rem} more image(s) allowed.`); return; }
    setError('');
    setFiles(selected);
    const prevs = [];
    selected.forEach(f => {
      const r = new FileReader();
      r.onload = ev => {
        prevs.push(ev.target.result);
        if (prevs.length === selected.length) setPreviews([...prevs]);
      };
      r.readAsDataURL(f);
    });
  };

  const handleUpload = async () => {
    if (!files.length) { setError('Please select at least one image.'); return; }
    setUploading(true); setError('');
    try {
      const fd = new FormData();
      files.forEach(f => fd.append('images', f));
      const res = await uploadImages(fd, calendar._id);
      const updated = res.data.updated_uc_img_csv
        ? res.data.updated_uc_img_csv.split(',').map(s=>s.trim()).filter(Boolean)
        : [...images, ...res.data.uploaded_files];
      setImages(updated);
      setFiles([]); setPreviews([]);
      if (fileRef.current) fileRef.current.value = '';
      toast.success(`${res.data.uploaded_files.length} image(s) uploaded!`);
      onRefresh();
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally { setUploading(false); }
  };

  const handleDelete = async filename => {
    if (!window.confirm('Remove this image?')) return;
    try {
      await deleteImage(filename, calendar._id);
      setImages(imgs => imgs.filter(i => i !== filename));
      toast.success('Image removed.');
      onRefresh();
    } catch { toast.error('Failed to remove image.'); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 720 }}>
        <div className="modal-header">
          <span className="modal-title">
            <i className="bi bi-images" style={{ color:'var(--blue)' }}></i>
            &nbsp;Manage Images — {images.length} / 24
          </span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {images.length > 0 ? (
            <div style={{ display:'flex', gap:10, overflowX:'auto', paddingBottom:10, marginBottom:16 }}>
              {images.map(fn => (
                <div key={fn} style={{ position:'relative', flexShrink:0 }}>
                  <img
                    src={getImageUrl(fn)} alt={fn}
                    style={{ width:130, height:130, objectFit:'cover', borderRadius:8, border:'1px solid var(--border)' }}
                    onError={e => { e.target.style.opacity='0.2'; }}
                  />
                  <button
                    onClick={() => handleDelete(fn)}
                    title="Remove image"
                    style={{ position:'absolute', top:4, right:4, width:22, height:22, borderRadius:'50%', background:'#ef4444', color:'#fff', border:'none', cursor:'pointer', fontSize:13, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700 }}
                  >✕</button>
                  <div style={{ fontSize:10, color:'var(--text-3)', marginTop:3, maxWidth:130, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {fn}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign:'center', padding:'24px 0', color:'var(--text-3)', marginBottom:16, background:'var(--bg)', borderRadius:8 }}>
              <i className="bi bi-image" style={{ fontSize:32, display:'block', marginBottom:8 }}></i>
              No images uploaded yet
            </div>
          )}

          {images.length < 24 && (
            <div style={{ borderTop:'1px solid var(--border)', paddingTop:16 }}>
              <p style={{ fontSize:13, fontWeight:500, color:'var(--text-2)', marginBottom:10 }}>
                Upload New Images &nbsp;
                <span style={{ color:'var(--text-3)', fontWeight:400 }}>
                  (max {24 - images.length} more, JPEG/PNG, up to 10MB each)
                </span>
              </p>
              {error && <div className="alert-error" style={{ marginBottom:12 }}>{error}</div>}
              <input
                ref={fileRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/jpg,image/webp"
                onChange={handleSelect}
                style={{ marginBottom:12, width:'100%', fontSize:14 }}
              />
              {previews.length > 0 && (
                <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:12 }}>
                  {previews.map((src,i) => (
                    <img key={i} src={src} alt=""
                      style={{ width:70, height:70, objectFit:'cover', borderRadius:6, border:'1px solid var(--border)' }}
                    />
                  ))}
                </div>
              )}
              <button
                className="btn-primary-custom"
                onClick={handleUpload}
                disabled={uploading || !files.length}
              >
                {uploading
                  ? <><span style={{ width:14,height:14,borderRadius:'50%',border:'2px solid rgba(255,255,255,.3)',borderTopColor:'#fff',display:'inline-block',animation:'spin .7s linear infinite',marginRight:8 }}></span>Uploading…</>
                  : <><i className="bi bi-cloud-upload me-2"></i>Upload {files.length > 0 ? `${files.length} Image(s)` : 'Images'}</>
                }
              </button>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn-primary-custom" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Main CalendarList page
// ─────────────────────────────────────────────────────────────
const CalendarList = () => {
  const { user }  = useAuth();
  const navigate  = useNavigate();
  const [calendars, setCalendars] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [modal,     setModal]     = useState(null);
  const [selCal,    setSelCal]    = useState(null);
  const [imgCal,    setImgCal]    = useState(null);

  const fetch = async () => {
    setLoading(true);
    try { const r = await getCalendars(); setCalendars(r.data); }
    catch { toast.error('Failed to load calendars.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const handleDelete = async id => {
    if (!window.confirm('Delete this calendar?')) return;
    try { await deleteCalendar(id); toast.success('Deleted.'); fetch(); }
    catch (e) { toast.error(e.response?.data?.message || 'Delete failed.'); }
  };

  const fmt  = d => d ? new Date(d).toLocaleDateString('en-IN') : '—';
  const imgs = csv => csv ? csv.split(',').map(s=>s.trim()).filter(Boolean) : [];

  const displayed = search.trim()
    ? calendars.filter(c =>
        c.usr_id?.includes(search) ||
        c.uc_msg?.toLowerCase().includes(search.toLowerCase())
      )
    : calendars;

  return (
    <div>
      {/* Banner */}
      <div style={{ background:'linear-gradient(135deg,#0369a1,#3b82f6)', borderRadius:'var(--radius)', padding:'22px 28px', marginBottom:24, color:'#fff', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div>
          <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:22, fontWeight:700, margin:0 }}>My Calendars</h2>
          <p style={{ margin:'4px 0 0', opacity:.8, fontSize:13 }}>Create and generate beautiful calendars</p>
        </div>
        <button
          className="btn-primary-custom"
          style={{ background:'rgba(255,255,255,.2)', backdropFilter:'blur(4px)', border:'1px solid rgba(255,255,255,.3)' }}
          onClick={() => { setSelCal(null); setModal('add'); }}
        >
          <i className="bi bi-plus-lg"></i> New Calendar
        </button>
      </div>

      {/* Search */}
      <div style={{ marginBottom:16, display:'flex', justifyContent:'flex-end' }}>
        <div className="search-bar" style={{ width:260 }}>
          <input
            placeholder="Search calendars…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button><i className="bi bi-search"></i></button>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ overflow:'hidden' }}>
        <div style={{ overflowX:'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th><th>Message</th><th>Type</th><th>Date Range</th>
                <th>Events</th><th>Images</th><th>Header / Footer</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ textAlign:'center', padding:40 }}>
                  <div className="spinner" style={{ margin:'0 auto' }}></div>
                </td></tr>
              ) : displayed.length === 0 ? (
                <tr><td colSpan={8}>
                  <div className="empty-state">
                    <i className="bx bx-calendar-x"></i>
                    <p>No calendars yet. Create your first one!</p>
                  </div>
                </td></tr>
              ) : displayed.map((cal, i) => {
                const calImgs = imgs(cal.uc_img_csv);
                return (
                  <tr key={cal._id}>
                    <td style={{ color:'var(--text-3)', fontSize:12 }}>{i+1}</td>
                    <td>
                      <div style={{ fontWeight:500 }}>{cal.uc_msg || <span style={{ color:'var(--text-3)' }}>Untitled</span>}</div>
                      {cal.uc_remarks && <div style={{ fontSize:11, color:'var(--text-3)', marginTop:2 }}>{cal.uc_remarks}</div>}
                    </td>
                    <td>
                      <span className={`badge-${cal.uc_calendar_type==='template_1'?'t1':cal.uc_calendar_type==='template_2'?'t2':'t3'}`}>
                        {TYPE_LABEL[cal.uc_calendar_type]}
                      </span>
                    </td>
                    <td style={{ fontSize:12, color:'var(--text-2)', whiteSpace:'nowrap' }}>
                      {fmt(cal.uc_start_date)} →<br/>{fmt(cal.uc_end_date)}
                    </td>
                    <td style={{ fontSize:12, color:'var(--text-2)', maxWidth:130 }}>
                      {cal.uc_event_details_csv
                        ? cal.uc_event_details_csv.split(',').slice(0,2).join(', ')
                          + (cal.uc_event_details_csv.split(',').length > 2 ? '…' : '')
                        : '—'}
                    </td>
                    <td>
                      <div style={{ display:'flex', gap:4, alignItems:'center', flexWrap:'wrap' }}>
                        {calImgs.slice(0,3).map(fn => (
                          <img key={fn} src={getImageUrl(fn)} alt="" className="thumb"
                            onError={e => { e.target.style.opacity='.2'; }} />
                        ))}
                        {calImgs.length > 3 && (
                          <span style={{ fontSize:11, color:'var(--text-3)' }}>+{calImgs.length-3}</span>
                        )}
                        <button
                          className="btn-icon"
                          style={{ color:'var(--blue)', borderColor:'var(--blue)' }}
                          onClick={() => setImgCal(cal)}
                          title="Manage Images"
                        >
                          <i className="bi bi-cloud-upload"></i>
                        </button>
                      </div>
                    </td>
                    <td style={{ fontSize:12, color:'var(--text-2)' }}>
                      {cal.uc_page_header && <div>H: {cal.uc_page_header}</div>}
                      {cal.uc_page_footer && <div>F: {cal.uc_page_footer}</div>}
                      {!cal.uc_page_header && !cal.uc_page_footer && '—'}
                    </td>
                    <td>
                      <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
                        <div style={{ display:'flex', gap:5 }}>
                          <button className="btn-icon edit" title="Edit"
                            onClick={() => { setSelCal(cal); setModal('edit'); }}>
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button className="btn-icon delete" title="Delete"
                            onClick={() => handleDelete(cal._id)}>
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                        <button
                          className="gen-btn"
                          onClick={() => navigate(`/cal-design/${TYPE_ROUTE[cal.uc_calendar_type] || 'template1'}/${cal._id}`)}
                        >
                          <i className="bi bi-calendar3"></i> Generate
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

      {/* Modals */}
      {modal && (
        <CalModal
          mode={modal}
          data={selCal}
          userId={user?.usr_id}
          onSave={() => { setModal(null); fetch(); }}
          onClose={() => setModal(null)}
        />
      )}
      {imgCal && (
        <ImgModal
          calendar={imgCal}
          onClose={() => setImgCal(null)}
          onRefresh={fetch}
        />
      )}
    </div>
  );
};

export default CalendarList;
