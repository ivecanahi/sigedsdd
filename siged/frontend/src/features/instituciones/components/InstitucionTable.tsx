import type { Institucion } from '../types/institucion';
import { IconButton } from '../../../components/ui';

interface InstitucionTableProps {
  data: Institucion[];
  count: number;
  page: number;
  pageSize: number;
  ordering: string;
  onSort: (field: string) => void;
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

export default function InstitucionTable({
  data,
  count,
  page,
  pageSize,
  ordering,
  onSort,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onDelete,
  onManageAuthorities,
}: InstitucionTableProps) {
  const totalPages = Math.ceil(count / pageSize);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (page >= totalPages - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = page - 1; i <= page + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3">
                <button
                  onClick={() => onSort('nombre')}
                  className="flex items-center gap-1 font-display text-[11px] font-bold tracking-wider uppercase text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Nombre de la institución
                  <span className="material-symbols-outlined text-[14px]">{getSortIcon('nombre', ordering)}</span>
                </button>
              </th>
              <th className="px-4 py-3">
                <button
                  onClick={() => onSort('codigo')}
                  className="flex items-center gap-1 font-display text-[11px] font-bold tracking-wider uppercase text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Código
                  <span className="material-symbols-outlined text-[14px]">{getSortIcon('codigo', ordering)}</span>
                </button>
              </th>
              <th className="px-4 py-3">
                <button
                  onClick={() => onSort('ruc')}
                  className="flex items-center gap-1 font-display text-[11px] font-bold tracking-wider uppercase text-slate-600 hover:text-slate-900 transition-colors"
                >
                  RUC
                  <span className="material-symbols-outlined text-[14px]">{getSortIcon('ruc', ordering)}</span>
                </button>
              </th>
              <th className="px-4 py-3 font-display text-[11px] font-bold tracking-wider uppercase text-slate-600">
                Autoridades académicas
              </th>
              <th className="px-4 py-3 font-display text-[11px] font-bold tracking-wider uppercase text-slate-600 text-right">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-slate-500">
                  No se encontraron instituciones.
                </td>
              </tr>
            ) : (
              data.map((inst) => (
                <tr key={inst.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">{inst.nombre}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{inst.codigo}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{inst.ruc}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      {inst.autoridades_academicas && inst.autoridades_academicas.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {inst.autoridades_academicas.slice(0, 2).map((a) => (
                            <span
                              key={a.id}
                              className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 text-xs font-medium ring-1 ring-primary-100"
                            >
                              {a.usuario.first_name} {a.usuario.last_name}
                            </span>
                          ))}
                          {inst.autoridades_academicas.length > 2 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                              +{inst.autoridades_academicas.length - 2}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-sm">—</span>
                      )}
                      <button
                        onClick={() => onManageAuthorities(inst)}
                        className="text-primary-600 hover:text-primary-700 text-xs font-semibold whitespace-nowrap transition-colors focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded"
                      >
                        Gestionar
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <IconButton
                        icon="edit"
                        label="Editar institución"
                        tone="primary"
                        size="sm"
                        onClick={() => onEdit(inst)}
                      />
                      <IconButton
                        icon="delete"
                        label="Eliminar institución"
                        tone="danger"
                        size="sm"
                        onClick={() => onDelete(inst)}
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span>Mostrar</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="border border-slate-200 rounded-lg px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span>por página</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="inline-flex items-center justify-center size-8 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-slate-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            aria-label="Página anterior"
          >
            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
          </button>
          {getPageNumbers().map((p, idx) => (
            <button
              key={idx}
              onClick={() => typeof p === 'number' && onPageChange(p)}
              disabled={p === '...'}
              className={`inline-flex items-center justify-center size-8 rounded-lg text-sm font-medium transition-colors focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                p === page
                  ? 'bg-primary-600 text-white'
                  : p === '...'
                    ? 'text-slate-400 cursor-default'
                    : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="inline-flex items-center justify-center size-8 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-slate-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            aria-label="Página siguiente"
          >
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  );
}
