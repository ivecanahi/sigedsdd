import type { ReactNode } from 'react';
import Icon from './Icon';

interface EmptyStateProps {
  icon: string;
  title: string;
  description?: string;
  /** Una pantalla vacía es una invitación a actuar: incluya la acción principal. */
  action?: ReactNode;
  className?: string;
}

/** Estado vacío consistente para listas, tablas y rejillas. */
export default function EmptyState({ icon, title, description, action, className = '' }: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-xl border border-dashed border-border-strong bg-surface-muted px-6 py-14 text-center ${className}`}
    >
      <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-white ring-1 ring-border">
        <Icon name={icon} className="text-[28px] text-ink-subtle" />
      </div>
      <p className="font-display text-base font-bold text-ink">{title}</p>
      {description && <p className="mt-1.5 max-w-md text-sm text-ink-muted">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
