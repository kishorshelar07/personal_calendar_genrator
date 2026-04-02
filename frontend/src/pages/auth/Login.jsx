import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { loginUser } from '../../services/auth.service';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [form, setForm]     = useState({ usr_id: '', usr_pass: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const { login }  = useAuth();
  const navigate   = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await loginUser(form.usr_id, form.usr_pass);
      login({ usr_id: data.usr_id, usr_name: data.usr_name, usr_type: data.usr_type }, data.token);
      toast.success(`Welcome, ${data.usr_name}!`);
      navigate(data.usr_type === 'Admin' ? '/admin/dashboard' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Decorative circles */}
      <div style={{ position:'absolute', width:400, height:400, borderRadius:'50%', border:'1px solid rgba(59,130,246,.1)', top:-100, right:-100, pointerEvents:'none' }}/>
      <div style={{ position:'absolute', width:200, height:200, borderRadius:'50%', border:'1px solid rgba(139,92,246,.1)', bottom:50, left:50, pointerEvents:'none' }}/>

      <div className="auth-card">
        <div className="auth-logo"><i className="bx bx-calendar" style={{fontSize:26}}></i></div>
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-sub">Sign in to your CalendarPro account</p>

        {error && <div className="alert-error"><i className="bi bi-exclamation-circle me-2"/>  {error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize:13, fontWeight:500, color:'#475569', display:'block', marginBottom:6 }}>
              Mobile Number
            </label>
            <input
              className="auth-input"
              type="text" placeholder="10-digit mobile number"
              value={form.usr_id} maxLength={10} required
              onChange={e => setForm(f => ({ ...f, usr_id: e.target.value }))}
            />
          </div>
          <div style={{ marginBottom: 8 }}>
            <label style={{ fontSize:13, fontWeight:500, color:'#475569', display:'block', marginBottom:6 }}>
              Password
            </label>
            <input
              className="auth-input"
              type="password" placeholder="Enter your password"
              value={form.usr_pass} required
              onChange={e => setForm(f => ({ ...f, usr_pass: e.target.value }))}
            />
          </div>
          <div style={{ textAlign:'right', marginBottom:4 }}>
            <a href="#" style={{ fontSize:13, color:'#3b82f6' }}>Forgot password?</a>
          </div>
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign:'center', marginTop:20, fontSize:14, color:'#94a3b8' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color:'#3b82f6', fontWeight:500 }}>Register</Link>
        </p>

        {/* Demo hint */}
        <div style={{
          marginTop: 20, padding: '12px 14px', background: '#f8fafc',
          borderRadius: 8, border: '1px dashed #cbd5e1', fontSize: 12, color: '#64748b'
        }}>
          <strong>First time?</strong> Create an account and ask admin to activate it, or insert admin directly into MongoDB.
        </div>
      </div>
    </div>
  );
};

export default Login;
