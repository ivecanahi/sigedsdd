import type { ButtonHTMLAttributes, ReactNode } from 'react';
import Icon from './Icon';
import Spinner from './Spinner';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  /** Símbolo de Material Symbols a la izquierda del texto. */
  icon?: string;
  /** Símbolo a la derecha del texto. */
  trailingIcon?: string;
  /** Muestra el spinner y bloquea el botón. */
  loading?: boolean;
  /** Ocupa todo el ancho disponible. */
  block?: boolean;
  children?: ReactNode;
}

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-primary-600 text-white shadow-sm hover:bg-primary-700 active:bg-primary-800 disabled:bg-primary-300',
  secondary:
    'bg-surface text-ink ring-1 ring-inset ring-border-strong hover:bg-surface-muted active:bg-slate-100',
  ghost: 'bg-transparent text-ink-muted hover:bg-slate-100 hover:text-ink',
  danger: 'bg-danger text-white shadow-sm hover:bg-red-800 active:bg-red-900',
  success: 'bg-success text-white shadow-sm hover:bg-green-800 active:bg-green-900',
};

const SIZES: Record<Size, string> = {
  sm: 'h-8 gap-1.5 px-3 text-[13px]',
  md: 'h-10 gap-2 px-4 text-sm',
  lg: 'h-12 gap-2 px-6 text-[15px]',
};

const ICON_SIZES: Record<Size, string> = {
  sm: 'text-[16px]',
  md: 'text-[18px]',
  lg: 'text-[20px]',
};

/** Botón unificado de la aplicación: una sola escala de tamaños, radios y estados. */
export default function Button({
  variant = 'primary',
  size = 'md',
  icon,
  trailingIcon,
  loading = false,
  block = false,
  className = '',
  disabled,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`inline-flex items-center justify-center rounded-lg font-semibold whitespace-nowrap transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-60 ${VARIANTS[variant]} ${SIZES[size]} ${block ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {loading ? (
        <Spinner className={size === 'sm' ? 'size-3.5' : 'size-4'} />
      ) : icon ? (
        <Icon name={icon} bold className={ICON_SIZES[size]} />
      ) : null}
      {children}
      {trailingIcon && !loading ? <Icon name={trailingIcon} bold className={ICON_SIZES[size]} /> : null}
    </button>
  );
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: string;
  /** Texto accesible obligatorio: el botón no tiene etiqueta visible. */
  label: string;
  tone?: 'neutral' | 'primary' | 'danger' | 'success' | 'warning';
  size?: 'sm' | 'md';
}

const TONES: Record<NonNullable<IconButtonProps['tone']>, string> = {
  neutral: 'text-ink-muted hover:bg-slate-100 hover:text-ink',
  primary: 'text-primary-600 hover:bg-primary-50',
  danger: 'text-danger hover:bg-danger-soft',
  success: 'text-success hover:bg-success-soft',
  warning: 'text-warning hover:bg-warning-soft',
};

/** Botón de solo ícono con etiqueta accesible y tooltip nativo. */
export function IconButton({
  icon,
  label,
  tone = 'neutral',
  size = 'md',
  className = '',
  type = 'button',
  ...rest
}: IconButtonProps) {
  return (
    <button
      type={type}
      title={label}
      aria-label={label}
      className={`inline-flex items-center justify-center rounded-lg transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40 ${TONES[tone]} ${size === 'sm' ? 'size-8' : 'size-9'} ${className}`}
      {...rest}
    >
      <Icon name={icon} className={size === 'sm' ? 'text-[18px]' : 'text-[20px]'} />
    </button>
  );
}
