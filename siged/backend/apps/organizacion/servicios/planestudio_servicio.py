from apps.organizacion.daos.planestudio_dao import PlanEstudioDAO
from apps.organizacion.excepciones import (
    PlanConGradosAsociadosError,
    PlanVigenteExistenteError,
)


class PlanEstudioServicio:

    @staticmethod
    def listar(page, page_size, ordering, nombre, institucion_id):
        return PlanEstudioDAO.listar(page, page_size, ordering, nombre, institucion_id)

    @staticmethod
    def obtener(plan_id):
        return PlanEstudioDAO.obtener_por_id(plan_id)

    @staticmethod
    def _get_institucion_id(data, default_institucion_id=None):
        institucion = data.get('institucion')
        if institucion is not None:
            return getattr(institucion, 'id', institucion)
        return default_institucion_id

    @staticmethod
    def crear(data):
        institucion_id = PlanEstudioServicio._get_institucion_id(data)
        es_activo = data.get('es_activo', False)
        if es_activo and PlanEstudioDAO.existe_activo_by_institucion(institucion_id):
            raise PlanVigenteExistenteError(
                'Ya existe un plan de estudio vigente para esta institución.'
            )
        return PlanEstudioDAO.crear(data)

    @staticmethod
    def actualizar(plan, data):
        institucion_id = PlanEstudioServicio._get_institucion_id(data, default_institucion_id=plan.institucion_id)
        es_activo = data.get('es_activo', plan.es_activo)
        if es_activo and PlanEstudioDAO.existe_activo_by_institucion(institucion_id, excluir_id=plan.id):
            raise PlanVigenteExistenteError(
                'Ya existe un plan de estudio vigente para esta institución.'
            )
        return PlanEstudioDAO.actualizar(plan, data)

    @staticmethod
    def existe_nombre(nombre, institucion_id, excluir_id=None):
        return PlanEstudioDAO.existe_nombre_by_institucion(nombre, institucion_id, excluir_id)

    @staticmethod
    def eliminar(plan):
        if PlanEstudioDAO.tiene_grados_asociados(plan):
            raise PlanConGradosAsociadosError(
                'No se puede eliminar el plan de estudio porque tiene grados escolares asociados.'
            )
        PlanEstudioDAO.eliminar(plan)
