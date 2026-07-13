import type { Institucion } from '../types/institucion';

interface InstitucionCardProps {
  institucion: Institucion;
}

export default function InstitucionCard({ institucion }: InstitucionCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-sm overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/10 rounded-sm">
            <span className="material-symbols-outlined text-3xl text-primary">account_balance</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 truncate">{institucion.nombre}</h3>
            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="material-symbols-outlined text-base text-gray-400">tag</span>
                <span className="font-medium">Código:</span>
                <span>{institucion.codigo}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="material-symbols-outlined text-base text-gray-400">badge</span>
                <span className="font-medium">RUC:</span>
                <span>{institucion.ruc}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
        <span className="text-xs text-gray-500">
          Actualizado: {new Date(institucion.fecha_actualizacion).toLocaleDateString('es-ES')}
        </span>
      </div>
    </div>
  );
}
