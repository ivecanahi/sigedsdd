interface IconProps {
  /** Nombre del símbolo de Material Symbols, p. ej. "school". */
  name: string;
  /** Relleno del glifo. */
  filled?: boolean;
  /** Trazo más grueso para íconos pequeños o sobre color. */
  bold?: boolean;
  className?: string;
}

/**
 * Ícono de Material Symbols con ejes variables controlados.
 * Centraliza el uso de la fuente para no repetir `fontVariationSettings`.
 */
export default function Icon({ name, filled = false, bold = false, className = '' }: IconProps) {
  const axis = filled ? 'ms-icon-filled' : bold ? 'ms-icon-bold' : '';
  return (
    <span aria-hidden="true" className={`ms-icon shrink-0 ${axis} ${className}`}>
      {name}
    </span>
  );
}
