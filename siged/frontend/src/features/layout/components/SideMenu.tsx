import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ROLES } from '../../../config/app';
import { useRoles } from '../../../hooks';
import { useInstitucion } from '../../instituciones/context/InstitucionContext';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MenuItem {
  icon: string;
  label: string;
  path: string;
  requiredRoles?: string[];
}

export default function SideMenu({ isOpen, onClose }: SideMenuProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { hasRole } = useRoles();
  const { institucionId, institucionNombre, clearInstitucion } = useInstitucion();
  const [activeItem, setActiveItem] = useState(location.pathname);

  useEffect(() => {
    setActiveItem(location.pathname);
  }, [location.pathname]);

  const mainMenuItems: MenuItem[] = [
    { icon: 'home', label: 'Main Menu', path: '/' },
    { icon: 'account_balance', label: 'Institutions', path: '/instituciones', requiredRoles: [ROLES.ADMINISTRADOR] },
    { icon: 'domain', label: 'My Institutions', path: '/mis-instituciones', requiredRoles: [ROLES.ADMINISTRADOR, ROLES.AUTORIDAD_ACADEMICA] },
  ];

  const contextualMenuItems: MenuItem[] = [
    { icon: 'arrow_back', label: 'Back to Main Menu', path: '/' },
    { icon: 'school', label: institucionNombre || 'My Institution', path: `/dashboard/${institucionId || ''}` },
    { icon: 'menu_book', label: 'Study Plans', path: `/planes-estudio/${institucionId || ''}` },
  ];

  const menuItems = institucionId ? contextualMenuItems : mainMenuItems;

  const visibleMenuItems = menuItems.filter((item) => {
    if (!item.requiredRoles) return true;
    return item.requiredRoles.some((role) => hasRole(role));
  });

  const handleNavigate = (path: string) => {
    if (path === '/') {
      clearInstitucion();
    }
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
          <span
            className="material-symbols-outlined text-6xl text-white"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            groups
          </span>
          <button
            onClick={onClose}
            className="hover:bg-white/10 rounded-full p-1 transition-colors"
            aria-label="Close menu"
          >
            <span className="material-symbols-outlined text-4xl font-light">close</span>
          </button>
        </div>

        {institucionId && institucionNombre && (
          <div className="px-6 py-2 border-b border-white/20">
            <p className="text-sm text-white/70">Current Institution</p>
            <p className="text-base font-bold text-white truncate">{institucionNombre}</p>
          </div>
        )}

        {/* Navigation */}
        <nav className="mt-4">
          {visibleMenuItems.map((item) => {
            const isActive = activeItem === item.path;
            return (
              <button
                key={item.path}
                onClick={() => handleNavigate(item.path)}
                className={`w-full flex items-center gap-4 px-6 py-5 transition-all text-left ${
                  isActive
                    ? 'bg-sidebar-active text-white'
                    : 'text-white/80 hover:bg-sidebar-hover hover:text-white'
                }`}
              >
                <span className={`material-symbols-outlined text-2xl ${isActive ? 'text-white' : 'text-white/60'}`}>
                  {item.icon}
                </span>
                <span className={`text-[17px] ${isActive ? 'font-bold' : 'font-medium'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </aside>
    </div>
  );
}
