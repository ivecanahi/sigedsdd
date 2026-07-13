import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROLES } from '../../../config/app';
import { useRoles } from '../../../hooks/useRoles';
import { institucionApi } from '../services/institucionApi';
import type { Institucion, InstitucionFormData } from '../types/institucion';
import InstitucionTable from '../components/InstitucionTable';
import InstitucionForm from '../components/InstitucionForm';
import AutoridadAcademicaModal from '../components/AutoridadAcademicaModal';

export default function InstitucionListPage() {
  const navigate = useNavigate();
  const { hasRole, isLoading: rolesLoading } = useRoles();

  const [data, setData] = useState<Institucion[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [ordering, setOrdering] = useState('nombre');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingInstitucion, setEditingInstitucion] = useState<Institucion | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalInstitucion, setModalInstitucion] = useState<Institucion | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await institucionApi.list({
        page,
        page_size: pageSize,
        ordering,
        nombre: searchTerm || undefined,
      });
      setData(response.results);
      setCount(response.count);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar instituciones');
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, ordering, searchTerm]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Unauthorized redirect
  useEffect(() => {
    if (!rolesLoading && !hasRole(ROLES.ADMINISTRADOR)) {
      navigate('/', { replace: true });
    }
  }, [rolesLoading, hasRole, navigate]);

  const handleSort = (field: string) => {
    setOrdering((prev) => {
      if (prev === field) return `-${field}`;
      return field;
    });
    setPage(1);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPage(1);
  };

  const handleEdit = (inst: Institucion) => {
    setEditingInstitucion(inst);
    setFormOpen(true);
  };

  const handleDelete = async (inst: Institucion) => {
    if (!window.confirm(`¿Eliminar la institución "${inst.nombre}"?`)) return;
    try {
      await institucionApi.delete(inst.id);
      await fetchData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar';
      alert(message);
    }
  };

  const handleManageAuthorities = (inst: Institucion) => {
    setModalInstitucion(inst);
    setModalOpen(true);
  };

  const handleFormSubmit = async (formData: InstitucionFormData) => {
    if (editingInstitucion) {
      await institucionApi.update(editingInstitucion.id, formData);
    } else {
      await institucionApi.create(formData);
    }
  };

  const handleFormSuccess = () => {
    setFormOpen(false);
    setEditingInstitucion(null);
    fetchData();
  };

  const handleModalUpdate = () => {
    fetchData();
  };

  if (rolesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="material-symbols-outlined text-4xl text-primary animate-spin">refresh</span>
      </div>
    );
  }

  if (!hasRole(ROLES.ADMINISTRADOR)) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header block - ADMIN style */}
      <section className="relative bg-gradient-to-r from-primary to-accent rounded-sm p-8 text-white w-full shadow-md flex flex-col justify-center overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="material-symbols-outlined text-4xl">admin_panel_settings</span>
            <span className="text-sm font-medium uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full">
              Administrador
            </span>
          </div>
          <h2 className="text-3xl font-bold mb-2 tracking-tight">
            Gestión de Instituciones Educativas
          </h2>
          <p className="text-white/80 text-base">
            Administre todas las instituciones educativas y asigne autoridades académicas
          </p>
        </div>
        <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-[0.15] pointer-events-none">
          <span className="material-symbols-outlined text-9xl text-white">account_balance</span>
        </div>
      </section>

      {error && (
        <div className="bg-danger/10 text-danger px-4 py-3 rounded-sm text-sm">
          {error}
        </div>
      )}

      {/* Action bar */}
      <div className="flex justify-end">
        <button
          onClick={() => { setEditingInstitucion(null); setFormOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-sm hover:bg-primary/90 transition-colors font-medium"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Nueva Institución
        </button>
      </div>

      {/* Table */}
      {isLoading && data.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <span className="material-symbols-outlined text-4xl text-primary animate-spin">refresh</span>
        </div>
      ) : (
        <InstitucionTable
          data={data}
          count={count}
          page={page}
          pageSize={pageSize}
          ordering={ordering}
          searchTerm={searchTerm}
          onSort={handleSort}
          onSearch={handleSearch}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onManageAuthorities={handleManageAuthorities}
        />
      )}

      {/* Form Modal */}
      <InstitucionForm
        isOpen={formOpen}
        onClose={() => { setFormOpen(false); setEditingInstitucion(null); }}
        onSuccess={handleFormSuccess}
        initialData={editingInstitucion}
        onSubmit={handleFormSubmit}
      />

      {/* Authority Modal */}
      <AutoridadAcademicaModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setModalInstitucion(null); }}
        institucion={modalInstitucion}
        onUpdate={handleModalUpdate}
      />
    </div>
  );
}
