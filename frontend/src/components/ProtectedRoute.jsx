import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = () => {
  const { token, ready } = useAuth();
  if (!ready) return null;
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export const AdminRoute = () => {
  const { token, isAdmin, ready } = useAuth();
  if (!ready) return null;
  if (!token)    return <Navigate to="/login"     replace />;
  if (!isAdmin()) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
};
