import Icon from './Icon';

interface LoadMeterProps {
  /** Carga pedagógica total del grado. */
  value: number;
  /** Mayor carga de la lista mostrada: la barra es una comparación relativa. */
  max: number;
  /** El backend marca el grado cuando la carga excede lo permitido. */
  alert?: boolean;
}

/**
 * Carga pedagógica como barra comparativa dentro de la lista visible.
 * La barra no representa un límite normativo, solo la relación entre grados.
 */
export default function LoadMeter({ value, max, alert = false }: LoadMeterProps) {
  const ratio = max > 0 ? Math.min(1, value / max) : 0;

  return (
    <div className="flex items-center gap-2.5">
      <span
        className={`w-9 text-right text-sm font-bold tabular ${alert ? 'text-danger' : 'text-ink'}`}
      >
        {value}
      </span>
      <span
        className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-200"
        role="img"
        aria-label={`Carga pedagógica ${value} de ${max} en esta lista`}
      >
        <span
          className={`block h-full rounded-full transition-[width] duration-500 ${alert ? 'bg-danger' : 'bg-primary-500'}`}
          style={{ width: `${Math.max(ratio * 100, value > 0 ? 6 : 0)}%` }}
        />
      </span>
      {alert && (
        <span title="Excede la carga pedagógica permitida" className="text-danger">
          <Icon name="warning" filled className="text-[16px]" />
        </span>
      )}
    </div>
  );
}
