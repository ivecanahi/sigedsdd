import type { GradoEscolar } from '../types/gradoEscolar';

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
      <div className="overflow-x-auto border border-slate-200 rounded-sm">
        <table className="w-full text-left">
          <thead className="bg-primary text-white">
            <tr>
              <th className="px-4 py-3">
                <button
                  onClick={() => onSort('nombre')}
                  className="flex items-center gap-1 font-display font-bold text-[15px] uppercase tracking-wider hover:text-white/90"
                >
                  NOMBRE
                  <span className="material-symbols-outlined text-sm">{getSortIcon('nombre', ordering)}</span>
                </button>
              </th>
              <th className="px-4 py-3">
                <button
                  onClick={() => onSort('orden')}
                  className="flex items-center gap-1 font-display font-bold text-[15px] uppercase tracking-wider hover:text-white/90"
                >
                  ORDEN
                  <span className="material-symbols-outlined text-sm">{getSortIcon('orden', ordering)}</span>
                </button>
              </th>
              <th className="px-4 py-3">
                <button
                  onClick={() => onSort('nivel__nombre')}
                  className="flex items-center gap-1 font-display font-bold text-[15px] uppercase tracking-wider hover:text-white/90"
                >
                  NIVEL
                  <span className="material-symbols-outlined text-sm">{getSortIcon('nivel__nombre', ordering)}</span>
                </button>
              </th>
              <th className="px-4 py-3">
                <button
                  onClick={() => onSort('subnivel__nombre')}
                  className="flex items-center gap-1 font-display font-bold text-[15px] uppercase tracking-wider hover:text-white/90"
                >
                  SUBNIVEL
                  <span className="material-symbols-outlined text-sm">{getSortIcon('subnivel__nombre', ordering)}</span>
                </button>
              </th>
              <th className="px-4 py-3 font-display font-bold text-[15px] uppercase tracking-wider">
                CARGA PEDAGÓGICA
              </th>
              <th className="px-4 py-3 font-display font-bold text-[15px] uppercase tracking-wider text-right">
                ACCIONES
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {data.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  No se encontraron grados escolares.
                </td>
              </tr>
            ) : (
              data.map((grado) => (
                <tr
                  key={grado.id}
                  className={`hover:bg-slate-50 transition-colors cursor-pointer ${
                    selectedGradoId === grado.id ? 'bg-sidebar-active/10' : ''
                  }`}
                  onClick={() => onSelectGrado(grado)}
                >
                  <td className="px-4 py-3 font-medium text-slate-900">{grado.nombre}</td>
                  <td className="px-4 py-3 text-slate-700">{grado.orden}</td>
                  <td className="px-4 py-3 text-slate-700">{grado.nivel?.nombre || '—'}</td>
                  <td className="px-4 py-3 text-slate-700">{grado.subnivel?.nombre || '—'}</td>
                  <td className="px-4 py-3 text-slate-700">
                    <div className="flex items-center gap-2">
                      <span>{grado.carga_pedagogica_total}</span>
                      {grado.alerta_carga_pedagogica && (
                        <span className="material-symbols-outlined text-danger text-sm">warning</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); onEdit(grado); }}
                        className="px-3 py-1.5 rounded-md bg-[#dcfce7] text-[#166534] text-sm font-medium hover:bg-[#d1fae5] transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onDelete(grado); }}
                        className="px-3 py-1.5 rounded-md bg-[#fee2e2] text-[#991b1b] text-sm font-medium hover:bg-[#fecaca] transition-colors"
                      >
                        Eliminar
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
          <span className="text-sm text-slate-600">Mostrar</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="border border-slate-200 rounded-sm px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span className="text-sm text-slate-600">por página</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-slate-700"
          >
            <span className="material-symbols-outlined text-sm">chevron_left</span>
          </button>
          {getPageNumbers().map((p, idx) => (
            <button
              key={idx}
              onClick={() => typeof p === 'number' && onPageChange(p)}
              disabled={p === '...'}
              className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-colors ${
                p === page
                  ? 'bg-primary text-white'
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
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-slate-700"
          >
            <span className="material-symbols-outlined text-sm">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  );
}
