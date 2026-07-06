import { APP_FULL_NAME, APP_NAME } from '../../../config/app';
import { useAuth } from '../../auth/hooks/useAuth';

export default function TopBar() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="bg-header-top border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-lg font-bold text-primary">{APP_NAME}</span>
        <span className="text-sm text-gray-600 hidden sm:inline">{APP_FULL_NAME}</span>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-700">
          {user?.first_name} {user?.last_name}
        </span>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
        >
          <span className="material-symbols-outlined text-lg">logout</span>
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}
