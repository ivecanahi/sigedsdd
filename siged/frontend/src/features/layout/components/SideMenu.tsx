import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ROLES } from '../../../config/app';
import { useRoles } from '../../../hooks';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MenuItem {
  icon: string;
  label: string;
  path: string;
  badge?: string;
  requiredRoles?: string[];
}

export default function SideMenu({ isOpen, onClose }: SideMenuProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { hasRole, isLoading: rolesLoading, roles } = useRoles();
  const [activeItem, setActiveItem] = useState(location.pathname);

  useEffect(() => {
    setActiveItem(location.pathname);
  }, [location.pathname]);

  const allMenuItems: MenuItem[] = [
    { icon: 'home', label: 'Menú principal', path: '/' },
    { icon: 'account_balance', label: 'Instituciones', path: '/instituciones', badge: 'Admin', requiredRoles: [ROLES.ADMINISTRADOR] },
    { icon: 'domain', label: 'Mis instituciones', path: '/mis-instituciones', badge: 'Autoridad', requiredRoles: [ROLES.ADMINISTRADOR, ROLES.AUTORIDAD_ACADEMICA] },
  ];

  const visibleMenuItems = allMenuItems.filter((item) => {
    if (!item.requiredRoles) return true;
    return item.requiredRoles.some((role) => hasRole(role));
  });

  const handleNavigate = (path: string) => {
    setActiveItem(path);
    navigate(path);
    onClose();
  };

  return (
    <div
      className={`fixed inset-0 z-[100] ${isOpen ? '' : 'pointer-events-none'}`}
      aria-hidden={!isOpen}
    >
      {/* Overlay */}
      {isOpen && (
        <div
          className="absolute inset-0 bg-black/30 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Drawer panel */}
      <aside
        className={`absolute left-0 top-0 h-full w-[280px] bg-sidebar text-white shadow-2xl transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-6 flex justify-between items-start">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-5xl text-white">groups</span>
            <div>
              <h1 className="text-lg font-bold text-white">SIGED</h1>
              <p className="text-xs text-white/60">Sistema de Gestión Educativa</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-white/10 rounded-full p-1 transition-colors"
            aria-label="Cerrar menú"
          >
            <span className="material-symbols-outlined text-3xl font-light">close</span>
          </button>
        </div>

        {/* Role indicator */}
        {!rolesLoading && roles.length > 0 && (
          <div className="px-6 pb-4">
            <div className="flex flex-wrap gap-2">
              {roles.map((rol) => (
                <span
                  key={rol.id}
                  className="text-xs px-2 py-1 rounded-full bg-white/15 text-white/90 font-medium"
                >
                  {rol.nombre_display}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="mx-6 border-t border-white/15" />

        {/* Navigation */}
        <nav className="mt-2">
          {visibleMenuItems.map((item) => {
            const isActive = activeItem === item.path;
            return (
              <button
                key={item.path}
                onClick={() => handleNavigate(item.path)}
                className={`w-full flex items-center gap-4 px-6 py-4 transition-all text-left relative ${
                  isActive
                    ? 'bg-sidebar-active text-white'
                    : 'text-white/80 hover:bg-sidebar-hover hover:text-white'
                }`}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />
                )}
                <span className={`material-symbols-outlined text-2xl ${isActive ? 'text-white' : 'text-white/60'}`}>
                  {item.icon}
                </span>
                <div className="flex-1">
                  <span className={`text-[15px] font-semibold ${isActive ? 'text-white' : ''}`}>
                    {item.label}
                  </span>
                  {item.badge && (
                    <span className={`block text-xs mt-0.5 ${isActive ? 'text-white/80' : 'text-white/50'}`}>
                      {item.badge}
                    </span>
                  )}
                </div>
                {isActive && (
                  <span className="material-symbols-outlined text-lg text-white/60">chevron_right</span>
                )}
              </button>
            );
          })}
        </nav>
      </aside>
    </div>
  );
}
