import { Navigate } from 'react-router-dom';
import { ROLES } from '../../../config/app';
import { useRoles } from '../../../hooks';
import HomePage from './HomePage';

export default function HomeRedirect() {
  const { hasRole, isLoading } = useRoles();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="material-symbols-outlined text-4xl text-primary animate-spin">refresh</span>
      </div>
    );
  }

  if (hasRole(ROLES.ADMINISTRADOR)) {
    return <Navigate to="/instituciones" replace />;
  }

  if (hasRole(ROLES.AUTORIDAD_ACADEMICA)) {
    return <Navigate to="/mis-instituciones" replace />;
  }

  return <HomePage />;
}
