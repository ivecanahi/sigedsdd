import { useEffect, useState } from 'react';
import Icon from './Icon';

interface SearchInputProps {
  /** Término aplicado actualmente (proviene del estado de la página). */
  value: string;
  /** Se dispara cuando el término deja de cambiar durante `delay` ms. */
  onSearch: (term: string) => void;
  placeholder?: string;
  label?: string;
  delay?: number;
  className?: string;
}

/**
 * Buscador con retardo: filtra mientras se escribe, sin botón "Buscar".
 * Menos pasos que el flujo anterior (escribir → clic → limpiar).
 */
export default function SearchInput({
  value,
  onSearch,
  placeholder = 'Buscar…',
  label = 'Buscar',
  delay = 350,
  className = '',
}: SearchInputProps) {
  const [term, setTerm] = useState(value);

  useEffect(() => {
    setTerm(value);
  }, [value]);

  useEffect(() => {
    if (term === value) return;
    const timer = window.setTimeout(() => onSearch(term.trim()), delay);
    return () => window.clearTimeout(timer);
  }, [term, value, delay, onSearch]);

  return (
    <div className={`relative ${className}`}>
      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-ink-subtle">
        <Icon name="search" className="text-[20px]" />
      </span>
      <input
        type="search"
        role="searchbox"
        aria-label={label}
        value={term}
        onChange={(event) => setTerm(event.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-lg border border-border-strong bg-surface pr-9 pl-10 text-sm text-ink transition-colors placeholder:text-ink-subtle focus:border-primary-500 focus:ring-4 focus:ring-primary-100 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
      />
      {term && (
        <button
          type="button"
          onClick={() => {
            setTerm('');
            onSearch('');
          }}
          aria-label="Limpiar búsqueda"
          className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-ink-subtle transition-colors hover:text-ink"
        >
          <Icon name="cancel" filled className="text-[18px]" />
        </button>
      )}
    </div>
  );
}
