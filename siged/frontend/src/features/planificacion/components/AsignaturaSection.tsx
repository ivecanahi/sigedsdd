import { useState } from 'react';
import type { Asignatura, AsignaturaFormData } from '../types/asignatura';
import type { GradoEscolar } from '../types/gradoEscolar';
import { Alert, Button, EmptyState, Icon } from '../../../components/ui';
import AsignaturaCard from './AsignaturaCard';

interface AsignaturaSectionProps {
  asignaturas: Asignatura[];
  selectedGrado: GradoEscolar | null;
  hasGrados: boolean;
  onCreate: (data: AsignaturaFormData) => Promise<void>;
  onUpdate: (id: number, data: Partial<AsignaturaFormData>) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onRefresh: () => void;
}

interface FormErrors {
  nombre?: string[];
  pp_semana_minimo?: string[];
  non_field_errors?: string[];
}

export default function AsignaturaSection({
  asignaturas,
  selectedGrado,
  hasGrados,
  onCreate,
  onUpdate,
  onDelete,
  onRefresh,
}: AsignaturaSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingAsignatura, setEditingAsignatura] = useState<Asignatura | null>(null);
  const [formData, setFormData] = useState({ nombre: '', pp_semana_minimo: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Asignatura | null>(null);

  const resetForm = () => {
    setFormData({ nombre: '', pp_semana_minimo: '' });
    setErrors({});
    setGlobalError(null);
    setIsEditing(false);
    setEditingAsignatura(null);
  };

  const handleEdit = (asignatura: Asignatura) => {
    setEditingAsignatura(asignatura);
    setFormData({
      nombre: asignatura.nombre,
      pp_semana_minimo: String(asignatura.pp_semana_minimo),
    });
    setIsEditing(true);
    setGlobalError(null);
  };

  const handleDeleteClick = (asignatura: Asignatura) => {
    setDeleteTarget(asignatura);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await onDelete(deleteTarget.id);
      setDeleteTarget(null);
      onRefresh();
    } catch (err) {
      setGlobalError(err instanceof Error ? err.message : 'Error al eliminar asignatura');
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.nombre.trim()) newErrors.nombre = ['Este campo es obligatorio.'];
    if (!formData.pp_semana_minimo.trim()) newErrors.pp_semana_minimo = ['Este campo es obligatorio.'];
    const numVal = Number(formData.pp_semana_minimo);
    if (isNaN(numVal) || numVal < 0) newErrors.pp_semana_minimo = ['Debe ser un número positivo.'];

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setGlobalError(null);

    try {
      if (editingAsignatura) {
        await onUpdate(editingAsignatura.id, {
          nombre: formData.nombre,
          pp_semana_minimo: Number(formData.pp_semana_minimo),
        });
      } else {
        await onCreate({
          nombre: formData.nombre,
          pp_semana_minimo: Number(formData.pp_semana_minimo),
          pp_semana_maximo: null,
          grado_escolar: 0, // Will be set by parent
        });
      }
      resetForm();
      onRefresh();
    } catch (err) {
      const apiError = err as Error & { data?: FormErrors };
      if (apiError.data) {
        setErrors(apiError.data);
        if (apiError.data.non_field_errors) {
          setGlobalError(apiError.data.non_field_errors.join(' '));
        }
      } else {
        setGlobalError(apiError.message || 'Error al guardar asignatura');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const formDisabled = !hasGrados;
  const selectedGradoNombre = selectedGrado?.nombre || null;

  // Carga pedagógica calculation
  const cargaActual = selectedGrado?.carga_pedagogica_actual ?? 0;
  const cargaMinima = selectedGrado?.carga_pedagogica_minima ?? 0;
  const cargaRemaining = Math.max(0, cargaMinima - cargaActual);
  const isMaxedOut = cargaMinima > 0 && cargaActual >= cargaMinima;
  const showCapacityInfo = selectedGrado && cargaMinima > 0 && !formDisabled;

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.nombre.trim()) newErrors.nombre = ['Este campo es obligatorio.'];
    const numVal = Number(formData.pp_semana_minimo);
    if (!formData.pp_semana_minimo.trim() || isNaN(numVal) || numVal < 0) {
      newErrors.pp_semana_minimo = ['Debe ser un número positivo.'];
      setErrors(newErrors);
      return false;
    }

    // Carga pedagógica: block if new asignatura exceeds remaining capacity
    if (!editingAsignatura && cargaRemaining > 0 && numVal > cargaRemaining) {
      newErrors.pp_semana_minimo = [
        'La carga horaria ingresada supera el límite del grado. Horas disponibles: ' + cargaRemaining + 'h.'
      ];
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-bold text-slate-900">
            Asignaturas {selectedGradoNombre && (
              <span className="text-primary-600">— {selectedGradoNombre}</span>
            )}
          </h3>

          {/* Capacity info banner */}
          {showCapacityInfo && (
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="tabular font-medium text-slate-700">{cargaActual}h</span>
                <span className="text-slate-300">/</span>
                <span className="tabular text-slate-400">{cargaMinima}h</span>
              </div>
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                isMaxedOut
                  ? 'bg-success/10 text-success'
                  : cargaRemaining > 0
                    ? 'bg-amber-50 text-amber-700'
                    : 'bg-slate-100 text-slate-500'
              }`}>
                {isMaxedOut
                  ? 'Carga completa'
                  : cargaRemaining > 0
                    ? `${cargaRemaining}h disponible${cargaRemaining !== 1 ? 's' : ''}`
                    : 'Sin límite'}
              </span>
            </div>
          )}
        </div>
        {!isEditing && (
          <Button
            icon="add"
            size="sm"
            onClick={() => setIsEditing(true)}
            disabled={formDisabled || isMaxedOut}
            title={isMaxedOut ? 'La carga pedagógica del grado ya está completa' : undefined}
          >
            {isMaxedOut ? 'Completo' : 'Nueva Asignatura'}
          </Button>
        )}
      </div>

      {/* Capacidad al máximo: info */}
      {!formDisabled && isMaxedOut && (
        <div className="rounded-lg border border-dashed border-green-300 bg-green-50/50 p-4 text-center">
          <div className="flex flex-col items-center gap-2">
            <Icon name="check_circle" className="text-[24px] text-success" />
            <p className="text-sm font-semibold text-green-700">
              La carga pedagógica de este grado ({cargaActual}h/{cargaMinima}h) ya está completa.
            </p>
            <p className="text-xs text-green-600">
              Elimine o reduzca horas de asignaturas existentes para agregar más.
            </p>
          </div>
        </div>
      )}

      {/* Blocked state: no grados registered */}
      {formDisabled && !selectedGrado && (
        <div className="rounded-lg border border-dashed border-amber-300 bg-amber-50/50 p-4 text-center">
          <div className="flex flex-col items-center gap-2">
            <Icon name="info" className="text-[24px] text-amber-500" />
            <p className="text-sm font-semibold text-amber-800">
              Debe registrar y seleccionar al menos un Grado Escolar para gestionar sus asignaturas.
            </p>
            <p className="text-xs text-amber-600">
              Use la sección &quot;Grados Escolares&quot; de la izquierda para crear el primer grado.
            </p>
          </div>
        </div>
      )}

      {globalError && !deleteTarget && (
        <Alert tone="danger" title="Error" onDismiss={() => setGlobalError(null)}>
          {globalError}
        </Alert>
      )}

      {deleteTarget && (
        <Alert
          tone="warning"
          title="Confirmar eliminación"
          action={
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(null)}>
                Cancelar
              </Button>
              <Button variant="danger" size="sm" onClick={confirmDelete}>
                Eliminar
              </Button>
            </div>
          }
        >
          ¿Eliminar asignatura &quot;{deleteTarget.nombre}&quot;? Esta acción no se puede deshacer.
        </Alert>
      )}

      {isEditing && (
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4"
        >
          <div>
            <label htmlFor="asig-nombre" className="block text-sm font-medium text-slate-700 mb-1">
              Nombre <span className="text-danger">*</span>
            </label>
            <input
              id="asig-nombre"
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData((prev) => ({ ...prev, nombre: e.target.value }))}
              disabled={formDisabled}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm disabled:bg-slate-100 disabled:cursor-not-allowed ${
                errors.nombre ? 'border-danger' : 'border-slate-200'
              }`}
            />
            {errors.nombre && <p className="mt-1 text-sm text-danger">{errors.nombre[0]}</p>}
          </div>
          <div>
            <label htmlFor="asig-pp" className="block text-sm font-medium text-slate-700 mb-1">
              Carga Semanal Mínima <span className="text-danger">*</span>
            </label>
            <input
              id="asig-pp"
              type="number"
              min={0}
              value={formData.pp_semana_minimo}
              onChange={(e) => setFormData((prev) => ({ ...prev, pp_semana_minimo: e.target.value }))}
              disabled={formDisabled}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm disabled:bg-slate-100 disabled:cursor-not-allowed ${
                errors.pp_semana_minimo ? 'border-danger' : 'border-slate-200'
              }`}
            />
            {errors.pp_semana_minimo && (
              <p className="mt-1 text-sm text-danger">{errors.pp_semana_minimo[0]}</p>
            )}
          </div>
          <div className="flex items-center justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={resetForm} disabled={formDisabled}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" loading={isSubmitting} disabled={formDisabled}>
              {editingAsignatura ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {!formDisabled && asignaturas.length === 0 && !isMaxedOut ? (
          <EmptyState
            icon="auto_stories"
            title="No hay asignaturas"
            description={
              selectedGradoNombre
                ? 'Haga clic en "Nueva Asignatura" para agregar una a este grado.'
                : 'Seleccione un grado escolar para ver sus asignaturas.'
            }
          />
        ) : (
          asignaturas.map((asignatura) => (
            <AsignaturaCard
              key={asignatura.id}
              asignatura={asignatura}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
            />
          ))
        )}
      </div>
    </div>
  );
}
