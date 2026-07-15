import Icon from './Icon';

interface PaginationProps {
  count: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  /** Nombre plural de lo que se lista, p. ej. "instituciones". */
  itemLabel?: string;
}

function pageNumbers(page: number, totalPages: number): (number | string)[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);
  if (page <= 4) return [1, 2, 3, 4, 5, '…', totalPages];
  if (page >= totalPages - 3) {
    return [1, '…', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }
  return [1, '…', page - 1, page, page + 1, '…', totalPages];
}

/** Paginación compartida por todas las tablas: antes estaba duplicada en cada una. */
export default function Pagination({
  count,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  itemLabel = 'registros',
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(count / pageSize));
  const from = count === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, count);

  return (
    <nav
      aria-label="Paginación"
      className="flex flex-col items-center justify-between gap-3 border-t border-border px-4 py-3 sm:flex-row"
    >
      <p className="text-[13px] text-ink-muted">
        <span className="font-semibold text-ink tabular">
          {from}–{to}
        </span>{' '}
        de <span className="font-semibold text-ink tabular">{count}</span> {itemLabel}
      </p>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-[13px] text-ink-muted">
          <span className="hidden sm:inline">Filas</span>
          <select
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            aria-label="Filas por página"
            className="h-8 cursor-pointer rounded-md border border-border-strong bg-surface px-2 text-[13px] font-medium text-ink focus:border-primary-500 focus:ring-4 focus:ring-primary-100 focus:outline-none"
          >
            {[5, 10, 20, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            aria-label="Página anterior"
            className="flex size-8 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-slate-100 hover:text-ink disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent"
          >
            <Icon name="chevron_left" className="text-[18px]" />
          </button>

          {pageNumbers(page, totalPages).map((entry, index) =>
            typeof entry === 'number' ? (
              <button
                key={entry}
                type="button"
                onClick={() => onPageChange(entry)}
                aria-label={`Página ${entry}`}
                aria-current={entry === page ? 'page' : undefined}
                className={`size-8 rounded-md text-[13px] font-semibold transition-colors tabular ${
                  entry === page
                    ? 'bg-primary-600 text-white'
                    : 'text-ink-muted hover:bg-slate-100 hover:text-ink'
                }`}
              >
                {entry}
              </button>
            ) : (
              <span key={`gap-${index}`} className="size-8 text-center text-[13px] leading-8 text-ink-subtle">
                {entry}
              </span>
            ),
          )}

          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            aria-label="Página siguiente"
            className="flex size-8 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-slate-100 hover:text-ink disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent"
          >
            <Icon name="chevron_right" className="text-[18px]" />
          </button>
        </div>
      </div>
    </nav>
  );
}
