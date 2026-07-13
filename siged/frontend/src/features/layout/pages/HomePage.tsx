import { APP_NAME } from '../../../config/app';
import { useAuth } from '../../auth/hooks/useAuth';
import { useRoles } from '../../../hooks';
import { ROLES } from '../../../config/app';

export default function HomePage() {
  const { user } = useAuth();
  const { hasRole } = useRoles();

  const isAdmin = hasRole(ROLES.ADMINISTRADOR);
  const isAutoridad = hasRole(ROLES.AUTORIDAD_ACADEMICA);

  return (
    <div className="space-y-8">
      {/* Header block — aligned with stitch_dashboard prototype */}
      <section className="relative bg-slate-50 border border-slate-200 rounded-sm p-6 text-slate-900 w-full shadow-sm flex flex-col justify-center overflow-hidden border-t-4 border-t-primary">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-1 tracking-tight text-slate-900">
            ¡Bienvenido/a, {user?.first_name} {user?.last_name}!
          </h2>
          <p className="text-slate-600 text-base">
            Accede a las funcionalidades del {APP_NAME}
          </p>
        </div>
        <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-[0.07] pointer-events-none">
          <span className="material-symbols-outlined text-8xl text-primary">school</span>
        </div>
      </section>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-2">
        {isAdmin && (
          <div className="bg-white border border-gray-200 rounded-sm p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-primary/10 rounded-sm">
                <span className="material-symbols-outlined text-3xl text-primary">account_balance</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Instituciones</h3>
                <p className="text-sm text-gray-500">Gestión completa</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Administre todas las instituciones educativas del sistema, autoridades académicas y asignaciones.
            </p>
            <a
              href="/instituciones"
              className="inline-flex items-center gap-2 text-primary font-medium text-sm hover:underline"
            >
              Ir a Instituciones
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </a>
          </div>
        )}

        {isAutoridad && (
          <div className="bg-white border border-gray-200 rounded-sm p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-secondary/10 rounded-sm">
                <span className="material-symbols-outlined text-3xl text-secondary">domain</span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Mis Instituciones</h3>
                <p className="text-sm text-gray-500">Vista de autoridad</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Visualice las instituciones educativas asignadas a su cuenta como autoridad académica.
            </p>
            <a
              href="/mis-instituciones"
              className="inline-flex items-center gap-2 text-secondary font-medium text-sm hover:underline"
            >
              Ir a Mis Instituciones
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </a>
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-sm p-6 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-success/10 rounded-sm">
              <span className="material-symbols-outlined text-3xl text-success">person</span>
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Mi Perfil</h3>
              <p className="text-sm text-gray-500">Información de cuenta</p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Nombre:</span>
              <span className="font-medium text-gray-900">{user?.first_name} {user?.last_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Identificación:</span>
              <span className="font-medium text-gray-900">{user?.numero_identificacion}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Estado:</span>
              <span className="inline-flex items-center gap-1 text-success font-medium">
                <span className="material-symbols-outlined text-sm">check_circle</span>
                Activo
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
