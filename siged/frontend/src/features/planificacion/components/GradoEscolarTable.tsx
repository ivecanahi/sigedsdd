import type { GradoEscolar } from '../types/gradoEscolar';
import { IconButton } from '../../../components/ui';

interface GradoEscolarTableProps {
  data: GradoEscolar[];
  selectedGradoId: number | null;
  count: number;
  page: number;
  pageSize: number;
  ordering: string;
  onSort: (field: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onSelectGrado: (grado: GradoEscolar) => void;
  onEdit: (grado: GradoEscolar) => void;
  onDelete: (grado: GradoEscolar) => void;
}

function getSortIcon(field: string, currentOrdering: string): string {
  if (currentOrdering === field) return 'arrow_upward';
  if (currentOrdering === `-${field}`) return 'arrow_downward';
  return 'unfold_more';
}

export default function GradoEscolarTable({
  data,
  selectedGradoId,
  count,
  page,
  pageSize,
  ordering,
  onSort,
  onPageChange,
  onPageSizeChange,
  onSelectGrado,
  onEdit,
  onDelete,
}: GradoEscolarTableProps) {
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
                  Nombre
                  <span className="material-symbols-outlined text-[14px]">{getSortIcon('nombre', ordering)}</span>
                </button>
              </th>
              <th className="px-4 py-3">
                <button
                  onClick={() => onSort('orden')}
                  className="flex items-center gap-1 font-display text-[11px] font-bold tracking-wider uppercase text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Orden
                  <span className="material-symbols-outlined text-[14px]">{getSortIcon('orden', ordering)}</span>
                </button>
              </th>
              <th className="px-4 py-3">
                <button
                  onClick={() => onSort('nivel__nombre')}
                  className="flex items-center gap-1 font-display text-[11px] font-bold tracking-wider uppercase text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Nivel
                  <span className="material-symbols-outlined text-[14px]">{getSortIcon('nivel__nombre', ordering)}</span>
                </button>
              </th>
              <th className="px-4 py-3">
                <button
                  onClick={() => onSort('subnivel__nombre')}
                  className="flex items-center gap-1 font-display text-[11px] font-bold tracking-wider uppercase text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Subnivel
                  <span className="material-symbols-outlined text-[14px]">{getSortIcon('subnivel__nombre', ordering)}</span>
                </button>
              </th>
              <th className="px-4 py-3 font-display text-[11px] font-bold tracking-wider uppercase text-slate-600">
                Carga pedagógica
              </th>
              <th className="px-4 py-3 font-display text-[11px] font-bold tracking-wider uppercase text-slate-600 text-right">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <span className="material-symbols-outlined text-[36px] text-slate-300">group_off</span>
                    <p className="text-sm font-medium text-slate-400">No hay grados escolares registrados</p>
                    <p className="text-xs text-slate-400">
                      Haga clic en &quot;Nuevo Grado Escolar&quot; para crear el primero.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((grado) => (
                <tr
                  key={grado.id}
                  className={`hover:bg-slate-50 transition-colors cursor-pointer ${
                    selectedGradoId === grado.id ? 'bg-primary-50' : ''
                  }`}
                  onClick={() => onSelectGrado(grado)}
                >
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">{grado.nombre}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{grado.orden}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{grado.nivel?.nombre || '—'}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{grado.subnivel?.nombre || '—'}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <span className="tabular">{grado.carga_pedagogica_total}</span>
                      {grado.alerta_carga_pedagogica && (
                        <span className="material-symbols-outlined text-danger text-sm" aria-label="Alerta de carga">warning</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <IconButton
                        icon="edit"
                        label="Editar grado"
                        tone="primary"
                        size="sm"
                        onClick={(e) => { e?.stopPropagation(); onEdit(grado); }}
                      />
                      <IconButton
                        icon="delete"
                        label="Eliminar grado"
                        tone="danger"
                        size="sm"
                        onClick={(e) => { e?.stopPropagation(); onDelete(grado); }}
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
