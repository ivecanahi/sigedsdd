import type { ReactNode } from 'react';
import Icon from './Icon';

/** Contenedor de tabla: borde, radio y desplazamiento horizontal en pantallas pequeñas. */
export function TableCard({ children, footer }: { children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-card">
      <div className="overflow-x-auto">{children}</div>
      {footer}
    </div>
  );
}

/** Cabecera de tabla con estilo unificado. */
export function Th({
  children,
  align = 'left',
  className = '',
}: {
  children: ReactNode;
  align?: 'left' | 'right' | 'center';
  className?: string;
}) {
  const alignment = align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';
  return (
    <th
      scope="col"
      className={`px-4 py-3 font-display text-[11px] font-bold tracking-wider text-white/80 uppercase ${alignment} ${className}`}
    >
      {children}
    </th>
  );
}

interface SortHeaderProps {
  label: string;
  /** Campo tal como lo espera el parámetro `ordering` de la API. */
  field: string;
  ordering: string;
  onSort: (field: string) => void;
  align?: 'left' | 'right' | 'center';
}

/** Cabecera ordenable: comunica el sentido del orden y lo anuncia por aria-sort. */
export function SortHeader({ label, field, ordering, onSort, align = 'left' }: SortHeaderProps) {
  const isAsc = ordering === field;
  const isDesc = ordering === `-${field}`;
  const active = isAsc || isDesc;
  const alignment = align === 'right' ? 'justify-end' : align === 'center' ? 'justify-center' : 'justify-start';

  return (
    <th scope="col" aria-sort={isAsc ? 'ascending' : isDesc ? 'descending' : 'none'} className="px-4 py-3">
      <button
        type="button"
        onClick={() => onSort(field)}
        className={`flex w-full items-center gap-1 font-display text-[11px] font-bold tracking-wider uppercase transition-colors ${alignment} ${
          active ? 'text-white' : 'text-white/80 hover:text-white'
        }`}
      >
        {label}
        <Icon
          name={isAsc ? 'arrow_upward' : isDesc ? 'arrow_downward' : 'unfold_more'}
          bold
          className={`text-[14px] transition-opacity ${active ? 'opacity-100' : 'opacity-45'}`}
        />
      </button>
    </th>
  );
}

/** Fila de cabecera con el color institucional. */
export function Thead({ children }: { children: ReactNode }) {
  return (
    <thead className="bg-primary-700">
      <tr>{children}</tr>
    </thead>
  );
}
