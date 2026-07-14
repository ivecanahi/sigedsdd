import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './features/auth/context/AuthContext';
import { RolesProvider } from './features/auth/context/RolesContext';
import { InstitucionProvider } from './features/instituciones/context/InstitucionContext';
import { router } from './router';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <RolesProvider>
        <InstitucionProvider>
          <RouterProvider router={router} />
        </InstitucionProvider>
      </RolesProvider>
    </AuthProvider>
  </StrictMode>,
);
