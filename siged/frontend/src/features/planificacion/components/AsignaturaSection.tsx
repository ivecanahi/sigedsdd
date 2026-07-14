import { useState } from 'react';
import type { Asignatura, AsignaturaFormData } from '../types/asignatura';
import AsignaturaCard from './AsignaturaCard';

interface AsignaturaSectionProps {
  asignaturas: Asignatura[];
  selectedGradoNombre: string | null;
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
  selectedGradoNombre,
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">
            Asignaturas {selectedGradoNombre && `- ${selectedGradoNombre}`}
          </h3>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Nueva Asignatura
          </button>
        )}
      </div>

      {globalError && (
        <div className="bg-danger/10 text-danger px-4 py-3 rounded-sm text-sm">
          {globalError}
        </div>
      )}

      {deleteTarget && (
        <div className="bg-warning/10 border border-warning text-warning px-4 py-3 rounded-sm text-sm flex items-center justify-between">
          <span>Eliminar asignatura &quot;{deleteTarget.nombre}&quot;?</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDeleteTarget(null)}
              className="px-3 py-1 rounded-sm hover:bg-warning/20 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={confirmDelete}
              className="px-3 py-1 bg-danger text-white rounded-sm hover:bg-danger/90 transition-colors font-medium"
            >
              Eliminar
            </button>
          </div>
        </div>
      )}

      {isEditing && (
        <form onSubmit={handleSubmit} className="bg-slate-50 border border-slate-200 rounded-sm p-4 space-y-3">
          <div>
            <label htmlFor="asig-nombre" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre <span className="text-danger">*</span>
            </label>
            <input
              id="asig-nombre"
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData((prev) => ({ ...prev, nombre: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-sm focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.nombre ? 'border-danger' : 'border-gray-200'
              }`}
            />
            {errors.nombre && <p className="mt-1 text-sm text-danger">{errors.nombre[0]}</p>}
          </div>
          <div>
            <label htmlFor="asig-pp" className="block text-sm font-medium text-gray-700 mb-1">
              Carga Semanal Mínima <span className="text-danger">*</span>
            </label>
            <input
              id="asig-pp"
              type="number"
              min={0}
              value={formData.pp_semana_minimo}
              onChange={(e) => setFormData((prev) => ({ ...prev, pp_semana_minimo: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-sm focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.pp_semana_minimo ? 'border-danger' : 'border-gray-200'
              }`}
            />
            {errors.pp_semana_minimo && <p className="mt-1 text-sm text-danger">{errors.pp_semana_minimo[0]}</p>}
          </div>
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-sm transition-colors text-sm font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-primary text-white rounded-sm hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-60"
            >
              {isSubmitting ? 'Guardando...' : editingAsignatura ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {asignaturas.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-sm p-6 text-center text-slate-500 text-sm">
            No hay asignaturas para este grado. Haga clic en &quot;Nueva Asignatura&quot; para agregar una.
          </div>
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
