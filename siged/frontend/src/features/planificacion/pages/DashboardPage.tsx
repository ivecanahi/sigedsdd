import { useNavigate, useParams } from 'react-router-dom';
import { useInstitucion } from '../../instituciones/context/InstitucionContext';

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
      {/* Header block */}
      <section className="bg-heading-block border border-slate-200 rounded-sm p-6 w-full shadow-sm border-t-4 border-t-heading-block-border relative flex flex-col justify-center overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2 tracking-tight text-slate-900">
            {institucionNombre || 'Panel Institucional'}
          </h2>
          <p className="text-slate-600 text-base">
            Administre los planes de estudio y grados escolares de esta institución
          </p>
        </div>
        <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-[0.07] pointer-events-none">
          <span className="material-symbols-outlined text-9xl text-primary">school</span>
        </div>
      </section>

      {/* Quick access cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Study Plans card */}
        <div className="bg-white border border-slate-200 rounded-sm overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow h-full min-h-[280px]">
          <div className="flex-1 flex flex-col items-center justify-center p-6">
            <span className="material-symbols-outlined text-7xl text-slate-800 mb-4">menu_book</span>
            <h3 className="text-[18px] font-bold text-slate-900 text-center">Planes de Estudio</h3>
            <p className="text-[13px] text-slate-500 text-center mt-2">
              Cree y administre los planes de estudio de la institución
            </p>
          </div>
          <button
            onClick={handleNavigateToPlanes}
            className="w-full bg-primary text-white py-4 flex items-center justify-center gap-2 font-bold text-[15px] hover:bg-secondary transition-colors mt-auto"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'wght' 700" }}>
              arrow_forward
            </span>
            Ir a Planes de Estudio
          </button>
        </div>

        {/* Institution Info card */}
        <div className="bg-white border border-slate-200 rounded-sm overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow h-full min-h-[280px]">
          <div className="flex-1 flex flex-col items-center justify-center p-6">
            <span className="material-symbols-outlined text-7xl text-slate-800 mb-4">info</span>
            <h3 className="text-[18px] font-bold text-slate-900 text-center">Información de la Institución</h3>
            <p className="text-[13px] text-slate-500 text-center mt-2">
              Vea la información general de la institución
            </p>
          </div>
          <button
            onClick={handleNavigateToInstitucionInfo}
            className="w-full bg-primary text-white py-4 flex items-center justify-center gap-2 font-bold text-[15px] hover:bg-secondary transition-colors mt-auto"
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
