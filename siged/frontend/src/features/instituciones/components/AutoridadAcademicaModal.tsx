import { useState, useEffect, useCallback } from 'react';
import { usuarioRolApi, usuariosApi } from '../services/usuarioRolApi';
import { ROLES } from '../../../config/app';
import type { Institucion } from '../types/institucion';
import type { UsuarioRol, UsuarioRolFormData, Rol } from '../types/usuariorol';
import type { Usuario } from '../services/usuarioRolApi';

interface AutoridadAcademicaModalProps {
  isOpen: boolean;
  onClose: () => void;
  institucion: Institucion | null;
  onUpdate: () => void;
}

interface FormErrors {
  usuario?: string[];
  rol?: string[];
  institucion?: string[];
  non_field_errors?: string[];
  [key: string]: string[] | undefined;
}

export default function AutoridadAcademicaModal({ isOpen, onClose, institucion, onUpdate }: AutoridadAcademicaModalProps) {
  const [asignaciones, setAsignaciones] = useState<UsuarioRol[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [formData, setFormData] = useState<UsuarioRolFormData>({
    usuario: 0,
    rol: 0,
    institucion: null,
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formGlobalError, setFormGlobalError] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ type: 'toggle' | 'delete'; target: UsuarioRol } | null>(null);

  const fetchAsignaciones = useCallback(async () => {
    if (!institucion) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await usuarioRolApi.list({ institucion: institucion.id });
      setAsignaciones(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar asignaciones');
    } finally {
      setIsLoading(false);
    }
  }, [institucion]);

  useEffect(() => {
    if (isOpen && institucion) {
      fetchAsignaciones();
    }
  }, [isOpen, institucion, fetchAsignaciones]);

  const resetForm = () => {
    setFormData({ usuario: 0, rol: 0, institucion: institucion ? institucion.id : null });
    setFormErrors({});
    setFormGlobalError(null);
    setEditingId(null);
    setShowForm(false);
  };

  const loadUsuarios = async (forCreate: boolean) => {
    try {
      const data = await usuariosApi.list(forCreate ? { activo: true } : undefined);
      setUsuarios(data);
    } catch (err) {
      setFormGlobalError('Error al cargar usuarios');
    }
  };

  const loadRoles = async () => {
    try {
      const data = await usuarioRolApi.listAllRoles();
      // Filter only AUTORIDAD_ACADEMICA role for this modal
      const autoridadRol = data.find((r) => r.nombre === ROLES.AUTORIDAD_ACADEMICA);
      setRoles(autoridadRol ? [autoridadRol] : []);
    } catch (err) {
      setFormGlobalError('Error al cargar roles');
    }
  };

  const handleAdd = async () => {
    resetForm();
    setShowForm(true);
    await Promise.all([loadUsuarios(true), loadRoles()]);
  };

  const handleEdit = async (asignacion: UsuarioRol) => {
    setEditingId(asignacion.id);
    setFormData({
      usuario: asignacion.usuario.id,
      rol: asignacion.rol.id,
      institucion: asignacion.institucion?.id || null,
    });
    setShowForm(true);
    await Promise.all([loadUsuarios(false), loadRoles()]);
  };

  const handleToggle = (asignacion: UsuarioRol) => {
    setConfirmAction({ type: 'toggle', target: asignacion });
  };

  const executeConfirm = async () => {
    if (!confirmAction) return;
    const { type, target } = confirmAction;
    try {
      if (type === 'toggle') {
        await usuarioRolApi.toggle(target.id, !target.es_activo);
      } else {
        await usuarioRolApi.delete(target.id);
      }
      setConfirmAction(null);
      await fetchAsignaciones();
      onUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar la acción');
    }
  };

  const handleDelete = (asignacion: UsuarioRol) => {
    setConfirmAction({ type: 'delete', target: asignacion });
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    if (!formData.usuario || formData.usuario === 0) errors.usuario = ['Seleccione un usuario.'];
    if (!formData.rol || formData.rol === 0) errors.rol = ['Seleccione un rol.'];
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setFormGlobalError(null);
    setFormErrors({});

    const payload: UsuarioRolFormData = {
      ...formData,
      institucion: institucion ? institucion.id : null,
    };

    try {
      if (editingId) {
        await usuarioRolApi.update(editingId, payload);
      } else {
        await usuarioRolApi.create(payload);
      }
      resetForm();
      await fetchAsignaciones();
      onUpdate();
    } catch (err) {
      const apiError = err as Error & { data?: FormErrors };
      if (apiError.data) {
        setFormErrors(apiError.data);
        if (apiError.data.non_field_errors) {
          setFormGlobalError(apiError.data.non_field_errors.join(' '));
        }
      } else {
        setFormGlobalError(apiError.message || 'Error al guardar');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !institucion) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-surface rounded-sm shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Autoridades Académicas
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">{institucion.nombre}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Cerrar"
          >
            <span className="material-symbols-outlined text-2xl text-gray-500">close</span>
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {error && (
            <div className="bg-danger/10 text-danger px-4 py-3 rounded-sm text-sm">
              {error}
            </div>
          )}

          {confirmAction && (
            <div className="bg-warning/10 border border-warning text-warning px-4 py-3 rounded-sm text-sm flex items-center justify-between">
              <span>
                {confirmAction.type === 'toggle'
                  ? `¿${confirmAction.target.es_activo ? 'Desactivar' : 'Activar'} esta asignación?`
                  : '¿Eliminar esta asignación permanentemente?'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setConfirmAction(null)}
                  className="px-3 py-1 rounded-sm hover:bg-warning/20 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={executeConfirm}
                  className="px-3 py-1 bg-danger text-white rounded-sm hover:bg-danger/90 transition-colors font-medium"
                >
                  Confirmar
                </button>
              </div>
            </div>
          )}

          {/* Add button */}
          {!showForm && (
            <div className="flex justify-end">
              <button
                onClick={handleAdd}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-sm hover:bg-primary/90 transition-colors font-medium"
              >
                <span className="material-symbols-outlined text-lg">add</span>
                Asignar autoridad
              </button>
            </div>
          )}

          {/* Form */}
          {showForm && (
            <form onSubmit={handleSubmit} className="border border-gray-200 rounded-sm p-4 space-y-4">
              {formGlobalError && (
                <div className="bg-danger/10 text-danger px-4 py-3 rounded-sm text-sm">
                  {formGlobalError}
                </div>
              )}

              <div>
                <label htmlFor="usuario" className="block text-sm font-medium text-gray-700 mb-1">
                  Usuario <span className="text-danger">*</span>
                </label>
                <select
                  id="usuario"
                  value={formData.usuario}
                  onChange={(e) => {
                    setFormData((p) => ({ ...p, usuario: Number(e.target.value) }));
                    setFormErrors((p) => { const n = { ...p }; delete n.usuario; return n; });
                  }}
                  className={`w-full px-3 py-2 border rounded-sm focus:outline-none focus:ring-2 focus:ring-primary ${
                    formErrors.usuario ? 'border-danger' : 'border-gray-200'
                  }`}
                >
                  <option value={0}>Seleccione un usuario</option>
                  {usuarios.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.first_name} {u.last_name} ({u.username})
                    </option>
                  ))}
                </select>
                {formErrors.usuario && <p className="mt-1 text-sm text-danger">{formErrors.usuario[0]}</p>}
              </div>

              <div>
                <label htmlFor="rol" className="block text-sm font-medium text-gray-700 mb-1">
                  Rol <span className="text-danger">*</span>
                </label>
                <select
                  id="rol"
                  value={formData.rol}
                  onChange={(e) => {
                    setFormData((p) => ({ ...p, rol: Number(e.target.value) }));
                    setFormErrors((p) => { const n = { ...p }; delete n.rol; return n; });
                  }}
                  className={`w-full px-3 py-2 border rounded-sm focus:outline-none focus:ring-2 focus:ring-primary ${
                    formErrors.rol ? 'border-danger' : 'border-gray-200'
                  }`}
                >
                  <option value={0}>Seleccione un rol</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.nombre_display}
                    </option>
                  ))}
                </select>
                {formErrors.rol && <p className="mt-1 text-sm text-danger">{formErrors.rol[0]}</p>}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-sm transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-primary text-white rounded-sm hover:bg-primary/90 transition-colors font-medium disabled:opacity-60"
                >
                  {isSubmitting ? 'Guardando...' : editingId ? 'Actualizar' : 'Asignar'}
                </button>
              </div>
            </form>
          )}

          {/* Table */}
          <div className="overflow-x-auto border border-gray-200 rounded-sm">
            <table className="w-full text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-semibold text-gray-700">Usuario</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Rol</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Estado</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">Cargando...</td>
                  </tr>
                ) : asignaciones.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                      No hay asignaciones registradas.
                    </td>
                  </tr>
                ) : (
                  asignaciones.map((a) => (
                    <tr key={a.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-900">
                        {a.usuario.first_name} {a.usuario.last_name}
                        <span className="block text-xs text-gray-500">{a.usuario.username}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{a.rol.nombre_display}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            a.es_activo
                              ? 'bg-success/10 text-success'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {a.es_activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleEdit(a)}
                            className="p-1.5 text-primary hover:bg-primary/10 rounded-sm transition-colors"
                            title="Editar"
                          >
                            <span className="material-symbols-outlined text-xl">edit</span>
                          </button>
                          <button
                            onClick={() => handleToggle(a)}
                            className={`p-1.5 rounded-sm transition-colors ${
                              a.es_activo
                                ? 'text-warning hover:bg-warning/10'
                                : 'text-success hover:bg-success/10'
                            }`}
                            title={a.es_activo ? 'Desactivar' : 'Activar'}
                          >
                            <span className="material-symbols-outlined text-xl">
                              {a.es_activo ? 'pause' : 'play_arrow'}
                            </span>
                          </button>
                          <button
                            onClick={() => handleDelete(a)}
                            className="p-1.5 text-danger hover:bg-danger/10 rounded-sm transition-colors"
                            title="Eliminar"
                          >
                            <span className="material-symbols-outlined text-xl">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
