import { useState, type FormEvent } from 'react';
import { useAuth } from '../hooks/useAuth';

interface FieldErrors {
  [key: string]: string[];
}

export default function LoginForm() {
  const { login } = useAuth();
  const [numeroIdentificacion, setNumeroIdentificacion] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [globalError, setGlobalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setGlobalError('');
    setIsSubmitting(true);

    try {
      await login(numeroIdentificacion, password);
    } catch (err: unknown) {
      const error = err as { data?: FieldErrors & { error?: string }; status?: number };
      if (error.data) {
        if (error.data.error) {
          setGlobalError(error.data.error);
        } else {
          setFieldErrors(error.data);
        }
      } else {
        setGlobalError('Error de conexión. Intente nuevamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldError = (field: string): string | undefined => {
    return fieldErrors[field]?.[0];
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6" aria-label="Formulario de inicio de sesión">
      {globalError && (
        <div
          className="flex items-start gap-3 p-4 rounded-lg bg-red-50 border-l-4 border-danger"
          role="alert"
          aria-live="assertive"
        >
          <span className="material-symbols-outlined text-danger shrink-0 mt-0.5">error</span>
          <span className="text-sm font-medium text-danger">{globalError}</span>
        </div>
      )}

      <div className="space-y-2">
        <label
          htmlFor="numero_identificacion"
          className="block font-bold text-gray-900 text-sm uppercase tracking-wider mb-2"
        >
          Número de identificación <span className="text-danger">*</span>
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
            <span className="material-symbols-outlined text-xl">person</span>
          </div>
          <input
            id="numero_identificacion"
            type="text"
            value={numeroIdentificacion}
            onChange={(e) => setNumeroIdentificacion(e.target.value)}
            className="block w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-gray-900 placeholder:text-gray-400/60"
            placeholder="Ingrese su número de identificación"
            aria-invalid={!!getFieldError('numero_identificacion')}
            aria-describedby={
              getFieldError('numero_identificacion')
                ? 'error-numero_identificacion'
                : undefined
            }
          />
        </div>
        {getFieldError('numero_identificacion') && (
          <p
            id="error-numero_identificacion"
            className="mt-2 flex items-center gap-1.5 text-sm text-danger"
            role="alert"
          >
            <span className="material-symbols-outlined text-sm text-danger shrink-0">error</span>
            {getFieldError('numero_identificacion')}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="password"
          className="block font-bold text-gray-900 text-sm uppercase tracking-wider mb-2"
        >
          Contraseña <span className="text-danger">*</span>
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
            <span className="material-symbols-outlined text-xl">lock</span>
          </div>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-gray-900 placeholder:text-gray-400/60"
            placeholder="Ingrese su contraseña"
            aria-invalid={!!getFieldError('password')}
            aria-describedby={
              getFieldError('password') ? 'error-password' : undefined
            }
          />
        </div>
        {getFieldError('password') && (
          <p
            id="error-password"
            className="mt-2 flex items-center gap-1.5 text-sm text-danger"
            role="alert"
          >
            <span className="material-symbols-outlined text-sm text-danger shrink-0">error</span>
            {getFieldError('password')}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-3 py-4 bg-primary hover:bg-primary/90 text-white font-bold text-lg rounded-full shadow-lg shadow-primary/20 transform active:scale-[0.98] transition-all duration-200 group disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:bg-primary"
        aria-busy={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <span className="material-symbols-outlined text-xl animate-spin">refresh</span>
            <span>Iniciando sesión...</span>
          </>
        ) : (
          <>
            <span className="material-symbols-outlined text-2xl group-hover:translate-x-1 transition-transform">arrow_forward</span>
            <span>Ingresar al sistema</span>
          </>
        )}
      </button>
    </form>
  );
}
