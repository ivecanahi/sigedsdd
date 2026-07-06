import { Navigate } from 'react-router-dom';
import { APP_NAME } from '../../../config/app';
import { useAuth } from '../../auth/hooks/useAuth';
import SideMenu from '../components/SideMenu';
import TopBar from '../components/TopBar';

export default function AuthenticatedLayout() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />

      <div className="flex flex-1">
        <SideMenu />

        <main className="flex-1 flex flex-col">
          <div className="bg-heading-block border-t-4 border-heading-block-border px-6 py-4">
            <h1 className="text-xl font-semibold text-gray-800">Bienvenido</h1>
            <p className="text-sm text-gray-600 mt-1">
              Sistema de Información y Gestión Educativa
            </p>
          </div>

          <div className="flex-1 p-6">
            <div className="bg-surface rounded-lg shadow-sm p-6">
              <p className="text-gray-700">
                Ha iniciado sesión correctamente en el sistema.
              </p>
            </div>
          </div>

          <footer className="bg-white border-t border-gray-200 px-6 py-3">
            <p className="text-xs text-gray-500 text-center">
              {APP_NAME} — Sistema de Información y Gestión Educativa
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
