import { APP_NAME } from '../../../config/app';
import { useAuth } from '../../auth/hooks/useAuth';
import { Badge, Icon, PageHeader } from '../../../components/ui';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Hola, ${user?.first_name || 'bienvenido'}`}
        description={`Accede a las funcionalidades del ${APP_NAME}`}
        icon="waving_hand"
      />

      {/* Profile card */}
      <div className="w-[280px]">
        <div className="bg-surface border border-border rounded-xl overflow-hidden flex flex-col shadow-card">
          <div className="pt-10 pb-8 flex flex-col items-center text-center">
            <div className="mb-4">
              <span className="flex size-16 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                <Icon name="account_circle" filled className="text-[56px]" />
              </span>
            </div>
            <h3 className="text-[17px] font-bold text-ink">
              {user?.first_name} {user?.last_name}
            </h3>
            <p className="text-[11px] text-ink-muted mt-1 tabular">
              {user?.numero_identificacion}
            </p>
          </div>
          <div className="w-full bg-primary-600 text-white py-3.5 flex items-center justify-center gap-2 font-bold text-[14px]">
            <Badge tone="success" dot className="bg-white/15 text-white ring-white/30">
              Activo
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
