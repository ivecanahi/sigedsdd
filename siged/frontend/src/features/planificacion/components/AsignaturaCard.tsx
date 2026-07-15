import type { Asignatura } from '../types/asignatura';
import { IconButton } from '../../../components/ui';

interface AsignaturaCardProps {
  asignatura: Asignatura;
  onEdit: (asignatura: Asignatura) => void;
  onDelete: (asignatura: Asignatura) => void;
}

export default function AsignaturaCard({ asignatura, onEdit, onDelete }: AsignaturaCardProps) {
  return (
    <div
      className={`bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow ${
        asignatura.alerta_carga_pedagogica ? 'border-danger' : 'border-slate-200'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-slate-900 text-sm truncate">{asignatura.nombre}</h4>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-600">
            <span className="inline-flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">schedule</span>
              Mín: {asignatura.pp_semana_minimo}h/semana
            </span>
            {asignatura.pp_semana_maximo !== null && (
              <span className="inline-flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">timer</span>
                Máx: {asignatura.pp_semana_maximo}h/semana
              </span>
            )}
          </div>
          {asignatura.alerta_carga_pedagogica && (
            <div className="mt-2 inline-flex items-center gap-1 text-danger text-xs font-medium">
              <span className="material-symbols-outlined text-sm">warning</span>
              Alerta de carga pedagógica
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 ml-2 shrink-0">
          <IconButton
            icon="edit"
            label="Editar asignatura"
            tone="primary"
            size="sm"
            onClick={() => onEdit(asignatura)}
          />
          <IconButton
            icon="delete"
            label="Eliminar asignatura"
            tone="danger"
            size="sm"
            onClick={() => onDelete(asignatura)}
          />
        </div>
      </div>
    </div>
  );
}
