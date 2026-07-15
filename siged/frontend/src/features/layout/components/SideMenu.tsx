import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ROLES, APP_NAME } from '../../../config/app';
import { useAuth } from '../../auth/hooks/useAuth';
import { useRoles } from '../../../hooks';
import { useInstitucion } from '../../instituciones/context/InstitucionContext';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MenuLink {
  icon: string;
  label: string;
  path: string;
  requiredRoles?: string[];
  disabled?: boolean;
  onClick?: () => void;
}

interface MenuSection {
  title?: string;
  items: MenuLink[];
}

export default function SideMenu({ isOpen, onClose }: SideMenuProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { hasRole } = useRoles();
  const { institucionId, institucionNombre, clearInstitucion } = useInstitucion();
  const isActive = useCallback(
    (path: string) => {
      if (path === '/') return location.pathname === '/';
      return location.pathname.startsWith(path);
    },
    [location.pathname],
  );

  const handleNavigate = (path: string, onClick?: () => void) => {
    if (onClick) {
      onClick();
      onClose();
      return;
    }
    if (path === '/') {
      clearInstitucion();
    }
    navigate(path);
    onClose();
  };

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  const buildSections = (): MenuSection[] => {
    const sections: MenuSection[] = [];

    // Dashboard
    sections.push({
      items: [
        {
          icon: 'home',
          label: 'Dashboard',
          path: '/',
        },
      ],
    });

    // Acceso Institucional (vista de usuario)
    const accessItems: MenuLink[] = [];
    if (hasRole(ROLES.ADMINISTRADOR) || hasRole(ROLES.AUTORIDAD_ACADEMICA)) {
      accessItems.push({
        icon: 'domain',
        label: 'Mis instituciones',
        path: '/mis-instituciones',
        requiredRoles: [ROLES.ADMINISTRADOR, ROLES.AUTORIDAD_ACADEMICA],
      });
    }
    if (accessItems.length > 0) {
      sections.push({ title: 'Acceso Institucional', items: accessItems });
    }

    // Administración
    const adminItems: MenuLink[] = [];
    if (hasRole(ROLES.ADMINISTRADOR)) {
      adminItems.push({
        icon: 'account_balance',
        label: 'Instituciones',
        path: '/instituciones',
        requiredRoles: [ROLES.ADMINISTRADOR],
      });
    }
    if (adminItems.length > 0) {
      sections.push({ title: 'Administración', items: adminItems });
    }

    // Mi Institución (contextual)
    if (institucionId) {
      const institucionItems: MenuLink[] = [];
      institucionItems.push({
        icon: 'menu_book',
        label: 'Planes de Estudio',
        path: `/planes-estudio/${institucionId}`,
      });
      institucionItems.push({
        icon: 'class',
        label: 'Grados y Asignaturas',
        path: `/planes-estudio/${institucionId}`,
      });
      sections.push({ title: 'Mi Institución', items: institucionItems });
    }

    // Configuración
    sections.push({
      title: 'Configuración',
      items: [
        {
          icon: 'person',
          label: 'Mi Perfil',
          path: '/',
        },
        {
          icon: 'logout',
          label: 'Cerrar Sesión',
          path: '#',
          onClick: handleLogout,
        },
      ],
    });

    return sections;
  };

  const sections = buildSections();

  const userName = user ? `${user.first_name} ${user.last_name}` : 'Usuario';
  const userRole = hasRole(ROLES.ADMINISTRADOR)
    ? 'Administrador'
    : hasRole(ROLES.AUTORIDAD_ACADEMICA)
      ? 'Autoridad Académica'
      : hasRole(ROLES.DOCENTE)
        ? 'Docente'
        : hasRole(ROLES.SECRETARIA)
          ? 'Secretaría'
          : 'Usuario';

  return (
    <>
      {/* Overlay — solo visible en móvil cuando el drawer está abierto */}
      <div
        className={`fixed inset-0 z-[99] bg-black/30 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-[100] flex h-full w-[260px] flex-col bg-[#1e3a5f] text-white shadow-2xl transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Menú principal"
      >
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <span
            className="material-symbols-outlined text-[32px] text-white/90"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            school
          </span>
          <div className="min-w-0">
            <p className="text-[15px] font-bold text-white tracking-tight truncate">{APP_NAME}</p>
            <p className="text-[11px] text-white/50 truncate">Sistema de Gestión Educativa</p>
          </div>
        </div>

        {/* Institution context badge */}
        {institucionId && institucionNombre && (
          <div className="px-5 py-3 border-b border-white/10">
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Institución activa</p>
            <p className="text-[13px] font-medium text-white/90 truncate mt-0.5">{institucionNombre}</p>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {sections.map((section, sectionIdx) => {
            const visibleItems = section.items.filter((item) => {
              if (item.disabled) return true; // show disabled items
              if (!item.requiredRoles) return true;
              return item.requiredRoles.some((role) => hasRole(role));
            });

            if (visibleItems.length === 0) return null;

            return (
              <div key={sectionIdx}>
                {section.title && (
                  <div className="mb-2 px-3">
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.12em]">
                      {section.title}
                    </p>
                    <div className="mt-1.5 h-px bg-white/10" />
                  </div>
                )}
                <ul className="space-y-0.5">
                  {visibleItems.map((item) => {
                    const active = isActive(item.path);
                    return (
                      <li key={item.label + item.path}>
                        <button
                          onClick={() => handleNavigate(item.path, item.onClick)}
                          disabled={item.disabled}
                          className={`group w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors duration-150 ${
                            active
                              ? 'bg-white/10 text-white border-l-4 border-l-[#4c6ef5]'
                              : item.disabled
                                ? 'text-white/30 cursor-not-allowed'
                                : 'text-white/70 hover:bg-white/5 hover:text-white border-l-4 border-l-transparent'
                          }`}
                          aria-current={active ? 'page' : undefined}
                        >
                          <span
                            className={`material-symbols-outlined text-[20px] shrink-0 ${
                              active ? 'text-white' : 'text-white/50 group-hover:text-white/80'
                            }`}
                            style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
                          >
                            {item.icon}
                          </span>
                          <span className={`text-[14px] ${active ? 'font-semibold' : 'font-medium'}`}>
                            {item.label}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>

        {/* User info at bottom */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 bg-[#1a3352] px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/10">
              <span className="material-symbols-outlined text-[18px] text-white/70">person</span>
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-white truncate">{userName}</p>
              <p className="text-[11px] text-white/50 truncate">{userRole}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
