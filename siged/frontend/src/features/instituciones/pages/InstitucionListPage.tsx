import { useState, useEffect, useCallback } from 'react';
import { Button, ConfirmDialog, PageHeader, SearchInput, TableSkeleton, useToast } from '../../../components/ui';
import { institucionApi } from '../services/institucionApi';
import type { Institucion, InstitucionFormData } from '../types/institucion';
import InstitucionTable from '../components/InstitucionTable';
import InstitucionForm from '../components/InstitucionForm';
import AutoridadAcademicaModal from '../components/AutoridadAcademicaModal';

export default function InstitucionListPage() {
  const [data, setData] = useState<Institucion[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [ordering, setOrdering] = useState('nombre');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const [formOpen, setFormOpen] = useState(false);
  const [editingInstitucion, setEditingInstitucion] = useState<Institucion | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalInstitucion, setModalInstitucion] = useState<Institucion | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
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
      toast.error(err instanceof Error ? err.message : 'Error al cargar instituciones');
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, ordering, searchTerm, toast]);

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

  const handleEdit = (inst: Institucion) => {
    setEditingInstitucion(inst);
    setFormOpen(true);
  };

  const [deleteTarget, setDeleteTarget] = useState<Institucion | null>(null);

  const handleDelete = (inst: Institucion) => {
    setDeleteTarget(inst);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await institucionApi.delete(deleteTarget.id);
      setDeleteTarget(null);
      await fetchData();
    } catch {
      toast.error(
        `Operación fallida\nNo se pudo eliminar la institución "${deleteTarget.nombre}" debido a dependencias activas (ej. usuarios, cursos, registros financieros). Por favor, resuelva estas dependencias primero o contacte al administrador.`
      );
      setDeleteTarget(null);
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

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Administración"
        title="Gestión de instituciones educativas"
        description="Administra los datos principales y autoridades académicas de las instituciones"
        icon="account_balance"
        actions={
          <Button icon="add" onClick={() => { setEditingInstitucion(null); setFormOpen(true); }}>
            Nueva Institución
          </Button>
        }
      />

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Eliminar institución"
        description={
          <div className="space-y-3">
            <p>
              ¿Está seguro de que desea eliminar la institución <strong className="text-ink">{deleteTarget?.nombre}</strong>?
            </p>
            <div className="rounded-lg bg-danger/5 border border-danger/20 p-3 text-sm text-danger">
              <span className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">error</span>
                <span>Esta acción no se puede deshacer. Si la institución tiene dependencias activas (usuarios, planes de estudio, registros), la eliminación fallará.</span>
              </span>
            </div>
          </div>
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
          placeholder="Buscar por nombre, código o RUC..."
          className="max-w-xl flex-1"
        />
      </div>

      {/* Table */}
      {isLoading && data.length === 0 ? (
        <TableSkeleton rows={5} columns={5} />
      ) : (
        <InstitucionTable
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
