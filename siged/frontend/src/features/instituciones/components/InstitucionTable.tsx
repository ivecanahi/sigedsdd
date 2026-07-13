import { useState } from 'react';
import type { Institucion } from '../types/institucion';
import type { UsuarioRol } from '../types/usuariorol';

interface InstitucionTableProps {
  data: Institucion[];
  count: number;
  page: number;
  pageSize: number;
  ordering: string;
  searchTerm: string;
  onSort: (field: string) => void;
  onSearch: (term: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onEdit: (institucion: Institucion) => void;
  onDelete: (institucion: Institucion) => void;
  onManageAuthorities: (institucion: Institucion) => void;
}

function getSortIcon(field: string, currentOrdering: string): string {
  if (currentOrdering === field) return 'arrow_upward';
  if (currentOrdering === `-${field}`) return 'arrow_downward';
  return 'unfold_more';
}

function formatAutoridades(autoridades: UsuarioRol[] | undefined): string {
  if (!autoridades || autoridades.length === 0) return '—';
  return autoridades
    .map((a) => `${a.usuario.first_name} ${a.usuario.last_name}`)
    .join(', ');
}

export default function InstitucionTable({
  data,
  count,
  page,
  pageSize,
  ordering,
  searchTerm,
  onSort,
  onSearch,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onDelete,
  onManageAuthorities,
}: InstitucionTableProps) {
  const [localSearch, setLocalSearch] = useState(searchTerm);
  const totalPages = Math.ceil(count / pageSize);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(localSearch);
  };

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Buscar por nombre..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-primary text-white rounded-sm hover:bg-primary/90 transition-colors font-medium"
        >
          Buscar
        </button>
        {searchTerm && (
          <button
            type="button"
            onClick={() => { setLocalSearch(''); onSearch(''); }}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-sm hover:bg-gray-200 transition-colors"
          >
            Limpiar
          </button>
        )}
      </form>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3">
                <button
                  onClick={() => onSort('nombre')}
                  className="flex items-center gap-1 font-semibold text-gray-700 hover:text-primary"
                >
                  Nombre
                  <span className="material-symbols-outlined text-sm">{getSortIcon('nombre', ordering)}</span>
                </button>
              </th>
              <th className="px-4 py-3">
                <button
                  onClick={() => onSort('codigo')}
                  className="flex items-center gap-1 font-semibold text-gray-700 hover:text-primary"
                >
                  Código
                  <span className="material-symbols-outlined text-sm">{getSortIcon('codigo', ordering)}</span>
                </button>
              </th>
              <th className="px-4 py-3">
                <button
                  onClick={() => onSort('ruc')}
                  className="flex items-center gap-1 font-semibold text-gray-700 hover:text-primary"
                >
                  RUC
                  <span className="material-symbols-outlined text-sm">{getSortIcon('ruc', ordering)}</span>
                </button>
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">Autoridades Académicas</th>
              <th className="px-4 py-3 font-semibold text-gray-700 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  No se encontraron instituciones.
                </td>
              </tr>
            ) : (
              data.map((inst) => (
                <tr key={inst.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{inst.nombre}</td>
                  <td className="px-4 py-3 text-gray-700">{inst.codigo}</td>
                  <td className="px-4 py-3 text-gray-700">{inst.ruc}</td>
                  <td className="px-4 py-3 text-gray-700">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate max-w-[200px]" title={formatAutoridades(inst.autoridades_academicas)}>
                        {formatAutoridades(inst.autoridades_academicas)}
                      </span>
                      <button
                        onClick={() => onManageAuthorities(inst)}
                        className="text-primary hover:text-secondary text-sm font-medium whitespace-nowrap"
                      >
                        Gestionar
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEdit(inst)}
                        className="p-1.5 text-primary hover:bg-primary/10 rounded-sm transition-colors"
                        title="Editar"
                      >
                        <span className="material-symbols-outlined text-xl">edit</span>
                      </button>
                      <button
                        onClick={() => onDelete(inst)}
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

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Mostrar</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="border border-gray-200 rounded-sm px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span className="text-sm text-gray-600">por página</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            {count === 0 ? '0' : `${(page - 1) * pageSize + 1} - ${Math.min(page * pageSize, count)}`} de {count}
          </span>
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="p-1 rounded-sm hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="p-1 rounded-sm hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  );
}
