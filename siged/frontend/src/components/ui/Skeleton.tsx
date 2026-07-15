interface SkeletonProps {
  className?: string;
}

/** Bloque de carga que reserva el espacio del contenido real. */
export default function Skeleton({ className = 'h-4 w-full' }: SkeletonProps) {
  return <div aria-hidden="true" className={`animate-shimmer rounded-md bg-slate-200/70 ${className}`} />;
}

/** Esqueleto para tablas mientras se resuelve la primera carga. */
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-card" role="status" aria-label="Cargando datos">
      <div className="h-12 bg-primary-700/90" />
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex items-center gap-4 px-4 py-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton
                key={colIndex}
                className={`h-4 ${colIndex === 0 ? 'w-1/3' : 'flex-1'}`}
              />
            ))}
          </div>
        ))}
      </div>
      <span className="sr-only">Cargando datos</span>
    </div>
  );
}

/** Esqueleto para rejillas de tarjetas. */
export function CardGridSkeleton({ items = 3 }: { items?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3" role="status" aria-label="Cargando">
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="rounded-xl border border-border bg-surface p-6 shadow-card">
          <Skeleton className="size-12 rounded-xl" />
          <Skeleton className="mt-5 h-5 w-3/4" />
          <Skeleton className="mt-3 h-3 w-1/2" />
          <Skeleton className="mt-8 h-10 w-full rounded-lg" />
        </div>
      ))}
      <span className="sr-only">Cargando</span>
    </div>
  );
}
