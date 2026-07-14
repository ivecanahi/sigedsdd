import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface InstitucionContextType {
  institucionId: number | null;
  institucionNombre: string | null;
  setInstitucion: (id: number, nombre: string) => void;
  clearInstitucion: () => void;
}

export const InstitucionContext = createContext<InstitucionContextType | null>(null);

export function InstitucionProvider({ children }: { children: ReactNode }) {
  const [institucionId, setInstitucionId] = useState<number | null>(() => {
    const stored = localStorage.getItem('institucionId');
    return stored ? Number(stored) : null;
  });
  const [institucionNombre, setInstitucionNombre] = useState<string | null>(() => {
    return localStorage.getItem('institucionNombre');
  });

  const setInstitucion = useCallback((id: number, nombre: string) => {
    localStorage.setItem('institucionId', String(id));
    localStorage.setItem('institucionNombre', nombre);
    setInstitucionId(id);
    setInstitucionNombre(nombre);
  }, []);

  const clearInstitucion = useCallback(() => {
    localStorage.removeItem('institucionId');
    localStorage.removeItem('institucionNombre');
    setInstitucionId(null);
    setInstitucionNombre(null);
  }, []);

  return (
    <InstitucionContext.Provider
      value={{ institucionId, institucionNombre, setInstitucion, clearInstitucion }}
    >
      {children}
    </InstitucionContext.Provider>
  );
}

export function useInstitucion() {
  const context = useContext(InstitucionContext);
  if (!context) {
    throw new Error('useInstitucion must be used within an InstitucionProvider');
  }
  return context;
}
