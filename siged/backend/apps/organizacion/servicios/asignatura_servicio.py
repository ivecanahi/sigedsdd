from apps.organizacion.daos.asignatura_dao import AsignaturaDAO


class AsignaturaServicio:

    @staticmethod
    def listar(page, page_size, ordering, nombre, grado_escolar_id):
        return AsignaturaDAO.listar(page, page_size, ordering, nombre, grado_escolar_id)

    @staticmethod
    def obtener(asignatura_id):
        return AsignaturaDAO.obtener_por_id(asignatura_id)

    @staticmethod
    def crear(data):
        return AsignaturaDAO.crear(data)

    @staticmethod
    def actualizar(asignatura, data):
        return AsignaturaDAO.actualizar(asignatura, data)

    @staticmethod
    def listar_por_grado(grado_escolar_id):
        return AsignaturaDAO.listar_por_grado(grado_escolar_id)

    @staticmethod
    def existe_nombre(nombre, grado_escolar_id, excluir_id=None):
        return AsignaturaDAO.existe_nombre_by_grado(nombre, grado_escolar_id, excluir_id)

    @staticmethod
    def eliminar(asignatura):
        AsignaturaDAO.eliminar(asignatura)
