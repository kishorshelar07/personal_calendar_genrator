import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const NavItem = ({ to, icon, label, adminStyle = false }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `nav-item${isActive ? ' active' : ''}${adminStyle ? ' admin-item' : ''}`
    }
  >
    <span className="nav-icon"><i className={icon}></i></span>
    <span className="nav-label">{label}</span>
  </NavLink>
);

const Sidebar = ({ open }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <aside className={`sidebar${open ? ' open' : ''}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <i className="bx bx-calendar"></i>
        </div>
        <div className="sidebar-logo-text">CalendarPro</div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="nav-section-label">Main</div>
        <NavItem to="/dashboard" icon="bx bx-grid-alt" label="Dashboard" />
        <NavItem to="/calendars" icon="bx bx-calendar-alt" label="My Calendars" />

        {isAdmin() && (
          <>
            <div className="nav-section-label">Admin Panel</div>
            <NavItem to="/admin/dashboard" icon="bx bx-shield-quarter"    label="Admin Overview" adminStyle />
            <NavItem to="/admin/users"     icon="bx bx-group"             label="Manage Users"   adminStyle />
            <NavItem to="/admin/calendars" icon="bx bx-layout"            label="All Calendars"  adminStyle />
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div
          className="nav-item"
          onClick={handleLogout}
          style={{ cursor: 'pointer', color: '#f87171' }}
        >
          <span className="nav-icon"><i className="bx bx-log-out"></i></span>
          <span className="nav-label">Logout</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
