import type { Institucion } from '../types/institucion';
import { useNavigate } from 'react-router-dom';
import { useInstitucion } from '../context/InstitucionContext';

interface InstitucionCardProps {
  institucion: Institucion;
}

export default function InstitucionCard({ institucion }: InstitucionCardProps) {
  const navigate = useNavigate();
  const { setInstitucion } = useInstitucion();

  const handleEnter = () => {
    setInstitucion(institucion.id, institucion.nombre);
    navigate(`/dashboard/${institucion.id}`);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-sm overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow h-full min-h-[300px]">
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <span className="material-symbols-outlined text-7xl text-slate-800 mb-4">school</span>
        <h3 className="text-[18px] font-bold text-slate-900 text-center">{institucion.nombre}</h3>
        <p className="text-[13px] text-slate-500 text-center mt-1">
          AMIE Code: {institucion.codigo}
        </p>
      </div>
      <button
        onClick={handleEnter}
        className="w-full bg-primary text-white py-4 flex items-center justify-center gap-2 font-bold text-[15px] hover:bg-[#3b5bdb] transition-colors mt-auto"
      >
        <span
          className="material-symbols-outlined"
          style={{ fontVariationSettings: "'wght' 700" }}
        >
          check
        </span>
        Enter
      </button>
    </div>
  );
}
