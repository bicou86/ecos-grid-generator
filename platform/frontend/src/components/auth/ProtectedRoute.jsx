import { Outlet, Navigate } from 'react-router-dom';

export default function ProtectedRoute() {
  const isAuthenticated = false; // TODO: Implement real auth check

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
