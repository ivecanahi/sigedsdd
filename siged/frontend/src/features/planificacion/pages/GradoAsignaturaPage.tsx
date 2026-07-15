import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, ConfirmDialog, Alert, PageHeader, SearchInput, TableSkeleton } from '../../../components/ui';
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
      <PageHeader
        eyebrow="Planificación"
        title="Grados y Asignaturas"
        description={`Plan: ${planNombre}`}
        icon="class"
      />

      {error && <Alert tone="danger" title="Error">{error}</Alert>}

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Eliminar grado escolar"
        description={
          <>
            ¿Eliminar <strong>{deleteTarget?.nombre}</strong>? Esta acción no se puede deshacer.
          </>
        }
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        tone="danger"
      />

      <div className="flex items-center justify-between">
        <Button variant="ghost" icon="arrow_back" onClick={() => navigate(-1)}>
          Volver
        </Button>
        <Button icon="add" onClick={() => { setEditingGrado(null); setFormOpen(true); }}>
          Nuevo Grado Escolar
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Grados table */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5">
          <h3 className="text-lg font-bold text-ink mb-4">Grados Escolares</h3>

          <SearchInput
            value={searchTerm}
            onSearch={handleSearch}
            placeholder="Buscar por nombre..."
            className="mb-3"
          />

          {isLoading && grados.length === 0 ? (
            <TableSkeleton rows={5} columns={6} />
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
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5">
          <AsignaturaSection
            asignaturas={asignaturas}
            selectedGrado={selectedGrado}
            hasGrados={grados.length > 0}
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
