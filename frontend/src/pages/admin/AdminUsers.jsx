import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getUsers, addUser, updateUser, deleteUser, toggleStatus, searchUsers } from '../../services/user.service';

// ── All field helpers defined OUTSIDE Modal so React doesn't recreate
// them on every keystroke (this was causing the focus-loss bug)
const FL = ({ children }) => <label className="form-label">{children}</label>;

const FI = ({ value, onChange, ...rest }) => (
  <input className="form-control-custom" value={value} onChange={onChange} {...rest} />
);

const FS = ({ value, onChange, children, ...rest }) => (
  <select className="form-control-custom" value={value} onChange={onChange} {...rest}>
    {children}
  </select>
);

const EMPTY = {
  usr_id:'', usr_name:'', usr_pass:'', usr_status:0,
  usr_type:'User', usr_dob:'', usr_email:'', usr_gender:'', usr_remarks:''
};

// ─────────────────────────────────────────────────────────────
// Add / Edit User Modal
// ─────────────────────────────────────────────────────────────
const UserModal = ({ mode, data, onSave, onClose }) => {
  const isEdit = mode === 'edit';
  const [form,    setForm]    = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    if (isEdit && data) {
      setForm({ ...EMPTY, ...data, usr_pass:'', usr_dob: data.usr_dob?.substring(0,10) || '' });
    } else {
      setForm(EMPTY);
    }
  }, [mode, data]);

  const handleSubmit = async e => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      if (!isEdit && !/^\d{10}$/.test(form.usr_id))
        throw new Error('Mobile number must be exactly 10 digits.');

      const payload = { ...form };
      if (isEdit) {
        delete payload.usr_id;
        if (!payload.usr_pass?.trim()) delete payload.usr_pass;
      }
      isEdit ? await updateUser(data.usr_id, payload) : await addUser(payload);
      toast.success(`User ${isEdit ? 'updated' : 'created'} successfully!`);
      onSave();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Operation failed.');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <span className="modal-title" style={{ color:'var(--admin-accent)' }}>
            <i className="bx bx-user-plus me-2"></i>
            {isEdit ? 'Edit User' : 'Add New User'}
          </span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="alert-error"><i className="bi bi-exclamation-circle me-2"/>{error}</div>}

            <div className="form-row">
              <div className="form-group">
                <FL>Mobile Number (ID) *</FL>
                <FI
                  value={form.usr_id} onChange={set('usr_id')}
                  placeholder="10-digit number"
                  maxLength={10} disabled={isEdit} required={!isEdit}
                />
              </div>
              <div className="form-group">
                <FL>Full Name *</FL>
                <FI value={form.usr_name} onChange={set('usr_name')} maxLength={35} required />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <FL>{isEdit ? 'New Password (blank = keep existing)' : 'Password *'}</FL>
                <FI
                  type="password" value={form.usr_pass} onChange={set('usr_pass')}
                  required={!isEdit}
                />
              </div>
              <div className="form-group">
                <FL>Date of Birth *</FL>
                <FI type="date" value={form.usr_dob} onChange={set('usr_dob')} required />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <FL>Email *</FL>
                <FI type="email" value={form.usr_email} onChange={set('usr_email')} maxLength={50} required />
              </div>
              <div className="form-group">
                <FL>Gender</FL>
                <FS value={form.usr_gender} onChange={set('usr_gender')}>
                  <option value="">Select</option>
                  <option>Male</option><option>Female</option><option>Other</option>
                </FS>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <FL>Status</FL>
                <FS value={form.usr_status} onChange={set('usr_status')}>
                  <option value={1}>Active</option>
                  <option value={0}>Inactive</option>
                </FS>
              </div>
              <div className="form-group">
                <FL>User Type</FL>
                <FS value={form.usr_type} onChange={set('usr_type')}>
                  <option value="User">User</option>
                  <option value="Admin">Admin</option>
                </FS>
              </div>
            </div>

            <div className="form-group">
              <FL>Remarks</FL>
              <FI value={form.usr_remarks} onChange={set('usr_remarks')} maxLength={160} />
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button" onClick={onClose}
              style={{ padding:'9px 20px', borderRadius:8, border:'1px solid var(--border)', background:'none', cursor:'pointer', fontFamily:'Outfit,sans-serif', fontSize:14 }}
            >
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-admin-custom">
              {loading ? 'Saving…' : isEdit ? 'Update User' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Main AdminUsers page
// ─────────────────────────────────────────────────────────────
const AdminUsers = () => {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [modal,   setModal]   = useState(null);
  const [selUser, setSelUser] = useState(null);

  const fetch = async (q = '') => {
    setLoading(true);
    try {
      const res = q ? await searchUsers(q) : await getUsers();
      setUsers(res.data);
    } catch { toast.error('Failed to load users.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const handleToggle = async usr_id => {
    try {
      const r = await toggleStatus(usr_id);
      toast.success(r.data.message);
      setUsers(u => u.map(x => x.usr_id === usr_id ? { ...x, usr_status: r.data.usr_status } : x));
    } catch { toast.error('Failed to toggle status.'); }
  };

  const handleDelete = async usr_id => {
    if (!window.confirm(`Delete user ${usr_id} and all their calendars?`)) return;
    try { await deleteUser(usr_id); toast.success('User deleted.'); fetch(); }
    catch (e) { toast.error(e.response?.data?.message || 'Delete failed.'); }
  };

  const fmt = d => d ? new Date(d).toLocaleDateString('en-IN') : '—';

  return (
    <div>
      <div className="admin-banner" style={{ marginBottom:20 }}>
        <i className="bx bx-group admin-banner-icon"></i>
        <div>
          <div className="admin-banner-title">User Management</div>
          <div className="admin-banner-sub">Activate, deactivate, add and manage all users</div>
        </div>
      </div>

      <div className="section-header">
        <span style={{ color:'var(--text-2)', fontSize:14 }}>
          {users.length} user{users.length !== 1 ? 's' : ''}
        </span>
        <div style={{ display:'flex', gap:12, alignItems:'center' }}>
          <div className="search-bar" style={{ width:280 }}>
            <input
              placeholder="Search by ID, name or email…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetch(search)}
            />
            <button onClick={() => fetch(search)}><i className="bi bi-search"></i></button>
          </div>
          <button className="btn-admin-custom" onClick={() => { setSelUser(null); setModal('add'); }}>
            <i className="bi bi-person-plus-fill"></i> Add User
          </button>
        </div>
      </div>

      <div className="card" style={{ overflow:'hidden' }}>
        <div style={{ overflowX:'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th><th>ID / Mobile</th><th>Name</th><th>Email</th>
                <th>Type</th><th>DOB</th><th>Gender</th><th>Registered</th>
                <th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10} style={{ textAlign:'center', padding:40 }}>
                  <div className="spinner" style={{ margin:'0 auto' }}></div>
                </td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={10}>
                  <div className="empty-state"><i className="bx bx-user-x"></i><p>No users found.</p></div>
                </td></tr>
              ) : users.map((u, i) => (
                <tr key={u.usr_id}>
                  <td style={{ color:'var(--text-3)', fontSize:12 }}>{i+1}</td>
                  <td><span style={{ fontFamily:'monospace', fontSize:13 }}>{u.usr_id}</span></td>
                  <td style={{ fontWeight:500 }}>{u.usr_name}</td>
                  <td style={{ color:'var(--text-2)' }}>{u.usr_email}</td>
                  <td><span className={u.usr_type==='Admin'?'badge-admin':'badge-user'}>{u.usr_type}</span></td>
                  <td style={{ color:'var(--text-2)', fontSize:13 }}>{fmt(u.usr_dob)}</td>
                  <td style={{ color:'var(--text-2)', fontSize:13 }}>{u.usr_gender || '—'}</td>
                  <td style={{ color:'var(--text-2)', fontSize:12 }}>{fmt(u.usr_reg_date_time)}</td>
                  <td>
                    <label className="toggle-switch" title={u.usr_status===1?'Click to deactivate':'Click to activate'}>
                      <input type="checkbox" checked={u.usr_status===1} onChange={() => handleToggle(u.usr_id)} />
                      <div className="toggle-track"><div className="toggle-thumb"></div></div>
                      <span style={{ fontSize:12, color: u.usr_status===1 ? 'var(--green)' : 'var(--text-3)' }}>
                        {u.usr_status===1 ? 'Active' : 'Inactive'}
                      </span>
                    </label>
                  </td>
                  <td>
                    <div style={{ display:'flex', gap:6 }}>
                      <button className="btn-icon edit" title="Edit"
                        onClick={() => { setSelUser(u); setModal('edit'); }}>
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button className="btn-icon delete" title="Delete"
                        onClick={() => handleDelete(u.usr_id)}>
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <UserModal
          mode={modal}
          data={selUser}
          onSave={() => { setModal(null); fetch(); }}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
};

export default AdminUsers;
