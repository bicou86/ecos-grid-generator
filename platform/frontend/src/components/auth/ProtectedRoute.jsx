import { Outlet, Navigate } from 'react-router-dom';

export default function ProtectedRoute() {
  // Check if user is authenticated by verifying token in localStorage
  const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
  const isAuthenticated = Boolean(token);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
