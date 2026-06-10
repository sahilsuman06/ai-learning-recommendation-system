import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const token = localStorage.getItem('token');

  if (!token) {
    // Redirect to login if token is missing
    return <Navigate to="/login" replace />;
  }

  // Render nested child components
  return <Outlet />;
};

export default ProtectedRoute;
