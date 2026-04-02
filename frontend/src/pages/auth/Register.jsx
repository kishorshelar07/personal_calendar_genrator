import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { registerUser } from '../../services/auth.service';

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ usr_id:'', usr_name:'', usr_pass:'', confirm:'', usr_dob:'', usr_email:'', usr_gender:'' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault(); setError('');
    if (!/^\d{10}$/.test(form.usr_id)) return setError('Mobile number must be exactly 10 digits.');
    if (form.usr_pass !== form.confirm)  return setError('Passwords do not match.');
    setLoading(true);
    try {
      await registerUser({ usr_id: form.usr_id, usr_name: form.usr_name, usr_pass: form.usr_pass, usr_email: form.usr_email, usr_dob: form.usr_dob, usr_gender: form.usr_gender });
      toast.success('Registered! Please wait for admin activation.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally { setLoading(false); }
  };

  const field = (label, key, type='text', extra={}) => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize:13, fontWeight:500, color:'#475569', display:'block', marginBottom:5 }}>{label}</label>
      <input className="auth-input" type={type} value={form[key]} onChange={set(key)} {...extra} required />
    </div>
  );

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 480, width: '100%' }}>
        <div className="auth-logo"><i className="bx bx-user-plus" style={{fontSize:26}}></i></div>
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-sub">Register for CalendarPro</p>

        {error && <div className="alert-error"><i className="bi bi-exclamation-circle me-2"/>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <div>
              <label style={{ fontSize:13, fontWeight:500, color:'#475569', display:'block', marginBottom:5 }}>Mobile Number *</label>
              <input className="auth-input" type="text" placeholder="10 digits" value={form.usr_id} onChange={set('usr_id')} maxLength={10} required />
            </div>
            <div>
              <label style={{ fontSize:13, fontWeight:500, color:'#475569', display:'block', marginBottom:5 }}>Full Name *</label>
              <input className="auth-input" type="text" placeholder="Your name" value={form.usr_name} onChange={set('usr_name')} maxLength={35} required />
            </div>
            <div>
              <label style={{ fontSize:13, fontWeight:500, color:'#475569', display:'block', marginBottom:5 }}>Password *</label>
              <input className="auth-input" type="password" value={form.usr_pass} onChange={set('usr_pass')} required />
            </div>
            <div>
              <label style={{ fontSize:13, fontWeight:500, color:'#475569', display:'block', marginBottom:5 }}>Confirm Password *</label>
              <input className="auth-input" type="password" value={form.confirm} onChange={set('confirm')} required />
            </div>
            <div>
              <label style={{ fontSize:13, fontWeight:500, color:'#475569', display:'block', marginBottom:5 }}>Date of Birth *</label>
              <input className="auth-input" type="date" value={form.usr_dob} onChange={set('usr_dob')} required />
            </div>
            <div>
              <label style={{ fontSize:13, fontWeight:500, color:'#475569', display:'block', marginBottom:5 }}>Gender</label>
              <select className="auth-input" value={form.usr_gender} onChange={set('usr_gender')}>
                <option value="">Select</option>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
          </div>
          <div style={{ marginTop:14 }}>
            <label style={{ fontSize:13, fontWeight:500, color:'#475569', display:'block', marginBottom:5 }}>Email *</label>
            <input className="auth-input" type="email" value={form.usr_email} onChange={set('usr_email')} maxLength={50} required />
          </div>
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign:'center', marginTop:18, fontSize:14, color:'#94a3b8' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color:'#3b82f6', fontWeight:500 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
