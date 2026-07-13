import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROLES } from '../../../config/app';
import { useRoles } from '../../../hooks';
import HomePage from './HomePage';

export default function HomeRedirect() {
  const navigate = useNavigate();
  const { hasRole, isLoading } = useRoles();

  useEffect(() => {
    if (!isLoading) {
      if (hasRole(ROLES.ADMINISTRADOR)) {
        navigate('/instituciones', { replace: true });
      } else if (hasRole(ROLES.AUTORIDAD_ACADEMICA)) {
        navigate('/mis-instituciones', { replace: true });
      }
    }
  }, [isLoading, hasRole, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="material-symbols-outlined text-4xl text-primary animate-spin">refresh</span>
      </div>
    );
  }

  // If no special role, show the default home page
  if (!hasRole(ROLES.ADMINISTRADOR) && !hasRole(ROLES.AUTORIDAD_ACADEMICA)) {
    return <HomePage />;
  }

  return null;
}
