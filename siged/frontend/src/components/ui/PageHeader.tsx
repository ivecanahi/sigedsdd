import type { ReactNode } from 'react';
import Icon from './Icon';

interface PageHeaderProps {
  title: string;
  description?: string;
  /** Etiqueta corta sobre el título que sitúa la página en su contexto. */
  eyebrow?: string;
  icon?: string;
  /** Acción principal de la página, alineada a la derecha. */
  actions?: ReactNode;
}

/**
 * Encabezado de página. Un solo bloque para todas las vistas, en lugar
 * de repetir el mismo `section` en cada archivo.
 */
export default function PageHeader({ title, description, eyebrow, icon, actions }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex min-w-0 items-start gap-4">
        {icon && (
          <span className="hidden size-12 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 ring-1 ring-primary-100 sm:flex">
            <Icon name={icon} className="text-[26px]" />
          </span>
        )}
        <div className="min-w-0">
          {eyebrow && (
            <p className="mb-1 text-[11px] font-bold tracking-[0.14em] text-primary-600 uppercase">{eyebrow}</p>
          )}
          <h1 className="truncate font-display text-2xl font-extrabold text-ink sm:text-[28px]">{title}</h1>
          {description && <p className="mt-1.5 max-w-2xl text-sm text-ink-muted">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  );
}
