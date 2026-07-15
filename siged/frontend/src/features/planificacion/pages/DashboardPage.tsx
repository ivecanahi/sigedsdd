import { useNavigate, useParams } from 'react-router-dom';
import { useInstitucion } from '../../instituciones/context/InstitucionContext';
import { PageHeader } from '../../../components/ui';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { institucionNombre } = useInstitucion();
  const { institucionId } = useParams<{ institucionId: string }>();

  const handleNavigateToPlanes = () => {
    if (institucionId) {
      navigate(`/planes-estudio/${institucionId}`);
    }
  };

  const handleNavigateToInstitucionInfo = () => {
    if (institucionId) {
      navigate(`/instituciones/${institucionId}`);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Institución"
        title={institucionNombre || 'Panel Institucional'}
        description="Administre los planes de estudio y grados escolares de esta institución"
        icon="school"
      />

      {/* Quick access cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Study Plans card */}
        <button
          onClick={handleNavigateToPlanes}
          className="group flex flex-col items-start rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-raised hover:border-primary-200 transition-all duration-200 text-left focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600 ring-1 ring-primary-100 mb-4 group-hover:bg-primary-100 transition-colors">
            <span className="material-symbols-outlined text-[24px]">menu_book</span>
          </div>
          <h3 className="text-[15px] font-bold text-slate-900 mb-1">Planes de Estudio</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Cree y administre los planes de estudio de la institución
          </p>
          <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-primary-600 group-hover:text-primary-700 transition-colors">
            <span>Ir a Planes de Estudio</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </div>
        </button>

        {/* Institution Info card */}
        <button
          onClick={handleNavigateToInstitucionInfo}
          className="group flex flex-col items-start rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-raised hover:border-primary-200 transition-all duration-200 text-left focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600 ring-1 ring-primary-100 mb-4 group-hover:bg-primary-100 transition-colors">
            <span className="material-symbols-outlined text-[24px]">info</span>
          </div>
          <h3 className="text-[15px] font-bold text-slate-900 mb-1">Información de la Institución</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Vea la información general y autoridades académicas
          </p>
          <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-primary-600 group-hover:text-primary-700 transition-colors">
            <span>Ver Información</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </div>
        </button>
      </div>
    </div>
  );
}
