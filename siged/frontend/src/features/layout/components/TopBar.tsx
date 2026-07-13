import { APP_FULL_NAME, APP_NAME } from '../../../config/app';
import { useAuth } from '../../auth/hooks/useAuth';

interface TopBarProps {
  onMenuToggle?: () => void;
}

export default function TopBar({ onMenuToggle }: TopBarProps) {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex justify-between items-center px-4 sticky top-0 z-50">
      {/* Left: Hamburger Menu */}
      <div className="flex-1 flex items-center">
        <button
          onClick={onMenuToggle}
          className="w-10 h-10 bg-gray-900 text-white rounded-md flex items-center justify-center hover:bg-gray-800 transition-colors"
          aria-label="Abrir menú"
        >
          <span className="material-symbols-outlined text-2xl">menu</span>
        </button>
      </div>

      {/* Center: Title and Icon */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-900">
          {APP_FULL_NAME} ({APP_NAME})
        </span>
        <span className="material-symbols-outlined text-gray-800 text-2xl">school</span>
      </div>

      {/* Right: User Info */}
      <div className="flex-1 flex flex-col items-end justify-center leading-tight">
        <p className="text-sm font-bold text-gray-900">
          {user?.first_name} {user?.last_name}
        </p>
        <button
          onClick={handleLogout}
          className="text-sm font-medium text-primary hover:underline"
        >
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}
