import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';

const STEPS = { VERIFY: 'verify', RESET: 'reset', DONE: 'done' };

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep]     = useState(STEPS.VERIFY);
  const [usr_id, setUsrId]  = useState('');
  const [usr_dob, setUsrDob]= useState('');
  const [newPass, setNewPass]= useState('');
  const [confirm, setConfirm]= useState('');
  const [loading, setLoading]= useState(false);
  const [error,   setError]  = useState('');
  const [showPass, setShowPass] = useState(false);

  // Step 1 — verify mobile + DOB
  const handleVerify = async e => {
    e.preventDefault();
    setError('');
    if (!/^\d{10}$/.test(usr_id)) return setError('Mobile number must be exactly 10 digits.');
    if (!usr_dob) return setError('Please enter your date of birth.');
    // Just move to reset step — actual verify happens on submit
    setStep(STEPS.RESET);
  };

  // Step 2 — set new password
  const handleReset = async e => {
    e.preventDefault();
    setError('');
    if (newPass.length < 6) return setError('Password must be at least 6 characters.');
    if (newPass !== confirm) return setError('Passwords do not match.');

    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', {
        usr_id,
        usr_dob,
        new_pass: newPass
      });
      toast.success(res.data.message);
      setStep(STEPS.DONE);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Decorative circles */}
      <div style={{ position:'absolute', width:300, height:300, borderRadius:'50%', border:'1px solid rgba(59,130,246,.1)', top:-80, left:-80, pointerEvents:'none' }}/>
      <div style={{ position:'absolute', width:200, height:200, borderRadius:'50%', border:'1px solid rgba(139,92,246,.1)', bottom:60, right:60, pointerEvents:'none' }}/>

      <div className="auth-card">

        {/* ── STEP: DONE ── */}
        {step === STEPS.DONE && (
          <div style={{ textAlign:'center' }}>
            <div style={{ width:64, height:64, background:'#dcfce7', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', fontSize:28, color:'#16a34a' }}>
              ✓
            </div>
            <h2 className="auth-title" style={{ fontSize:22 }}>Password Reset!</h2>
            <p style={{ color:'var(--text-3)', fontSize:14, margin:'8px 0 28px' }}>
              Your password has been updated successfully.
            </p>
            <button className="auth-btn" onClick={() => navigate('/login')}>
              Go to Login
            </button>
          </div>
        )}

        {/* ── STEP: VERIFY ── */}
        {step === STEPS.VERIFY && (
          <>
            <div className="auth-logo" style={{ background:'#f97316' }}>
              <i className="bx bx-lock-open-alt" style={{ fontSize:26 }}></i>
            </div>
            <h1 className="auth-title">Forgot Password</h1>
            <p className="auth-sub">Enter your mobile number and date of birth to verify your identity</p>

            {error && (
              <div className="alert-error">
                <i className="bi bi-exclamation-circle me-2"></i>{error}
              </div>
            )}

            <form onSubmit={handleVerify}>
              <div style={{ marginBottom:16 }}>
                <label style={{ fontSize:13, fontWeight:500, color:'var(--text-2)', display:'block', marginBottom:6 }}>
                  Mobile Number
                </label>
                <input
                  className="auth-input"
                  type="text"
                  placeholder="10-digit mobile number"
                  value={usr_id}
                  maxLength={10}
                  onChange={e => setUsrId(e.target.value)}
                  required
                />
              </div>

              <div style={{ marginBottom:8 }}>
                <label style={{ fontSize:13, fontWeight:500, color:'var(--text-2)', display:'block', marginBottom:6 }}>
                  Date of Birth
                </label>
                <input
                  className="auth-input"
                  type="date"
                  value={usr_dob}
                  onChange={e => setUsrDob(e.target.value)}
                  required
                />
                <p style={{ fontSize:12, color:'var(--text-3)', marginTop:6 }}>
                  <i className="bi bi-info-circle me-1"></i>
                  We'll verify your DOB to confirm your identity
                </p>
              </div>

              <button type="submit" className="auth-btn" style={{ background:'#f97316' }}>
                Verify Identity →
              </button>
            </form>

            <p style={{ textAlign:'center', marginTop:20, fontSize:14, color:'var(--text-3)' }}>
              Remember your password?{' '}
              <Link to="/login" style={{ color:'var(--blue)', fontWeight:500 }}>Sign in</Link>
            </p>
          </>
        )}

        {/* ── STEP: RESET ── */}
        {step === STEPS.RESET && (
          <>
            <div className="auth-logo" style={{ background:'#22c55e' }}>
              <i className="bx bx-key" style={{ fontSize:26 }}></i>
            </div>
            <h1 className="auth-title">New Password</h1>
            <p className="auth-sub">
              Setting new password for{' '}
              <strong style={{ color:'var(--text-1)' }}>{usr_id}</strong>
            </p>

            {error && (
              <div className="alert-error">
                <i className="bi bi-exclamation-circle me-2"></i>{error}
              </div>
            )}

            <form onSubmit={handleReset}>
              <div style={{ marginBottom:16 }}>
                <label style={{ fontSize:13, fontWeight:500, color:'var(--text-2)', display:'block', marginBottom:6 }}>
                  New Password
                </label>
                <div style={{ position:'relative' }}>
                  <input
                    className="auth-input"
                    type={showPass ? 'text' : 'password'}
                    placeholder="Min 6 characters"
                    value={newPass}
                    onChange={e => setNewPass(e.target.value)}
                    style={{ paddingRight:44 }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(s => !s)}
                    style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--text-3)', fontSize:18, padding:0 }}
                  >
                    <i className={`bi bi-eye${showPass ? '-slash' : ''}`}></i>
                  </button>
                </div>

                {/* Password strength bar */}
                {newPass && (
                  <div style={{ marginTop:8 }}>
                    <div style={{ height:4, borderRadius:4, background:'var(--border)', overflow:'hidden' }}>
                      <div style={{
                        height:'100%', borderRadius:4, transition:'width .3s, background .3s',
                        width: newPass.length < 6 ? '25%' : newPass.length < 8 ? '50%' : newPass.length < 12 ? '75%' : '100%',
                        background: newPass.length < 6 ? '#ef4444' : newPass.length < 8 ? '#f97316' : newPass.length < 12 ? '#eab308' : '#22c55e'
                      }}/>
                    </div>
                    <span style={{ fontSize:11, color:'var(--text-3)', marginTop:3, display:'block' }}>
                      {newPass.length < 6 ? 'Too short' : newPass.length < 8 ? 'Weak' : newPass.length < 12 ? 'Good' : 'Strong'}
                    </span>
                  </div>
                )}
              </div>

              <div style={{ marginBottom:8 }}>
                <label style={{ fontSize:13, fontWeight:500, color:'var(--text-2)', display:'block', marginBottom:6 }}>
                  Confirm New Password
                </label>
                <input
                  className="auth-input"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Repeat your new password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  style={{ borderColor: confirm && confirm !== newPass ? '#ef4444' : undefined }}
                  required
                />
                {confirm && confirm !== newPass && (
                  <p style={{ fontSize:12, color:'#ef4444', marginTop:4 }}>
                    <i className="bi bi-x-circle me-1"></i>Passwords don't match
                  </p>
                )}
                {confirm && confirm === newPass && (
                  <p style={{ fontSize:12, color:'#22c55e', marginTop:4 }}>
                    <i className="bi bi-check-circle me-1"></i>Passwords match
                  </p>
                )}
              </div>

              <div style={{ display:'flex', gap:10, marginTop:20 }}>
                <button
                  type="button"
                  onClick={() => { setStep(STEPS.VERIFY); setError(''); }}
                  style={{ flex:1, padding:13, background:'none', border:'1.5px solid var(--border)', borderRadius:'var(--radius-sm)', fontFamily:'Outfit,sans-serif', fontSize:14, cursor:'pointer', color:'var(--text-2)' }}
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  className="auth-btn"
                  disabled={loading}
                  style={{ flex:2, marginTop:0, background:'#22c55e' }}
                >
                  {loading ? 'Resetting…' : 'Reset Password'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
