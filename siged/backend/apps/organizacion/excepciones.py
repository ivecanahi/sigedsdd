class InstitucionConDependenciasActivasError(Exception):
    """Excepción lanzada cuando se intenta eliminar una institución con asignaciones activas."""

    pass


class AsignacionDuplicadaError(Exception):
    """Excepción lanzada cuando se intenta crear una asignación activa duplicada."""

    pass
