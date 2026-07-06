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
    <form onSubmit={handleSubmit} className="w-full max-w-sm mx-auto space-y-5">
      {globalError && (
        <div className="p-3 rounded bg-red-50 border border-danger text-danger text-sm">
          {globalError}
        </div>
      )}

      <div>
        <label htmlFor="numero_identificacion" className="block text-sm font-medium text-gray-700 mb-1">
          Número de identificación
        </label>
        <input
          id="numero_identificacion"
          type="text"
          value={numeroIdentificacion}
          onChange={(e) => setNumeroIdentificacion(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="Ingrese su número de identificación"
          required
        />
        {getFieldError('numero_identificacion') && (
          <p className="mt-1 text-sm text-danger">{getFieldError('numero_identificacion')}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="Ingrese su contraseña"
          required
        />
        {getFieldError('password') && (
          <p className="mt-1 text-sm text-danger">{getFieldError('password')}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-2.5 px-4 bg-primary text-white font-medium rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? 'Iniciando sesión...' : 'Iniciar sesión'}
      </button>
    </form>
  );
}
