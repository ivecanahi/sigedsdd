import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { APP_NAME } from '../../../config/app';
import { useAuth } from '../../auth/hooks/useAuth';
import { useInstitucion } from '../../instituciones/context/InstitucionContext';

interface TopBarProps {
  onMenuToggle?: () => void;
}

function getPageTitle(pathname: string): string {
  if (pathname === '/') return 'Dashboard';
  if (pathname.startsWith('/instituciones')) {
    if (pathname.includes('/instituciones/') && pathname.length > '/instituciones/'.length) {
      return 'Detalle de Institución';
    }
    return 'Gestión de Instituciones';
  }
  if (pathname === '/mis-instituciones') return 'Mis Instituciones';
  if (pathname.startsWith('/dashboard/')) return 'Panel Institucional';
  if (pathname.startsWith('/planes-estudio/')) return 'Planes de Estudio';
  if (pathname.startsWith('/grados-asignaturas/')) return 'Grados y Asignaturas';
  return APP_NAME;
}

export default function TopBar({ onMenuToggle }: TopBarProps) {
  const { user, logout } = useAuth();
  const { institucionNombre } = useInstitucion();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const pageTitle = getPageTitle(location.pathname);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
  };

  const userName = user ? `${user.first_name} ${user.last_name}` : 'Usuario';
  const initials = user
    ? `${user.first_name?.charAt(0) || ''}${user.last_name?.charAt(0) || ''}`.toUpperCase()
    : 'U';

  return (
    <header className="h-16 bg-white border-b border-slate-200 shadow-sm flex items-center justify-between px-4 sticky top-0 z-50 lg:ml-[260px]">
      {/* Left: Hamburger (mobile only) + page title */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <button
          onClick={onMenuToggle}
          className="lg:hidden inline-flex items-center justify-center size-10 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          aria-label="Abrir menú"
        >
          <span className="material-symbols-outlined text-2xl">menu</span>
        </button>

        <div className="min-w-0">
          <h1 className="text-base font-semibold text-slate-900 truncate">{pageTitle}</h1>
          {institucionNombre && (
            <p className="text-xs text-slate-500 truncate hidden sm:block">{institucionNombre}</p>
          )}
        </div>
      </div>

      {/* Right: notification + user */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Notification bell — placeholder */}
        <button
          className="inline-flex items-center justify-center size-10 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          aria-label="Notificaciones"
        >
          <span className="material-symbols-outlined text-[22px]">notifications</span>
        </button>

        {/* User dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-100 transition-colors focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            aria-haspopup="menu"
            aria-expanded={dropdownOpen}
          >
            <div className="flex size-8 items-center justify-center rounded-full bg-primary-100 text-primary-700 font-bold text-[13px]">
              {initials}
            </div>
            <span className="hidden md:block text-sm font-medium text-slate-700 truncate max-w-[140px]">
              {userName}
            </span>
            <span className="material-symbols-outlined text-slate-400 text-[18px]">
              {dropdownOpen ? 'expand_less' : 'expand_more'}
            </span>
          </button>

          {dropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white shadow-pop py-1 z-50"
              role="menu"
            >
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-sm font-semibold text-slate-900 truncate">{userName}</p>
                <p className="text-xs text-slate-500 truncate">{user?.numero_identificacion}</p>
              </div>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left"
                role="menuitem"
              >
                <span className="material-symbols-outlined text-[18px] text-slate-400">person</span>
                Mi Perfil
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-danger hover:bg-danger-soft transition-colors text-left"
                role="menuitem"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
