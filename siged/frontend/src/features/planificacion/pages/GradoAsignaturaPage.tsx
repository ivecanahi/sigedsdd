import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { planEstudioApi } from '../services/planEstudioApi';
import { gradoEscolarApi } from '../services/gradoEscolarApi';
import { asignaturaApi } from '../services/asignaturaApi';
import { nivelApi } from '../services/nivelApi';
import type { GradoEscolar, GradoEscolarFormData } from '../types/gradoEscolar';
import type { Asignatura, AsignaturaFormData } from '../types/asignatura';
import type { Nivel } from '../types/nivel';
import GradoEscolarTable from '../components/GradoEscolarTable';
import GradoEscolarForm from '../components/GradoEscolarForm';
import AsignaturaSection from '../components/AsignaturaSection';

export default function GradoAsignaturaPage() {
  const { planEstudioId } = useParams<{ planEstudioId: string }>();
  const navigate = useNavigate();
  const planId = Number(planEstudioId);

  const [planNombre, setPlanNombre] = useState('');
  const [grados, setGrados] = useState<GradoEscolar[]>([]);
  const [selectedGrado, setSelectedGrado] = useState<GradoEscolar | null>(null);
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
  const [niveles, setNiveles] = useState<Nivel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [ordering, setOrdering] = useState('nombre');
  const [searchTerm, setSearchTerm] = useState('');
  const [localSearch, setLocalSearch] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editingGrado, setEditingGrado] = useState<GradoEscolar | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<GradoEscolar | null>(null);

  const fetchPlan = useCallback(async () => {
    try {
      const plan = await planEstudioApi.detail(planId);
      setPlanNombre(plan.nombre);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar plan de estudio');
    }
  }, [planId]);

  const fetchGrados = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await gradoEscolarApi.listByPlanEstudio(planId, {
        page,
        page_size: pageSize,
        ordering,
        nombre: searchTerm || undefined,
      });
      setGrados(response.results);
      setCount(response.count);
      if (response.results.length > 0 && !selectedGrado) {
        setSelectedGrado(response.results[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar grados escolares');
    } finally {
      setIsLoading(false);
    }
  }, [planId, page, pageSize, ordering, searchTerm, selectedGrado]);

  const fetchAsignaturas = useCallback(async () => {
    if (!selectedGrado) return;
    try {
      const data = await asignaturaApi.listByGradoEscolar(selectedGrado.id);
      setAsignaturas(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar asignaturas');
    }
  }, [selectedGrado]);

  const fetchNiveles = useCallback(async () => {
    try {
      const data = await nivelApi.list();
      setNiveles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar niveles');
    }
  }, []);

  useEffect(() => {
    fetchPlan();
    fetchGrados();
    fetchNiveles();
  }, [fetchPlan, fetchGrados, fetchNiveles]);

  useEffect(() => {
    fetchAsignaturas();
  }, [fetchAsignaturas]);

  const handleSelectGrado = (grado: GradoEscolar) => {
    setSelectedGrado(grado);
  };

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

  const handleEdit = (grado: GradoEscolar) => {
    setEditingGrado(grado);
    setFormOpen(true);
  };

  const handleDelete = (grado: GradoEscolar) => {
    setDeleteTarget(grado);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await gradoEscolarApi.delete(deleteTarget.id);
      setDeleteTarget(null);
      if (selectedGrado?.id === deleteTarget.id) {
        setSelectedGrado(null);
      }
      await fetchGrados();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar';
      setError(message);
    }
  };

  const handleFormSubmit = async (formData: GradoEscolarFormData) => {
    if (editingGrado) {
      await gradoEscolarApi.update(editingGrado.id, formData);
    } else {
      await gradoEscolarApi.create(formData);
    }
  };

  const handleFormSuccess = () => {
    setFormOpen(false);
    setEditingGrado(null);
    fetchGrados();
  };

  const handleCreateAsignatura = async (data: AsignaturaFormData) => {
    if (!selectedGrado) return;
    await asignaturaApi.create({ ...data, grado_escolar: selectedGrado.id });
    await fetchGrados();
  };

  const handleUpdateAsignatura = async (id: number, data: Partial<AsignaturaFormData>) => {
    await asignaturaApi.update(id, data);
    await fetchGrados();
  };

  const handleDeleteAsignatura = async (id: number) => {
    await asignaturaApi.delete(id);
    await fetchGrados();
  };

  return (
    <div className="space-y-6">
      {/* Header block */}
      <section className="bg-heading-block border border-slate-200 rounded-sm p-6 w-full shadow-sm border-t-4 border-t-heading-block-border relative flex flex-col justify-center overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2 tracking-tight text-slate-900">
            Grados y Asignaturas
          </h2>
          <p className="text-slate-600 text-base">
            Plan: {planNombre}
          </p>
        </div>
        <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-[0.07] pointer-events-none">
          <span className="material-symbols-outlined text-9xl text-primary">class</span>
        </div>
      </section>

      {error && (
        <div className="bg-danger/10 text-danger px-4 py-3 rounded-sm text-sm">
          {error}
        </div>
      )}

      {deleteTarget && (
        <div className="bg-warning/10 border border-warning text-warning px-4 py-3 rounded-sm text-sm flex items-center justify-between">
          <span>Eliminar grado escolar &quot;{deleteTarget.nombre}&quot;?</span>
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

      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors text-sm font-medium"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Volver
        </button>
        <button
          onClick={() => { setEditingGrado(null); setFormOpen(true); }}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-bold"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Nuevo Grado Escolar
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Grados table */}
        <div>
          <h3 className="text-lg font-bold text-slate-900 mb-3">Grados Escolares</h3>

          <form onSubmit={handleSearchSubmit} className="flex gap-2 mb-3">
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

          {isLoading && grados.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <span className="material-symbols-outlined text-4xl text-primary animate-spin">refresh</span>
            </div>
          ) : (
            <GradoEscolarTable
              data={grados}
              selectedGradoId={selectedGrado?.id || null}
              count={count}
              page={page}
              pageSize={pageSize}
              ordering={ordering}
              onSort={handleSort}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              onSelectGrado={handleSelectGrado}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </div>

        {/* Right: Asignaturas section */}
        <div>
          <AsignaturaSection
            asignaturas={asignaturas}
            selectedGradoNombre={selectedGrado?.nombre || null}
            onCreate={handleCreateAsignatura}
            onUpdate={handleUpdateAsignatura}
            onDelete={handleDeleteAsignatura}
            onRefresh={fetchAsignaturas}
          />
        </div>
      </div>

      {/* Form Modal */}
      <GradoEscolarForm
        isOpen={formOpen}
        onClose={() => { setFormOpen(false); setEditingGrado(null); }}
        onSuccess={handleFormSuccess}
        initialData={editingGrado}
        onSubmit={handleFormSubmit}
        planEstudioId={planId}
        niveles={niveles}
      />
    </div>
  );
}
