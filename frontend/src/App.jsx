import React, { useState } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Header  from './components/Header';

import Landing       from './pages/Landing';
import Login         from './pages/auth/Login';
import Register      from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import Dashboard      from './pages/dashboard/Dashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers     from './pages/admin/AdminUsers';
import AdminCalendars from './pages/admin/AdminCalendars';
import CalendarList   from './pages/calendars/CalendarList';
import Template1 from './pages/cal_design/Template1';
import Template2 from './pages/cal_design/Template2';
import Template3 from './pages/cal_design/Template3';

const Layout = () => {
  const [open, setOpen] = useState(false);
  return (
    <div className="app-shell">
      <Sidebar open={open} />
      <Header open={open} onToggle={() => setOpen(o => !o)} />
      <main className={`main-content${open ? ' shifted' : ''}`}>
        <div className="page-body">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

const App = () => {
  const { token, ready } = useAuth();
  if (!ready) return null;

  return (
    <Routes>
      {/* ── Landing page — always public ── */}
      <Route path="/" element={<Landing />} />

      {/* ── Auth routes — redirect to dashboard if already logged in ── */}
      <Route path="/login"           element={!token ? <Login />          : <Navigate to="/dashboard" replace />} />
      <Route path="/register"        element={!token ? <Register />       : <Navigate to="/dashboard" replace />} />
      <Route path="/forgot-password" element={!token ? <ForgotPassword /> : <Navigate to="/dashboard" replace />} />

      {/* ── Protected user routes ── */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/calendars" element={<CalendarList />} />
          <Route path="/cal-design/template1/:id" element={<Template1 />} />
          <Route path="/cal-design/template2/:id" element={<Template2 />} />
          <Route path="/cal-design/template3/:id" element={<Template3 />} />
        </Route>
      </Route>

      {/* ── Admin only routes ── */}
      <Route element={<AdminRoute />}>
        <Route element={<Layout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users"     element={<AdminUsers />} />
          <Route path="/admin/calendars" element={<AdminCalendars />} />
        </Route>
      </Route>

      {/* ── Fallback ── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
