import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Alert, Button, EmptyState, PageHeader, Spinner } from '../../../components/ui';
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
        <Spinner className="size-8 text-primary" label="Cargando institución..." />
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
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-600">domain</span>
            Datos Generales
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Nombre</p>
              <p className="text-sm text-slate-900 font-medium">{institucion.nombre}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Código AMIE</p>
              <p className="text-sm text-slate-900 font-medium">{institucion.codigo}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">RUC</p>
              <p className="text-sm text-slate-900 font-medium">{institucion.ruc}</p>
            </div>
          </div>
        </div>

        {/* Timestamps */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-600">schedule</span>
            Registro Temporal
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Fecha de Creación</p>
              <p className="text-sm text-slate-900 font-medium">{formatDate(institucion.fecha_creacion)}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Última Actualización</p>
              <p className="text-sm text-slate-900 font-medium">{formatDate(institucion.fecha_actualizacion)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Academic authorities */}
      {institucion.autoridades_academicas && institucion.autoridades_academicas.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-600">badge</span>
            Autoridades Académicas
          </h3>
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 font-display text-[11px] font-bold tracking-wider uppercase text-slate-600">
                    Usuario
                  </th>
                  <th className="px-4 py-3 font-display text-[11px] font-bold tracking-wider uppercase text-slate-600">
                    Rol
                  </th>
                  <th className="px-4 py-3 font-display text-[11px] font-bold tracking-wider uppercase text-slate-600">
                    Estado
                  </th>
                  <th className="px-4 py-3 font-display text-[11px] font-bold tracking-wider uppercase text-slate-600">
                    Desde
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {institucion.autoridades_academicas.map((aut) => (
                  <tr key={aut.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">
                      {aut.usuario?.first_name} {aut.usuario?.last_name}
                      <span className="block text-xs text-slate-500">@{aut.usuario?.username}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {aut.rol?.nombre_display || aut.rol?.nombre}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ring-1 ${
                          aut.es_activo
                            ? 'bg-green-50 text-green-700 ring-green-100'
                            : 'bg-slate-100 text-slate-600 ring-slate-200'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          {aut.es_activo ? 'check_circle' : 'cancel'}
                        </span>
                        {aut.es_activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
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
