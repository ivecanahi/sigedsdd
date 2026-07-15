import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, ConfirmDialog, Alert, PageHeader, SearchInput, TableSkeleton } from '../../../components/ui';
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
      <PageHeader
        eyebrow="Planificación"
        title="Planes de Estudio"
        description="Administre los planes de estudio de la institución"
        icon="menu_book"
        actions={
          <Button icon="add" onClick={handleNewPlan}>
            Nuevo Plan de Estudio
          </Button>
        }
      />

      {error && <Alert tone="danger" title="Error">{error}</Alert>}

      {activePlanAlert && (
        <Alert
          tone="warning"
          title="Advertencia"
          onDismiss={() => setActivePlanAlert(false)}
        >
          Ya existe un plan de estudio activo. Solo se permite un plan activo por institución.
        </Alert>
      )}

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Eliminar plan de estudio"
        description={
          <>
            ¿Eliminar <strong>{deleteTarget?.nombre}</strong>? Esta acción no se puede deshacer.
          </>
        }
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        tone="danger"
      />

      {/* Action bar */}
      <div className="flex items-center justify-between gap-4">
        <SearchInput
          value={searchTerm}
          onSearch={handleSearch}
          placeholder="Buscar por nombre..."
          className="max-w-xl flex-1"
        />
      </div>

      {/* Table */}
      {isLoading && data.length === 0 ? (
        <TableSkeleton rows={5} columns={3} />
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
