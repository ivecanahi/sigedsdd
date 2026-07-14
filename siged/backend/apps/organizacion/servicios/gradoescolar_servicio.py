from apps.organizacion.daos.gradoescolar_dao import GradoEscolarDAO
from apps.organizacion.excepciones import (
    GradoConAsignaturasAsociadasError,
    SubnivelRequeridoError,
)


class GradoEscolarServicio:

    @staticmethod
    def listar(page, page_size, ordering, nombre, plan_estudio_id):
        return GradoEscolarDAO.listar(page, page_size, ordering, nombre, plan_estudio_id)

    @staticmethod
    def obtener(grado_id):
        return GradoEscolarDAO.obtener_por_id(grado_id)

    @staticmethod
    def crear(data):
        nivel = data.get('nivel')
        subnivel = data.get('subnivel')
        if nivel and hasattr(nivel, 'subniveles') and nivel.subniveles.exists() and not subnivel:
            raise SubnivelRequeridoError(
                'El subnivel es obligatorio para el nivel seleccionado.'
            )
        return GradoEscolarDAO.crear(data)

    @staticmethod
    def actualizar(grado, data):
        nivel = data.get('nivel', grado.nivel)
        subnivel = data.get('subnivel', grado.subnivel)
        if nivel and hasattr(nivel, 'subniveles') and nivel.subniveles.exists() and not subnivel:
            raise SubnivelRequeridoError(
                'El subnivel es obligatorio para el nivel seleccionado.'
            )
        return GradoEscolarDAO.actualizar(grado, data)

    @staticmethod
    def eliminar(grado):
        if GradoEscolarDAO.tiene_asignaturas_asociadas(grado):
            raise GradoConAsignaturasAsociadasError(
                'No se puede eliminar el grado escolar porque tiene asignaturas asociadas.'
            )
        GradoEscolarDAO.eliminar(grado)

    @staticmethod
    def existe_nombre(nombre, plan_estudio_id, excluir_id=None):
        return GradoEscolarDAO.existe_nombre_by_plan(nombre, plan_estudio_id, excluir_id)

    @staticmethod
    def calcular_carga_pedagogica(grado):
        actual = sum(a.pp_semana_minimo for a in grado.asignaturas.all())
        minima = grado.subnivel.pp_semana_minimo if grado.subnivel else grado.nivel.pp_semana_minimo
        alerta = actual < minima
        return {
            'carga_pedagogica_actual': actual,
            'carga_pedagogica_minima': minima,
            'alerta_carga_pedagogica': alerta,
        }
