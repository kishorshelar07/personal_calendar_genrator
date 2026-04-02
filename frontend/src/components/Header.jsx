import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const PAGE_TITLES = {
  '/dashboard':        'Dashboard',
  '/calendars':        'My Calendars',
  '/admin/dashboard':  'Admin Overview',
  '/admin/users':      'Manage Users',
  '/admin/calendars':  'All Calendars',
};

const Header = ({ open, onToggle }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [drop, setDrop] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    const close = e => { if (dropRef.current && !dropRef.current.contains(e.target)) setDrop(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/login');
  };

  const initials = user?.usr_name?.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase() || 'U';
  const title = PAGE_TITLES[location.pathname] || 'CalendarPro';
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <header className={`top-header${open ? ' shifted' : ''}`}>
      <div className="header-left">
        <button className="toggle-btn" onClick={onToggle}>
          <i className={`bx ${open ? 'bx-x' : 'bx-menu'}`}></i>
        </button>
        <h1 className="header-title" style={{ color: isAdminPage ? 'var(--admin-accent)' : undefined }}>
          {isAdminPage && <i className="bx bx-shield-quarter me-2" style={{ color: 'var(--admin-accent)' }}></i>}
          {title}
        </h1>
      </div>

      <div className="header-right">
        {isAdmin() && (
          <span style={{
            fontSize: '11px', fontWeight: 600, background: 'var(--admin-accent)',
            color: '#fff', padding: '3px 10px', borderRadius: '20px'
          }}>
            ADMIN
          </span>
        )}

        <div style={{ position: 'relative' }} ref={dropRef}>
          <div
            className="header-avatar"
            onClick={() => setDrop(d => !d)}
            style={{ background: isAdmin() ? 'var(--admin-accent)' : 'var(--blue)' }}
          >
            {initials}
          </div>

          {drop && (
            <div style={{
              position: 'absolute', top: '44px', right: 0,
              background: '#fff', border: '1px solid var(--border)',
              borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-lg)',
              minWidth: '220px', z: 400, zIndex: 400, overflow: 'hidden'
            }}>
              <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
                <div style={{ fontWeight: 600, fontSize: '15px' }}>{user?.usr_name}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-3)', marginTop: '2px' }}>
                  {user?.usr_id} · {user?.usr_type}
                </div>
              </div>
              <button
                onClick={handleLogout}
                style={{
                  width: '100%', padding: '12px 16px', background: 'none',
                  border: 'none', cursor: 'pointer', text: 'left',
                  display: 'flex', alignItems: 'center', gap: '10px',
                  color: '#ef4444', fontSize: '14px', fontFamily: 'Outfit, sans-serif'
                }}
              >
                <i className="bx bx-log-out"></i> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
