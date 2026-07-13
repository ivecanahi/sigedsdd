import { useEffect, useState, useCallback, useRef } from 'react';
import { usuarioRolApi } from '../features/instituciones/services/usuarioRolApi';
import type { Rol } from '../features/instituciones/types/usuariorol';

export function useRoles() {
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
      // Defensa: asegurar que data es un array
      const safeData = Array.isArray(data) ? data : [];
      setRoles(safeData);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar roles';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    async function load() {
      if (cancelled) return;
      await fetchRoles();
    }

    load();

    // Reintentar cuando cambie el token en localStorage (otras pestañas)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'authToken') {
        fetchRoles();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // Revisar periódicamente si el token cambió en la MISMA pestaña
    // Esto soluciona el race condition después del login
    intervalId = setInterval(() => {
      const currentToken = localStorage.getItem('authToken');
      if (currentToken !== lastTokenRef.current) {
        fetchRoles();
      }
    }, 500);

    return () => {
      cancelled = true;
      window.removeEventListener('storage', handleStorageChange);
      if (intervalId) clearInterval(intervalId);
    };
  }, [fetchRoles]);

  const hasRole = (roleName: string): boolean => {
    if (!Array.isArray(roles)) return false;
    return roles.some((r) => r.nombre === roleName);
  };

  return { roles, isLoading, error, hasRole, refresh: fetchRoles };
}
