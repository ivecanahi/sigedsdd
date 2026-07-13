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
          <svg
            className="w-5 h-5 text-danger shrink-0 mt-0.5"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
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
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
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
            <svg
              className="w-4 h-4 shrink-0"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
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
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
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
            <svg
              className="w-4 h-4 shrink-0"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
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
            <svg
              className="w-5 h-5 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <span>Iniciando sesión...</span>
          </>
        ) : (
          <>
            <svg
              className="w-6 h-6 group-hover:translate-x-1 transition-transform"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" />
            </svg>
            <span>Ingresar al sistema</span>
          </>
        )}
      </button>
    </form>
  );
}
