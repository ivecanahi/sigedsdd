import { useState, useEffect } from 'react';
import type { PlanEstudio, PlanEstudioFormData } from '../types/planEstudio';

interface PlanEstudioFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onError?: (err: Error & { data?: { non_field_errors?: string[] } }) => void;
  initialData?: PlanEstudio | null;
  onSubmit: (data: PlanEstudioFormData) => Promise<void>;
  institucionId: number;
}

interface FormErrors {
  nombre?: string[];
  es_activo?: string[];
  non_field_errors?: string[];
  [key: string]: string[] | undefined;
}

export default function PlanEstudioForm({
  isOpen,
  onClose,
  onSuccess,
  onError,
  initialData,
  onSubmit,
  institucionId,
}: PlanEstudioFormProps) {
  const [formData, setFormData] = useState<PlanEstudioFormData>({
    nombre: '',
    es_activo: true,
    institucion: institucionId,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const isEditMode = !!initialData;

  useEffect(() => {
    if (initialData) {
      setFormData({
        nombre: initialData.nombre,
        es_activo: initialData.es_activo,
        institucion: initialData.institucion,
      });
    } else {
      setFormData({ nombre: '', es_activo: true, institucion: institucionId });
    }
    setErrors({});
    setGlobalError(null);
  }, [initialData, isOpen, institucionId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
    setGlobalError(null);
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.nombre.trim()) newErrors.nombre = ['Este campo es obligatorio.'];
    if (formData.nombre.length > 200) newErrors.nombre = ['Máximo 200 caracteres.'];

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setGlobalError(null);
    setErrors({});

    try {
      await onSubmit(formData);
      onSuccess();
    } catch (err) {
      const apiError = err as Error & { data?: FormErrors; status?: number };
      if (apiError.data) {
        setErrors(apiError.data);
        if (apiError.data.non_field_errors) {
          setGlobalError(apiError.data.non_field_errors.join(' '));
        }
        if (onError) onError(apiError);
      } else {
        setGlobalError(apiError.message || 'Error al guardar plan de estudio');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-surface rounded-sm shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {isEditMode ? 'Editar Plan de Estudio' : 'Nuevo Plan de Estudio'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Cerrar"
          >
            <span className="material-symbols-outlined text-2xl text-gray-500">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {globalError && (
            <div className="bg-danger/10 text-danger px-4 py-3 rounded-sm text-sm">
              {globalError}
            </div>
          )}

          <input type="hidden" name="institucion" value={formData.institucion} />

          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre <span className="text-danger">*</span>
            </label>
            <input
              id="nombre"
              name="nombre"
              type="text"
              value={formData.nombre}
              onChange={handleChange}
              maxLength={200}
              className={`w-full px-3 py-2 border rounded-sm focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.nombre ? 'border-danger' : 'border-gray-200'
              }`}
            />
            {errors.nombre && (
              <p className="mt-1 text-sm text-danger">{errors.nombre[0]}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              id="es_activo"
              name="es_activo"
              type="checkbox"
              checked={formData.es_activo}
              onChange={handleChange}
              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
            />
            <label htmlFor="es_activo" className="text-sm font-medium text-gray-700">
              Activo
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-sm transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-primary text-white rounded-sm hover:bg-primary/90 transition-colors font-medium disabled:opacity-60"
            >
              {isSubmitting ? 'Guardando...' : isEditMode ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
