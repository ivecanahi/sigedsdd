import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROLES } from '../../../config/app';
import { useRoles } from '../../../hooks/useRoles';
import { institucionApi } from '../services/institucionApi';
import type { Institucion } from '../types/institucion';
import InstitucionCard from '../components/InstitucionCard';

export default function MisInstitucionesPage() {
  const navigate = useNavigate();
  const { hasRole, isLoading: rolesLoading } = useRoles();

  const [instituciones, setInstituciones] = useState<Institucion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!rolesLoading && !hasRole(ROLES.ADMINISTRADOR) && !hasRole(ROLES.AUTORIDAD_ACADEMICA)) {
      navigate('/', { replace: true });
    }
  }, [rolesLoading, hasRole, navigate]);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await institucionApi.listByUser();
        setInstituciones(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar instituciones');
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  if (rolesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="material-symbols-outlined text-4xl text-primary animate-spin">refresh</span>
      </div>
    );
  }

  if (!hasRole(ROLES.ADMINISTRADOR) && !hasRole(ROLES.AUTORIDAD_ACADEMICA)) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header block - AUTORIDAD style */}
      <section className="relative bg-gradient-to-r from-secondary to-accent rounded-sm p-8 text-white w-full shadow-md flex flex-col justify-center overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="material-symbols-outlined text-4xl">badge</span>
            <span className="text-sm font-medium uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full">
              Autoridad Académica
            </span>
          </div>
          <h2 className="text-3xl font-bold mb-2 tracking-tight">
            Mis Instituciones
          </h2>
          <p className="text-white/80 text-base">
            Instituciones educativas asignadas a su cuenta
          </p>
        </div>
        <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-[0.15] pointer-events-none">
          <span className="material-symbols-outlined text-9xl text-white">domain</span>
        </div>
      </section>

      {error && (
        <div className="bg-danger/10 text-danger px-4 py-3 rounded-sm text-sm">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <span className="material-symbols-outlined text-4xl text-primary animate-spin">refresh</span>
        </div>
      ) : instituciones.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-sm p-8 text-center">
          <span className="material-symbols-outlined text-5xl text-gray-300 mb-3">domain</span>
          <p className="text-gray-500">No tiene instituciones asignadas actualmente.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {instituciones.map((inst) => (
            <InstitucionCard key={inst.id} institucion={inst} />
          ))}
        </div>
      )}
    </div>
  );
}
