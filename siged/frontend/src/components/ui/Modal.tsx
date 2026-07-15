import { useCallback, useEffect, useId, useRef } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import Icon from './Icon';
import { IconButton } from './Button';

type Size = 'sm' | 'md' | 'lg' | 'xl';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  /** Línea de apoyo bajo el título (p. ej. el nombre de la institución). */
  subtitle?: string;
  /** Símbolo que identifica el tipo de contenido. */
  icon?: string;
  size?: Size;
  children: ReactNode;
  /** Barra inferior fija con las acciones del diálogo. */
  footer?: ReactNode;
}

const SIZES: Record<Size, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Diálogo modal accesible: cierra con Escape, bloquea el scroll de fondo,
 * atrapa el foco y lo devuelve al elemento que lo abrió.
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  size = 'md',
  children,
  footer,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const titleId = useId();

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // Con diálogos anidados, solo responde el que está encima.
        const dialogs = document.querySelectorAll('[role="dialog"]');
        if (dialogs.length > 0 && dialogs[dialogs.length - 1] !== panelRef.current) return;
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !panelRef.current) return;

      const nodes: HTMLElement[] = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
      ).filter((node) => node.offsetParent !== null);
      if (nodes.length === 0) return;

      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!isOpen) return;

    openerRef.current = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    const focusTimer = window.setTimeout(() => {
      const target = panelRef.current?.querySelector<HTMLElement>(FOCUSABLE);
      target?.focus();
    }, 20);

    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', handleKeyDown);
      window.clearTimeout(focusTimer);
      openerRef.current?.focus?.();
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div
        className="absolute inset-0 animate-fade-in bg-ink/45 backdrop-blur-[3px]"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`relative flex max-h-[92vh] w-full animate-scale-in flex-col overflow-hidden rounded-t-2xl bg-surface shadow-pop sm:rounded-2xl ${SIZES[size]}`}
      >
        <header className="flex items-start gap-3 border-b border-border px-5 py-4 sm:px-6">
          {icon && (
            <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
              <Icon name={icon} className="text-[20px]" />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="font-display text-lg font-bold text-ink">
              {title}
            </h2>
            {subtitle && <p className="mt-0.5 truncate text-sm text-ink-muted">{subtitle}</p>}
          </div>
          <IconButton icon="close" label="Cerrar" onClick={onClose} className="-mr-1" />
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>

        {footer && (
          <footer className="flex items-center justify-end gap-3 border-t border-border bg-surface-muted px-5 py-4 sm:px-6">
            {footer}
          </footer>
        )}
      </div>
    </div>,
    document.body,
  );
}
