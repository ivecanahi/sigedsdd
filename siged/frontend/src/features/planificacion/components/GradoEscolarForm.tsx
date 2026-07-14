import { useState, useEffect } from 'react';
import type { GradoEscolar, GradoEscolarFormData } from '../types/gradoEscolar';
import type { Nivel } from '../types/nivel';

interface GradoEscolarFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: GradoEscolar | null;
  onSubmit: (data: GradoEscolarFormData) => Promise<void>;
  planEstudioId: number;
  niveles: Nivel[];
}

interface FormErrors {
  nombre?: string[];
  orden?: string[];
  nivel?: string[];
  non_field_errors?: string[];
  [key: string]: string[] | undefined;
}

export default function GradoEscolarForm({
  isOpen,
  onClose,
  onSuccess,
  initialData,
  onSubmit,
  planEstudioId,
  niveles,
}: GradoEscolarFormProps) {
  const [formData, setFormData] = useState<GradoEscolarFormData>({
    nombre: '',
    orden: 1,
    nivel: 0,
    subnivel: null,
    plan_estudio: planEstudioId,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [selectedNivelId, setSelectedNivelId] = useState<number | null>(null);

  const isEditMode = !!initialData;

  useEffect(() => {
    if (initialData) {
      setFormData({
        nombre: initialData.nombre,
        orden: initialData.orden,
        nivel: initialData.nivel?.id || 0,
        subnivel: initialData.subnivel?.id || null,
        plan_estudio: initialData.plan_estudio,
      });
      setSelectedNivelId(initialData.nivel?.id || null);
    } else {
      setFormData({
        nombre: '',
        orden: 1,
        nivel: 0,
        subnivel: null,
        plan_estudio: planEstudioId,
      });
      setSelectedNivelId(null);
    }
    setErrors({});
    setGlobalError(null);
  }, [initialData, isOpen, planEstudioId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'nivel') {
      const nivelId = Number(value);
      setSelectedNivelId(nivelId);
      setFormData((prev) => ({ ...prev, nivel: nivelId, subnivel: null }));
    } else if (name === 'subnivel') {
      setFormData((prev) => ({ ...prev, subnivel: value ? Number(value) : null }));
    } else if (name === 'orden') {
      setFormData((prev) => ({ ...prev, [name]: Number(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
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
    if (!formData.orden || formData.orden < 1) newErrors.orden = ['Debe ser al menos 1.'];
    if (!formData.nivel) newErrors.nivel = ['Este campo es obligatorio.'];

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
        setGlobalError(apiError.message || 'Error al guardar grado escolar');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedNivel = niveles.find((n) => n.id === selectedNivelId);
  const hasSubniveles = selectedNivel && selectedNivel.subniveles && selectedNivel.subniveles.length > 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-surface rounded-sm shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {isEditMode ? 'Editar Grado Escolar' : 'Nuevo Grado Escolar'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Cerrar"
          >
            <span className="material-symbols-outlined text-2xl text-gray-500">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {globalError && (
            <div className="bg-danger/10 text-danger px-4 py-3 rounded-sm text-sm">
              {globalError}
            </div>
          )}

          <input type="hidden" name="plan_estudio" value={formData.plan_estudio} />

          <div>
            <label htmlFor="grado-nombre" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre <span className="text-danger">*</span>
            </label>
            <input
              id="grado-nombre"
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
            <label htmlFor="grado-orden" className="block text-sm font-medium text-gray-700 mb-1">
              Orden <span className="text-danger">*</span>
            </label>
            <input
              id="grado-orden"
              name="orden"
              type="number"
              min={1}
              value={formData.orden}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-sm focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.orden ? 'border-danger' : 'border-gray-200'
              }`}
            />
            {errors.orden && (
              <p className="mt-1 text-sm text-danger">{errors.orden[0]}</p>
            )}
          </div>

          <div>
            <label htmlFor="grado-nivel" className="block text-sm font-medium text-gray-700 mb-1">
              Nivel <span className="text-danger">*</span>
            </label>
            <select
              id="grado-nivel"
              name="nivel"
              value={formData.nivel || ''}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-sm focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.nivel ? 'border-danger' : 'border-gray-200'
              }`}
            >
              <option value="">Seleccione un nivel</option>
              {niveles.map((nivel) => (
                <option key={nivel.id} value={nivel.id}>
                  {nivel.nombre}
                </option>
              ))}
            </select>
            {errors.nivel && (
              <p className="mt-1 text-sm text-danger">{errors.nivel[0]}</p>
            )}
          </div>

          {hasSubniveles && (
            <div>
            <label htmlFor="grado-subnivel" className="block text-sm font-medium text-gray-700 mb-1">
              Subnivel
            </label>
              <select
                id="grado-subnivel"
                name="subnivel"
                value={formData.subnivel || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Seleccione un subnivel</option>
                {selectedNivel.subniveles.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.nombre}
                  </option>
                ))}
              </select>
            </div>
          )}

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
