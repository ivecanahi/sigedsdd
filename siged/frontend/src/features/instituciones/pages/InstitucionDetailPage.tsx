import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Alert, Button, EmptyState, PageHeader } from '../../../components/ui';
import { institucionApi } from '../services/institucionApi';
import type { Institucion } from '../types/institucion';

export default function InstitucionDetailPage() {
  const { institucionId } = useParams<{ institucionId: string }>();
  const navigate = useNavigate();
  const [institucion, setInstitucion] = useState<Institucion | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!institucionId) return;
      setIsLoading(true);
      setError(null);
      try {
        const data = await institucionApi.detail(Number(institucionId));
        setInstitucion(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar institución');
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [institucionId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="material-symbols-outlined text-4xl text-primary animate-spin">refresh</span>
      </div>
    );
  }

  if (error) {
    return <Alert tone="danger" title="Error">{error}</Alert>;
  }

  if (!institucion) {
    return (
      <EmptyState
        icon="domain_disabled"
        title="No se encontró la institución"
        description="La institución solicitada no existe o no tiene permisos para verla."
      />
    );
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Información de la Institución"
        title={institucion.nombre}
        icon="school"
        actions={
          <Button variant="ghost" icon="arrow_back" onClick={() => navigate(-1)}>
            Volver
          </Button>
        }
      />

      {/* Info cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Basic info */}
        <div className="bg-surface border border-border rounded-xl p-6 shadow-card">
          <h3 className="text-lg font-bold text-ink mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">domain</span>
            Datos Generales
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold text-ink-subtle uppercase tracking-wider mb-1">Nombre</p>
              <p className="text-sm text-ink font-medium">{institucion.nombre}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-ink-subtle uppercase tracking-wider mb-1">Código AMIE</p>
              <p className="text-sm text-ink font-medium">{institucion.codigo}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-ink-subtle uppercase tracking-wider mb-1">RUC</p>
              <p className="text-sm text-ink font-medium">{institucion.ruc}</p>
            </div>
          </div>
        </div>

        {/* Timestamps */}
        <div className="bg-surface border border-border rounded-xl p-6 shadow-card">
          <h3 className="text-lg font-bold text-ink mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">schedule</span>
            Registro Temporal
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold text-ink-subtle uppercase tracking-wider mb-1">Fecha de Creación</p>
              <p className="text-sm text-ink font-medium">{formatDate(institucion.fecha_creacion)}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-ink-subtle uppercase tracking-wider mb-1">Última Actualización</p>
              <p className="text-sm text-ink font-medium">{formatDate(institucion.fecha_actualizacion)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Academic authorities */}
      {institucion.autoridades_academicas && institucion.autoridades_academicas.length > 0 && (
        <div className="bg-surface border border-border rounded-xl p-6 shadow-card">
          <h3 className="text-lg font-bold text-ink mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">badge</span>
            Autoridades Académicas
          </h3>
          <div className="overflow-x-auto border border-border rounded-xl">
            <table className="w-full text-left">
              <thead className="bg-primary-700 text-white">
                <tr>
                  <th className="px-4 py-3 font-display font-bold text-[15px] uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-4 py-3 font-display font-bold text-[15px] uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-4 py-3 font-display font-bold text-[15px] uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-4 py-3 font-display font-bold text-[15px] uppercase tracking-wider">
                    Desde
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {institucion.autoridades_academicas.map((aut) => (
                  <tr key={aut.id} className="hover:bg-surface-muted transition-colors">
                    <td className="px-4 py-3 text-ink font-medium">
                      {aut.usuario?.first_name} {aut.usuario?.last_name}
                      <span className="block text-xs text-ink-muted">@{aut.usuario?.username}</span>
                    </td>
                    <td className="px-4 py-3 text-ink-muted">
                      {aut.rol?.nombre_display || aut.rol?.nombre}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-sm text-xs font-bold ${
                          aut.es_activo
                            ? 'bg-success-soft text-success'
                            : 'bg-slate-100 text-ink-muted'
                        }`}
                      >
                        <span className="material-symbols-outlined text-xs">
                          {aut.es_activo ? 'check_circle' : 'cancel'}
                        </span>
                        {aut.es_activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink-muted text-sm">
                      {aut.fecha_desde ? formatDate(aut.fecha_desde) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
