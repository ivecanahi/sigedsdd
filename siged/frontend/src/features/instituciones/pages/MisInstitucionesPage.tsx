import { useState, useEffect } from 'react';
import { institucionApi } from '../services/institucionApi';
import type { Institucion } from '../types/institucion';
import InstitucionCard from '../components/InstitucionCard';

export default function MisInstitucionesPage() {
  const [instituciones, setInstituciones] = useState<Institucion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="space-y-6">
      {/* Header block */}
      <section className="bg-slate-50 border border-slate-200 rounded-sm p-6 w-full shadow-sm border-t-4 border-t-primary relative flex flex-col justify-center overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2 tracking-tight text-slate-900">
            Mis instituciones
          </h2>
          <p className="text-slate-600 text-base">
            Acceda y gestione sus instituciones educativas asignadas.
          </p>
        </div>
        <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-[0.07] pointer-events-none">
          <span className="material-symbols-outlined text-9xl text-primary">school</span>
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
        <div className="bg-white border border-slate-200 rounded-sm p-8 text-center">
          <span className="material-symbols-outlined text-5xl text-slate-300 mb-3">domain</span>
          <p className="text-slate-500">No tiene instituciones asignadas actualmente.</p>
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
