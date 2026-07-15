import { useId } from 'react';
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react';
import Icon from './Icon';

const CONTROL_BASE =
  'w-full rounded-lg border bg-surface px-3 py-2.5 text-sm text-ink transition-colors placeholder:text-ink-subtle focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-ink-subtle';
const CONTROL_OK = 'border-border-strong focus:border-primary-500 focus:ring-primary-100';
const CONTROL_ERROR = 'border-danger focus:border-danger focus:ring-danger/15';

interface LabelProps {
  htmlFor: string;
  children: ReactNode;
  required?: boolean;
}

function FieldLabel({ htmlFor, children, required }: LabelProps) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-semibold text-ink">
      {children}
      {required && (
        <span className="ml-0.5 text-danger" aria-hidden="true">
          *
        </span>
      )}
    </label>
  );
}

function FieldError({ id, message }: { id: string; message: string }) {
  return (
    <p id={id} role="alert" className="mt-1.5 flex items-start gap-1.5 text-[13px] font-medium text-danger">
      <Icon name="error" filled className="mt-px text-[15px]" />
      {message}
    </p>
  );
}

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string;
  /** Primer mensaje de error devuelto por el formulario o la API. */
  error?: string;
  /** Texto de ayuda mostrado cuando no hay error. */
  hint?: string;
  /** Símbolo decorativo al inicio del campo. */
  icon?: string;
  /** Control al final del campo, p. ej. mostrar/ocultar contraseña. */
  trailing?: ReactNode;
  id?: string;
}

/** Campo de texto con etiqueta, ayuda y error enlazados por aria. */
export function TextField({
  label,
  error,
  hint,
  icon,
  trailing,
  id,
  required,
  className = '',
  ...rest
}: TextFieldProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const errorId = `${fieldId}-error`;
  const hintId = `${fieldId}-hint`;

  return (
    <div className={className}>
      <FieldLabel htmlFor={fieldId} required={required}>
        {label}
      </FieldLabel>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-ink-subtle">
            <Icon name={icon} className="text-[18px]" />
          </span>
        )}
        <input
          id={fieldId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          className={`${CONTROL_BASE} ${error ? CONTROL_ERROR : CONTROL_OK} ${icon ? 'pl-10' : ''} ${trailing ? 'pr-11' : ''}`}
          {...rest}
        />
        {trailing && <div className="absolute inset-y-0 right-0 flex items-center pr-1.5">{trailing}</div>}
      </div>
      {error ? (
        <FieldError id={errorId} message={error} />
      ) : hint ? (
        <p id={hintId} className="mt-1.5 text-[13px] text-ink-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

interface SelectFieldProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> {
  label: string;
  error?: string;
  hint?: string;
  id?: string;
  children: ReactNode;
}

/** Lista desplegable con la misma anatomía que TextField. */
export function SelectField({ label, error, hint, id, required, className = '', children, ...rest }: SelectFieldProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const errorId = `${fieldId}-error`;
  const hintId = `${fieldId}-hint`;

  return (
    <div className={className}>
      <FieldLabel htmlFor={fieldId} required={required}>
        {label}
      </FieldLabel>
      <div className="relative">
        <select
          id={fieldId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          className={`${CONTROL_BASE} ${error ? CONTROL_ERROR : CONTROL_OK} cursor-pointer appearance-none pr-10`}
          {...rest}
        >
          {children}
        </select>
        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-ink-subtle">
          <Icon name="expand_more" className="text-[20px]" />
        </span>
      </div>
      {error ? (
        <FieldError id={errorId} message={error} />
      ) : hint ? (
        <p id={hintId} className="mt-1.5 text-[13px] text-ink-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

interface SwitchFieldProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  id?: string;
  name?: string;
  disabled?: boolean;
}

/** Interruptor de encendido/apagado para opciones booleanas. */
export function SwitchField({ label, description, checked, onChange, id, name, disabled }: SwitchFieldProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;

  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-border bg-surface-muted px-4 py-3">
      <div className="min-w-0">
        <label htmlFor={fieldId} className="text-sm font-semibold text-ink">
          {label}
        </label>
        {description && <p className="mt-0.5 text-[13px] text-ink-muted">{description}</p>}
      </div>
      <button
        type="button"
        id={fieldId}
        name={name}
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${
          checked ? 'bg-primary-600' : 'bg-slate-300'
        }`}
      >
        <span
          className={`pointer-events-none absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform duration-200 ${
            checked ? 'translate-x-5.5' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  );
}
