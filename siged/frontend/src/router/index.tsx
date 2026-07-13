import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import LoginPage from '../features/auth/pages/LoginPage';
import AuthenticatedLayout from '../features/layout/pages/AuthenticatedLayout';
import HomeRedirect from '../features/layout/pages/HomeRedirect';
import InstitucionListPage from '../features/instituciones/pages/InstitucionListPage';
import MisInstitucionesPage from '../features/instituciones/pages/MisInstitucionesPage';

function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

function PublicRoute() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />;
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
            element: <InstitucionListPage />,
          },
          {
            path: '/mis-instituciones',
            element: <MisInstitucionesPage />,
          },
        ],
      },
    ],
  },
]);
