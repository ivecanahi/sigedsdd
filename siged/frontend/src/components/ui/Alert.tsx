import type { ReactNode } from 'react';
import Icon from './Icon';
import { IconButton } from './Button';

type Tone = 'info' | 'success' | 'warning' | 'danger';

interface AlertProps {
  tone?: Tone;
  title?: string;
  children?: ReactNode;
  /** Si se entrega, muestra el botón de cierre. */
  onDismiss?: () => void;
  /** Acción opcional alineada a la derecha. */
  action?: ReactNode;
  className?: string;
}

const TONES: Record<Tone, { box: string; icon: string; symbol: string }> = {
  info: { box: 'bg-info-soft/60 border-info/25', icon: 'text-info', symbol: 'info' },
  success: { box: 'bg-success-soft/70 border-success/25', icon: 'text-success', symbol: 'check_circle' },
  warning: { box: 'bg-warning-soft/70 border-warning/30', icon: 'text-warning', symbol: 'warning' },
  danger: { box: 'bg-danger-soft/70 border-danger/25', icon: 'text-danger', symbol: 'error' },
};

/** Mensaje contextual persistente. Para confirmaciones use ConfirmDialog; para avisos efímeros, useToast. */
export default function Alert({ tone = 'info', title, children, onDismiss, action, className = '' }: AlertProps) {
  const style = TONES[tone];
  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      className={`flex animate-slide-up items-start gap-3 rounded-xl border px-4 py-3 ${style.box} ${className}`}
    >
      <Icon name={style.symbol} filled className={`mt-0.5 text-[20px] ${style.icon}`} />
      <div className="min-w-0 flex-1">
        {title && <p className={`text-sm font-semibold ${style.icon}`}>{title}</p>}
        {children && <div className={`text-sm ${title ? 'mt-0.5 text-ink-muted' : style.icon}`}>{children}</div>}
      </div>
      {action}
      {onDismiss && <IconButton icon="close" label="Cerrar aviso" size="sm" onClick={onDismiss} />}
    </div>
  );
}
