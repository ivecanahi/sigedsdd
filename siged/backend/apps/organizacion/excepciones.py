class InstitucionConDependenciasActivasError(Exception):
    """Excepción lanzada cuando se intenta eliminar una institución con asignaciones activas."""

    pass


class AsignacionDuplicadaError(Exception):
    """Excepción lanzada cuando se intenta crear una asignación activa duplicada."""

    pass


class PlanEstudioException(Exception):
    """Excepción base para operaciones con planes de estudio."""

    pass


class PlanVigenteExistenteError(PlanEstudioException):
    """Excepción lanzada cuando ya existe un plan de estudio vigente para la institución."""

    pass


class PlanConGradosAsociadosError(PlanEstudioException):
    """Excepción lanzada cuando se intenta eliminar un plan de estudio con grados escolares asociados."""

    pass


class GradoEscolarException(Exception):
    """Excepción base para operaciones con grados escolares."""

    pass


class GradoConAsignaturasAsociadasError(GradoEscolarException):
    """Excepción lanzada cuando se intenta eliminar un grado escolar con asignaturas asociadas."""

    pass


class SubnivelRequeridoError(GradoEscolarException):
    """Excepción lanzada cuando el nivel educativo requiere un subnivel y no se proporciona."""

    pass


class AsignaturaException(Exception):
    """Excepción base para operaciones con asignaturas."""

    pass
