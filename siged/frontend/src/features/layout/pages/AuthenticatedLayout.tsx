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
    <div className="min-h-screen flex flex-col bg-background">
      <SideMenu isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <TopBar onMenuToggle={() => setSidebarOpen(true)} />

      <main className="flex-grow px-4 py-6 sm:px-6 sm:py-8">
        <div className="mx-auto w-full max-w-[1400px] space-y-6">
          <Outlet />
        </div>
      </main>

      <footer className="border-t border-border px-6 py-5">
        <p className="mx-auto max-w-[1400px] text-center text-xs text-ink-subtle sm:text-left">
          © {new Date().getFullYear()} {APP_NAME}
        </p>
      </footer>
    </div>
  );
}
