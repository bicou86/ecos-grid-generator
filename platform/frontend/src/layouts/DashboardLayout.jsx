import { Outlet } from 'react-router-dom';

export default function DashboardLayout() {
  return (
    <div className="container-custom py-8">
      <Outlet />
    </div>
  );
}
