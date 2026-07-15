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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Study Plans card */}
        <div className="bg-surface border border-border rounded-xl overflow-hidden flex flex-col shadow-card hover:shadow-raised transition-shadow h-full min-h-[280px]">
          <div className="flex-1 flex flex-col items-center justify-center p-6">
            <span className="material-symbols-outlined text-7xl text-ink mb-4">menu_book</span>
            <h3 className="text-[18px] font-bold text-ink text-center">Planes de Estudio</h3>
            <p className="text-[13px] text-ink-muted text-center mt-2">
              Cree y administre los planes de estudio de la institución
            </p>
          </div>
          <button
            onClick={handleNavigateToPlanes}
            className="w-full bg-primary text-white py-4 flex items-center justify-center gap-2 font-bold text-[15px] hover:bg-primary-700 transition-colors mt-auto"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'wght' 700" }}>
              arrow_forward
            </span>
            Ir a Planes de Estudio
          </button>
        </div>

        {/* Institution Info card */}
        <div className="bg-surface border border-border rounded-xl overflow-hidden flex flex-col shadow-card hover:shadow-raised transition-shadow h-full min-h-[280px]">
          <div className="flex-1 flex flex-col items-center justify-center p-6">
            <span className="material-symbols-outlined text-7xl text-ink mb-4">info</span>
            <h3 className="text-[18px] font-bold text-ink text-center">Información de la Institución</h3>
            <p className="text-[13px] text-ink-muted text-center mt-2">
              Vea la información general de la institución
            </p>
          </div>
          <button
            onClick={handleNavigateToInstitucionInfo}
            className="w-full bg-primary text-white py-4 flex items-center justify-center gap-2 font-bold text-[15px] hover:bg-primary-700 transition-colors mt-auto"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'wght' 700" }}>
              arrow_forward
            </span>
            Ver Información
          </button>
        </div>
      </div>
    </div>
  );
}
