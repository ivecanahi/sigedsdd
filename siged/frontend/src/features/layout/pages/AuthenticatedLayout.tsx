import { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { APP_NAME } from '../../../config/app';
import { useAuth } from '../../auth/hooks/useAuth';
import SideMenu from '../components/SideMenu';
import TopBar from '../components/TopBar';

export default function AuthenticatedLayout() {
  const { isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <SideMenu isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <TopBar onMenuToggle={() => setSidebarOpen(true)} />

      <main className="flex-grow">
        <Outlet />
      </main>

      <footer className="p-8 text-center text-xs text-gray-400 mt-10">
        @ {new Date().getFullYear()} {APP_NAME}
      </footer>
    </div>
  );
}
