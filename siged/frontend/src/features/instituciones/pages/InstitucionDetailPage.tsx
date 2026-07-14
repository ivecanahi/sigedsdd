import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
    return (
      <div className="bg-danger/10 text-danger px-4 py-3 rounded-sm text-sm">
        {error}
      </div>
    );
  }

  if (!institucion) {
    return (
      <div className="bg-white border border-slate-200 rounded-sm p-8 text-center text-slate-500">
        No se encontró la institución.
      </div>
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
      {/* Header block */}
      <section className="bg-heading-block border border-slate-200 rounded-sm p-6 w-full shadow-sm border-t-4 border-t-heading-block-border relative flex flex-col justify-center overflow-hidden">
        <div className="relative z-10">
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[11px] mb-1">
            Información de la Institución
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            {institucion.nombre}
          </h2>
        </div>
        <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-[0.07] pointer-events-none">
          <span className="material-symbols-outlined text-9xl text-primary">school</span>
        </div>
      </section>

      {/* Action bar */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors text-sm font-medium"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Volver
        </button>
      </div>

      {/* Info cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Basic info */}
        <div className="bg-white border border-slate-200 rounded-sm p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">domain</span>
            Datos Generales
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Nombre</p>
              <p className="text-sm text-slate-900 font-medium">{institucion.nombre}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Código AMIE</p>
              <p className="text-sm text-slate-900 font-medium">{institucion.codigo}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">RUC</p>
              <p className="text-sm text-slate-900 font-medium">{institucion.ruc}</p>
            </div>
          </div>
        </div>

        {/* Timestamps */}
        <div className="bg-white border border-slate-200 rounded-sm p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">schedule</span>
            Registro Temporal
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Fecha de Creación</p>
              <p className="text-sm text-slate-900 font-medium">{formatDate(institucion.fecha_creacion)}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Última Actualización</p>
              <p className="text-sm text-slate-900 font-medium">{formatDate(institucion.fecha_actualizacion)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Academic authorities */}
      {institucion.autoridades_academicas && institucion.autoridades_academicas.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-sm p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">badge</span>
            Autoridades Académicas
          </h3>
          <div className="overflow-x-auto border border-slate-200 rounded-sm">
            <table className="w-full text-left">
              <thead className="bg-primary text-white">
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
              <tbody className="divide-y divide-slate-200">
                {institucion.autoridades_academicas.map((aut) => (
                  <tr key={aut.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-slate-900 font-medium">
                      {aut.usuario?.first_name} {aut.usuario?.last_name}
                      <span className="block text-xs text-slate-500">@{aut.usuario?.username}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {aut.rol?.nombre_display || aut.rol?.nombre}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-sm text-xs font-bold ${
                          aut.es_activo
                            ? 'bg-success/10 text-success'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        <span className="material-symbols-outlined text-xs">
                          {aut.es_activo ? 'check_circle' : 'cancel'}
                        </span>
                        {aut.es_activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700 text-sm">
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
