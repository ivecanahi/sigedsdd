import type { ReactNode } from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import { useRoles } from '../hooks';
import { ROLES } from '../config/app';
import { Spinner } from '../components/ui';
import LoginPage from '../features/auth/pages/LoginPage';
import AuthenticatedLayout from '../features/layout/pages/AuthenticatedLayout';
import HomeRedirect from '../features/layout/pages/HomeRedirect';
import InstitucionListPage from '../features/instituciones/pages/InstitucionListPage';
import MisInstitucionesPage from '../features/instituciones/pages/MisInstitucionesPage';
import InstitucionDetailPage from '../features/instituciones/pages/InstitucionDetailPage';
import DashboardPage from '../features/planificacion/pages/DashboardPage';
import PlanEstudioListPage from '../features/planificacion/pages/PlanEstudioListPage';
import GradoAsignaturaPage from '../features/planificacion/pages/GradoAsignaturaPage';

function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

function PublicRoute() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />;
}

function RoleRoute({ allowedRoles, children }: { allowedRoles: string[]; children: ReactNode }) {
  const { hasRole, isLoading } = useRoles();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner className="size-8 text-primary" label="Cargando permisos..." />
      </div>
    );
  }

  if (!allowedRoles.some((role) => hasRole(role))) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export const router = createBrowserRouter([
  {
    element: <PublicRoute />,
    children: [
      {
        path: '/login',
        element: <LoginPage />,
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AuthenticatedLayout />,
        children: [
          {
            path: '/',
            element: <HomeRedirect />,
          },
          {
            path: '/instituciones',
            element: (
              <RoleRoute allowedRoles={[ROLES.ADMINISTRADOR]}>
                <InstitucionListPage />
              </RoleRoute>
            ),
          },
          {
            path: '/mis-instituciones',
            element: (
              <RoleRoute allowedRoles={[ROLES.ADMINISTRADOR, ROLES.AUTORIDAD_ACADEMICA]}>
                <MisInstitucionesPage />
              </RoleRoute>
            ),
          },
          {
            path: '/instituciones/:institucionId',
            element: <InstitucionDetailPage />,
          },
          {
            path: '/dashboard/:institucionId',
            element: <DashboardPage />,
          },
          {
            path: '/planes-estudio/:institucionId',
            element: <PlanEstudioListPage />,
          },
          {
            path: '/grados-asignaturas/:planEstudioId',
            element: <GradoAsignaturaPage />,
          },
        ],
      },
    ],
  },
]);
