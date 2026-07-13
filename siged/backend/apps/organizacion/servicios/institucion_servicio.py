from apps.organizacion.daos.institucion_dao import InstitucionDAO
from apps.organizacion.excepciones import InstitucionConDependenciasActivasError


class InstitucionServicio:

    @staticmethod
    def listar(page, page_size, ordering, nombre):
        return InstitucionDAO.listar(page, page_size, ordering, nombre)

    @staticmethod
    def obtener(institucion_id):
        return InstitucionDAO.obtener_por_id(institucion_id)

    @staticmethod
    def crear(data):
        return InstitucionDAO.crear(data)

    @staticmethod
    def actualizar(institucion, data):
        return InstitucionDAO.actualizar(institucion, data)

    @staticmethod
    def eliminar(institucion):
        if InstitucionDAO.tiene_dependencias_activas(institucion):
            raise InstitucionConDependenciasActivasError(
                'No se puede eliminar la institución porque tiene autoridades académicas activas.'
            )
        InstitucionDAO.eliminar(institucion)

    @staticmethod
    def obtener_autoridades_activas(institucion):
        return InstitucionDAO.obtener_autoridades_activas(institucion)

    @staticmethod
    def listar_por_usuario(usuario):
        return InstitucionDAO.listar_por_usuario(usuario)
