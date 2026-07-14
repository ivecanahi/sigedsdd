from apps.core.daos.usuario_dao import UsuarioDAO


class UsuarioServicio:
    @staticmethod
    def listar(activo=None):
        return UsuarioDAO.listar(activo)
