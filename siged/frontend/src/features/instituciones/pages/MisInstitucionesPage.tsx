import { useState, useEffect } from 'react';
import { Alert, CardGridSkeleton, EmptyState, PageHeader } from '../../../components/ui';
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
      <PageHeader
        eyebrow="Acceso institucional"
        title="Mis instituciones"
        description="Acceda y gestione sus instituciones educativas asignadas."
        icon="domain"
      />

      {error && <Alert tone="danger" title="No se pudieron cargar las instituciones">{error}</Alert>}

      {isLoading ? (
        <CardGridSkeleton items={3} />
      ) : instituciones.length === 0 ? (
        <EmptyState
          icon="domain_disabled"
          title="No tiene instituciones asignadas actualmente"
          description="Cuando un administrador le asigne un rol en una institución, aparecerá aquí."
        />
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
