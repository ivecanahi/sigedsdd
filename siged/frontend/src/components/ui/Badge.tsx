import type { ReactNode } from 'react';
import Icon from './Icon';

type Tone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

interface BadgeProps {
  tone?: Tone;
  icon?: string;
  /** Punto de estado en lugar de ícono. */
  dot?: boolean;
  children: ReactNode;
  className?: string;
}

const TONES: Record<Tone, string> = {
  neutral: 'bg-slate-100 text-ink-muted ring-slate-200',
  primary: 'bg-primary-50 text-primary-700 ring-primary-100',
  success: 'bg-success-soft text-success ring-green-200',
  warning: 'bg-warning-soft text-warning ring-amber-200',
  danger: 'bg-danger-soft text-danger ring-red-200',
  info: 'bg-info-soft text-info ring-blue-200',
};

const DOTS: Record<Tone, string> = {
  neutral: 'bg-ink-subtle',
  primary: 'bg-primary-500',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  info: 'bg-info',
};

/** Etiqueta compacta de estado o metadato. */
export default function Badge({ tone = 'neutral', icon, dot = false, children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset whitespace-nowrap ${TONES[tone]} ${className}`}
    >
      {dot && <span className={`size-1.5 rounded-full ${DOTS[tone]}`} />}
      {icon && <Icon name={icon} className="text-[14px]" />}
      {children}
    </span>
  );
}
