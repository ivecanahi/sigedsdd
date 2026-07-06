import { Navigate } from 'react-router-dom';
import { APP_FULL_NAME, APP_NAME } from '../../../config/app';
import { useAuth } from '../hooks/useAuth';
import LoginForm from '../components/LoginForm';

export default function LoginPage() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md bg-surface rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{APP_NAME}</h1>
          <p className="text-sm text-gray-600">{APP_FULL_NAME}</p>
        </div>

        <h2 className="text-lg font-semibold text-gray-800 text-center mb-6">
          Inicio de sesión
        </h2>

        <LoginForm />
      </div>
    </div>
  );
}
