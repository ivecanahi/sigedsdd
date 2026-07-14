import { useState, useEffect } from 'react';
import type { Institucion, InstitucionFormData } from '../types/institucion';

interface InstitucionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: Institucion | null;
  onSubmit: (data: InstitucionFormData) => Promise<void>;
}

interface FormErrors {
  nombre?: string[];
  codigo?: string[];
  ruc?: string[];
  non_field_errors?: string[];
  [key: string]: string[] | undefined;
}

export default function InstitucionForm({ isOpen, onClose, onSuccess, initialData, onSubmit }: InstitucionFormProps) {
  const [formData, setFormData] = useState<InstitucionFormData>({
    nombre: '',
    codigo: '',
    ruc: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const isEditMode = !!initialData;

  useEffect(() => {
    if (initialData) {
      setFormData({
        nombre: initialData.nombre,
        codigo: initialData.codigo,
        ruc: initialData.ruc,
      });
    } else {
      setFormData({ nombre: '', codigo: '', ruc: '' });
    }
    setErrors({});
    setGlobalError(null);
  }, [initialData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field error when user types
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
    if (!formData.codigo.trim()) newErrors.codigo = ['Este campo es obligatorio.'];
    if (formData.codigo.length > 20) newErrors.codigo = ['Máximo 20 caracteres.'];
    if (!formData.ruc.trim()) newErrors.ruc = ['Este campo es obligatorio.'];
    if (formData.ruc.length > 20) newErrors.ruc = ['Máximo 20 caracteres.'];

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
      } else {
        setGlobalError(apiError.message || 'Error al guardar la institución');
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
            {isEditMode ? 'Editar Institución' : 'Nueva Institución'}
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

          <div>
            <label htmlFor="codigo" className="block text-sm font-medium text-gray-700 mb-1">
              Código <span className="text-danger">*</span>
            </label>
            <input
              id="codigo"
              name="codigo"
              type="text"
              value={formData.codigo}
              onChange={handleChange}
              maxLength={20}
              className={`w-full px-3 py-2 border rounded-sm focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.codigo ? 'border-danger' : 'border-gray-200'
              }`}
            />
            {errors.codigo && (
              <p className="mt-1 text-sm text-danger">{errors.codigo[0]}</p>
            )}
          </div>

          <div>
            <label htmlFor="ruc" className="block text-sm font-medium text-gray-700 mb-1">
              RUC <span className="text-danger">*</span>
            </label>
            <input
              id="ruc"
              name="ruc"
              type="text"
              value={formData.ruc}
              onChange={handleChange}
              maxLength={20}
              className={`w-full px-3 py-2 border rounded-sm focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.ruc ? 'border-danger' : 'border-gray-200'
              }`}
            />
            {errors.ruc && (
              <p className="mt-1 text-sm text-danger">{errors.ruc[0]}</p>
            )}
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
