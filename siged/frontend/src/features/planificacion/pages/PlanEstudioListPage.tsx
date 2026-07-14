import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { planEstudioApi } from '../services/planEstudioApi';
import type { PlanEstudio, PlanEstudioFormData } from '../types/planEstudio';
import PlanEstudioTable from '../components/PlanEstudioTable';
import PlanEstudioForm from '../components/PlanEstudioForm';

export default function PlanEstudioListPage() {
  const { institucionId } = useParams<{ institucionId: string }>();
  const navigate = useNavigate();
  const institutionId = Number(institucionId);

  const [data, setData] = useState<PlanEstudio[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [ordering, setOrdering] = useState('nombre');
  const [searchTerm, setSearchTerm] = useState('');
  const [localSearch, setLocalSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PlanEstudio | null>(null);
  const [activePlanAlert, setActivePlanAlert] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<PlanEstudio | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await planEstudioApi.listByInstitucion(institutionId, {
        page,
        page_size: pageSize,
        ordering,
        nombre: searchTerm || undefined,
      });
      setData(response.results);
      setCount(response.count);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar planes de estudio');
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, ordering, searchTerm, institutionId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(localSearch);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPage(1);
  };

  const handleEdit = (plan: PlanEstudio) => {
    setEditingPlan(plan);
    setFormOpen(true);
  };

  const handleDelete = (plan: PlanEstudio) => {
    setDeleteTarget(plan);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await planEstudioApi.delete(deleteTarget.id);
      setDeleteTarget(null);
      await fetchData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar';
      setError(message);
    }
  };

  const handleManageGrados = (planId: number) => {
    navigate(`/grados-asignaturas/${planId}`);
  };

  const handleFormSubmit = async (formData: PlanEstudioFormData) => {
    if (editingPlan) {
      await planEstudioApi.update(editingPlan.id, formData);
    } else {
      await planEstudioApi.create(formData);
    }
  };

  const handleFormSuccess = () => {
    setFormOpen(false);
    setEditingPlan(null);
    setActivePlanAlert(false);
    fetchData();
  };

  const handleFormError = (err: Error & { data?: { non_field_errors?: string[] } }) => {
    if (err.data?.non_field_errors?.some((msg) => msg.toLowerCase().includes('active'))) {
      setActivePlanAlert(true);
    }
  };

  const handleNewPlan = () => {
    const hasActive = data.some((p) => p.es_activo);
    if (hasActive) {
      setActivePlanAlert(true);
    }
    setEditingPlan(null);
    setFormOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header block */}
      <section className="bg-heading-block border border-slate-200 rounded-sm p-6 w-full shadow-sm border-t-4 border-t-heading-block-border relative flex flex-col justify-center overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2 tracking-tight text-slate-900">
            Planes de Estudio
          </h2>
          <p className="text-slate-600 text-base">
            Administre los planes de estudio de la institución
          </p>
        </div>
        <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-[0.07] pointer-events-none">
          <span className="material-symbols-outlined text-9xl text-primary">menu_book</span>
        </div>
      </section>

      {error && (
        <div className="bg-danger/10 text-danger px-4 py-3 rounded-sm text-sm">
          {error}
        </div>
      )}

      {activePlanAlert && (
        <div className="bg-warning/10 border border-warning text-warning px-4 py-3 rounded-sm text-sm flex items-center justify-between">
          <span>Advertencia: Ya existe un plan de estudio activo. Solo se permite un plan activo por institución.</span>
          <button
            onClick={() => setActivePlanAlert(false)}
            className="px-3 py-1 rounded-sm hover:bg-warning/20 transition-colors font-medium"
          >
            Cerrar
          </button>
        </div>
      )}

      {deleteTarget && (
        <div className="bg-warning/10 border border-warning text-warning px-4 py-3 rounded-sm text-sm flex items-center justify-between">
          <span>Eliminar plan de estudio &quot;{deleteTarget.nombre}&quot;?</span>
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

      {/* Action bar */}
      <div className="flex items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 flex-1 max-w-xl">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Buscar por nombre..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            Buscar
          </button>
          {searchTerm && (
            <button
              type="button"
              onClick={() => { setLocalSearch(''); handleSearch(''); }}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Limpiar
            </button>
          )}
        </form>

        <button
          onClick={handleNewPlan}
          className="flex items-center gap-2 px-8 py-3.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-bold"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Nuevo Plan de Estudio
        </button>
      </div>

      {/* Table */}
      {isLoading && data.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <span className="material-symbols-outlined text-4xl text-primary animate-spin">refresh</span>
        </div>
      ) : (
        <PlanEstudioTable
          data={data}
          count={count}
          page={page}
          pageSize={pageSize}
          ordering={ordering}
          onSort={handleSort}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onManageGrados={handleManageGrados}
        />
      )}

      {/* Form Modal */}
      <PlanEstudioForm
        isOpen={formOpen}
        onClose={() => { setFormOpen(false); setEditingPlan(null); setActivePlanAlert(false); }}
        onSuccess={handleFormSuccess}
        onError={handleFormError}
        initialData={editingPlan}
        onSubmit={handleFormSubmit}
        institucionId={institutionId}
      />
    </div>
  );
}
