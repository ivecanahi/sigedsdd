import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { APP_NAME, ROLES } from '../../../config/app';
import { useAuth } from '../../auth/hooks/useAuth';
import { useRoles } from '../../../hooks';
import { useInstitucion } from '../../instituciones/context/InstitucionContext';
import { PageHeader, Icon, Badge, Spinner } from '../../../components/ui';
import { institucionApi } from '../../instituciones/services/institucionApi';
import { planEstudioApi } from '../../planificacion/services/planEstudioApi';
import { gradoEscolarApi } from '../../planificacion/services/gradoEscolarApi';
import { asignaturaApi } from '../../planificacion/services/asignaturaApi';

interface StatCardProps {
  icon: string;
  label: string;
  value: string;
  tone?: 'primary' | 'success' | 'warning' | 'danger';
}

function StatCard({ icon, label, value, tone = 'primary' }: StatCardProps) {
  const toneClasses = {
    primary: 'bg-primary-50 text-primary-600 ring-primary-100',
    success: 'bg-green-50 text-green-600 ring-green-100',
    warning: 'bg-amber-50 text-amber-600 ring-amber-100',
    danger: 'bg-red-50 text-red-600 ring-red-100',
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div className={`flex size-12 items-center justify-center rounded-xl ring-1 ${toneClasses[tone]}`}>
          <Icon name={icon} className="text-[24px]" />
        </div>
        <div>
          <p className="text-2xl font-extrabold text-slate-900 tabular">{value}</p>
          <p className="text-sm text-slate-500 font-medium">{label}</p>
        </div>
      </div>
    </div>
  );
}

interface QuickActionCardProps {
  icon: string;
  title: string;
  description: string;
  path: string;
  onClick: () => void;
}

function QuickActionCard({ icon, title, description, onClick }: QuickActionCardProps) {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-start rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-raised hover:border-primary-200 transition-all duration-200 text-left focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
    >
      <div className="flex size-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600 ring-1 ring-primary-100 mb-4 group-hover:bg-primary-100 transition-colors">
        <Icon name={icon} className="text-[24px]" />
      </div>
      <h3 className="text-[15px] font-bold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
      <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-primary-600 group-hover:text-primary-700 transition-colors">
        <span>Acceder</span>
        <Icon name="arrow_forward" className="text-[16px]" />
      </div>
    </button>
  );
}

