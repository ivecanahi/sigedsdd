import { createContext, useContext, useEffect, useState, type ReactNode, useCallback, useRef } from 'react';
import { usuarioRolApi } from '../../instituciones/services/usuarioRolApi';
import type { Rol } from '../../instituciones/types/usuariorol';

interface RolesContextType {
  roles: Rol[];
  isLoading: boolean;
  error: string | null;
  hasRole: (roleName: string) => boolean;
  refresh: () => void;
}

const RolesContext = createContext<RolesContextType | null>(null);

export function RolesProvider({ children }: { children: ReactNode }) {
  const [roles, setRoles] = useState<Rol[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastTokenRef = useRef<string | null>(null);

  const fetchRoles = useCallback(async () => {
    const token = localStorage.getItem('authToken');
    lastTokenRef.current = token;

    if (!token) {
      setRoles([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await usuarioRolApi.listRoles();
      setRoles(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar roles');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'authToken') fetchRoles();
    };
    window.addEventListener('storage', handleStorageChange);

    const intervalId = setInterval(() => {
      const currentToken = localStorage.getItem('authToken');
      if (currentToken !== lastTokenRef.current) {
        fetchRoles();
      }
    }, 500);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
    };
  }, [fetchRoles]);

  const hasRole = useCallback((roleName: string): boolean => {
    return roles.some((r) => r.nombre === roleName);
  }, [roles]);

  return (
    <RolesContext.Provider value={{ roles, isLoading, error, hasRole, refresh: fetchRoles }}>
      {children}
    </RolesContext.Provider>
  );
}

export function useRoles() {
  const context = useContext(RolesContext);
  if (!context) {
    throw new Error('useRoles must be used within a RolesProvider');
  }
  return context;
}