export default function HomePage() {
  const { user } = useAuth();
  const { hasRole } = useRoles();
  const { institucionId } = useInstitucion();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    instituciones: 0,
    planes: 0,
    grados: 0,
    asignaturas: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  const firstName = user?.first_name || 'Usuario';
  const fullName = user ? `${user.first_name} ${user.last_name}` : 'Usuario';

  useEffect(() => {
    async function fetchStats() {
      setStatsLoading(true);
      try {
        let institucionesCount = 0;
        let planesCount = 0;
        let gradosCount = 0;
        let asignaturasCount = 0;

        // 1. Instituciones count (global for the user)
        if (hasRole(ROLES.ADMINISTRADOR)) {
          const response = await institucionApi.list({ page: 1, page_size: 1 });
          institucionesCount = response.count;
        } else if (hasRole(ROLES.AUTORIDAD_ACADEMICA)) {
          const data = await institucionApi.listByUser();
          institucionesCount = data.length;
        }

        // 2. Institution-specific stats (only if an institution is active)
        if (institucionId) {
          const plansResponse = await planEstudioApi.listByInstitucion(institucionId, {
            page: 1,
            page_size: 1,
          });
          planesCount = plansResponse.count;

          // Get all plans to count their grados
          const allPlans = await planEstudioApi.listByInstitucion(institucionId, {
            page: 1,
            page_size: 100,
          });

          // Fetch grados for each plan
          const gradoPromises = allPlans.results.map((plan) =>
            gradoEscolarApi.listByPlanEstudio(plan.id, { page: 1, page_size: 1 })
          );
          const gradoResults = await Promise.all(gradoPromises);
          gradosCount = gradoResults.reduce((sum, res) => sum + res.count, 0);

          // Fetch asignaturas for each plan (through first grado of each plan)
          // Note: asignaturas are per-grado, so this is a simplification
          // We'll count asignaturas from the first grado of each plan
          const asignaturaPromises: Promise<any>[] = [];
          for (const plan of allPlans.results) {
            const gradosRes = await gradoEscolarApi.listByPlanEstudio(plan.id, {
              page: 1,
              page_size: 100,
            });
            for (const grado of gradosRes.results) {
              asignaturaPromises.push(
                asignaturaApi.listByGradoEscolar(grado.id).then((asigs) => asigs.length)
              );
            }
          }
          const asignaturaCounts = await Promise.all(asignaturaPromises);
          asignaturasCount = asignaturaCounts.reduce((sum, count) => sum + count, 0);
        }

        setStats({
          instituciones: institucionesCount,
          planes: planesCount,
          grados: gradosCount,
          asignaturas: asignaturasCount,
        });
      } catch {
        // Silently fail - stats are decorative, not critical
      } finally {
        setStatsLoading(false);
      }
    }

    fetchStats();
  }, [hasRole, institucionId]);

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Hola, ${firstName}`}
        description={`Bienvenido al ${APP_NAME}. Aquí tiene un resumen de su actividad.`}
        icon="waving_hand"
      />

      {/* Stats row */}
      {statsLoading ? (
        <div className="flex items-center justify-center h-24">
          <Spinner className="size-8 text-primary" label="Cargando estadísticas..." />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon="account_balance" label="Instituciones" value={String(stats.instituciones)} tone="primary" />
          <StatCard icon="menu_book" label="Planes de estudio" value={String(stats.planes)} tone="success" />
          <StatCard icon="class" label="Grados escolares" value={String(stats.grados)} tone="warning" />
          <StatCard icon="auto_stories" label="Asignaturas" value={String(stats.asignaturas)} tone="danger" />
        </div>
      )}

      {/* Quick actions */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">Acceso Rápido</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {hasRole(ROLES.ADMINISTRADOR) && (
            <QuickActionCard
              icon="account_balance"
              title="Instituciones"
              description="Administre las instituciones educativas registradas en el sistema."
              path="/instituciones"
              onClick={() => navigate('/instituciones')}
            />
          )}
          {(hasRole(ROLES.ADMINISTRADOR) || hasRole(ROLES.AUTORIDAD_ACADEMICA)) && (
            <QuickActionCard
              icon="domain"
              title="Mis Instituciones"
              description="Acceda a las instituciones donde tiene asignado un rol."
              path="/mis-instituciones"
              onClick={() => navigate('/mis-instituciones')}
            />
          )}
          <QuickActionCard
            icon="person"
            title="Mi Perfil"
            description="Revise y actualice su información personal y de contacto."
            path="/"
            onClick={() => { /* placeholder */ }}
          />
        </div>
      </div>

      {/* Recent activity */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">Actividad Reciente</h2>
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/50 px-6 py-10 text-center">
          <div className="flex flex-col items-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-white ring-1 ring-slate-200 mb-3">
              <Icon name="history" className="text-[28px] text-slate-400" />
            </div>
            <p className="font-display text-base font-bold text-slate-700">No hay actividad reciente</p>
            <p className="mt-1 max-w-md text-sm text-slate-500">
              Sus acciones más recientes aparecerán aquí. Comience gestionando una institución o un plan de estudio.
            </p>
          </div>
        </div>
      </div>

      {/* Profile summary card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex size-14 items-center justify-center rounded-full bg-primary-50 text-primary-600 shrink-0">
          <Icon name="account_circle" filled className="text-[32px]" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-[17px] font-bold text-slate-900">{fullName}</h3>
          <p className="text-sm text-slate-500 mt-0.5">{user?.numero_identificacion}</p>
        </div>
        <Badge tone="success" dot>
          Activo
        </Badge>
      </div>
    </div>
  );
}
